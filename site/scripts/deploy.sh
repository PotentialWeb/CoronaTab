#!/bin/sh
set -e

if [ -z "$DOCKER_REGISTRY" ]; then
    echo "Need to set DOCKER_REGISTRY"
    exit 1
fi  

docker build --no-cache -t $DOCKER_REGISTRY/coronatab-site:latest --build-arg DB_URL=$DB_URL -f site/Dockerfile .
docker push $DOCKER_REGISTRY/coronatab-site:latest

gcloud beta run deploy coronatab-site \
--image $DOCKER_REGISTRY/coronatab-site:latest \
--allow-unauthenticated \
--platform=managed \
--region=europe-west1