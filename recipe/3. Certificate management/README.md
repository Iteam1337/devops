# cert-manager setup

## Requirements before you start

- Have `kubectl` [installed](https://kubernetes.io/docs/tasks/tools/install-kubectl/)

### Install it

- Following their [instructions](https://docs.cert-manager.io/en/latest/getting-started/install/kubernetes.html)

```bash
kubectl create namespace cert-manager
```

```bash
kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v0.13.1/cert-manager.yaml
```

### Usage

- Read here [how to setup](https://cert-manager.io/docs/configuration/acme/dns01/route53/) an IAM policy for Route 53 and then create a user with this policy and get their access key and secret

- Create a secret with aws access key

```bash
kubectl create secret generic amazon-route53-credentials --from-literal=AWS_ACCESS_KEY_ID=<KEY HERE> --from-literal=AWS_SECRET_ACCESS_KEY=<SECRET HERE> -n cert-manager
```

- Update the cluster issuer (`cluster-issuer.yaml`) and replace the following:

```yaml
region: # Add your region here
accessKeyID: # Add your access key here
```

- Update the cluster issuer and certificate and replace the domain to what you need:

```yaml
dnsNames:
  - '*.devops.iteamdev.se' # Add your domain here
```

- Deploy the `ClusterIssuer` and `Certificate` resources

```bash
kubectl apply -f k8s/cert-manager
```

The configuration for using https in the Ingress is:

```yaml
kind: Ingress
metadata:
  ...
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
      - api.devops.iteamdev.se
      secretName: letsencrypt-prod
  ...
```
