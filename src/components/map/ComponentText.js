import React from 'react';
import RelativeMovable from './Movable';
import MetaPositioner from '../../MetaPositioner';

function ComponentText(props) {
	const metaPosition = new MetaPositioner();
	const elementId = 'element_text_' + props.element.id;
	const getMetaPosition = () => {
		const defaultOffset = {
			x: props.mapStyleDefs.component.textOffset,
			y: -props.mapStyleDefs.component.textOffset,
		};
		return metaPosition.for(elementId, props.metaText, defaultOffset);
	};

	const endDrag = moved => {
		props.setMetaText(metaPosition.update(elementId, props.metaText, moved));
	};

	return (
		<React.Fragment>
			<RelativeMovable
				id={elementId}
				fixedY={false}
				fixedX={false}
				onMove={endDrag}
				x={getMetaPosition().x}
				y={getMetaPosition().y}
			>
				{props.element.name.length < 15 ? (
					<text
						key={elementId}
						id={elementId}
						className="label"
						x="0"
						y="0"
						textAnchor="start"
						fill={
							props.element.evolved
								? props.mapStyleDefs.component.evolvedTextColor
								: props.mapStyleDefs.component.textColor
						}
					>
						{props.element.name}
					</text>
				) : (
					<text
						id={elementId}
						x="0"
						y="0"
						key={elementId}
						transform="translate(30, 10)"
						className="label"
						fill={
							props.element.evolved
								? props.mapStyleDefs.component.evolvedTextColor
								: props.mapStyleDefs.component.textColor
						}
					>
						{props.element.name
							.trim()
							.split(' ')
							.map((text, i) => (
								<tspan
									key={'component_text_span_' + elementId + '_' + i}
									x={0}
									dy={i > 0 ? 15 : 0}
									textAnchor="middle"
								>
									{text.trim()}
								</tspan>
							))}
					</text>
				)}
			</RelativeMovable>
		</React.Fragment>
	);
}

export default ComponentText;
