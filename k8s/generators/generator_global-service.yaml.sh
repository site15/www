cat <<EOF >./k8s/$HOST_TYPE/postgres/services/global-service.yaml
apiVersion: v1
kind: Service
metadata:
  namespace: postgres-$HOST_TYPE
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