import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { BsLink45Deg } from 'react-icons/bs';

const SubMapSymbol = props => {
	const { id, cx, cy, evolved, onClick, styles = {} } = props;
	const fill = evolved ? styles.evolvedFill : styles.fill;
	const stroke = evolved ? styles.evolved : styles.stroke;

	return (
		<>
			<g transform={'translate(-23, -8)'}>
				<BsLink45Deg
					color={'black'}
					className="submapLink"
					size={'1.2em'}
					onClick={() => window.open('https://onlinewardleymaps.com')}
				/>
			</g>
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
		</>
	);
};

SubMapSymbol.propTypes = {
	onClick: PropTypes.func,
	id: PropTypes.string,
	cx: PropTypes.string,
	cy: PropTypes.string,
	styles: PropTypes.object.isRequired,
	evolved: PropTypes.bool,
};

export default memo(SubMapSymbol);
