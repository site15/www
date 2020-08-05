./k8s/prod/postgres/generator_1.configmap.yaml.sh
./k8s/prod/generator_global-service.yaml.sh
./k8s/prod/generator_1.configmap.yaml.sh
/snap/bin/microk8s kubectl apply -f  ./k8s/prod/postgres
POD=$(/snap/bin/microk8s kubectl get pod -l app=postgres -n postgres-prod -o jsonpath="{.items[0].metadata.name}")
/snap/bin/microk8s kubectl exec -n postgres-prod $POD -- psql -U postgres -c "CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD'"
/snap/bin/microk8s kubectl exec -n postgres-prod -ti $POD -- psql -U postgres -c "CREATE DATABASE site15"
/snap/bin/microk8s kubectl exec -n postgres-prod -ti $POD -- psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE \"site15\" TO \"$POSTGRES_USER\""
/snap/bin/microk8s kubectl delete deployment site15-static -n site15-prod --now
/snap/bin/microk8s kubectl delete deployment site15-server -n site15-prod --now
/snap/bin/microk8s kubectl apply -f ./k8s/prod
