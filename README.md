# BlogApp - A full DevOps flow

[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/Naereen/StrapDown.js/blob/master/LICENSE)

For more details about the application, go to the original repo: 
[https://github.com/akashchouhan16/Nodejs-BlogApp](https://github.com/akashchouhan16/Nodejs-BlogApp). 

This repository is used for practising a full DevOps flow, using:
- Docker
- DockerCompose
- Dockerhub
- GithubActions
- Kubernetes
- ArgoCD

## How it works
### Docker and DockerCompose
- There are written `Dockerfile` and `docker-compose.yaml` files for the application;
- The docker orchestration uses the latest image for creating the `mongo` container;
- The username and password are set as environment variables within the `mongo` container, and are initially taken from an `.env` file;
- After running ``` docker-compose up --build ``` the application is fully functional on `localhost:3000`.

### GitHub Actions CI
- There are a few jobs in the workflow, the first is triggered on push to the `master` branch;
- Each job is dependent on the successful completion of the previous job;
- If all of the jobs pass, a new Docker image is created and pushed to my repository on `dockerhub`;
- The credentials for `dockerhub` as well as the necessary environment variables for the application and database are now taken from `GitHub Secrets` from this repository.

### Kubernetes Deployment
- For the purpose of this project, I used Kubernetes from Docker Desktop, as I only needed local testing.
- In the `kubernetes` folder in this repository are the necessary `manifests` for:
  - Namespace,
  - Application Configmap,
  - Application Service,
  - Application Deployment,
  - Database Statefulset,
  - Database Service,
  - Ingress.
- The installation instructions of the controllers used (`ingress nginx` and `argocd`) can be found in the `prerequisites/` folder, or simply be executed with the command `kubectl apply -f prerequisites/`. These commands should create the namespaces `ingress-nginx` and `argocd` automatically. You can check this with `kubectl get namespaces`;
- To check if the Ingress controller was set up correctly I used the commands:
```bash
kubectl get deployment -n ingress-nginx
```
- I applied the cluster by running:
  ```bash
  kubectl apply -f kubernetes/namespace.yaml
  kubectl apply -f kubernetes/
  ```
- Testing of the cluster was done with the commands:
  ```bash
  kubectl get pods -n blogapp
  kubectl logs <pod-name> -n blogapp
  kubectl get svc -n blogapp
  kubectl get ingress -n blogapp
  ```
- As I was only using Kubernetes locally, for testing the application I used `port-forward` to forward traffic from `localhost` to my NGINX Ingress Controller. The command I used was:
```bash
kubectl port-forward svc/ingress-nginx-controller -n ingress-nginx 3000:80
```
After this, the application was available at `localhost:3000`, as long as Docker Desktop was open or running in the background.

### ArgoCD 
- To implement continuous deployment, i used the ArgoCD controller;
- Additional setup after installing the controller:
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 --decode
argocd login localhost:8080
```
- After this the ArgoCD CLI was available at `localhost:8080`. I changed the admin password and was able to supervise the application in the CLI.
- The `app-argocd.yaml` file is in the `kubernetes/` folder, and it is configured to listen to push on `master` on this repository, and sync the changes to my local kubernetes cluster.
- To confirm this I used the command `kubectl get applications -n argocd`, as well as tested if it worked after a push on the `master` branch, and it did!




