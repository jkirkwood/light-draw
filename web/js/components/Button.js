import React from "react"
import { view } from "react-easy-state"
import "./Button.scss"
import PropTypes from "prop-types"
import Spinner from "./Spinner"

function Button({
	text,
	icon,
	loading,
	disabled,
	className,
	id,
	type,
	title,
	onPress,
}) {
	return (
		<button
			id={id}
			className={"Button" + (className ? " " + className : "")}
			disabled={disabled || loading}
			type={type}
			title={title}
			onClick={onPress}
		>
			<div className="Button-content">
				{icon != null && <i className={"fas fa-" + icon}></i>}
				<div className="Button-text">{text != null && text}</div>
				{loading && <Spinner />}
			</div>
		</button>
	)
}

Button.propTypes = {
	text: PropTypes.string,
	icon: PropTypes.string,
	loading: PropTypes.bool,
	disabled: PropTypes.bool,
	className: PropTypes.string,
	id: PropTypes.string,
	type: PropTypes.string,
	title: PropTypes.string,
	onPress: PropTypes.func,
}

export default view(Button)
