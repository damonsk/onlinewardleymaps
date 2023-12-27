import React, { memo } from 'react';
import PropTypes from 'prop-types';

const EcosystemSymbol = props => {
	const { id, cx, cy, onClick, styles = {} } = props;
	return (
		<g id={id} onClick={onClick}>
			<circle
				cx={cx}
				cy={cy}
				r="30"
				fill="#d7d7d7"
				strokeWidth="1"
				stroke={styles.stroke}
			/>
			<circle
				cx={cx}
				cy={cy}
				r="25"
				fill="white"
				strokeWidth="1"
				stroke="#9e9b9e"
			/>
			<circle cx={cx} cy={cy} r="25" fill="url(#diagonalHatch)" />
			<circle
				cx={cx}
				cy={cy}
				r="10"
				fill="white"
				strokeWidth="1"
				stroke="#6e6e6e"
			/>
		</g>
	);
};

EcosystemSymbol.propTypes = {
	onClick: PropTypes.func,
	id: PropTypes.string,
	cx: PropTypes.string,
	cy: PropTypes.string,
	styles: PropTypes.object.isRequired,
};

export default memo(EcosystemSymbol);
