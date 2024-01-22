import React from "react"
import ReactDOM from "react-dom"
import "normalize.css"
import "@fortawesome/fontawesome-free/css/all.css"
import "../styles/main.scss"
import App from "./App"

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(<App />, document.getElementById("root"))

  // Prevent scrolling on iOS
  document.body.addEventListener(
    "touchmove",
    ev => {
      ev.preventDefault()
    },
    { passive: false }
  )

  document.body.addEventListener(
    "touchend",
    ev => {
      ev.preventDefault()
    },
    { passive: false }
  )

  document.body.addEventListener(
    "touchmove",
    ev => {
      ev.preventDefault()
    },
    { passive: false }
  )
})
