import React, { memo } from 'react';
import PropTypes from 'prop-types';

const MethodSymbol = props => {
	const { id, x, y, method, styles = {} } = props;
	const style = styles[method] || {};
	return (
		<g id={id} transform={'translate (' + x + ',' + y + ')'}>
			<circle cx="0" cy="0" r="20" fill={style.fill} stroke={style.stroke} />
		</g>
	);
};

MethodSymbol.propTypes = {
	onClick: PropTypes.func,
	id: PropTypes.string,
	x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	y: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	method: PropTypes.string,
	styles: PropTypes.object.isRequired,
};

export default memo(MethodSymbol);
