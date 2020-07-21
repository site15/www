export UID=$(id -u)
export GID=$(id -g)
docker-compose -f ./docker/docker-compose.yml up -d --build