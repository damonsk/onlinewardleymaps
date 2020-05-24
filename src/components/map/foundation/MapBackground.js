import React from 'react';
import PropTypes from 'prop-types';

const MapBackground = props => (
	<rect
		x="0"
		width={props.mapDimensions.width}
		y="0"
		height={props.mapDimensions.height}
		id="fillArea"
		fill={props.mapStyleClass === 'wardley' ? 'url(#wardleyGradient)' : 'none'}
	></rect>
);

MapBackground.propTypes = {
	mapDimensions: PropTypes.object.isRequired,
	mapStyleClass: PropTypes.string.isRequired,
};

export default MapBackground;
