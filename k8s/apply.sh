./k8s/generators/generator-postgres_1.configmap.yaml.sh
./k8s/generators/generator_global-service.yaml.sh
./k8s/generators/generator_1.configmap.yaml.sh
/snap/bin/microk8s kubectl apply -f  ./k8s/$HOST_TYPE/postgres
POD=$(/snap/bin/microk8s kubectl get pod -l app=postgres -n postgres-$HOST_TYPE -o jsonpath="{.items[0].metadata.name}")
/snap/bin/microk8s kubectl exec -n postgres-$HOST_TYPE $POD -- psql -U postgres -c "CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD'"
/snap/bin/microk8s kubectl exec -n postgres-$HOST_TYPE -ti $POD -- psql -U postgres -c "CREATE DATABASE site15"
/snap/bin/microk8s kubectl exec -n postgres-$HOST_TYPE -ti $POD -- psql -U postgres -d "site15" -c "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO $POSTGRES_USER"
/snap/bin/microk8s kubectl exec -n postgres-$HOST_TYPE -ti $POD -- psql -U postgres -d "site15" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $POSTGRES_USER"
/snap/bin/microk8s kubectl exec -n postgres-$HOST_TYPE -ti $POD -- psql -U postgres -d "site15" -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $POSTGRES_USER"
/snap/bin/microk8s kubectl exec -n postgres-$HOST_TYPE -ti $POD -- psql -U postgres -d "site15" -c "GRANT ALL PRIVILEGES ON DATABASE site15 TO $POSTGRES_USER"
/snap/bin/microk8s kubectl exec -n postgres-$HOST_TYPE -ti $POD -- psql -U postgres -d "site15" -c "ALTER USER $POSTGRES_USER WITH LOGIN CREATEROLE NOCREATEDB NOSUPERUSER INHERIT"
/snap/bin/microk8s kubectl delete deployment site15-static -n site15-$HOST_TYPE --now
/snap/bin/microk8s kubectl delete deployment site15-server -n site15-$HOST_TYPE --now
/snap/bin/microk8s kubectl apply -f ./k8s/$HOST_TYPE
