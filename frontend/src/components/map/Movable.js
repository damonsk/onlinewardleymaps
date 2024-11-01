import React, { useEffect, useCallback } from 'react';

const HIGHLIGHT_DEF = 'url(#ctrlHighlight)';

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

	const handleMouseMove = useCallback(
		(e) => {
			setPosition((position) => {
				const scaleFactor = props.scaleFactor || 1; // Use scaleFactor from props, default to 1 if not provided
				const xDiff = (position.coords.x - e.pageX) / scaleFactor;
				const yDiff = (position.coords.y - e.pageY) / scaleFactor;
				return {
					x: position.x - xDiff,
					y: position.y - yDiff,
					coords: {
						x: e.pageX,
						y: e.pageY,
					},
				};
			});
		},
		[props.scaleFactor]
	);

	const handleMouseDown = (e) => {
		if (props.isModKeyPressed) return;
		setMoving(true);
		const pageX = e.pageX;
		const pageY = e.pageY;

		setPosition((position) =>
			Object.assign({}, position, {
				coords: {
					x: pageX,
					y: pageY,
				},
			})
		);
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('keyup', handleEscape);
	};

	const handleEscape = (k) => {
		if (k.key === 'Escape' && moving) {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('keyup', handleEscape);
			setMoving(false);
			endDrag();
			setPosition({ x: x(), y: y() });
		}
	};

	const handleMouseUp = () => {
		if (props.isModKeyPressed) return;
		document.removeEventListener('mousemove', handleMouseMove);
		setPosition((position) =>
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
	}, [x, y]);
	const filter = shouldHighlight(props);
	return (
		<g
			is="custom"
			class={'draggable'}
			style={{ cursor: moving ? 'grabbing' : 'grab' }}
			onMouseDown={(e) => handleMouseDown(e)}
			onMouseUp={(e) => handleMouseUp(e)}
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
				x="-15"
				y="-15"
				rx="30"
				ry="30"
				width="30"
				height="30"
				fillOpacity={shouldShowMoving && moving ? 0.2 : 0.0}
			/>
			{props.children}
		</g>
	);
}

export default Movable;
