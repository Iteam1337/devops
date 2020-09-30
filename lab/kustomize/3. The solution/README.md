The solution shows how kustomize can help structure and customize the application configuration for our `dev` and `prod` environments in the example

### Structure:
- packages contains the application we develop (currently a basic api that prints its current configuration)
- k8s contains the Kubernetes Resource Config files divided into `dev` and `prod` folders
- skaffold.yaml contains the workflow for building, pushing and deploying the application to both environments by the use of [profiles](https://skaffold.dev/docs/environment/profiles/)

### To run the demo you will need:
- [docker installed](https://docs.docker.com/engine/install/)
- [kubectl installed](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [skaffold installed](https://skaffold.dev/docs/install/)
- login with your Docker account
- access to a Kubernetes cluster
- possibly change `- image: iteam1337/kustomize-lab-api` in the skaffold.yaml to a Docker image that suits your needs


### Run it

Deploy to dev

```bash
skaffold run
```

Deploy to prod
```bash
skaffold run --profile prod
```