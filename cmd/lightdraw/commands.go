package main

import (
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"log"
	"os"

	"nhooyr.io/websocket"
)

const (
	CommandSetPixel      = 1
	CommandSetBrightness = 2
	CommandClearImage    = 3
	CommandSaveImage     = 4
	CommandLoadImage     = 5
)

func processSetPixelCommand(conn *websocket.Conn, state *appState, payload []byte) {
	x := int(payload[0])
	y := int(payload[1])
	r := uint8(payload[2])
	g := uint8(payload[3])
	b := uint8(payload[4])

	color := color.RGBA{r, g, b, 255}
	state.image.SetRGBA(x, y, color)

	sendToAllExcept(state.connections, conn, pixelMessage(state, x, y, r, g, b))
}

func processSetBrightnessCommand(conn *websocket.Conn, state *appState, payload []byte) {
	state.brightness = int(payload[0])
	sendToAllExcept(state.connections, conn, brightnessMessage(state))
}

func processClearImageCommand(conn *websocket.Conn, state *appState, payload []byte) {
	state.image = image.NewRGBA(image.Rect(0, 0, 32, 16))
	sendToAll(state.connections, imageMessage(state))
}

func processSaveImageCommand(conn *websocket.Conn, state *appState, payload []byte) {
	fileName := string(payload)

	f, err := os.Create("/home/pi/goledsaves/" + fileName + ".png")
	if err != nil {
		log.Printf("could not create save file: %v", err)
		return
	}

	if err := png.Encode(f, state.image); err != nil {
		f.Close()
		log.Printf("could not encode png: %v", err)
		return
	}

	if err := f.Close(); err != nil {
		log.Printf("could not close file: %v", err)
		return
	}

	sendToAll(state.connections, saveFilesMessage(state))
}

func processLoadImageCommand(conn *websocket.Conn, state *appState, payload []byte) {
	fileName := string(payload)

	f, err := os.Open("/home/pi/goledsaves/" + fileName + ".png")
	if err != nil {
		log.Printf("could not open file: %v", err)
		return
	}

	pngImg, err := png.Decode(f)
	if err != nil {
		log.Printf("could not decode png: %v", err)
		return
	}

	b := pngImg.Bounds()
	state.image = image.NewRGBA(image.Rect(0, 0, b.Dx(), b.Dy()))
	draw.Draw(state.image, state.image.Bounds(), pngImg, b.Min, draw.Src)

	sendToAll(state.connections, imageMessage(state))
}

func processCommand(conn *websocket.Conn, state *appState, message []byte) {
	command := message[0]
	payload := []byte{}
	if len(message) > 1 {
		payload = message[1:]
	}

	switch command {
	case CommandSetPixel:
		processSetPixelCommand(conn, state, payload)
	case CommandSetBrightness:
		processSetBrightnessCommand(conn, state, payload)
	case CommandClearImage:
		processClearImageCommand(conn, state, payload)
	case CommandSaveImage:
		processSaveImageCommand(conn, state, payload)
	case CommandLoadImage:
		processLoadImageCommand(conn, state, payload)
	}
}
