package main

import (
	"image"

	rgbmatrix "github.com/mcuadros/go-rpi-rgb-led-matrix"
	"nhooyr.io/websocket"
)

type appState struct {
	canvas      *rgbmatrix.Canvas
	image       *image.RGBA
	brightness  int
	connections []*websocket.Conn
}
