# Site15

This project was generated using [Nx](https://nx.dev).

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="450"></p>

🔎 **Nx is a set of Extensible Dev Tools for Monorepos.**

## Quick Start & Documentation

[Nx Documentation](https://nx.dev/angular)

[10-minute video showing all Nx features](https://nx.dev/angular/getting-started/what-is-nx)

[Interactive Tutorial](https://nx.dev/angular/tutorial/01-create-application)

## Adding capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are our core plugins:

- [Angular](https://angular.io)
  - `ng add @nrwl/angular`
- [React](https://reactjs.org)
  - `ng add @nrwl/react`
- Web (no framework frontends)
  - `ng add @nrwl/web`
- [Nest](https://nestjs.com)
  - `ng add @nrwl/nest`
- [Express](https://expressjs.com)
  - `ng add @nrwl/express`
- [Node](https://nodejs.org)
  - `ng add @nrwl/node`

There are also many [community plugins](https://nx.dev/nx-community) you could add.

## Generate an application

Run `ng g @nrwl/angular:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

## Generate a library

Run `ng g @nrwl/angular:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are sharable across libraries and applications. They can be imported from `@site15/mylib`.

## Development server

Run `ng serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng g component my-component --project=my-app` to generate a new component.

## Build

Run `ng build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

## Running end-to-end tests

Run `ng e2e my-app` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.

## Understand your workspace

Run `nx dep-graph` to see a diagram of the dependencies of your projects.

## Further help

Visit the [Nx Documentation](https://nx.dev/angular) to learn more.

## ☁ Nx Cloud

### Computation Memoization in the Cloud

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-cloud-card.png"></p>

Nx Cloud pairs with Nx in order to enable you to build and test code more rapidly, by up to 10 times. Even teams that are new to Nx can connect to Nx Cloud and start saving time instantly.

Teams using Nx gain the advantage of building full-stack applications with their preferred framework alongside Nx’s advanced code generation and project dependency graph, plus a unified experience for both frontend and backend developers.

Visit [Nx Cloud](https://nx.app/) to learn more.

# Run with docker-compose in development mode
```bash
npm run docker:dev:up
# open http://localhost:9090/
```

# Run with docker-compose
```bash
npm run docker:prod:up
# open http://localhost:9090/
```

# Run with microk8s in local

```bash
sudo snap install microk8s --classic
microk8s enable dashboard dns registry ingress metrics-server storage
microk8s kubectl create namespace cert-manager
microk8s kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/nginx-0.26.1/deploy/static/mandatory.yaml
microk8s kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/nginx-0.26.1/deploy/static/provider/cloud-generic.yaml
microk8s kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v0.12.0/cert-manager.yaml
microk8s kubectl get pods --namespace cert-manager
# wait until all not set to Running, example
# NAME                                       READY   STATUS    RESTARTS   AGE
# cert-manager-85db5c4c87-n9lwb              1/1     Running   3          7d9h
# cert-manager-cainjector-7959549c78-lkg69   1/1     Running   3          7d9h
# cert-manager-webhook-5c8696f555-b7bzr      1/1     Running   3          7d9h
npm run k8s:local:build-apply
# open http://localhost/site15
```

# Run with microk8s

```bash
sudo snap install microk8s --classic
microk8s enable dashboard dns registry ingress metrics-server storage
microk8s kubectl create namespace cert-manager
microk8s kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/nginx-0.26.1/deploy/static/mandatory.yaml
microk8s kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/nginx-0.26.1/deploy/static/provider/cloud-generic.yaml
microk8s kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v0.12.0/cert-manager.yaml
microk8s kubectl get pods --namespace cert-manager
# wait until all not set to Running, example
# NAME                                       READY   STATUS    RESTARTS   AGE
# cert-manager-85db5c4c87-n9lwb              1/1     Running   3          7d9h
# cert-manager-cainjector-7959549c78-lkg69   1/1     Running   3          7d9h
# cert-manager-webhook-5c8696f555-b7bzr      1/1     Running   3          7d9h
npm run k8s:local:apply
```

# Utils
```
microk8s kubectl get pods --all-namespaces -l app.kubernetes.io/name=ingress-nginx
microk8s kubectl get all --all-namespaces
microk8s kubectl describe certificate echo-tls
microk8s kubectl delete namespace site15-local
microk8s kubectl delete namespace postgres-local
```