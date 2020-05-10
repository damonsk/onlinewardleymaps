import React from 'react';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';
import AnnotationElementSymbol from '../symbols/AnnotationElementSymbol';

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
			<AnnotationElementSymbol
				annotation={props.annotation}
				styles={props.mapStyleDefs.annotation}
			/>
		</Movable>
	);
}

export default AnnotationElement;
