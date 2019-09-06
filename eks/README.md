# EKS

## GitLab integrated cluster

```bash
# Get API_URL
kubectl cluster-info | grep 'Kubernetes master' | awk '/http/ {print $NF}'

# Get CA Certificate
kubectl get secret $(kubectl get secret | grep default-token | awk '{print $1}') -o jsonpath="{['data']['ca\.crt']}" | base64 --decode

# Create the serviceaccount
kubectl apply -f gitlab-admin-service-account.yaml

# Retrieve the token for the gitlab-admin service account
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep gitlab-admin | awk '{print $1}')
```

## Shortcuts

```bash
# List clusters
eksctl --profile iteam get cluster

# Configure your kubectl to use <cluster>
aws --profile iteam eks --region eu-north-1 update-kubeconfig --name <cluster>
```
