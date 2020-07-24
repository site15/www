export UID=$(id -u)
export GID=$(id -g)
docker-compose -f ./docker/docker-compose-build.yml build