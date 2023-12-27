import React, { memo } from 'react';
import PropTypes from 'prop-types';

const PipelineComponentSymbol = props => {
	const {
		id,
		x = '-5',
		y = '-5',
		width = '10',
		height = '10',
		evolved,
		onClick,
		styles = {},
	} = props;
	const fill = evolved ? styles.evolvedFill : styles.fill;
	const stroke = evolved ? styles.evolved : styles.stroke;

	return (
		<rect
			onClick={onClick}
			id={id}
			x={x}
			y={y}
			fill={fill}
			stroke={stroke}
			width={width}
			height={height}
			strokeWidth={styles.pipelineStrokeWidth}
		/>
	);
};

PipelineComponentSymbol.propTypes = {
	id: PropTypes.string,
	x: PropTypes.string,
	y: PropTypes.string,
	width: PropTypes.string,
	height: PropTypes.string,
	styles: PropTypes.object.isRequired,
	evolved: PropTypes.bool,
	onClick: PropTypes.func,
};

export default memo(PipelineComponentSymbol);
