import React, {MouseEvent} from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapElements} from '../../processing/MapElements';
import {MapTheme} from '../../types/map/styles';
import {UnifiedComponent} from '../../types/unified';
import {PipelineData} from '../../types/unified/components';
import Pipeline from './Pipeline';
import PipelineVersion2 from './PipelineVersion2';

interface ModernMapPipelinesProps {
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (text: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    scaleFactor?: number;
    enableNewPipelines?: boolean;
    mapElements: MapElements;
    pipelines?: PipelineData[];
    clicked?: (data: {el: UnifiedComponent; e: MouseEvent<Element> | null}) => void;
}

const MapPipelines: React.FC<ModernMapPipelinesProps> = ({
    mapDimensions,
    mapText,
    mutateMapText,
    mapStyleDefs,
    setHighlightLine,
    mapElements,
    pipelines,
    enableNewPipelines = true,
    scaleFactor = 1,
    clicked,
}) => {
    const handleSetHighlightLine = (line?: number) => {
        if (line !== undefined) {
            setHighlightLine(line);
        }
    };

    const pipelinesToRender = pipelines || mapElements.getPipelineComponents();
    if (pipelinesToRender.length === 0) return;

    console.log(
        `Rendering ${pipelinesToRender.length} pipelines:`,
        pipelinesToRender.map(p => ({
            name: p.name,
            visibility: p.visibility,
            components: p.components?.length || 0,
        })),
    );

    const linkingFunction = clicked
        ? (data: {el: any; e: MouseEvent<Element>}) => {
              const componentWithVisibility = {
                  ...data.el,
                  visibility: data.el.visibility || 0,
              };
              clicked({el: componentWithVisibility, e: data.e});
          }
        : undefined;

    return (
        <g id="pipelines">
            {enableNewPipelines &&
                pipelinesToRender
                    .filter(p => p.hidden !== true)
                    .map((p, i) => (
                        <React.Fragment key={i}>
                            {p.components && p.components.length > 0 ? (
                                <PipelineVersion2
                                    key={'pipeline_' + i}
                                    mapDimensions={mapDimensions}
                                    pipeline={p}
                                    mapText={mapText}
                                    mutateMapText={mutateMapText}
                                    mapStyleDefs={mapStyleDefs}
                                    setHighlightLine={handleSetHighlightLine}
                                    linkingFunction={linkingFunction || (() => {})}
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

export default React.memo(MapPipelines);
