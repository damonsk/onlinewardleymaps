import React from 'react';
import PositionCalculator from './PositionCalculator';
import Inertia from './Inertia';
import LinkSymbol from '../symbols/LinkSymbol';

const setBoundary = (
	positionCalc,
	{ mapDimensions, evolutionOffsets, startElement }
) => {
	const boundWidth = mapDimensions.width / 20;
	const limits = [
		evolutionOffsets.commodity,
		evolutionOffsets.product,
		evolutionOffsets.custom,
	];
	for (let i = 0; i < limits.length; i++) {
		const edge = positionCalc.xToMaturity(
			boundWidth * limits[i],
			mapDimensions.width
		);
		if (startElement.maturity >= edge) {
			return edge;
		}
	}
	return null;
};

function EvolvingComponentLink(props) {
	const { mapStyleDefs, mapDimensions, startElement, endElement } = props;
	const { height, width } = mapDimensions;
	const positionCalc = new PositionCalculator();
	const x1 = positionCalc.maturityToX(startElement.maturity, width);
	const x2 = positionCalc.maturityToX(endElement.maturity, width);
	const y1 = positionCalc.visibilityToY(startElement.visibility, height);
	const y2 = positionCalc.visibilityToY(endElement.visibility, height);
	let boundary;

	if (endElement.inertia) {
		boundary = setBoundary(positionCalc, props) || x1;
	}

	return (
		<>
			<LinkSymbol
				x1={x1}
				y1={y1}
				x2={x2}
				y2={y2}
				strokeDasharray="5 5"
				markerStart="url(#arrow)"
				styles={mapStyleDefs.link}
				evolved
			/>
			{endElement.inertia && (
				<Inertia
					maturity={boundary}
					visibility={endElement.visibility}
					mapDimensions={mapDimensions}
				/>
			)}
		</>
	);
}

export default EvolvingComponentLink;
