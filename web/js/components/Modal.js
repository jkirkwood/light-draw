import React, { useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { view } from "react-easy-state"
import "./Modal.scss"

function Modal({ title, className, children, closable, onClose }) {
	const modalRef = useRef()

	function close() {
		if (closable && onClose) {
			onClose()
		}
	}

	// If user presses escape key, fire onClose handler
	function handleWindowKeyDown(ev) {
		if (ev.keyCode === 27) {
			close()
		}
	}

	useEffect(() => {
		document.body.addEventListener("keydown", handleWindowKeyDown)
		return () =>
			document.body.removeEventListener("keydown", handleWindowKeyDown)
	}, [])

	// If user clicks outside of modal fire onClose handler
	function handleWindowClick(ev) {
		if (modalRef.current && !modalRef.current.contains(ev.target)) {
			close()
		}
	}

	useEffect(() => {
		document.body.addEventListener("click", handleWindowClick)
		return () => document.body.removeEventListener("click", handleWindowClick)
	}, [])

	return (
		<div className="Modal-wrapper">
			<div className="Modal" ref={modalRef}>
				<div className="Modal-header">
					<h2>{title}</h2>
					{closable && <i className="fas fa-times-circle" onClick={close}></i>}
				</div>
				<div className="Modal-content">{children}</div>
			</div>
		</div>
	)
}

Modal.defaultProps = {
	closable: true,
}

Modal.propTypes = {
	title: PropTypes.string.isRequired,
	className: PropTypes.string,
	closable: PropTypes.bool,
	children: PropTypes.oneOfType([
		PropTypes.node,
		PropTypes.element,
		PropTypes.elementType,
		PropTypes.func,
	]).isRequired,
	onClose: PropTypes.func,
}

export default view(Modal)
