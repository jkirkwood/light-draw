#!/bin/bash

set -o errexit

cd /go/src/github.com/jkirkwood/go-led/cmd/led
go get

cd $GOPATH/src/github.com/mcuadros/go-rpi-rgb-led-matrix/vendor/rpi-rgb-led-matrix/
git submodule update --init
make
cd $GOPATH/src/github.com/mcuadros/go-rpi-rgb-led-matrix/
go install -v ./...

cd /go/src/github.com/jkirkwood/go-led/cmd/led
go build
