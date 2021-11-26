import React from 'react';
import PositionCalculator from './PositionCalculator';
import FlowText from './FlowText';
import LinkSymbol from '../symbols/LinkSymbol';

function ComponentLink(props) {
	const { mapStyleDefs, mapDimensions, startElement, endElement, link } = props;
	const { height, width } = mapDimensions;
	const positionCalc = new PositionCalculator();
	const x1 = positionCalc.maturityToX(startElement.maturity, width);
	const x2 = positionCalc.maturityToX(endElement.maturity, width);
	const y1 = positionCalc.visibilityToY(startElement.visibility, height);
	const y2 = positionCalc.visibilityToY(endElement.visibility, height);

	const isEvolved = startElement.evolved || endElement.evolved;
	const isFlow =
		link.flow &&
		(link.future === link.past || // both
			(link.past === true &&
				endElement.evolving === false &&
				startElement.evolving === true) ||
			(link.past === true &&
				endElement.evolving === true &&
				startElement.evolving === false) ||
			(link.future === true && startElement.evolving === true) ||
			(link.future === true && startElement.evolved === true) ||
			(link.future === true && endElement.evolved === true));

	return (
		<>
			<LinkSymbol
				id={`link_${startElement.id}_${endElement.id}`}
				x1={x1}
				x2={x2}
				y1={y1}
				y2={y2}
				flow={isFlow}
				evolved={isEvolved}
				styles={mapStyleDefs.link}
			/>
			{link.flowValue && (
				<FlowText
					mapStyleDefs={mapStyleDefs}
					startElement={startElement}
					endElement={endElement}
					link={link}
					metaText={props.metaText}
					setMetaText={props.setMetaText}
					x={x2.toString()}
					y={y2.toString()}
				/>
			)}
		</>
	);
}

export default ComponentLink;
