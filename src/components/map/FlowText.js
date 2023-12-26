import React from 'react';
import PropTypes from 'prop-types';
import RelativeMovable from '../map/RelativeMovable';
import MetaPositioner from '../../MetaPositioner';

import ComponentTextSymbol from '../symbols/ComponentTextSymbol';

const FlowText = props => {
	const {
		x,
		y,
		startElement,
		endElement,
		metaText,
		link,
		setMetaText,
		mapStyleDefs,
	} = props;
	const metaPosition = new MetaPositioner();
	const flowLabelElementId = `flow_text_${startElement.id}_${endElement.id}`;
	const getMetaPosition = () => {
		const defaultOffset = {
			x: 0,
			y: -30,
		};
		return metaPosition.for(flowLabelElementId, metaText, defaultOffset);
	};
	const flowLabelEndDrag = moved => {
		setMetaText(metaPosition.update(flowLabelElementId, metaText, moved));
	};
	const flowLabelPosition = getMetaPosition();

	return (
		<g
			id={'flow_' + endElement.name}
			transform={'translate(' + x + ',' + y + ')'}
		>
			<RelativeMovable
				id={flowLabelElementId}
				fixedX={false}
				fixedY={false}
				onMove={flowLabelEndDrag}
				y={flowLabelPosition.y}
				x={flowLabelPosition.x}
			>
				<ComponentTextSymbol
					className="draggable label"
					id={flowLabelElementId}
					x="5"
					y="5"
					textAnchor="start"
					fill={mapStyleDefs.link.flowText}
					text={link.flowValue}
					styles={mapStyleDefs}
				/>
			</RelativeMovable>
		</g>
	);
};

FlowText.propTypes = {
	id: PropTypes.string,
	x: PropTypes.string,
	y: PropTypes.string,
	link: PropTypes.object.isRequired,
	startElement: PropTypes.object.isRequired,
	endElement: PropTypes.object.isRequired,
	setMetaText: PropTypes.func.isRequired,
	mapStyleDefs: PropTypes.object.isRequired,
};

export default FlowText;
