import React, { memo } from 'react';
import PropTypes from 'prop-types';

const PipelineBoxSymbol = props => {
	const { id, y, x1, x2, stroke, styles = {} } = props;

	const str = stroke || styles.stroke;
	return (
		<g id={id} transform={'translate(' + x1 + ',' + y + ')'}>
			<line x1={0} y1={0} x2={x2 - x1} y2={0} strokeWidth={1} stroke={str} />
			<line
				x1={x2 - x1}
				y1={0}
				x2={x2 - x1}
				y2={22}
				strokeWidth={1}
				stroke={str}
			/>
			<line x1={x2 - x1} y1={22} x2={0} y2={22} strokeWidth={1} stroke={str} />
			<line x1={0} y1={22} x2={0} y2={0} strokeWidth={1} stroke={str} />
			<line
				x1={10}
				y1={12}
				x2={x2 - x1 - 22}
				y2={12}
				strokeWidth={1}
				stroke={str}
				strokeDasharray="2 2"
				markerEnd="url(#pipelineArrow)"
			/>
		</g>
	);
};

PipelineBoxSymbol.propTypes = {
	id: PropTypes.string,
	y: PropTypes.number,
	x1: PropTypes.number,
	x2: PropTypes.number,
	stroke: PropTypes.string,
	styles: PropTypes.object.isRequired,
};

export default memo(PipelineBoxSymbol);
