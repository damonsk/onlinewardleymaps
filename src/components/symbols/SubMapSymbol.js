import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { BsLink45Deg } from 'react-icons/bs';

const SubMapSymbol = props => {
	const { id, cx, cy, evolved, onClick, styles = {}, launchUrl } = props;
	const fill = evolved ? styles.evolvedFill : styles.fill;
	const stroke = evolved ? styles.evolved : styles.stroke;

	return (
		<>
			<rect
				x="-20"
				y="-6"
				stroke={'none'}
				width={'30px'}
				fillOpacity="0"
				className={'submapLink'}
				onClick={launchUrl}
				height={'12px'}
			/>
			<g transform={'translate(-23, -8)'}>
				<BsLink45Deg
					color={'black'}
					className="submapLink"
					size={'18px'}
					onClick={launchUrl}
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
	launchUrl: PropTypes.func,
	id: PropTypes.string,
	cx: PropTypes.string,
	cy: PropTypes.string,
	styles: PropTypes.object.isRequired,
	evolved: PropTypes.bool,
};

export default memo(SubMapSymbol);
