import React from 'react';

function AnnotationText(props) {
	const x = () => 0;
	const y = () => 0;
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
		props.mutateMapText(
			props.mapText
				.split('\n')
				.map(line => {
					if (
						line
							.replace(/\s/g, '')
							.indexOf(
								'annotation' + props.annotation.number.replace(/\s/g, '') + '['
							) !== -1
					) {
						return line.replace(
							/\[(.+?)\]/g,
							`[${1 -
								((1 / props.mapDimensions.height) * position.y).toFixed(2)}, ${(
								(1 / props.mapDimensions.width) *
								position.x
							).toFixed(2)}]`
						);
					} else {
						return line;
					}
				})
				.join('\n')
		);
	}

	return (
		<>
			{props.annotation.text.length < 15 ? (
				<text
					key={'annotation_' + props.annotation.number}
					className="label"
					x={position.x}
					y={position.y}
					textAnchor="start"
					onMouseDown={e => handleMouseDown(e)}
					onMouseUp={e => handleMouseUp(e)}
					fill="black"
				>
					{props.annotation.text}
				</text>
			) : (
				<text
					key={'annotation_' + props.annotation.number}
					onMouseDown={e => handleMouseDown(e)}
					onMouseUp={e => handleMouseUp(e)}
					x={position.x}
					y={position.y}
					transform="translate(30, 10)"
					className="label"
				>
					{props.annotation.text
						.trim()
						.split(' ')
						.map((text, i) => (
							<tspan
								key={'annotationTextSpan_' + props.annotation.number + '_' + i}
								x={position.x}
								dy={i > 0 ? 15 : 0}
								textAnchor="middle"
							>
								{text.trim()}
							</tspan>
						))}
				</text>
			)}
		</>
	);
}

export default AnnotationText;
