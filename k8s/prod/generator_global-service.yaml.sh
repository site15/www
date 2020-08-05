cat <<EOF >./k8s/prod/postgres/services/global-service.yaml
apiVersion: v1
kind: Service
metadata:
  namespace: postgres-prod
  name: site15-global-postgres
  labels:
    app: postgres
spec:
  type: NodePort
  ports:
    - port: 5432
      nodePort: $POSTGRES_PORT
  selector:
    app: postgres
EOF