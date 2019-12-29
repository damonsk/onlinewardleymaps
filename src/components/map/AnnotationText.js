import React from 'react';

function AnnotationText(props) {

	return (
		<tspan
			className="label draggable"
			textAnchor="start"
			dy={18}
			x={0}
			fill={props.mapStyleDefs.annotations.boxTextColour}
		>
			&nbsp;{props.annotation.number}. {props.annotation.text}&nbsp;
		</tspan>
	);
}

export default AnnotationText;
