import React from "react"
import colorConvert from "color-convert"
import "./MenuBar.scss"
import {
  COLOR_MENU,
  SAVE_MENU,
  PENCIL_TOOL,
  ERASER_TOOL,
  EYEDROPPER_TOOL,
} from "../lib/constants"

function MenuBar({
  openMenu,
  setOpenMenu,
  selectedTool,
  setSelectedTool,
  color,
}) {
  function toggleColorMenu() {
    setOpenMenu(openMenu === COLOR_MENU ? null : COLOR_MENU)
  }

  function toggleSaveMenu() {
    setOpenMenu(openMenu === SAVE_MENU ? null : SAVE_MENU)
  }

  const [r, g, b] = colorConvert.hsv.rgb(color[0], color[1], color[2])

  return (
    <div className="MenuBar">
      <div className={"item" + (selectedTool === PENCIL_TOOL ? " active" : "")}>
        <i
          className="fas fa-pencil-alt"
          onClick={() => setSelectedTool(PENCIL_TOOL)}
        ></i>
      </div>
      <div className={"item" + (selectedTool === ERASER_TOOL ? " active" : "")}>
        <i
          className="fas fa-eraser"
          onClick={() => setSelectedTool(ERASER_TOOL)}
        ></i>
      </div>
      <div
        className={"item" + (selectedTool === EYEDROPPER_TOOL ? " active" : "")}
      >
        <i
          className="fas fa-eye-dropper"
          onClick={() => setSelectedTool(EYEDROPPER_TOOL)}
        ></i>
      </div>

      <div className="divider" />

      <div className="item">
        <i className="fas fa-palette" onClick={toggleColorMenu}></i>
        <div
          className="color-preview"
          style={{ backgroundColor: `rgb(${r},${g},${b})` }}
        />
      </div>
      <div className="item">
        <i className="fas fa-save" onClick={toggleSaveMenu}></i>
      </div>
    </div>
  )
}

export default React.memo(MenuBar)
