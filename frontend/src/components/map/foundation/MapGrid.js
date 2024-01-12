import React from 'react';

function MapGrid(props) {
  return (
    <g
      id="valueChain"
      transform={'translate(0,' + props.mapDimensions.height + ') rotate(270)'}
      fontFamily='"Helvetica Neue",Helvetica,Arial,sans-serif'
      fontSize="13px"
    >
      <line
        x1="0"
        y1="0"
        x2={props.mapDimensions.height}
        y2="0"
        stroke={props.mapStyleDefs.stroke}
        strokeWidth={props.mapStyleDefs.strokeWidth}
        strokeDasharray={props.mapStyleDefs.strokeDasharray}
      />
      <line
        x1="-2em"
        y1={(props.mapDimensions.width / 20) * props.evolutionOffsets.custom}
        x2={props.mapDimensions.height}
        y2={(props.mapDimensions.width / 20) * props.evolutionOffsets.custom}
        stroke={props.mapStyleDefs.evolutionSeparationStroke}
        strokeDasharray={props.mapStyleDefs.strokeDasharray}
      />
      <line
        x1="-2em"
        y1={(props.mapDimensions.width / 20) * props.evolutionOffsets.product}
        x2={props.mapDimensions.height}
        y2={(props.mapDimensions.width / 20) * props.evolutionOffsets.product}
        stroke={props.mapStyleDefs.evolutionSeparationStroke}
        strokeDasharray={props.mapStyleDefs.strokeDasharray}
      />
      <line
        x1="-2em"
        y1={(props.mapDimensions.width / 20) * props.evolutionOffsets.commodity}
        x2={props.mapDimensions.height}
        y2={(props.mapDimensions.width / 20) * props.evolutionOffsets.commodity}
        stroke={props.mapStyleDefs.evolutionSeparationStroke}
        strokeDasharray={props.mapStyleDefs.strokeDasharray}
      />
      <text
        fill={props.mapStyleDefs.mapGridTextColor}
        x={props.mapDimensions.height - 2}
        y="-0.4em"
        textAnchor="end"
        fontWeight="bold"
      >
        Value Chain
      </text>
    </g>
  );
}

export default MapGrid;
