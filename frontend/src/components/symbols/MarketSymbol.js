import React, { memo } from 'react';
import PropTypes from 'prop-types';

const SM_CIRC_RADIUS = 10;
const polarCoord = (radius, angle) => [
	Math.round(radius * Math.cos((angle * Math.PI) / 180)),
	Math.round(radius * Math.sin((angle * Math.PI) / 180)),
];

const rotatePoints = () => {
	const START_ANGLE = 30;
	const ROTATE = 120;
	const coords = [];
	for (let i = 0; i < 3; i++) {
		coords.push(polarCoord(SM_CIRC_RADIUS, START_ANGLE + ROTATE * i));
	}
	return coords;
};
const drawInsideCircles = (coords, styles) =>
	coords.map((cxy, i) => (
		<circle
			key={i}
			cx={cxy[0]}
			cy={cxy[1]}
			r="5"
			fill={styles.fill}
			strokeWidth="3"
			stroke={styles.stroke}
		/>
	));

const MarketSymbol = props => {
	const { id, styles = {}, onClick } = props;
	const coords = rotatePoints();
	return (
		<g id={id} onClick={onClick}>
			<circle
				r={SM_CIRC_RADIUS * 1.8}
				fill={styles.fill}
				strokeWidth="1"
				stroke={styles.stroke}
			/>
			<path
				strokeWidth="2"
				stroke="black"
				fill="none"
				opacity=".8"
				d={`M${coords[0]} L${coords[1]} L${coords[2]} Z`}
			/>
			{drawInsideCircles(coords, styles)}
		</g>
	);
};

MarketSymbol.propTypes = {
	onClick: PropTypes.func,
	id: PropTypes.string,
	cx: PropTypes.string,
	cy: PropTypes.string,
	styles: PropTypes.object.isRequired,
};

export default memo(MarketSymbol);
