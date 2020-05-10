import React from 'react';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';

function AnnotationElement(props) {
	const positionCalc = new PositionCalculator();
	const x = () =>
		positionCalc.maturityToX(
			props.occurance.maturity,
			props.mapDimensions.width
		);
	const y = () =>
		positionCalc.visibilityToY(
			props.occurance.visibility,
			props.mapDimensions.height
		);

	function endDrag(moved) {
		props.mutateMapText(
			props.mapText
				.split('\n')
				.map(line => {
					if (
						line
							.replace(/\s/g, '')
							.indexOf('annotation' + props.annotation.number + '[') !== -1
					) {
						if (line.replace(/\s/g, '').indexOf(']]') > -1) {
							var extractedOccurances = line
								.replace(/\s/g, '')
								.split('[[')[1]
								.split(']]')[0]
								.split('],[');
							extractedOccurances[props.occuranceIndex] =
								positionCalc.yToVisibility(
									moved.y,
									props.mapDimensions.height
								) +
								',' +
								positionCalc.xToMaturity(moved.x, props.mapDimensions.width);
							var beforeCoords = line.split('[')[0].trim();
							var afterCoords = line.substr(
								line.lastIndexOf(']'),
								line.length - line.lastIndexOf(']')
							);
							var newCoords =
								'[' +
								extractedOccurances
									.map(e => {
										return '[' + e + ']';
									})
									.join(',');
							return beforeCoords + ' ' + newCoords + ' ' + afterCoords;
						} else {
							return line.replace(
								/\[(.+?)\]/g,
								`[${positionCalc.yToVisibility(
									moved.y,
									props.mapDimensions.height
								)}, ${positionCalc.xToMaturity(
									moved.x,
									props.mapDimensions.width
								)}]`
							);
						}
					} else {
						return line;
					}
				})
				.join('\n')
		);
	}

	return (
		<Movable
			id={'annotation_element_' + props.annotation.number}
			onMove={endDrag}
			x={x()}
			y={y()}
			fixedY={false}
			fixedX={false}
		>
			<circle
				cx="-0"
				cy="0"
				className="draggable"
				r="15"
				fill={props.mapStyleDefs.annotations.fill}
				stroke={props.mapStyleDefs.annotations.stroke}
				strokeWidth={props.mapStyleDefs.annotations.strokeWidth}
			/>
			<text
				x="-5"
				y="5"
				className="label draggable"
				textAnchor="start"
				fill={props.mapStyleDefs.annotations.text}
			>
				{props.annotation.number}
			</text>
		</Movable>
	);
}

export default AnnotationElement;
