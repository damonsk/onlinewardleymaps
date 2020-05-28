import React, { useEffect, useCallback } from 'react';

function Movable(props) {
	const x = useCallback(() => props.x, [props.x]);
	const y = useCallback(() => props.y, [props.y]);
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

	return (
		<g
			is="custom"
			class={'draggable'}
			onMouseDown={e => handleMouseDown(e)}
			onMouseUp={e => handleMouseUp(e)}
			id={'movable_' + props.id}
			transform={
				'translate(' +
				(props.fixedX ? x() : position.x) +
				',' +
				(props.fixedY ? y() : position.y) +
				')'
			}
		>
			{props.children}
		</g>
	);
}

export default Movable;
