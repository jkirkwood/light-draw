package main

import (
	"image"
	"image/color"
	"image/draw"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/go-chi/chi"
	"github.com/gobuffalo/packr/v2"
	rgbmatrix "github.com/mcuadros/go-rpi-rgb-led-matrix"
	"nhooyr.io/websocket"
)

var connections []websocket.Conn

func main() {
	// create a new Matrix instance with the DefaultConfig
	m, _ := rgbmatrix.NewRGBLedMatrix(&rgbmatrix.HardwareConfig{
		Rows:            16,
		Cols:            32,
		HardwareMapping: "adafruit-hat",
		ChainLength:     1,
		Parallel:        1,
		Brightness:      100,
	})

	state := &appState{
		canvas:      rgbmatrix.NewCanvas(m),
		image:       image.NewRGBA(image.Rect(0, 0, 32, 16)),
		brightness:  50,
		connections: []*websocket.Conn{},
	}
	defer state.canvas.Close() // don't forgot close the Matrix, if not your leds will remain on

	lock := sync.Mutex{}

	r := chi.NewRouter()

	r.Get("/ws", func(w http.ResponseWriter, req *http.Request) {
		conn, err := websocket.Accept(w, req, &websocket.AcceptOptions{
			InsecureSkipVerify: true,
		})
		if err != nil {
			log.Printf("could not accept websocket: %v", err)
			return
		}
		defer conn.Close(websocket.StatusInternalError, "")

		lock.Lock()
		state.connections = append(state.connections, conn)
		log.Printf("client connected: %s, total: %d", req.RemoteAddr, len(state.connections))
		lock.Unlock()
		defer func() {
			lock.Lock()
			newConns := []*websocket.Conn{}
			for _, c := range state.connections {
				if c != conn {
					newConns = append(newConns, c)
				}
			}
			state.connections = newConns
			log.Printf("client disconnected: %s, total: %d", req.RemoteAddr, len(state.connections))
			lock.Unlock()
		}()

		sendToOne(conn, imageMessage(state))
		sendToOne(conn, brightnessMessage(state))
		sendToOne(conn, saveFilesMessage(state))

		for {
			if req.Context().Err() != nil {
				break
			}

			messageType, message, err := conn.Read(req.Context())
			if err != nil {
				log.Printf("could not read websocket: %v", err)
				return
			}

			if messageType != websocket.MessageBinary {
				log.Printf("invalid websocket message type: %v", messageType)
				return
			}

			lock.Lock()

			processCommand(conn, state, message)

			draw.Draw(state.canvas, state.canvas.Bounds(), state.image, image.ZP, draw.Src)
			brightnessOverlay := image.NewUniform(color.RGBA{0, 0, 0, uint8(255.0 - (float64(state.brightness)/100.0)*255.0)})
			draw.Draw(state.canvas, state.canvas.Bounds(), brightnessOverlay, image.ZP, draw.Over)
			state.canvas.Render()

			lock.Unlock()
		}

		conn.Close(websocket.StatusNormalClosure, "")
	})

	r.Get("/saves/{fileName}.png", func(w http.ResponseWriter, req *http.Request) {
		fileName := chi.URLParam(req, "fileName")

		data, err := ioutil.ReadFile("/home/pi/goledsaves/" + fileName + ".png")
		if err == os.ErrNotExist {
			w.WriteHeader(404)
			return
		}
		if err != nil {
			log.Printf("could not open file: %v", err)
			w.WriteHeader(500)
			return
		}

		w.Write(data)
	})

	r.Get("/ping", func(w http.ResponseWriter, req *http.Request) {
		w.Write([]byte("Hello!"))
	})

	box := packr.New("statics", "../../web/dist")
	r.Handle("/*", http.FileServer(box))

	err := http.ListenAndServe(":80", r)
	log.Fatalf("could not open server: %v", err)
}
