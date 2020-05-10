import React, { memo } from 'react';
import PropTypes from 'prop-types';

const ComponentSymbol = props => {
	const { id, cx, cy, evolved, onClick } = props;
	const { component = {} } = props.mapStyleDefs || {};
	const fill = evolved ? component.evolvedFill : component.fill;
	const stroke = evolved ? component.evolved : component.stroke;

	return (
		<circle
			id={id}
			cx={cx}
			cy={cy}
			strokeWidth={component.strokeWidth}
			r={component.radius}
			stroke={stroke}
			fill={fill}
			onClick={onClick}
		/>
	);
};

ComponentSymbol.propTypes = {
	onClick: PropTypes.func,
	id: PropTypes.string,
	cx: PropTypes.string,
	cy: PropTypes.string,
	mapStyleDefs: PropTypes.object.isRequired,
	evolved: PropTypes.bool,
	// can make these overrides at the component level
	// stroke: PropTypes.number,
	// fill: PropTypes.string,
};

export default memo(ComponentSymbol);
