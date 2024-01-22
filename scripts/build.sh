#!/bin/bash

set -o errexit

echo "Building frontend"
cd ./web
npm install
npm run build

cd ../cmd/lightdraw

echo "Packing static files"
packr2

echo "Building backend"
docker run -it --rm \
  -v /Users/James/Repositories/jkirkwood/go-led:/go/src/github.com/jkirkwood/go-led \
  -w /go/src/github.com/jkirkwood/go-led \
  -e CGO_ENABLED=1 \
  docker.elastic.co/beats-dev/golang-crossbuild:1.13.12-arm \
  --build-cmd "/bin/bash -c ./scripts/build-docker.sh" \
  -p "linux/armv6"

packr2 clean

echo "Done"
