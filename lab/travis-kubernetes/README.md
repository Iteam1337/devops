# Travis setup

We will be using [RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) to access our cluster from travis.

All the resources needed for it are in `travis-rbac.yaml`. Some of the configuration we will go through here.

> "Role-based access control (RBAC) is a method of regulating access to computer or network resources based on the roles of individual users within an enterprise."

This setup is intended for CI pipelines where you might want travis to access your cluster to do rollouts (redeployments).

### **Summary:**

- Applies a Namespace, a ServiceAccount, a Clusterrole and a RoleBinding to our cluster.
- Retrieve secret from ServiceAccount and use it to access our cluster from travis.

### **Prerequisites**

- Have `kubectl` [installed](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- Have a running cluster

---

### Apply travis RBAC

The way it's setup now is that we first create a namespace serviceids that our ServiceAccount will live in. I believe this is just for not cluttering the default namespace with too much stuff. Then we create a ServiceAccount which will be communicating with our cluster. Then we create a ClusterRole which defines the rules of that communication. Lastly we create a RoleBinding which connects our ClusterRole to our ServiceAccount. If you compare this with the travis-rbac.yaml you'll see what I mean.

```bash
kubectl apply -f travis-rbac.yaml
```

### Retrieve secret

After you've applied the travis-rbac, you need a secret to authenticate to the cluster.

Install 'jq' which is an command line json processor. Don't know how to do it without jq at the time of writing.

```bash
brew install jq
```

Then get the secret

```bash
kubectl -n serviceids get secret $(kubectl -n serviceids get secret | grep travis | awk '{print $1}') -o json | jq -r '.data.token'  | base64 -D
```

Take the output and set an environment variable \$KUBERNETES_TOKEN in travis.

### Retrieve server

We also need the server to communicate with. The server is just your master node public DNS suffixed with port 6443, which is the port that the Kubernetes API uses to communicate with your cluster.

Either get it from the terminal:

```bash
kubectl config view -o jsonpath="{.clusters[?(@.name==\"YOUR_CLUSTER_NAME\")].cluster.server}"
```

Or just copy the public dns from your master node (in my case AWS console -> EC2 instances) and append :6443.

Take this IP and add it as an environment variable \$KUBERNETES_SERVER in travis.

### Usage 

Look at [deploy.sh](deploy.sh) for example usage.
