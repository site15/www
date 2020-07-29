export UID=$(id -u)
export GID=$(id -g)
docker-compose -f ./k8s/local/docker-compose.config-yml build
docker save site15/server:local > ./tmp/site15-server-local.tar
docker save site15/static:local > ./tmp/site15-static-local.tar
microk8s ctr image import ./tmp/site15-server-local.tar
microk8s ctr image import ./tmp/site15-static-local.tar
./k8s/local/apply.sh