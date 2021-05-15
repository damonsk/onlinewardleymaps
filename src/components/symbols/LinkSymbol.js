import React, { memo } from 'react';
import PropTypes from 'prop-types';

const LinkSymbol = props => {
	const {
		id,
		x1,
		x2,
		y1,
		y2,
		flow,
		evolved,
		strokeDasharray,
		markerStart,
		styles,
		filter,
	} = props;
	const stroke = evolved ? styles.evolvedStroke : styles.stroke;
	const strokeWidth = evolved ? styles.evolvedStrokeWidth : styles.strokeWidth;
	return (
		<g id={id}>
			<line
				x1={x1}
				y1={y1}
				x2={x2}
				y2={y2}
				strokeDasharray={strokeDasharray}
				stroke={stroke}
				strokeWidth={strokeWidth}
				markerStart={markerStart}
				filter={filter}
			/>
			{flow && (
				<line
					x1={x1}
					y1={y1}
					x2={x2}
					y2={y2}
					strokeWidth={styles.flowStrokeWidth}
					stroke={styles.flow}
				/>
			)}
		</g>
	);
};

LinkSymbol.propTypes = {
	id: PropTypes.string,
	x1: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	x2: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	y1: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	y2: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	evolved: PropTypes.bool,
	flow: PropTypes.bool,
	strokeDasharray: PropTypes.string,
	// stroke: PropTypes.string,
	// strokeWidth: PropTypes.number,
};

export default memo(LinkSymbol);
