import React, { memo } from 'react';
import PropTypes from 'prop-types';

const deaccelTransform = 'scale(-1,1) translate(-150)';

const AccelerateSymbol = props => {
	const { id, styles = {}, deaccel } = props;
	return (
		<polygon
			id={id}
			points="0,0 100,0 100,-25 150,25 100,75 100,50 0,50"
			transform={deaccel ? deaccelTransform : ''}
			fill="url(#accelGradient)"
			stroke={styles.stroke}
			strokeWidth="2"
		/>
	);
};

AccelerateSymbol.propTypes = {
	id: PropTypes.string,
	deaccel: PropTypes.bool,
	styles: PropTypes.object.isRequired,
};

export default memo(AccelerateSymbol);
