// position, height and width seems simple, but to allow irregular shapes, could go polygon
//pioneers [topRight, topLeft, bottomLeft, bottomRight]
// <polygon id={id} points="100,100 150,25 150,75 200,0"
import React, { memo } from 'react';
import PropTypes from 'prop-types';

function AttitudeSymbol(props) {
	const {
		id,
		x = '0',
		y = '2',
		height = '80',
		width = '200',
		fill,
		stroke,
		attitude,
		// textAnchor = 'center',
		styles,
	} = props;
	const style = styles[attitude] || styles.pioneer || {};
	return (
		<rect
			id={id}
			x={x}
			y={y}
			fill={fill || style.fill}
			stroke={stroke || style.stroke}
			height={height}
			width={width}
			strokeWidth={styles.strokeWidth}
		/>
	);
}

AttitudeSymbol.propTypes = {
	id: PropTypes.string,
	x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	dy: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	fill: PropTypes.string,
	textAnchor: PropTypes.string,
	textDecoration: PropTypes.string,
	className: PropTypes.string,
	children: PropTypes.node,
};

export default memo(AttitudeSymbol);
