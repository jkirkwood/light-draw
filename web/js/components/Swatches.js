import React from "react"
import colorConvert from "color-convert"
import "./Swatches.scss"

export default function Swatches({ values, selectedIndex, onSelect }) {
  return (
    <div className="Swatches">
      {values.map((value, i) => {
        const [r, g, b] = colorConvert.hsv.rgb(value)
        const selected = selectedIndex === i
        return (
          <div
            className={"Swatch" + (selected ? " selected" : "")}
            key={i}
            style={{ backgroundColor: `rgb(${r},${g},${b})` }}
            onClick={() => onSelect(selected ? null : i)}
          ></div>
        )
      })}
    </div>
  )
}
