# Traefik setup

We use Traefik as an [Ingress Controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/).

All the resources needed and the configuration for it are in `traefik.yaml`.

This setup is intended for clusters where you use multiple worker nodes (more than 1), hence the use of `type: LoadBalancer` in the traefik Service and the choice for `cert-manager` for dealing with Let's Encrypt.

- This guide sets Traefik as a `Daemonset` (1 replica per worker node).
- This means that you can scale up or down and you would have a Traefik instance on every node
- You can setup things differently of course by having different worker pools and only running Traefik on one pool that has only 1 worker node but that is outside of the scope of this setup.
- It configures the service of type `LoadBalancer` which will automatically create a LoadBalancer for us in AWS configured to the EC2 instances. This makes it nicer to configure Route53 to point towards the LoadBalancer instead of every node
- Even though Traefik can manage Let's Encrypt certificates, the way you set that up is by using a persistent volume for storing it. This becomes a problem once you run several instances of Traefik per each node having their own volume that will eventually all try to renew certificates because they all have their own versions and there is no syncronisation unless you go the route of setting up Traefik in Cluster mode.
- Using `cert-manager` you store certificates into `secrets` which are shared across nodes and also has a nicer separation for domains we request certificates for - reducing the risk for someone to accidentally affect other websites by misconfiguration in the Traefik config

## Requirements before you start

- Have `kubectl` [installed](https://kubernetes.io/docs/tasks/tools/install-kubectl/)

- Access to Iteam organization in [Containership](https://containership.io)

- Acess to Iteam AWS if you create a cluster in AWS (as we did)

## Setup a Kubernetes cluster with Containership

- [Add Amazon Web Services as a provider](https://docs.containership.io/en/articles/504594-how-to-add-amazon-web-services-as-a-provider) (This has already been configured)

- [Launch cluster using AWS](https://docs.containership.io/en/articles/2241901-launch-cluster-using-amazon-web-services-aws)

## Connecting to the cluster

#### Easy option but slow speed when running commands since it goes through a Containership proxy

- Copy your `kubectl connection info` from the cluster's overview page in Containership

#### More complicated option but faster speed since you are connecting directly to the cluster

- [Add your ssh key with Containership](https://docs.containership.io/en/articles/1523970-managing-ssh-keys)

- Inside AWS Instances find your master node or one of them if you have a pool of them and get your public IP

- SSH into it using the user `containership`

- Look for the `kube-admin` configuration (if it's not there you're probably on a worker node)

```bash
sudo su
cat /etc/kubernetes/admin.conf
```

- Copy the `client-certificate-data` and `client-key-data` from the `user` under the `users` section (we will use them in the next step)

- Now edit your local `kubectl configuration` usually located in `~/.kube/config` and add the following to the according sections

`clusters:`

```yaml
- cluster:
    insecure-skip-tls-verify: true
    server: https://<public IP or dns name of master node>:6443
  name: aws
```

`contexts:`

```yaml
- context:
    cluster: aws
    user: kubernetes-admin-aws
  name: kubernetes-admin-aws@aws
```

`users:`

```yaml
- name: kubernetes-admin-aws
  user:
    client-certificate-data: <The one you copied from the server>
    client-key-data: <The one you copied from the server>
```

- Change the context to the newly created one

```bash
kubectl config use-context kubernetes-admin-aws@aws
```

### Deploy Traefik

```bash
kubectl apply -f traefik.yaml
```

The way it's setup now is by allowing port 80 and 443 and having a redirect from port 80 to 443.

You can check [Traefik docs](https://docs.traefik.io/) and make changes to the config based on your needs. When applying config changes (aka making changes to the `ConfigMap` object) you want to delete the current pod(s) so that the new one(s) created pick up the changes.

```bash
kubectl -n kube-system delete pod $(kubectl -n kube-system get pod -l app=traefik -o jsonpath='{.items[0].metadata.name}')
```

### Configure Load Balancer in AWS

- After you have deployed Traefik it is likely that your Load Balancer in AWS will not work.
- Navigate to Load Balancers section inside EC2 and select your Load Balancer and then verify the `Instances` tab for the `Status` of your instances (you want to have `InService`)
- `Edit Availability Zones` and make sure that the zones your instances belong to are added to `Selected subnets`
- Then wait for a bit for the health checks to recognize that your instances are up and the Status should chane

### Route53 setup

- Create record sets for the hosts that you defined or will define in your `Ingress` resources.
- The easiest is to configure a wildcard domain as an A Type using the Alias option and point it to the `DNS Name` of the Load Balancer that you can obtain from the Load Balancer's `Description` tab

## cert-manager

### Install it

- Following their [instructions](https://docs.cert-manager.io/en/latest/getting-started/install/kubernetes.html)

```bash
kubectl create namespace cert-manager
```

```bash
kubectl label namespace cert-manager certmanager.k8s.io/disable-validation=true
```

```bash
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v0.9.0/cert-manager.yaml
```

- Since we run `cert-manager` in it's own namespace we will need access to AWS credentials used for Let's Encrypt DNS challenge.

  One way of solving this is by copying the credentials from `kube-system` namespace (you have this since you've used Containership for creating the cluster) to `cert-manager` (or you can create a new secret)

```bash
kubectl get secret amazon-web-service-credentials -n kube-system -o yaml | \
    sed "s/namespace: kube-system/namespace: cert-manager/" | \
    kubectl apply -n cert-manager -f -
```

### Creating our first Certificate and Issuer

- First get your AWS_ACCESS_KEY_ID from the AWS secret and base64 decode it and then update one of the yaml files provided (if this command does not work - I don't know bash :) )

```bash
  kubectl get secret amazon-web-service-credentials -n cert-manager -o yaml | \
    grep AWS_ACCESS_KEY_ID | \
    head -1 | \
    sed "s/AWS_ACCESS_KEY_ID://" | \
    awk '{$1=$1};1' | \
    base64 -D
```

- We will use `letsencrypt-stage.yaml` for the guide but same applies to `letsencrypt-prod.yaml` or any new file you will create. Just remember to delete the stage files and then apply the prod files once you are ready and to not have any issue with how you name things

- Also this setup uses a `ClusterIssuer` versus multiple `Issuer`s. An `Issuer` is a namespaced resource so if you have multiple namespaces (say a namespace per project) you will have to create one `Issuer` in every of them.
A `CluserIssuer` however can issue certificates for `Certificate` resources in all namespaces

- Update the `accessKeyID` under the `ClusterIssuer` resource and also have a look at `dnsNames` and `domains` in the `Certificate` resource in the `letsencrypt-stage.yaml` file.
Also check the `secretName: letsencrypt-stage`. That is the name of the secret containing the certificate that you will use later in the `Ingress` configuration

- You can specify multiple domains, wildcard domains in the `dnsNames` and `domains` section but I think the desired flow would be to separate the `ClusterIssuer` into it's own file and then create `Certificate` files for every site or even stack (having multiple URLs) you want to deploy. This would mean you are not affecting other certificates for existing applications.

- Deploy the `ClusterIssuer` and `Certificate`

```bash
kubectl apply -f letsencrypt-stage.yaml
```

### Configure the Ingress

The `hello-world.yaml` contains an example for what you need to deploy an application:

- `Deployment` as the controller for a Pod and configuration for it
- `Service` for making our `Pod` reachable within the cluster
- `Ingress` for configuring how we want out service to be reached from the Internets

The configuration for using https in the Ingress is:

```yaml
tls:
  - hosts:
    - hello-world.aws.iteamdev.se
    secretName: letsencrypt-stage
```