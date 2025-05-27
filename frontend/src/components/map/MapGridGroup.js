import MapBackground from './foundation/MapBackground';
import MapEvolution from './foundation/MapEvolution';
import MapGraphics from './foundation/MapGraphics';
import MapGrid from './foundation/MapGrid';
import MapTitle from './MapTitle';

function MapGridGroup({
    mapStyleDefs,
    mapDimensions,
    mapTitle,
    evolutionOffsets,
    mapEvolutionStates,
}) {
    return (
        <>
            <MapGraphics mapStyleDefs={mapStyleDefs} />
            <g id="grid">
                <MapBackground
                    mapDimensions={mapDimensions}
                    mapStyleClass={mapStyleDefs.className}
                />
                <MapTitle mapTitle={mapTitle} />
                <MapGrid
                    mapDimensions={mapDimensions}
                    mapStyleDefs={mapStyleDefs}
                    evolutionOffsets={evolutionOffsets}
                />
                <MapEvolution
                    mapDimensions={mapDimensions}
                    mapEvolutionStates={mapEvolutionStates}
                    mapStyleDefs={mapStyleDefs}
                    evolutionOffsets={evolutionOffsets}
                />
            </g>
        </>
    );
}

export default MapGridGroup;
