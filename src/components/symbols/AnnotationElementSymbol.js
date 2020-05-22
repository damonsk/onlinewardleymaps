import React, { memo } from 'react';
import PropTypes from 'prop-types';

function AnnotationElementSymbol(props) {
	const { annotation, styles } = props;
	return (
		<>
			<circle
				cx="-0"
				cy="0"
				className="draggable"
				r="15"
				fill={styles.fill}
				stroke={styles.stroke}
				strokeWidth={styles.strokeWidth}
			/>
			<text x="-5" y="5" className="label draggable" textAnchor="start">
				{annotation.number}
			</text>
		</>
	);
}

export default memo(AnnotationElementSymbol);

AnnotationElementSymbol.propTypes = {
	id: PropTypes.string,
	annotation: PropTypes.shape({
		number: PropTypes.number,
		text: PropTypes.string,
	}),
	styles: PropTypes.object.isRequired,
};
