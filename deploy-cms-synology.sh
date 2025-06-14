docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "Frontend deployed on Synology NAS"
echo "API: http://192.168.1.200:3333"