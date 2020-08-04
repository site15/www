export UID=$(id -u)
export GID=$(id -g)
docker-compose -f ./docker/prod/docker-compose.yml down
docker volume rm site15-postgresql --force
docker volume rm site15-redis --force