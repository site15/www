cat <<EOF >./k8s/prod/1.configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: site15-prod
  name: site15-config
data:
  POSTGRES_URL: postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@postgres.postgres-prod:5432/site15?schema=public
EOF