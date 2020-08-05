cat <<EOF >./k8s/$HOST_TYPE/1.configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: site15-$HOST_TYPE
  name: site15-config
data:
  POSTGRES_URL: postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@postgres.postgres-$HOST_TYPE:5432/site15?schema=public
EOF