The solution shows how kustomize can help structure and customize the application configuration for our `dev` and `prod` environments in the example

This example contains [Bases and Variations](https://kubectl.docs.kubernetes.io/pages/app_customization/bases_and_variants.html) for our `dev` and `prod` environments

- Bases are shared Resource Config in a `kustomization.yaml` to be used and customized by another `kustomization.yaml`
- A project can add a Base by adding a path (relative to the `kustomization.yaml`) to base that points to a directory containing another `kustomization.yaml` file. This will automatically add and kustomize all of the Resources from the base project to the current project.

### Structure:

- this is a very simplified layout where the `Base` is applied to the `dev` environment
  and we have all our specific `prod` customizations as an `Overlay` which allow us to customize arbitrary fields
- [The kustomize docs](https://kubectl.docs.kubernetes.io/pages/app_composition_and_deployment/structure_directories.html) explain a more advanced directory layout
- we also customize the environment variables with the use of the [configMapGenerator](https://kubectl.docs.kubernetes.io/pages/reference/kustomize.html#configmapgenerator)
- skaffold.yaml contains the workflow for building, pushing and deploying the application to both environments by the use of [profiles](https://skaffold.dev/docs/environment/profiles/) and using [Kustomize](https://skaffold.dev/docs/pipeline-stages/deployers/kustomize/) for deploying

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
