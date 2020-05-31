import React, { memo } from 'react';
import PropTypes from 'prop-types';

function AnnotationBoxSymbol(props) {
	const {
		id,
		dy = '0',
		x = '2',
		fill,
		textAnchor = 'start',
		textDecoration = 'underline',
		className = 'label draggable',
		children,
	} = props;

	return (
		<text id={id}>
			<tspan
				className={className}
				textAnchor={textAnchor}
				dy={dy}
				x={x}
				fill={fill}
				textDecoration={textDecoration}
			>
				Annotations:
			</tspan>
			{children}
		</text>
	);
}

AnnotationBoxSymbol.propTypes = {
	id: PropTypes.string,
	x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	dy: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	fill: PropTypes.string,
	textAnchor: PropTypes.string,
	textDecoration: PropTypes.string,
	className: PropTypes.string,
	children: PropTypes.node,
};

export default memo(AnnotationBoxSymbol);
