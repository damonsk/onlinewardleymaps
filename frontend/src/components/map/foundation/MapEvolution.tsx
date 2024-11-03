import React from 'react';
import {
    EvolutionStages,
    MapDimensions,
    Offsets,
} from '../../../constants/defaults';
import { MapTheme } from '../../../constants/mapstyles';

export interface MapEvolutionProps {
    mapDimensions: MapDimensions;
    evolutionOffsets: Offsets;
    mapStyleDefs: MapTheme;
    mapEvolutionStates: EvolutionStages;
}

const MapEvolution: React.FunctionComponent<MapEvolutionProps> = ({
    mapDimensions,
    evolutionOffsets,
    mapStyleDefs,
    mapEvolutionStates,
}) => {
    const custMark = (mapDimensions.width / 20) * evolutionOffsets.custom + 2;
    const prodMark = (mapDimensions.width / 20) * evolutionOffsets.product + 2;
    const commMark =
        (mapDimensions.width / 20) * evolutionOffsets.commodity + 2;
    return (
        <g
            id="Evolution"
            fontFamily='"Helvetica Neue",Helvetica,Arial,sans-serif'
            fontSize="13px"
            fontStyle="italic"
            transform={'translate(0,' + mapDimensions.height + ')'}
        >
            <line
                x1="0"
                y1="0"
                x2={mapDimensions.width - 2}
                y2="0"
                stroke={mapStyleDefs.stroke}
                strokeWidth={mapStyleDefs.strokeWidth}
                markerEnd="url(#graphArrow)"
            />

            {mapStyleDefs.className === 'wardley' ? (
                <>
                    <text
                        fill={mapStyleDefs.mapGridTextColor}
                        x="10"
                        y={-mapDimensions.height + 15}
                        textAnchor="start"
                        fontStyle="normal"
                        fontSize="11px"
                        fontWeight="bold"
                    >
                        Uncharted
                    </text>

                    <text
                        fill={mapStyleDefs.mapGridTextColor}
                        x={mapDimensions.width - 10}
                        y={-mapDimensions.height + 15}
                        textAnchor="end"
                        fontStyle="normal"
                        fontSize="11px"
                        fontWeight="bold"
                    >
                        Industrialised
                    </text>
                </>
            ) : null}

            <text
                fill={mapStyleDefs.mapGridTextColor}
                x="0"
                y="1em"
                textAnchor="start"
            >
                {mapEvolutionStates.genesis.l1}
            </text>
            <text
                fill={mapStyleDefs.mapGridTextColor}
                x="0"
                y="2em"
                textAnchor="start"
            >
                {mapEvolutionStates.genesis.l2}
            </text>
            <text
                fill={mapStyleDefs.mapGridTextColor}
                x={custMark + 5}
                y="1em"
                textAnchor="start"
            >
                {mapEvolutionStates.custom.l1}
            </text>
            <text
                fill={mapStyleDefs.mapGridTextColor}
                x={custMark + 5}
                y="2em"
                textAnchor="start"
            >
                {mapEvolutionStates.custom.l2}
            </text>
            <text
                fill={mapStyleDefs.mapGridTextColor}
                x={prodMark + 5}
                y="1em"
                textAnchor="start"
            >
                {mapEvolutionStates.product.l1}
            </text>
            <text
                fill={mapStyleDefs.mapGridTextColor}
                x={prodMark + 5}
                y="2em"
                textAnchor="start"
            >
                {mapEvolutionStates.product.l2}
            </text>
            <text
                fill={mapStyleDefs.mapGridTextColor}
                x={commMark + 5}
                y="1em"
                textAnchor="start"
            >
                {mapEvolutionStates.commodity.l1}
            </text>
            <text
                fill={mapStyleDefs.mapGridTextColor}
                x={commMark + 5}
                y="2em"
                textAnchor="start"
            >
                {mapEvolutionStates.commodity.l2}
            </text>
            <text
                fill={mapStyleDefs.mapGridTextColor}
                x={mapDimensions.width}
                y="1.8em"
                textAnchor="end"
                fontWeight="bold"
                fontStyle="normal"
            >
                Evolution
            </text>
        </g>
    );
};
export default MapEvolution;
