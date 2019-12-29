import React from 'react';

function AnnotationText(props) {

	return (
		<tspan
			className="label draggable"
			textAnchor="start"
			dy={props.parentIndex > 0 ? 18 : 0}
			x={0}
			fill="black"
		>
			&nbsp;{props.annotation.number}. {props.annotation.text}&nbsp;
		</tspan>
	);
}

export default AnnotationText;
