// position, height and width seems simple, but to allow irregular shapes, could go polygon
//pioneers [topRight, topLeft, bottomLeft, bottomRight]
// <polygon id={id} points="100,100 150,25 150,75 200,0"
import React, { memo } from 'react';
import PropTypes from 'prop-types';

const defaultHeight = '100';
const defaultWidth = '200';
function AttitudeSymbol(props) {
	const {
		id,
		height,
		width,
		fill,
		stroke,
		fillOpacity,
		strokeOpacity,
		attitude,
		styles,
	} = props;
	const style = styles[attitude] || styles.pioneer || {};
	return (
		<rect
			id={id}
			fill={fill || style.fill}
			stroke={stroke || style.stroke}
			fillOpacity={fillOpacity || style.fillOpacity}
			strokeOpacity={strokeOpacity || style.strokeOpacity}
			height={height || defaultHeight}
			width={width || defaultWidth}
			strokeWidth={styles.strokeWidth}
		/>
	);
}

AttitudeSymbol.propTypes = {
	id: PropTypes.string,
	fill: PropTypes.string,
	stroke: PropTypes.string,
	attitude: PropTypes.string,
	fillOpacity: PropTypes.number,
	strokeOpacity: PropTypes.number,
};

export default memo(AttitudeSymbol);
