import React, { MouseEvent } from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../types/map/styles';
import { MapElement } from '../../types/base';
import Pipeline from './Pipeline';
import PipelineVersion2 from './PipelineVersion2';

interface MapPipelinesProps {
    enableNewPipelines: boolean;
    mapElements: {
        getMapPipelines(): any[];
    };
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (text: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    clicked: (data: { el: MapElement; e: MouseEvent<Element> | null }) => void;
    scaleFactor: number;
}

const MapPipelines: React.FC<MapPipelinesProps> = ({
    enableNewPipelines,
    mapElements,
    mapDimensions,
    mapText,
    mutateMapText,
    mapStyleDefs,
    setHighlightLine,
    clicked,
    scaleFactor,
}) => {
    // Create wrapper function to handle optional line parameter
    const handleSetHighlightLine = (line?: number) => {
        if (line !== undefined) {
            setHighlightLine(line);
        }
    };

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
                                    setHighlightLine={handleSetHighlightLine}
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
                                    setHighlightLine={handleSetHighlightLine}
                                    scaleFactor={scaleFactor}
                                />
                            )}
                        </React.Fragment>
                    ))}
        </g>
    );
};

export default MapPipelines;
