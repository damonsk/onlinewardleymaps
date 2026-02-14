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
    highlightedPipelineId?: string | null;
    onPipelineMouseEnter?: (pipelineId: string) => void;
    onPipelineMouseLeave?: () => void;
    selectedToolbarItem?: any;
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
    highlightedPipelineId,
    onPipelineMouseEnter,
    onPipelineMouseLeave,
    selectedToolbarItem,
}) => {
    const handleSetHighlightLine = (line?: number) => {
        if (line !== undefined) {
            setHighlightLine(line);
        }
    };

    const pipelinesToRender = pipelines || mapElements.getPipelineComponents();
    if (pipelinesToRender.length === 0) return;

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
                                    isHighlighted={highlightedPipelineId === p.name}
                                    onPipelineMouseEnter={onPipelineMouseEnter}
                                    onPipelineMouseLeave={onPipelineMouseLeave}
                                    selectedToolbarItem={selectedToolbarItem}
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
                                    isHighlighted={highlightedPipelineId === p.name}
                                    onPipelineMouseEnter={onPipelineMouseEnter}
                                    onPipelineMouseLeave={onPipelineMouseLeave}
                                    selectedToolbarItem={selectedToolbarItem}
                                />
                            )}
                        </React.Fragment>
                    ))}
        </g>
    );
};

export default React.memo(MapPipelines);
