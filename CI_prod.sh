#!/bin/sh

echo "Start CI backend prod"
docker build -t docker.pkg.github.com/safe-zone-org/safezone-admin-react/safezone-admin-react:main -f Dockerfile-Prod .
docker push docker.pkg.github.com/safe-zone-org/safezone-admin-react/safezone-admin-react:main
echo "Done CI"