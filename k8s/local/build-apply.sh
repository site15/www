export UID=$(id -u)
export GID=$(id -g)
docker-compose -f ./k8s/prod/docker-compose.config-yml build
docker save site15/server:prod > ./tmp/site15-server-prod.tar
docker save site15/static:prod > ./tmp/site15-static-prod.tar
microk8s ctr image import ./tmp/site15-server-prod.tar
microk8s ctr image import ./tmp/site15-static-prod.tar
./k8s/prod/apply.sh