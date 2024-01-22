import React from "react"
import ColorPicker from "../ColorPicker"
import Swatches from "../Swatches"
import "./ColorMenu.scss"

function ColorMenu({
	color,
	setColor,
	swatches,
	selectedSwatch,
	setSelectedSwatch,
	clearImage,
	brightness,
	setBrightness,
	onClose,
}) {
	return (
		<div className="ColorMenu menu">
			<i className="far fa-times-circle close" onClick={() => onClose()}></i>
			<ColorPicker value={color} onChange={setColor} />
			<Swatches
				values={swatches}
				selectedIndex={selectedSwatch}
				onSelect={setSelectedSwatch}
			/>
			<div>
				<button onClick={clearImage}>Clear</button>
			</div>
			<div>
				<input
					type="range"
					min={0}
					max={100}
					value={brightness}
					onChange={ev => setBrightness(parseInt(ev.target.value))}
				/>
			</div>
		</div>
	)
}

export default React.memo(ColorMenu)
