docker save site15/server > ./tmp/site15-server.tar
docker save site15/static > ./tmp/site15-static.tar
microk8s ctr image import ./tmp/site15-server.tar
microk8s ctr image import ./tmp/site15-static.tar
microk8s kubectl apply -f  ./k8s/local