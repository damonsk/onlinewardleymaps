import React, { memo } from 'react';
import PropTypes from 'prop-types';

const AcceleratorSymbol = (props) => {
	const { id, onClick, isDeAccelerator } = props;
	return (
		<g
			transform={['translate(-25, -25)']
				.concat(isDeAccelerator ? 'rotate(180,25,25)' : '')
				.join(' ')}
			id={id}
			onClick={onClick}
		>
			<g opacity="0.8" fill="url(#arrowGradient)">
				<path d="m25.5 6 18 18 -18 18v-9H9a1.5 1.5 0 0 1 -1.5 -1.5V16.5a1.5 1.5 0 0 1 1.5 -1.5h16.5Z" />
			</g>
			<path d="m44.561 22.939 -18 -18A1.5 1.5 0 0 0 24 6v7.5H9a3.003 3.003 0 0 0 -3 3v15a3.003 3.003 0 0 0 3 3h15v7.5a1.5 1.5 0 0 0 2.561 1.06l18 -18a1.5 1.5 0 0 0 0 -2.121ZM27 38.379V33a1.5 1.5 0 0 0 -1.5 -1.5H9V16.5h16.5a1.5 1.5 0 0 0 1.5 -1.5V9.621L41.379 24Z" />
		</g>
	);
};

AcceleratorSymbol.propTypes = {
	onClick: PropTypes.func,
	id: PropTypes.string,
};

export default memo(AcceleratorSymbol);
