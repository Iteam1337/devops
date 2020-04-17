### Amazon EKS

Lorem ipsum dolor sit amet

### Getting started

- The easiest way to get started is using `eksctl` following their [instructions](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html)

- Recommendation is to use nodes with at least 4 GB of RAM (like t3.medium)

### IO1 storage class

- EKS cluster seems to have installed only the General Purpose SSD volume type (`gp2`)

- If you need Provisioned IOPS you can simply create the storage class for it:

  - first check if you have the class

    ```bash
    kubectl get storageclasses.storage.k8s.io
    ```

  - if you don't have `io1` then you can just install it:

    ```bash
    kubectl apply -f io1-storageclass.yaml
    ```
