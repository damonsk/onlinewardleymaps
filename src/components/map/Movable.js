import React, { useEffect, useCallback } from 'react';

const HIGHLIGHT_DEF = 'url(#ctrlHighlight)';

// could check specific element type here
const shouldHighlight = ({ isModKeyPressed }) => {
	if (isModKeyPressed) {
		return HIGHLIGHT_DEF;
	}
	return undefined;
};

function Movable(props) {
	const x = useCallback(() => props.x, [props.x]);
	const y = useCallback(() => props.y, [props.y]);
	const [moving, setMoving] = React.useState(false);
	const shouldShowMoving = props.shouldShowMoving ?? false;
	const [position, setPosition] = React.useState({
		x: x(),
		y: y(),
		coords: {},
	});

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
		if (props.isModKeyPressed) return;
		setMoving(true);
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
		document.addEventListener('keyup', handleEscape);
	};

	const handleEscape = k => {
		if (k.key === 'Escape') {
			document.removeEventListener('mousemove', handleMouseMove.current);
			document.removeEventListener('keyup', handleEscape);
			setMoving(false);
			setPosition({ x: x(), y: y() });
		}
	};

	const handleMouseUp = () => {
		if (props.isModKeyPressed) return;
		document.removeEventListener('mousemove', handleMouseMove.current);
		setPosition(position =>
			Object.assign({}, position, {
				coords: {},
			})
		);
		setMoving(false);
		endDrag();
	};

	function endDrag() {
		let moved = {
			x: position.x,
			y: position.y,
		};
		props.onMove(moved);
	}

	useEffect(() => {
		setPosition({
			x: x(),
			y: y(),
			coords: {},
		});
		//if (props.onEffects !== undefined) props.onEffects();
	}, [x, y]);
	const filter = shouldHighlight(props);
	return (
		<g
			is="custom"
			class={'draggable'}
			onMouseDown={e => handleMouseDown(e)}
			onMouseUp={e => handleMouseUp(e)}
			id={'movable_' + props.id}
			filter={filter}
			transform={
				'translate(' +
				(props.fixedX ? x() : position.x) +
				',' +
				(props.fixedY ? y() : position.y) +
				')'
			}
		>
			<rect
				x="-12"
				y="-12"
				rx="5"
				ry="5"
				width="24"
				height="24"
				fillOpacity={shouldShowMoving && moving ? 0.2 : 0}
			/>
			{props.children}
		</g>
	);
}

export default Movable;
