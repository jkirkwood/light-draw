import React, { useEffect, useState } from "react"
import colorConvert from "color-convert"

import Canvas from "./components/Canvas"
import MenuBar from "./components/MenuBar"
import SaveMenu from "./components/menus/SaveMenu"
import ColorMenu from "./components/menus/ColorMenu"
import * as ws from "./lib/websocket"
import "./App.scss"
import {
	COLOR_MENU,
	SAVE_MENU,
	PENCIL_TOOL,
	ERASER_TOOL,
	EYEDROPPER_TOOL,
} from "./lib/constants"

export default function App() {
	const [imageData, setImageData] = useState()
	const [brightness, setBrightness] = useState(50)
	const [savedImages, setSavedImages] = useState([])
	const [color, setColor] = useState([0, 100, 100])
	const [swatches, setSwatches] = useState([
		[0, 100, 100], // Red
		[35, 100, 100], // Orange
		[60, 100, 100], // Yellow
		[120, 100, 100], // Green
		[240, 100, 100], // Blue
		[281, 100, 100], // Violet
		[0, 41, 100], // Pink
		[0, 0, 100], // White
	])
	const [selectedSwatch, setSelectedSwatch] = useState()
	const [selectedTool, setSelectedTool] = useState(PENCIL_TOOL)
	const [openMenu, setOpenMenu] = useState()

	function drawPixel(x, y, r, g, b) {
		const offset = (y * imageData.width + x) * 4

		if (
			imageData.data[offset] === r &&
			imageData.data[offset + 1] === g &&
			imageData.data[offset + 2] === b
		) {
			// nothing to do
			return
		}

		const newImageData = new ImageData(
			new Uint8ClampedArray(imageData.data),
			imageData.width,
			imageData.height
		)

		newImageData.data[offset] = r
		newImageData.data[offset + 1] = g
		newImageData.data[offset + 2] = b

		setImageData(newImageData)
	}

	function onTouchPixel(x, y, clear) {
		let [r, g, b] = colorConvert.hsv.rgb(color[0], color[1], color[2])

		if (clear || selectedTool === ERASER_TOOL) {
			;[r, g, b] = [0, 0, 0]
		}

		if (selectedTool === EYEDROPPER_TOOL) {
			const offset = (y * imageData.width + x) * 4
			setColor(
				colorConvert.rgb.hsv([
					imageData.data[offset],
					imageData.data[offset + 1],
					imageData.data[offset + 2],
				])
			)
			return
		}

		drawPixel(x, y, r, g, b)
		ws.setPixel(x, y, r, g, b)
	}

	function clearImage() {
		ws.clearImage()
	}

	function saveImage() {
		ws.saveImage(Date.now().toString())
	}

	function loadImage(fileName) {
		ws.loadImage(fileName)
	}

	function _setBrightness(b) {
		setBrightness(b)
		ws.setBrightness(b)
	}

	function _setSelectedSwatch(i) {
		setSelectedSwatch(i)
		if (swatches[i]) {
			setColor(swatches[i])
		}
	}

	function _setColor(color) {
		if (selectedSwatch != null) {
			const newSwatches = [...swatches]
			newSwatches[selectedSwatch] = color
			setSwatches(newSwatches)
		}

		setColor(color)
	}

	useEffect(() => {
		ws.setListener(async ev => {
			const payload = new Uint8ClampedArray(ev.data)
			if (payload[0] === ws.MESSAGE_IMAGE) {
				const width = payload[1]
				const height = payload[2]
				const origData = payload.slice(3)

				const data = new Uint8ClampedArray((origData.length * 4) / 3)
				let i = 0
				for (let origI = 0; origI < origData.length; origI++) {
					data[i++] = origData[origI]
					if ((origI + 1) % 3 === 0) {
						data[i++] = 255
					}
				}

				setImageData(new ImageData(data, width, height))
			} else if (payload[0] === ws.MESSAGE_BRIGHTNESS) {
				setBrightness(payload[1])
			} else if (payload[0] === ws.MESSAGE_SAVE_FILES) {
				const decoder = new TextDecoder()
				const str = decoder.decode(payload.slice(1))
				setSavedImages(str.split("\n"))
			} else if (payload[0] === ws.MESSAGE_PIXEL) {
				const x = payload[1]
				const y = payload[2]
				const r = payload[3]
				const g = payload[4]
				const b = payload[5]

				drawPixel(x, y, r, g, b)
			}
		})
	})

	return (
		<div className="App">
			<Canvas imageData={imageData} onTouchPixel={onTouchPixel} />
			<MenuBar
				openMenu={openMenu}
				setOpenMenu={setOpenMenu}
				selectedTool={selectedTool}
				setSelectedTool={setSelectedTool}
				color={color}
			/>
			{openMenu === COLOR_MENU && (
				<ColorMenu
					color={color}
					setColor={_setColor}
					swatches={swatches}
					selectedSwatch={selectedSwatch}
					setSelectedSwatch={_setSelectedSwatch}
					clearImage={clearImage}
					brightness={brightness}
					setBrightness={_setBrightness}
					onClose={() => setOpenMenu(null)}
				/>
			)}
			{openMenu === SAVE_MENU && (
				<SaveMenu
					savedImages={savedImages}
					saveImage={saveImage}
					loadImage={loadImage}
					onClose={() => setOpenMenu(null)}
				/>
			)}
		</div>
	)
}
