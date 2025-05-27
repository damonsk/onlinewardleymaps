import React from 'react';
import Pipeline from './Pipeline';
import PipelineVersion2 from './PipelineVersion2';

function MapPipelines({
    enableNewPipelines,
    mapElements,
    mapDimensions,
    mapText,
    mutateMapText,
    mapStyleDefs,
    setHighlightLine,
    clicked,
    scaleFactor,
}) {
    return (
        <g id="pipelines">
            {enableNewPipelines &&
                mapElements
                    .getMapPipelines()
                    .filter((p) => p.hidden == false)
                    .map((p, i) => (
                        <React.Fragment key={i}>
                            {enableNewPipelines &&
                            p.components != undefined &&
                            p.components.length > 0 ? (
                                <PipelineVersion2
                                    key={'pipeline_' + i}
                                    mapDimensions={mapDimensions}
                                    pipeline={p}
                                    mapText={mapText}
                                    mutateMapText={mutateMapText}
                                    mapStyleDefs={mapStyleDefs}
                                    setHighlightLine={setHighlightLine}
                                    linkingFunction={clicked}
                                    scaleFactor={scaleFactor}
                                />
                            ) : (
                                <Pipeline
                                    key={i}
                                    mapDimensions={mapDimensions}
                                    pipeline={p}
                                    mapText={mapText}
                                    mutateMapText={mutateMapText}
                                    mapStyleDefs={mapStyleDefs}
                                    setHighlightLine={setHighlightLine}
                                    scaleFactor={scaleFactor}
                                />
                            )}
                        </React.Fragment>
                    ))}
        </g>
    );
}

export default MapPipelines;
