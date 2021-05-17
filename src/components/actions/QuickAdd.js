import React, { memo, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

function QuickAdd(props) {
	const {
		newComponentContext,
		mutateMapText,
		setNewComponentContext,
		mapText,
	} = props;
	const [showAdd, setShowAdd] = useState(false);
	const componentName = useRef(null);

	useEffect(() => {
		if (showAdd) componentName.current.focus();
	}, [showAdd]);

	useEffect(() => {
		const handleEscape = k => {
			if (k.key === 'Escape') {
				document.removeEventListener('keyup', handleEscape);
				cancelShowAdd();
			}
		};

		if (newComponentContext) {
			setShowAdd(true);
			document.addEventListener('keyup', handleEscape);
		}
		return function cleanup() {
			document.removeEventListener('keyup', handleEscape);
		};
	}, [newComponentContext]);

	function cancelShowAdd() {
		setShowAdd(false);
		setNewComponentContext(null);
	}

	function addNewComponent() {
		if (componentName.current.value.trim().length === 0) return;
		setShowAdd(false);
		mutateMapText(
			mapText +
				`\r\ncomponent ${componentName.current.value} [${newComponentContext.y}, ${newComponentContext.x}]`
		);
	}

	return (
		showAdd && (
			<div id="create-element">
				<span id="close">
					<div id="cross" onClick={cancelShowAdd}>
						<svg className="svg-icon" viewBox="0 0 20 20">
							<path
								fill="none"
								d="M8.55,7.968l7.301-7.301c0.153-0.152,0.153-0.399,0-0.551c-0.152-0.152-0.397-0.152-0.55,0L8,7.417
                        L0.699,0.116c-0.152-0.152-0.399-0.152-0.551,0s-0.152,0.399,0,0.551l7.301,7.301L0.147,15.27c-0.152,0.151-0.152,0.398,0,0.55
                        c0.152,0.153,0.399,0.153,0.551,0L8,8.519l7.301,7.301c0.152,0.153,0.397,0.153,0.55,0c0.153-0.151,0.153-0.398,0-0.55L8.55,7.968z
                        "
							></path>
						</svg>
					</div>
				</span>
				<div id="create-entry">
					<input
						placeholder="Type to add"
						ref={componentName}
						onKeyPress={e => {
							if (e.key === 'Enter') addNewComponent();
						}}
					/>
					<span>Press Enter to add, Escape to cancel.</span>
					<div id="add" onClick={addNewComponent}>
						<div id="done">
							<svg className="svg-icon" viewBox="0 0 20 20">
								<path
									fill="none"
									d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
								></path>
							</svg>
						</div>
					</div>
				</div>
			</div>
		)
	);
}

QuickAdd.propTypes = {
	setNewComponentContext: PropTypes.func,
	newComponentContext: PropTypes.object,
	mutateMapText: PropTypes.func,
};

export default memo(QuickAdd);
