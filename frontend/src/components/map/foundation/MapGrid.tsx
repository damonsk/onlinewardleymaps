import React from 'react';
import {MapDimensions, Offsets} from '../../../constants/defaults';
import {MapTheme} from '../../../constants/mapstyles';

export interface MaoGridProps {
    mapDimensions: MapDimensions;
    mapStyleDefs: MapTheme;
    evolutionOffsets: Offsets;
}

export const MapGrid: React.FunctionComponent<MaoGridProps> = ({mapDimensions, mapStyleDefs, evolutionOffsets}) => {
    return (
        <g
            id="valueChain"
            transform={'translate(0,' + mapDimensions.height + ') rotate(270)'}
            fontFamily='"Helvetica Neue",Helvetica,Arial,sans-serif'
            fontSize="13px">
            <line
                x1="0"
                y1="0"
                x2={mapDimensions.height}
                y2="0"
                stroke={mapStyleDefs.stroke}
                strokeWidth={mapStyleDefs.strokeWidth}
                strokeDasharray={mapStyleDefs.strokeDasharray}
            />
            <line
                x1="-2em"
                y1={(mapDimensions.width / 20) * evolutionOffsets.custom}
                x2={mapDimensions.height}
                y2={(mapDimensions.width / 20) * evolutionOffsets.custom}
                stroke={mapStyleDefs.evolutionSeparationStroke}
                strokeDasharray={mapStyleDefs.strokeDasharray}
            />
            <line
                x1="-2em"
                y1={(mapDimensions.width / 20) * evolutionOffsets.product}
                x2={mapDimensions.height}
                y2={(mapDimensions.width / 20) * evolutionOffsets.product}
                stroke={mapStyleDefs.evolutionSeparationStroke}
                strokeDasharray={mapStyleDefs.strokeDasharray}
            />
            <line
                x1="-2em"
                y1={(mapDimensions.width / 20) * evolutionOffsets.commodity}
                x2={mapDimensions.height}
                y2={(mapDimensions.width / 20) * evolutionOffsets.commodity}
                stroke={mapStyleDefs.evolutionSeparationStroke}
                strokeDasharray={mapStyleDefs.strokeDasharray}
            />
            <text fill={mapStyleDefs.mapGridTextColor} x={mapDimensions.height - 2} y="-0.4em" textAnchor="end" fontWeight="bold">
                Value Chain
            </text>
        </g>
    );
};
export default MapGrid;
