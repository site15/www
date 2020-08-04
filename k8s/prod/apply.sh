/snap/bin/microk8s kubectl delete deployment site15-static -n site15-prod --now
/snap/bin/microk8s kubectl delete deployment site15-server -n site15-prod --now
/snap/bin/microk8s kubectl apply -f ./k8s/prod
/snap/bin/microk8s kubectl apply -f  ./k8s/prod/postgres
POD=$(/snap/bin/microk8s kubectl get pod -l app=postgres -n postgres-prod -o jsonpath="{.items[0].metadata.name}")
/snap/bin/microk8s kubectl exec -n postgres-prod $POD -- psql -U postgres -d site15 -c "CREATE USER site15 WITH PASSWORD 'password'"
/snap/bin/microk8s kubectl exec -n postgres-prod -ti $POD -- psql -U postgres -d site15 -c "CREATE DATABASE site15"
/snap/bin/microk8s kubectl exec -n postgres-prod -ti $POD -- psql -U postgres -d site15 -c "GRANT ALL PRIVILEGES ON DATABASE \"site15\" TO \"site15\""
