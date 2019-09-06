# EKS

## Shortcuts

```bash
# List clusters
eksctl --profile iteam get cluster

# Configure your kubectl to use <cluster>
aws --profile iteam eks --region eu-north-1 update-kubeconfig --name <cluster>
```

## Setup

### GitLab integrated cluster

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

### NodeGroups

There is a nodegroup dedicated to running the izone sql server container. Nodes in this groups are labelled and tainted to avoid scheduling random pods here.

```bash
# See Izone nodegroup
eksctl --profile iteam get nodegroup --name Izone --cluster Iteam-Life

# Label and taint a node
kubectl label nodes ip-192-168-26-210.eu-north-1.compute.internal example/nodetype=izone
kubectl taint nodes ip-192-168-26-210.eu-north-1.compute.internal dedicated=izone:NoSchedule
```

Example for scheduling pods on the dedicated node.

```yaml
annotations:
  scheduler.alpha.kubernetes.io/tolerations: '[{"key":"dedicated", "value":"izone"}]'
  scheduler.alpha.kubernetes.io/affinity: >
    {
      "nodeAffinity": {
        "requiredDuringSchedulingIgnoredDuringExecution": {
          "nodeSelectorTerms": [
            {
              "matchExpressions": [
                {
                  "key": "example/nodetype",
                  "operator": "In",
                  "values": ["izone"]
                }
              ]
            }
          ]
        }
      }
    }
```
