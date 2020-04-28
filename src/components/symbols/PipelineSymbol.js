import React, { memo } from 'react';
import PropTypes from 'prop-types';

const PipelineSymbol = props => {
	const {
		id,
		x = '-5',
		y = '-5',
		width = '10',
		height = '10',
		evolved,
	} = props;
	const { component = {} } = props.mapStyleDefs || {};
	const fill = evolved ? component.evolvedFill : component.fill;
	const stroke = evolved ? component.evolved : component.stroke;

	return (
		<rect
			id={id}
			x={x}
			y={y}
			fill={fill}
			stroke={stroke}
			width={width}
			height={height}
			strokeWidth={component.pipelineStrokeWidth}
		/>
	);
};

PipelineSymbol.propTypes = {
	id: PropTypes.string,
	x: PropTypes.string,
	y: PropTypes.string,
	width: PropTypes.string,
	height: PropTypes.string,
	mapStyleDefs: PropTypes.object.isRequired,
	evolved: PropTypes.bool,
};

export default memo(PipelineSymbol);
