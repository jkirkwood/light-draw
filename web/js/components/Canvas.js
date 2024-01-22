import React, { useState, useEffect, useRef } from "react"
import "./Canvas.scss"

function Canvas({ imageData, onTouchPixel }) {
  const canvasRef = useRef()

  const [mouseDown, setMouseDown] = useState(false)

  useEffect(() => {
    if (imageData) {
      const ctx = canvasRef.current.getContext("2d")
      ctx.putImageData(imageData, 0, 0)
    }
  }, [imageData])

  function draw(ev) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    let x = ev.clientX - rect.left
    let y = ev.clientY - rect.top
    const xScale = rect.width / imageData.width
    const yScale = rect.height / imageData.height

    x = Math.floor(x / xScale)
    y = Math.floor(y / yScale)

    onTouchPixel(x, y, ev.shiftKey)
  }

  function onMouseDown() {
    setMouseDown(true)
  }

  function onMouseUp() {
    setMouseDown(false)
  }

  function onMouseMove(ev) {
    if (mouseDown) {
      draw(ev)
    }
  }

  function onTouchStart(ev) {
    for (let i = 0; i < ev.changedTouches.length; i++) {
      draw(ev.touches[i])
    }
    ev.preventDefault()
    ev.stopPropagation()
    return false
  }

  function onTouchMove(ev) {
    for (let i = 0; i < ev.changedTouches.length; i++) {
      draw(ev.touches[i])
    }
    ev.preventDefault()
    ev.stopPropagation()
    return false
  }

  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp)
    return () => {
      document.removeEventListener("mouseup", onMouseUp)
    }
  })

  const rows = new Array(imageData && imageData.height).fill(0).map((v, i) => i)
  const columns = new Array(imageData && imageData.width)
    .fill(0)
    .map((v, i) => i)

  return (
    <div className="Canvas">
      {imageData && (
        <React.Fragment>
          <canvas
            ref={canvasRef}
            width={imageData.width}
            height={imageData.height}
            onClick={draw}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onTouchMove={onTouchMove}
            onTouchStart={onTouchStart}
          ></canvas>
          <table className="overlay">
            <tbody>
              {rows.map(x => (
                <tr key={x}>
                  {columns.map(y => (
                    <td key={y}></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </React.Fragment>
      )}
    </div>
  )
}

export default React.memo(Canvas)
