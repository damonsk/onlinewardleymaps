import React, { MouseEvent } from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapElement } from '../../types/base';
import { MapTheme } from '../../types/map/styles';
import {
    PipelineComponentData,
    PipelineData,
} from '../../types/unified/components';
import { useModKeyPressedConsumer } from '../KeyPressContext';
import ComponentSymbol from '../symbols/ComponentSymbol';
import PipelineBoxSymbol from '../symbols/PipelineBoxSymbol';
import ComponentText from './ComponentText';
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

interface PipelineVersion2Props {
    pipeline: PipelineData;
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (text: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: (line?: number) => void;
    linkingFunction: (data: { el: MapElement; e: MouseEvent<Element> }) => void;
    scaleFactor: number;
}

function PipelineVersion2(props: PipelineVersion2Props): JSX.Element {
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

    function endDragForLabel(
        pipelineComponent: PipelineComponentData,
        moved: MovedPosition,
    ): void {
        props.mutateMapText(
            props.mapText
                .split('\n')
                .map((line) => {
                    if (
                        line
                            .replace(/\s/g, '')
                            .indexOf(
                                'component' +
                                    pipelineComponent.name.replace(/\s/g, '') +
                                    '[',
                            ) === 0
                    ) {
                        if (line.replace(/\s/g, '').indexOf('label[') > -1) {
                            return line.replace(
                                /\slabel\s\[(.?|.+?)\]+/g,
                                ` label [${parseFloat(
                                    moved.x.toString(),
                                ).toFixed(
                                    0,
                                )}, ${parseFloat(moved.y.toString()).toFixed(0)}]`,
                            );
                        } else {
                            return (
                                line.trim() +
                                ` label [${parseFloat(
                                    moved.x.toString(),
                                ).toFixed(
                                    0,
                                )}, ${parseFloat(moved.y.toString()).toFixed(0)}]`
                            );
                        }
                    } else {
                        return line;
                    }
                })
                .join('\n'),
        );
    }

    function endDragX2(
        component: PipelineComponentData,
        moved: MovedPosition,
    ): void {
        positionUpdater.update(
            {
                param1: positionCalc.xToMaturity(
                    moved.x,
                    props.mapDimensions.width,
                ),
            },
            component.name,
        );
    }

    const x1 = positionCalc.maturityToX(
        props.pipeline.maturity1 || 0,
        props.mapDimensions.width,
    );
    const x2 = positionCalc.maturityToX(
        props.pipeline.maturity2 || 0,
        props.mapDimensions.width,
    );

    const xCalc = (mat: number): number =>
        positionCalc.maturityToX(mat, props.mapDimensions.width);

    const allowLinking = (
        component: PipelineComponentData,
        e: MouseEvent<SVGElement>,
    ): void => {
        const supplementObjectWithVisibility = Object.assign(component, {
            visibility: props.pipeline.visibility,
            offsetY: 12,
        }) as MapElement;
        props.linkingFunction({ el: supplementObjectWithVisibility, e });
    };

    const y =
        positionCalc.visibilityToY(
            props.pipeline.visibility,
            props.mapDimensions.height,
        ) + 2;

    return (
        <React.Fragment key={'pipeline_box_' + props.pipeline.id}>
            <PipelineBoxSymbol
                y={y}
                id={'pipeline_box_' + props.pipeline.id}
                x1={x1 - 10}
                x2={x2 + 10}
                styles={props.mapStyleDefs.component}
            />
            {props.pipeline.components.map((component, i) => (
                <React.Fragment key={i}>
                    <>
                        <Movable
                            id={'pipeline_' + props.pipeline.id + '_' + i}
                            onMove={(m: MovedPosition) =>
                                endDragX2(component, m)
                            }
                            x={xCalc(component.maturity)}
                            y={y + 12}
                            fixedY={true}
                            fixedX={false}
                            shouldShowMoving={true}
                            isModKeyPressed={isModKeyPressed}
                            scaleFactor={props.scaleFactor}
                        >
                            <ComponentSymbol
                                id={
                                    'pipeline_circle_' +
                                    props.pipeline.id +
                                    '_' +
                                    i
                                }
                                cx={'0'}
                                cy="0"
                                styles={props.mapStyleDefs.component}
                                onClick={(e) => allowLinking(component, e)}
                            />
                        </Movable>
                        <g
                            transform={
                                'translate(' +
                                xCalc(component.maturity) +
                                ',' +
                                y +
                                ')'
                            }
                        >
                            <ComponentText
                                overrideDrag={(m: MovedPosition) =>
                                    endDragForLabel(component, m)
                                }
                                id={'pipelinecomponent_text_' + component.id}
                                mapStyleDefs={props.mapStyleDefs}
                                element={component}
                                mapText={props.mapText}
                                mutateMapText={props.mutateMapText}
                                scaleFactor={props.scaleFactor}
                            />
                        </g>
                    </>
                </React.Fragment>
            ))}
        </React.Fragment>
    );
}

export default PipelineVersion2;
