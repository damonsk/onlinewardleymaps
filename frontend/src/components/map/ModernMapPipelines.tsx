import React, { MouseEvent } from 'react';
import { MapDimensions } from '../../constants/defaults';
import { UnifiedMapElements } from '../../processing/UnifiedMapElements';
import { MapTheme } from '../../types/map/styles';
import { UnifiedComponent } from '../../types/unified';
import { PipelineData } from '../../types/unified/components';
import ModernPipeline from './ModernPipeline';
import ModernPipelineVersion2 from './ModernPipelineVersion2';

/**
 * ModernMapPipelines Props - using unified type system directly
 * This interface eliminates legacy types and improves type safety
 */
interface ModernMapPipelinesProps {
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (text: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    scaleFactor?: number;
    enableNewPipelines?: boolean;

    // Direct reference to UnifiedMapElements and PipelineData
    mapElements: UnifiedMapElements;
    pipelines?: PipelineData[];

    // Optional click handler for linking functionality
    clicked?: (data: {
        el: UnifiedComponent;
        e: MouseEvent<Element> | null;
    }) => void;
}

/**
 * ModernMapPipelines - Pipeline manager component using unified types directly
 * This component eliminates legacy type dependencies and improves rendering performance
 */
const ModernMapPipelines: React.FC<ModernMapPipelinesProps> = ({
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
    // Create wrapper function to handle optional line parameter
    const handleSetHighlightLine = (line?: number) => {
        if (line !== undefined) {
            setHighlightLine(line);
        }
    };

    // If pipelines are provided directly, use those, otherwise get from mapElements
    const pipelinesToRender = pipelines || mapElements.getMapPipelines();

    // Log the pipeline data for debugging
    if (pipelinesToRender.length === 0) {
        console.warn('No pipelines to render');
    } else {
        console.log(
            `Rendering ${pipelinesToRender.length} pipelines:`,
            pipelinesToRender.map((p) => ({
                name: p.name,
                visibility: p.visibility,
                components: p.components?.length || 0,
            })),
        );
    }

    // Helper function to adapt UnifiedComponent to the expected format for linking
    const linkingFunction = clicked
        ? (data: { el: any; e: MouseEvent<Element> }) => {
              // Create a component with the necessary pipeline properties to match MapElement
              const componentWithVisibility = {
                  ...data.el,
                  visibility: data.el.visibility || 0,
              };
              clicked({ el: componentWithVisibility, e: data.e });
          }
        : undefined;

    return (
        <g id="pipelines">
            {enableNewPipelines &&
                pipelinesToRender
                    .filter((p) => p.hidden !== true)
                    .map((p, i) => (
                        <React.Fragment key={i}>
                            {p.components && p.components.length > 0 ? (
                                <ModernPipelineVersion2
                                    key={'pipeline_' + i}
                                    mapDimensions={mapDimensions}
                                    pipeline={p}
                                    mapText={mapText}
                                    mutateMapText={mutateMapText}
                                    mapStyleDefs={mapStyleDefs}
                                    setHighlightLine={handleSetHighlightLine}
                                    linkingFunction={
                                        linkingFunction || (() => {})
                                    }
                                    scaleFactor={scaleFactor}
                                />
                            ) : (
                                <ModernPipeline
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

export default React.memo(ModernMapPipelines);
