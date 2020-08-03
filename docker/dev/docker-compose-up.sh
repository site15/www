export UID=$(id -u)
export GID=$(id -g)
docker volume create --name=site15-postgresql
docker volume create --name=site15-redis
docker-compose -f ./docker/dev/docker-compose.yml up -d