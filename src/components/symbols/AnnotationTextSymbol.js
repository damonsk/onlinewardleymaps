import React, { memo } from 'react';
import PropTypes from 'prop-types';

function AnnotationTextSymbol(props) {
	return (
		<tspan
			className="label"
			textAnchor="start"
			dy={18}
			x={0}
			fill={props.mapStyleDefs.annotations.boxTextColour}
		>
			&nbsp;{props.annotation.number}. {props.annotation.text}&nbsp;
		</tspan>
	);
}

export default memo(AnnotationTextSymbol);

AnnotationTextSymbol.propTypes = {
	id: PropTypes.string,
	annotation: PropTypes.shape({
		number: PropTypes.number,
		text: PropTypes.string,
	}),
	mapStyleDefs: PropTypes.object.isRequired,
};
