# Traefik setup

We use Traefik as an [Ingress Controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/).

All the resources needed and the configuration for it are in `traefik.yaml`.

This setup is intended for clusters where you use multiple worker nodes (more than 1), hence the use of `type: LoadBalancer` in the traefik Service and the choice for `cert-manager` for dealing with Let's Encrypt.

- This guide sets Traefik as a `Daemonset` (1 replica per worker node).
- This means that you can scale up or down and you would have a Traefik instance on every node
- You can setup things differently of course by having different worker pools and only running Traefik on one pool that has only 1 worker node but that is outside of the scope of this setup.
- Even though Traefik can manage Let's Encrypt certificates, the way you set that up is by using a persistent volume for storing it. This becomes a problem once you run several instances of Traefik per each node having their own volume that will eventually all try to renew certificates because they all have their own versions and there is no syncronisation unless you go the route of setting up Traefik in Cluster mode.
- Using `cert-manager` you store certificates into `secrets` which are shared across nodes and also has a nicer separation for domains we request certificates for - reducing the risk for someone to accidentally affect other websites by misconfiguration in the Traefik config

### Deploy Traefik

```bash
kubectl apply -f traefik.yaml
```

- The way it's setup now is by allowing port 80 and 443 and having a redirect from port 80 to 443.

- You can check [Traefik docs](https://docs.traefik.io/) and make changes to the config based on your needs.

- When applying config changes (aka making changes to the `ConfigMap` object) you want to redeploy traefik.

```bash
kubectl -n kube-system rollout restart daemonset traefik
```
