#!/bin/sh

echo "Start CI backend stg"
docker build -t docker.pkg.github.com/safe-zone-org/safezone-admin-react/safezone-admin-react:staging -f Dockerfile-stg .
docker push docker.pkg.github.com/safe-zone-org/safezone-admin-react/safezone-admin-react:staging
echo "Done CI"