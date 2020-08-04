microk8s kubectl delete deployment site15-static -n site15-local --now
microk8s kubectl delete deployment site15-server -n site15-local --now
microk8s kubectl apply -f  ./k8s/local
microk8s kubectl apply -f  ./k8s/local/postgres
POD=$(microk8s kubectl get pod -l app=postgres -n postgres-local -o jsonpath="{.items[0].metadata.name}")
microk8s kubectl exec -n postgres-local -ti $POD -- psql -U postgres -c "CREATE USER site15 WITH PASSWORD 'password'"
microk8s kubectl exec -n postgres-local -ti $POD -- psql -U postgres -c "CREATE DATABASE site15"
microk8s kubectl exec -n postgres-local -ti $POD -- psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE \"site15\" TO \"site15\""
