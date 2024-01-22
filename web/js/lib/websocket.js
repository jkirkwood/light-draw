export const COMMAND_SET_PIXEL = 1
export const COMMAND_SET_BRIGHTNESS = 2
export const COMMAND_CLEAR_IMAGE = 3
export const COMMAND_SAVE_IMAGE = 4
export const COMMAND_LOAD_IMAGE = 5

export const MESSAGE_IMAGE = 1
export const MESSAGE_BRIGHTNESS = 2
export const MESSAGE_SAVE_FILES = 3
export const MESSAGE_PIXEL = 4

let socket
let listener

function connect() {
  const ws = new WebSocket("ws:/lights.local/ws")
  ws.binaryType = "arraybuffer"

  ws.addEventListener("open", function() {
    console.log("socket connection opened")
    socket = ws
  })

  ws.addEventListener("error", function(err) {
    console.log("websocket error:", err)
  })

  // If connection is closed attempt to reopen after a delay
  ws.addEventListener("close", function() {
    socket = null
    console.log("socket connection closed")
    setTimeout(connect, 100 + Math.random(1000))
  })

  ws.addEventListener("message", function(message) {
    if (listener) {
      listener(message)
    }
  })
}

export function setPixel(x, y, r, g, b) {
  if (socket) {
    const data = new Uint8Array(7)
    data[0] = COMMAND_SET_PIXEL
    data[1] = x
    data[2] = y
    data[3] = r
    data[4] = g
    data[5] = b
    socket.send(data)
  }
}

export function setBrightness(brightness) {
  if (socket) {
    const data = new Uint8Array(2)
    data[0] = COMMAND_SET_BRIGHTNESS
    data[1] = brightness
    socket.send(data)
  }
}

export function clearImage() {
  if (socket) {
    const data = new Uint8Array(1)
    data[0] = COMMAND_CLEAR_IMAGE
    socket.send(data)
  }
}

export function saveImage(fileName) {
  if (socket) {
    const encoder = new TextEncoder()
    const fileNameBytes = encoder.encode(fileName)
    const data = new Uint8Array(fileNameBytes.length + 1)
    data[0] = COMMAND_SAVE_IMAGE
    for (const [i, byte] of fileNameBytes.entries()) {
      data[i + 1] = byte
    }
    socket.send(data)
  }
}

export function loadImage(fileName) {
  if (socket) {
    const encoder = new TextEncoder()
    const fileNameBytes = encoder.encode(fileName)
    const data = new Uint8Array(fileNameBytes.length + 1)
    for (const [i, byte] of fileNameBytes.entries()) {
      data[i + 1] = byte
    }
    data[0] = COMMAND_LOAD_IMAGE
    socket.send(data)
  }
}

export function setListener(fn) {
  listener = fn
}

connect()
