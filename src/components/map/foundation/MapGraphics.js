import React, { memo } from 'react';
import PropTypes from 'prop-types';

const ecosystemStripesPattern = () => (
	<pattern
		id="diagonalHatch"
		patternUnits="userSpaceOnUse"
		width="4"
		height="4"
	>
		<path
			d="M 3,-1 l 2,2
			 M 0,0 l 4,4
			 M -1,3 l 2,2
			 "
			stroke="grey"
			strokeWidth="1"
			opacity=".5"
		/>
	</pattern>
);

const MapGraphics = props => (
	<defs>
		<filter id="ctrlHighlight">
			<feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="blue" />
		</filter>
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
		<linearGradient
			spreadMethod="pad"
			id="accelGradient"
			x1="0%"
			y1="64%"
			x2="76%"
			y2="0%"
		>
			<stop offset="0%" style={{ stopColor: 'white', stopOpacity: 1 }} />
			<stop offset="100%" style={{ stopColor: '#8c8995', stopOpacity: 1 }} />
		</linearGradient>
		{ecosystemStripesPattern()}
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

export default memo(MapGraphics);
