import React from 'react';
import {EvolutionStages, MapDimensions, Offsets} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import MapBackground from './foundation/MapBackground';
import MapEvolution from './foundation/MapEvolution';
import MapGraphics from './foundation/MapGraphics';
import MapGrid from './foundation/MapGrid';
import MapTitle from './MapTitle';

interface MapGridGroupProps {
    mapStyleDefs: MapTheme;
    mapDimensions: MapDimensions;
    mapTitle: string;
    evolutionOffsets: Offsets;
    mapEvolutionStates: EvolutionStages;
    mapText?: string;
    onTitleUpdate?: (newTitle: string) => void;
}

const MapGridGroup: React.FC<MapGridGroupProps> = ({
    mapStyleDefs,
    mapDimensions,
    mapTitle,
    evolutionOffsets,
    mapEvolutionStates,
    mapText,
    onTitleUpdate,
}) => {
    return (
        <>
            <MapGraphics mapStyleDefs={mapStyleDefs} />
            <g id="grid">
                <MapBackground mapDimensions={mapDimensions} mapStyleClass={mapStyleDefs.className || ''} />
                <MapTitle mapTitle={mapTitle} mapText={mapText} onTitleUpdate={onTitleUpdate} mapStyleDefs={mapStyleDefs} />
                <MapGrid mapDimensions={mapDimensions} mapStyleDefs={mapStyleDefs} evolutionOffsets={evolutionOffsets} />
                <MapEvolution
                    mapDimensions={mapDimensions}
                    mapEvolutionStates={mapEvolutionStates}
                    mapStyleDefs={mapStyleDefs}
                    evolutionOffsets={evolutionOffsets}
                />
            </g>
        </>
    );
};

export default MapGridGroup;
