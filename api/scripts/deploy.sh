#!/bin/sh

if [ -z "$DOCKER_REGISTRY" ]; then
    echo "Need to set DOCKER_REGISTRY"
    exit 1
fi  

if [ -z "$DB_URL" ]; then
    echo "Need to set DB_URL"
    exit 1
fi

docker build --no-cache -t $DOCKER_REGISTRY/coronatab-api:latest --build-arg DB_URL=$DB_URL -f api/Dockerfile .
docker push $DOCKER_REGISTRY/coronatab-api:latest

gcloud beta run deploy coronatab-api \
--image $DOCKER_REGISTRY/coronatab-api:latest \
--allow-unauthenticated \
--platform=managed \
--region=europe-west1