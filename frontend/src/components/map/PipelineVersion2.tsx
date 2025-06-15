import React, {MouseEvent} from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import {PipelineComponentData, PipelineData, UnifiedComponent} from '../../types/unified/components';
import {useModKeyPressedConsumer} from '../KeyPressContext';
import ComponentSymbol from '../symbols/ComponentSymbol';
import ModernPipelineBoxSymbol from '../symbols/ModernPipelineBoxSymbol';
import ComponentText from './ComponentText';
import Movable from './Movable';
import PositionCalculator from './PositionCalculator';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import {ExistingMaturityMatcher} from './positionUpdaters/ExistingMaturityMatcher';
import {NotDefinedMaturityMatcher} from './positionUpdaters/NotDefinedMaturityMatcher';

interface MovedPosition {
    x: number;
    y: number;
}

interface MatcherFunction {
    matcher: (line: string, identifier: string, type: string) => boolean;
    action: (line: string, moved: {param1: string | number}) => string;
}

interface ModernPipelineVersion2Props {
    pipeline: PipelineData;
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (text: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: (line?: number) => void;
    linkingFunction: (data: {el: UnifiedComponent; e: MouseEvent<Element>}) => void;
    scaleFactor: number;
}

function PipelineVersion2(props: ModernPipelineVersion2Props): JSX.Element {
    const positionCalc = new PositionCalculator();
    const isModKeyPressed = useModKeyPressedConsumer();

    const noLabelMatcher: MatcherFunction = {
        matcher: (line: string, identifier: string, type: string): boolean => {
            return ExistingMaturityMatcher.matcher(line, identifier, type) && !ExistingMaturityMatcher.matcher(line, '', 'label');
        },
        action: (line: string, moved: {param1: string | number}): string => {
            return ExistingMaturityMatcher.action(line, moved);
        },
    };

    const withLabelMatcher: MatcherFunction = {
        matcher: (line: string, identifier: string, type: string): boolean => {
            return ExistingMaturityMatcher.matcher(line, identifier, type) && ExistingMaturityMatcher.matcher(line, '', 'label');
        },
        action: (line: string, moved: {param1: string | number}): string => {
            const parts = line.split('label');
            const newPart = ExistingMaturityMatcher.action(parts[0], moved);
            return newPart + 'label' + parts[1];
        },
    };

    const positionUpdater = new DefaultPositionUpdater('component', props.mapText, props.mutateMapText, [
        noLabelMatcher,
        withLabelMatcher,
        NotDefinedMaturityMatcher,
    ]);

    function endDragForLabel(pipelineComponent: PipelineComponentData, moved: MovedPosition): void {
        const correctedX = Math.round(moved.x);
        const correctedY = Math.round(moved.y);
        props.mutateMapText(
            props.mapText
                .split('\n')
                .map((line: string) => {
                    const regex = new RegExp(`component\\s+${pipelineComponent.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                    if (regex.test(line)) {
                        console.log('Found line to update:', line);

                        if (line.includes('label')) {
                            return line.replace(/\slabel\s\[([^[\]]+)\]/g, ` label [${correctedX}, ${correctedY}]`);
                        }
                        return line + ` label [${correctedX}, ${correctedY}]`;
                    }
                    return line;
                })
                .join('\n'),
        );
    }

    function endDragForComponent(pipelineComponent: PipelineComponentData, moved: MovedPosition): void {
        const maturity = positionCalc.xToMaturity(moved.x, props.mapDimensions.width);
        positionUpdater.update(
            {
                param1: maturity,
            },
            pipelineComponent.name,
        );
    }

    const calculatedComponents: Array<{
        pipelineComponent: PipelineComponentData;
        x: number;
        y: number;
    }> = props.pipeline.components
        .filter(pc => pc.name !== '')
        .map((pc: PipelineComponentData) => {
            const x = positionCalc.maturityToX(pc.maturity, props.mapDimensions.width);
            const baseY = positionCalc.visibilityToY(props.pipeline.visibility, props.mapDimensions.height);
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
            label: c.pipelineComponent.label || {x: 0, y: 0},
            pipeline: true,
        } as UnifiedComponent;

        return (
            <>
                <Movable
                    key={i}
                    id={`pipeline_v2_${c.pipelineComponent.name}_${i}`}
                    onMove={(moved: MovedPosition) => endDragForComponent(c.pipelineComponent, moved)}
                    x={c.x}
                    y={c.y}
                    fixedY={true}
                    fixedX={false}
                    scaleFactor={props.scaleFactor}>
                    <ComponentSymbol
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
                        <ComponentText
                            component={component}
                            cx={0}
                            cy={0}
                            styles={props.mapStyleDefs.component}
                            mapText={props.mapText}
                            mutateMapText={props.mutateMapText}
                            onLabelMove={moved => endDragForLabel(c.pipelineComponent, moved)}
                            scaleFactor={props.scaleFactor}
                        />
                    </g>
                )}
            </>
        );
    });

    if (calculatedComponents.length === 0) {
        return <></>;
    }

    const x1 = calculatedComponents.length > 0 ? calculatedComponents[0].x : positionCalc.maturityToX(0, props.mapDimensions.width);

    const x2 =
        calculatedComponents.length > 0
            ? calculatedComponents[calculatedComponents.length - 1].x
            : positionCalc.maturityToX(0, props.mapDimensions.width);
    const y = positionCalc.visibilityToY(props.pipeline.visibility, props.mapDimensions.height);

    if (isNaN(x1) || isNaN(x2) || isNaN(y) || x1 === x2) {
        return <></>;
    }

    return (
        <>
            <ModernPipelineBoxSymbol
                id={`pipeline_v2_box_${props.pipeline.id}`}
                y={y}
                x1={x1 - 15}
                x2={x2 + 15}
                styles={props.mapStyleDefs.component}
                stroke={props.mapStyleDefs.component.stroke}
            />
            {componentSymbols}
        </>
    );
}

export default React.memo(PipelineVersion2);
