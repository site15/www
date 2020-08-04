export UID=$(id -u)
export GID=$(id -g)
./docker/local/docker-compose-build.sh
docker save site15/server:local > ./tmp/site15-server-local.tar
docker save site15/static:local > ./tmp/site15-static-local.tar
microk8s ctr image import ./tmp/site15-server-local.tar
microk8s ctr image import ./tmp/site15-static-local.tar
./k8s/local/apply.sh