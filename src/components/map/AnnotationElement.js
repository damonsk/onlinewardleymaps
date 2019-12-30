import React, { useEffect } from 'react';
import MapPositionCalculator from '../../MapPositionCalculator';

function AnnotationElement(props) {
	var _mapHelper = new MapPositionCalculator();
	const x = () =>
		_mapHelper.maturityToX(
			props.occurance.maturity,
			props.mapDimensions.width
		);
	const y = () =>
		_mapHelper.visibilityToY(
			props.occurance.visibility,
			props.mapDimensions.height
		);
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
								'annotation' + props.annotation.number + '['
							) !== -1
					) {

						if(line.replace(/\s/g,'').indexOf(']]') > -1){
							var extractedOccurances = line
								.replace(/\s/g,'')
								.split('[[')[1]
								.split(']]')[0]
								.split('],[');
							extractedOccurances[props.occuranceIndex] = _mapHelper.yToVisibility(position.y, props.mapDimensions.height) + ',' + _mapHelper.xToMaturity(position.x, props.mapDimensions.width);
							var beforeCoords = line.split('[')[0].trim();
							var afterCoords = line.substr(line.lastIndexOf(']'), (line.length - line.lastIndexOf(']')))
							var newCoords = '[' + extractedOccurances.map((e,i) => { return '[' + e + ']' }).join(',');
							return beforeCoords + ' ' + newCoords + ' ' + afterCoords;
						}
						else {
							return line.replace(
								/\[(.+?)\]/g,
								`[${_mapHelper.yToVisibility(position.y, props.mapDimensions.height)}, ${_mapHelper.xToMaturity(position.x, props.mapDimensions.width)}]`
							);
						}
					} else {
						return line;
					}
				})
				.join('\n')
		);
	}

	const defineStoke = function() {
		return props.mapStyleDefs.annotations.stroke;
	};

	const defineFill = function() {
		return props.mapStyleDefs.annotations.fill;
	};

	useEffect(() => {
		position.x = x();
	}, [props.occurance.maturity]);
	useEffect(() => {
		position.y = y();
	}, [props.occurance.visibility]);

	useEffect(() => {
		position.y = y();
		position.x = x();
	}, [props.mapDimensions]);

	return (
		<g transform={'translate (' + position.x + ',' + position.y + ')'} >
			<circle
				cx="-0"
				cy="0"
				className="draggable"
				r="15"
				onMouseDown={e => handleMouseDown(e)}
				onMouseUp={e => handleMouseUp(e)}
				fill={props.mapStyleDefs.annotations.fill}
				stroke={props.mapStyleDefs.annotations.stroke}
				strokeWidth={props.mapStyleDefs.annotations.strokeWidth}
			/>
			<text
				onMouseDown={e => handleMouseDown(e)}
				onMouseUp={e => handleMouseUp(e)}
				x="-5"
				y="5"
				className="label draggable"
				textAnchor="start"
				fill={props.mapStyleDefs.annotations.text}
			>
				{props.annotation.number}
			</text>
		</g>
	);
}

export default AnnotationElement;
