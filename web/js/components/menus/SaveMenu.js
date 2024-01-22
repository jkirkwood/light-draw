import React from "react"
import "./SaveMenu.scss"

function SaveMenu({ savedImages, saveImage, loadImage, onClose }) {
	return (
		<div className="SaveMenu menu">
			<i
				className="far fa-times-circle close"
				onClick={() => onClose(null)}
			></i>
			<button onClick={saveImage}>Save</button>
			<ul>
				{savedImages.map(file => (
					<li key={file}>
						<img
							onClick={() => loadImage(file)}
							src={"http://lights.local/saves/" + file + ".png"}
						/>
					</li>
				))}
			</ul>
		</div>
	)
}

export default React.memo(SaveMenu)
