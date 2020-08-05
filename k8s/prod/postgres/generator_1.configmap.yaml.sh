cat <<EOF >./k8s/prod/postgres/1.configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: postgres-prod
  name: postgres-config
  labels:
    app: postgres
data:
  POSTGRES_USER: $POSTGRES_USER
  POSTGRES_PASSWORD: $POSTGRES_PASSWORD
EOF