This is an introduction to a basic setup of code and Resource Configs for it using [skaffold](https://skaffold.dev/)

### Structure:
- packages contains the application we develop (currently a basic api that prints its current configuration)
- k8s contains the Kubernetes Resource Config files
- skaffold.yaml contains the workflow for building, pushing and deploying the application

### To run the demo you will need:
- [docker installed](https://docs.docker.com/engine/install/)
- [kubectl installed](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [skaffold installed](https://skaffold.dev/docs/install/)
- login with your Docker account
- access to a Kubernetes cluster
- possibly change `- image: iteam1337/kustomize-lab-api` in the skaffold.yaml to a Docker image that suits your needs


### Run it

```bash
skaffold run
```