import React, { MouseEvent } from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../types/map/styles';
import {
    PipelineComponentData,
    PipelineData,
    UnifiedComponent,
} from '../../types/unified/components';
import { useModKeyPressedConsumer } from '../KeyPressContext';
import ModernComponentSymbol from '../symbols/ModernComponentSymbol';
import ModernPipelineBoxSymbol from '../symbols/ModernPipelineBoxSymbol';
import ModernComponentText from './ModernComponentText';
import Movable from './Movable';
import PositionCalculator from './PositionCalculator';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import { ExistingMaturityMatcher } from './positionUpdaters/ExistingMaturityMatcher';
import { NotDefinedMaturityMatcher } from './positionUpdaters/NotDefinedMaturityMatcher';

interface MovedPosition {
    x: number;
    y: number;
}

interface MatcherFunction {
    matcher: (line: string, identifier: string, type: string) => boolean;
    action: (line: string, moved: { param1: string | number }) => string;
}

interface ModernPipelineVersion2Props {
    pipeline: PipelineData;
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (text: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: (line?: number) => void;
    linkingFunction: (data: {
        el: UnifiedComponent;
        e: MouseEvent<Element>;
    }) => void;
    scaleFactor: number;
}

/**
 * ModernPipelineVersion2 - Modern implementation using unified types directly
 * Part of Phase 4 Component Interface Modernization
 */
function ModernPipelineVersion2(
    props: ModernPipelineVersion2Props,
): JSX.Element {
    const positionCalc = new PositionCalculator();
    const isModKeyPressed = useModKeyPressedConsumer();

    const noLabelMatcher: MatcherFunction = {
        matcher: (line: string, identifier: string, type: string): boolean => {
            return (
                ExistingMaturityMatcher.matcher(line, identifier, type) &&
                !ExistingMaturityMatcher.matcher(line, '', 'label')
            );
        },
        action: (line: string, moved: { param1: string | number }): string => {
            return ExistingMaturityMatcher.action(line, moved);
        },
    };

    const withLabelMatcher: MatcherFunction = {
        matcher: (line: string, identifier: string, type: string): boolean => {
            return (
                ExistingMaturityMatcher.matcher(line, identifier, type) &&
                ExistingMaturityMatcher.matcher(line, '', 'label')
            );
        },
        action: (line: string, moved: { param1: string | number }): string => {
            const parts = line.split('label');
            const newPart = ExistingMaturityMatcher.action(parts[0], moved);
            return newPart + 'label' + parts[1];
        },
    };

    const positionUpdater = new DefaultPositionUpdater(
        'component',
        props.mapText,
        props.mutateMapText,
        [noLabelMatcher, withLabelMatcher, NotDefinedMaturityMatcher],
    );

    // Not currently used but keeping for future label dragging support
    function endDragForLabel(
        pipelineComponent: PipelineComponentData,
        moved: MovedPosition,
    ): void {
        console.log(
            'Pipeline label drag - Component:',
            pipelineComponent.name,
            'Moved to:',
            moved,
        );

        // Round the moved coordinates for clean integer values
        // The scaling is already handled by the ModernRelativeMovable component
        const correctedX = Math.round(moved.x);
        const correctedY = Math.round(moved.y);

        console.log('Corrected coordinates:', { x: correctedX, y: correctedY });

        // Only update the label position, not the component position
        props.mutateMapText(
            props.mapText
                .split('\n')
                .map((line: string) => {
                    // Exact match for the component name using RegExp
                    // We need to match the exact component name with word boundaries
                    const regex = new RegExp(
                        `component\\s+${pipelineComponent.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
                        'i',
                    );

                    if (regex.test(line)) {
                        console.log('Found line to update:', line);

                        if (line.includes('label')) {
                            // If label exists, update only the label coordinates
                            return line.replace(
                                /\slabel\s\[(.?|.+?)\]+/g,
                                ` label [${correctedX}, ${correctedY}]`,
                            );
                        }
                        // If no label, add one
                        return line + ` label [${correctedX}, ${correctedY}]`;
                    }
                    return line;
                })
                .join('\n'),
        );
    }

    function endDragForComponent(
        pipelineComponent: PipelineComponentData,
        moved: MovedPosition,
    ): void {
        const maturity = positionCalc.xToMaturity(
            moved.x,
            props.mapDimensions.width,
        );
        positionUpdater.update(
            {
                param1: maturity,
            },
            pipelineComponent.name,
        );
    }

    // Commenting out as this is not currently used but may be needed in future
    // function handlePipelineBoxClick(): void {
    //     props.setHighlightLine(props.pipeline.line);
    // }

    const calculatedComponents: Array<{
        pipelineComponent: PipelineComponentData;
        x: number;
        y: number;
    }> = props.pipeline.components
        .filter((pc) => pc.name !== '')
        .map((pc: PipelineComponentData) => {
            const x = positionCalc.maturityToX(
                pc.maturity,
                props.mapDimensions.width,
            );
            // Calculate base Y position of the pipeline
            const baseY = positionCalc.visibilityToY(
                props.pipeline.visibility,
                props.mapDimensions.height,
            );

            // Center components vertically within the pipeline box (11px offset for 22px height)
            const y = baseY + 11;

            return {
                pipelineComponent: pc,
                x,
                y,
            };
        })
        .sort((a, b) => a.x - b.x);

    const componentSymbols = calculatedComponents.map((c, i) => {
        const component = {
            id: c.pipelineComponent.id || `pipeline_comp_${i}`,
            name: c.pipelineComponent.name,
            type: 'component',
            maturity: c.pipelineComponent.maturity,
            visibility: props.pipeline.visibility,
            line: c.pipelineComponent.line,
            label: c.pipelineComponent.label || { x: 0, y: 0 },
            pipeline: true,
        } as UnifiedComponent;

        return (
            <>
                <Movable
                    key={i}
                    id={`pipeline_v2_${c.pipelineComponent.name}_${i}`}
                    onMove={(moved: MovedPosition) =>
                        endDragForComponent(c.pipelineComponent, moved)
                    }
                    x={c.x}
                    y={c.y}
                    fixedY={true}
                    fixedX={false}
                    scaleFactor={props.scaleFactor}
                >
                    <ModernComponentSymbol
                        id={`pipeline_v2_circle_${props.pipeline.id}_${i}`}
                        styles={props.mapStyleDefs.component}
                        component={component}
                        onClick={(e: MouseEvent<SVGElement>) => {
                            if (isModKeyPressed) {
                                props.linkingFunction({
                                    el: component,
                                    e,
                                });
                                return;
                            }
                            props.setHighlightLine(c.pipelineComponent.line);
                        }}
                    />
                </Movable>
                {c.pipelineComponent.label && (
                    <g transform={`translate(${c.x},${c.y})`}>
                        <ModernComponentText
                            component={component}
                            cx={0}
                            cy={0}
                            styles={props.mapStyleDefs.component}
                            mapText={props.mapText}
                            mutateMapText={props.mutateMapText}
                            onLabelMove={(moved) =>
                                endDragForLabel(c.pipelineComponent, moved)
                            }
                            scaleFactor={props.scaleFactor}
                        />
                    </g>
                )}
            </>
        );
    });

    // Pipeline box should only render if there are components
    if (calculatedComponents.length === 0) {
        // No components to render for this pipeline
        console.warn(
            `Pipeline ${props.pipeline.name} has no components to render`,
        );
        return <></>;
    }

    // Use maturity values directly, not x coordinates which are already transformed
    const x1 =
        calculatedComponents.length > 0
            ? calculatedComponents[0].x
            : positionCalc.maturityToX(0, props.mapDimensions.width);

    const x2 =
        calculatedComponents.length > 0
            ? calculatedComponents[calculatedComponents.length - 1].x
            : positionCalc.maturityToX(0, props.mapDimensions.width);
    const y = positionCalc.visibilityToY(
        props.pipeline.visibility,
        props.mapDimensions.height,
    );

    // Ensure we have valid dimensions for the box
    if (isNaN(x1) || isNaN(x2) || isNaN(y) || x1 === x2) {
        console.warn(
            `Pipeline ${props.pipeline.name} has invalid coordinates: x1=${x1}, x2=${x2}, y=${y}`,
        );
        return <></>;
    }

    // Log the calculated coordinates for debugging
    console.log(
        `Pipeline ${props.pipeline.name} box: x1=${x1 - 15}, x2=${x2 + 15}, y=${y}`,
    );

    return (
        <>
            <ModernPipelineBoxSymbol
                id={`pipeline_v2_box_${props.pipeline.id}`}
                y={y}
                x1={x1 - 15}
                x2={x2 + 15}
                styles={props.mapStyleDefs.component}
                // Explicitly pass stroke for backward compatibility
                stroke={props.mapStyleDefs.component.stroke}
            />
            {componentSymbols}
        </>
    );
}

export default React.memo(ModernPipelineVersion2);
