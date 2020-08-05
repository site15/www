cat <<EOF >./k8s/prod/postgres/1.configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: postgres-prod
  name: postgres-config
  labels:
    app: postgres
data:
  POSTGRES_USER: $ROOT_POSTGRES_USER
  POSTGRES_PASSWORD: $ROOT_POSTGRES_PASSWORD
EOF