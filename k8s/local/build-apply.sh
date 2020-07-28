export UID=$(id -u)
export GID=$(id -g)
docker-compose -f ./k8s/docker-compose.docker-compose-yml build
docker save site15/server:local > ./tmp/site15-server.tar
docker save site15/static:local > ./tmp/site15-static.tar
microk8s ctr image import ./tmp/site15-server.tar
microk8s ctr image import ./tmp/site15-static.tar
microk8s kubectl apply -f  ./k8s/local