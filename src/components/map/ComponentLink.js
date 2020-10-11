import React from 'react';
import PositionCalculator from './PositionCalculator';
import FlowText from './FlowText';
import LinkSymbol from '../symbols/LinkSymbol';

function ComponentLink(props) {
	const { mapStyleDefs, mapDimensions, startElement, endElement, link } = props;
	const { height, width } = mapDimensions;
	const positionCalc = new PositionCalculator();
	let x1 = positionCalc.maturityToX(startElement.maturity, width);
	let x2 = positionCalc.maturityToX(endElement.maturity, width);
	let y1 = positionCalc.visibilityToY(startElement.visibility, height);
	let y2 = positionCalc.visibilityToY(endElement.visibility, height);

	if (endElement.increaseLabelSpacing) {
		if (x1 > x2) {
			x2 = x2 + 7 * endElement.increaseLabelSpacing;
		} else if (x1 < x2) {
			x2 = x2 - 7 * endElement.increaseLabelSpacing;
		}
		if (y1 > y2) {
			y2 = y2 + 7 * endElement.increaseLabelSpacing;
		} else if (y1 < y2) {
			y2 = y2 - 7 * endElement.increaseLabelSpacing;
		}
	}
	if (startElement.increaseLabelSpacing) {
		if (x1 > x2) {
			//x1 = x1 - (7 * startElement.increaseLabelSpacing);
		} else if (x1 < x2) {
			x1 = x1 + 7 * startElement.increaseLabelSpacing;
		}
		if (y1 > y2) {
			y1 = y1 - 7 * startElement.increaseLabelSpacing;
		} else if (y1 < y2) {
			y1 = y1 + 7 * startElement.increaseLabelSpacing;
		}
	}

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
					x={x2}
					y={y2}
				/>
			)}
		</>
	);
}

export default ComponentLink;
