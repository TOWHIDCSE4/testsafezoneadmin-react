#!/bin/sh

echo "Start CI backend prod"
docker build -t docker.pkg.github.com/safe-zone-org/safezone-admin-react/safezone-admin-react:dev -f Dockerfile .
docker push docker.pkg.github.com/safe-zone-org/safezone-admin-react/safezone-admin-react:dev
echo "Done CI"