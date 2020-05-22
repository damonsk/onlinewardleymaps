import React, { memo } from 'react';
import PropTypes from 'prop-types';

const ComponentSymbol = props => {
	const { id, cx, cy, evolved, onClick, styles = {} } = props;
	const fill = evolved ? styles.evolvedFill : styles.fill;
	const stroke = evolved ? styles.evolved : styles.stroke;

	return (
		<circle
			id={id}
			cx={cx}
			cy={cy}
			strokeWidth={styles.strokeWidth}
			r={styles.radius}
			stroke={stroke}
			fill={fill}
			onClick={onClick}
		/>
	);
};

ComponentSymbol.propTypes = {
	onClick: PropTypes.func,
	id: PropTypes.string,
	cx: PropTypes.string,
	cy: PropTypes.string,
	styles: PropTypes.object.isRequired,
	evolved: PropTypes.bool,
};

export default memo(ComponentSymbol);
