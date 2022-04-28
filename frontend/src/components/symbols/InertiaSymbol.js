import React, { memo } from 'react';
import PropTypes from 'prop-types';

const InertiaSymbol = memo(function InertiaSymbol(props) {
	const { id, x, y, stroke = 'black', strokeWidth = '6' } = props;

	return (
		<line
			id={id}
			x1={x}
			y1={y - 10}
			x2={x}
			y2={Number(y) + 10}
			stroke={stroke}
			strokeWidth={strokeWidth}
		/>
	);
});

InertiaSymbol.propTypes = {
	id: PropTypes.string,
	x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	y: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	stroke: PropTypes.string,
	strokeWidth: PropTypes.number,
};

export default InertiaSymbol;
