package main

import (
	"context"
	"io/ioutil"
	"log"
	"strings"

	"nhooyr.io/websocket"
)

const (
	MessageImage      = 1
	MessageBrightness = 2
	MessageSaveFiles  = 3
	MessagePixel      = 4
)

func pixelMessage(state *appState, x int, y int, r uint8, g uint8, b uint8) []byte {

	return []byte{MessagePixel, byte(x), byte(y), byte(r), byte(g), byte(b)}
}

func imageMessage(state *appState) []byte {
	imageData := make([]byte, len(state.image.Pix)*3/4)
	n := 0
	// Don't fetch alpha values
	for i, v := range state.image.Pix {
		if (i+1)%4 != 0 {
			imageData[n] = byte(v)
			n = n + 1
		}
	}

	width := state.image.Stride / 4
	height := len(state.image.Pix) / state.image.Stride

	return append([]byte{MessageImage, byte(width), byte(height)}, imageData...)
}

func brightnessMessage(state *appState) []byte {

	return []byte{MessageBrightness, byte(state.brightness)}
}

func saveFilesMessage(state *appState) []byte {

	files, err := ioutil.ReadDir("/home/pi/goledsaves")
	if err != nil {
		log.Printf("could not read saves: %v", err)
		return nil
	}

	fileNames := []string{}

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".png") {
			fileNames = append(fileNames, strings.TrimSuffix(file.Name(), ".png"))
		}
	}

	saveFileData := strings.Join(fileNames, "\n")

	return append([]byte{MessageSaveFiles}, saveFileData...)
}

func sendToOne(conn *websocket.Conn, message []byte) {
	if message == nil {
		return
	}

	err := conn.Write(context.Background(), websocket.MessageBinary, message)
	if err != nil {
		log.Printf("could not send message: %v", err)
	}
}

func sendToAll(conns []*websocket.Conn, message []byte) {
	for _, conn := range conns {
		sendToOne(conn, message)
	}
}

func sendToAllExcept(conns []*websocket.Conn, except *websocket.Conn, message []byte) {
	for _, conn := range conns {
		if conn != except {
			sendToOne(conn, message)
		}
	}
}
