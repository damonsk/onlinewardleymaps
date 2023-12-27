import React from 'react';
import PropTypes from 'prop-types';

const MapBackground = props => {
	const fill = {
		wardley: 'url(#wardleyGradient)',
		colour: 'none',
		plain: 'none',
		handwritten: 'none',
		dark: '#353347',
	};

	return (
		<rect
			x="0"
			width={props.mapDimensions.width}
			y="0"
			height={props.mapDimensions.height}
			id="fillArea"
			fill={fill[props.mapStyleClass]}
		></rect>
	);
};

MapBackground.propTypes = {
	mapDimensions: PropTypes.object.isRequired,
	mapStyleClass: PropTypes.string.isRequired,
};

export default MapBackground;
