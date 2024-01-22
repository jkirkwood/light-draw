import React, { useEffect, useRef } from "react"
import iro from "@jaames/iro"
import "./ColorPicker.scss"

function ColorPicker({ value, onChange }) {
  const ref = useRef()
  const colorPicker = useRef()

  const [h, s, v] = value
  const color = { h, s, v }

  useEffect(() => {
    if (!ref.current) {
      return
    }

    if (!colorPicker.current) {
      // create a new iro color picker and pass component props to it
      colorPicker.current = new iro.ColorPicker(ref.current, { color })
    }

    if (colorPicker.current) {
      colorPicker.current.on("color:change", onColorChange)
      return () => {
        colorPicker.current.off("color:change", onColorChange)
      }
    }
  })

  function onColorChange(color) {
    const { h, s, v } = color.hsv
    onChange([h, s, v])
  }

  if (colorPicker.current) {
    const curColor = colorPicker.current.color.hsv
    if (
      color.h !== curColor.h ||
      color.s !== curColor.s ||
      color.v !== curColor.v
    ) {
      colorPicker.current.color.set(color)
    }
  }

  return <div ref={ref} />
}

export default ColorPicker
