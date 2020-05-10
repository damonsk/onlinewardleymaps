import React, { memo } from 'react';
import PropTypes from 'prop-types';

const trimText = (id, longText) =>
	longText
		.trim()
		.split(' ')
		.map((text, i) => (
			<tspan
				key={'component_text_span_' + id + '_' + i}
				x={0}
				dy={i > 0 ? 15 : 0}
				textAnchor="middle"
			>
				{text.trim()}
			</tspan>
		));

const ComponentTextSymbol = props => {
	const {
		id,
		x,
		y,
		text,
		evolved,
		className = 'label',
		fontWeight = '14px',
		textAnchor,
	} = props;
	const { component = {} } = props.mapStyleDefs || {};
	const fill = evolved ? component.evolvedTextColor : component.textColor;
	const isLong = text && text.length > 14;
	const displayText = isLong ? trimText(id, text) : text;
	const transform = isLong ? 'translate(30, 10)' : '';
	return (
		<text
			id={id}
			data-testid={id}
			fontWeight={fontWeight}
			className={className}
			textAnchor={textAnchor}
			x={x}
			y={y}
			transform={transform}
			fill={fill}
		>
			{displayText}
		</text>
	);
};

ComponentTextSymbol.propTypes = {
	id: PropTypes.string,
	x: PropTypes.string,
	y: PropTypes.string,
	text: PropTypes.string.isRequired,
	mapStyleDefs: PropTypes.object.isRequired,
	fontWeight: PropTypes.string,
	className: PropTypes.string,
	evolved: PropTypes.bool,
};

export default memo(ComponentTextSymbol);
