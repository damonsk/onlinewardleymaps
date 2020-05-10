import React from 'react';
import PropTypes from 'prop-types';

const MapGraphics = props => (
	<defs>
		<linearGradient
			gradientUnits="objectBoundingBox"
			id="wardleyGradient"
			spreadMethod="pad"
			x1="0%"
			x2="100%"
			y1="0%"
			y2="0%"
		>
			<stop
				offset="0%"
				style={{ stopColor: 'rgb(196, 196, 196)', stopOpacity: 1 }}
			/>
			<stop offset="0.3" style={{ stopColor: 'white', stopOpacity: 1 }} />
			<stop offset="0.7" style={{ stopColor: 'white' }} />
			<stop offset={1} style={{ stopColor: 'rgb(196, 196, 196)' }} />
		</linearGradient>
		<marker
			id="arrow"
			markerWidth="12"
			markerHeight="12"
			refX="15"
			refY="0"
			viewBox="0 -5 10 10"
			orient="0"
		>
			<path d="M0,-5L10,0L0,5" fill={props.mapStyleDefs.link.evolvedStroke} />
		</marker>

		<marker
			id="graphArrow"
			markerWidth={12 / props.mapStyleDefs.strokeWidth}
			markerHeight={12 / props.mapStyleDefs.strokeWidth}
			refX="9"
			refY="0"
			viewBox="0 -5 10 10"
			orient="0"
		>
			<path d="M0,-5L10,0L0,5" fill={props.mapStyleDefs.stroke} />
		</marker>

		<marker
			id="pipelineArrow"
			markerWidth={props.mapStyleDefs.pipelineArrowWidth}
			markerHeight={props.mapStyleDefs.pipelineArrowHeight}
			refX="9"
			refY="0"
			viewBox="0 -5 10 10"
			orient="0"
		>
			<path d="M0,-5L10,0L0,5" fill={props.mapStyleDefs.pipelineArrowStroke} />
		</marker>
	</defs>
);

MapGraphics.propTypes = {
	mapStyleDefs: PropTypes.object.isRequired,
};

export default MapGraphics;
