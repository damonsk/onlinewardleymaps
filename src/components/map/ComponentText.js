import React from 'react';

function ComponentText(props) {
	const elementId = 'element_text_' + props.element.id;
	const getMetaPosition = () => {
		var defaultPosition = {
			x: props.mapStyleDefs.component.textOffset,
			y: -props.mapStyleDefs.component.textOffset,
			coords: {},
		};
		if (props.metaText.length > 0) {
			var meta = JSON.parse(props.metaText);
			var itemToModify = meta.find(el => {
				if (el.name == elementId) return el;
			});
			if (itemToModify != undefined) {
				return {
					x: itemToModify.x,
					y: itemToModify.y,
					coords: {},
				};
			} else return defaultPosition;
		}
		return defaultPosition;
	};

	const [position, setPosition] = React.useState(getMetaPosition());

	const handleMouseMove = React.useRef(e => {
		setPosition(position => {
			const xDiff = position.coords.x - e.pageX;
			const yDiff = position.coords.y - e.pageY;
			return {
				x: position.x - xDiff,
				y: position.y - yDiff,
				coords: {
					x: e.pageX,
					y: e.pageY,
				},
			};
		});
	});

	const handleMouseDown = e => {
		const pageX = e.pageX;
		const pageY = e.pageY;

		setPosition(position =>
			Object.assign({}, position, {
				coords: {
					x: pageX,
					y: pageY,
				},
			})
		);
		document.addEventListener('mousemove', handleMouseMove.current);
	};

	const handleMouseUp = () => {
		document.removeEventListener('mousemove', handleMouseMove.current);
		setPosition(position =>
			Object.assign({}, position, {
				coords: {},
			})
		);
		endDrag();
	};

	const endDrag = () => {
		if (props.metaText.length > 0) {
			var meta = JSON.parse(props.metaText);
			if (meta.find(el => el.name == elementId) == undefined) {
				meta.push({ name: elementId, x: position.x, y: position.y });
			}
			var modifiedArray = meta.map(el => {
				if (el.name == elementId) {
					el.x = position.x;
					el.y = position.y;
				}
				return el;
			});
			props.setMetaText(JSON.stringify(modifiedArray));
		} else {
			props.setMetaText(
				JSON.stringify([{ name: elementId, x: position.x, y: position.y }])
			);
		}
	};

	return (
		<React.Fragment>
			{props.element.name.length < 15 ? (
				<text
					key={props.key}
					id={elementId}
					className="label"
					x={position.x}
					y={position.y}
					onMouseDown={e => handleMouseDown(e)}
					onMouseUp={e => handleMouseUp(e)}
					textAnchor="start"
					fill={props.element.evolved ? props.mapStyleDefs.component.evolvedTextColor : props.mapStyleDefs.component.textColor}
				>
					{props.element.name}
				</text>
			) : (
				<text
					id={elementId}
					onMouseDown={e => handleMouseDown(e)}
					onMouseUp={e => handleMouseUp(e)}
					x={position.x}
					y={position.y}
					key={props.key}
					transform="translate(30, 10)"
					className="label"
					fill={props.element.evolved ? props.mapStyleDefs.component.evolvedTextColor : props.mapStyleDefs.component.textColor}
				>
					{props.element.name
						.trim()
						.split(' ')
						.map((text, i) => (
							<tspan
								key={props.key}
								x={position.x}
								dy={i > 0 ? 15 : 0}
								textAnchor="middle"
							>
								{text.trim()}
							</tspan>
						))}
				</text>
			)}
		</React.Fragment>
	);
}

export default ComponentText;
