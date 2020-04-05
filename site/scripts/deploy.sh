#!/bin/sh
set -e

if [ -z "$DOCKER_REGISTRY" ]; then
    echo "Need to set DOCKER_REGISTRY"
    exit 1
fi

docker build --no-cache -t $DOCKER_REGISTRY/coronatab-site:latest -f site/Dockerfile .
docker push $DOCKER_REGISTRY/coronatab-site:latest

gcloud beta run deploy coronatab-site \
--image $DOCKER_REGISTRY/coronatab-site:latest \
--allow-unauthenticated \
--platform=managed \
--region=europe-west1

./site/node_modules/.bin/ts-node -O '{"module":"commonjs"}' ./site/scripts/purge-cache.ts || echo "❌ Failed to purge Cloudflare cache"
