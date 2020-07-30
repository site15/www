microk8s kubectl delete deployment site15-static -n site15-prod --now
microk8s kubectl delete deployment site15-server -n site15-prod --now
microk8s kubectl apply -f  ./k8s/prod