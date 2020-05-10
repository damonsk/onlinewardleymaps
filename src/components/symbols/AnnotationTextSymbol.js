import React, { memo } from 'react';
import PropTypes from 'prop-types';

function AnnotationTextSymbol(props) {
	const { id, annotation, styles } = props;
	return (
		<tspan
			id={id}
			className="label"
			textAnchor="start"
			dy={18}
			x={0}
			fill={styles.boxTextColour}
		>
			&nbsp;{annotation.number}. {annotation.text}&nbsp;
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
	styles: PropTypes.object.isRequired,
};
