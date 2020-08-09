export UID=$(id -u)
export GID=$(id -g)
node ./k8s/generators/generator.js
./docker/$HOST_TYPE/docker-compose-build.sh
docker save $PROJECT_NAME/server:$HOST_TYPE > ./tmp/$PROJECT_NAME-server-$HOST_TYPE.tar
docker save $PROJECT_NAME/static:$HOST_TYPE > ./tmp/$PROJECT_NAME-static-$HOST_TYPE.tar
/snap/bin/microk8s ctr image import ./tmp/$PROJECT_NAME-server-$HOST_TYPE.tar
/snap/bin/microk8s ctr image import ./tmp/$PROJECT_NAME-static-$HOST_TYPE.tar
./k8s/apply.sh
/snap/bin/microk8s kubectl apply -f  ./k8s/$HOST_TYPE/postgres/services