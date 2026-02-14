import React from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import {PipelineData} from '../../types/unified/components';
import ComponentSymbol from '../symbols/ComponentSymbol';
import ModernPipelineBoxSymbol from '../symbols/ModernPipelineBoxSymbol';
import Movable from './Movable';
import PositionCalculator from './PositionCalculator';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import {ExistingCoordsMatcher} from './positionUpdaters/ExistingCoordsMatcher';
import {NotDefinedCoordsMatcher} from './positionUpdaters/NotDefinedCoordsMatcher';

interface MovedPosition {
    x: number;
    y: number;
}

interface ModernPipelineProps {
    pipeline: PipelineData;
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (text: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: (line?: number) => void;
    scaleFactor: number;
    isHighlighted?: boolean;
    onPipelineMouseEnter?: (pipelineId: string) => void;
    onPipelineMouseLeave?: () => void;
    selectedToolbarItem?: any;
}

function Pipeline(props: ModernPipelineProps): React.JSX.Element {
    const positionCalc = new PositionCalculator();
    const positionUpdater = new DefaultPositionUpdater('pipeline', props.mapText, props.mutateMapText, [
        ExistingCoordsMatcher,
        NotDefinedCoordsMatcher,
    ]);

    function endDragX1(moved: MovedPosition): void {
        positionUpdater.update(
            {
                param1: positionCalc.xToMaturity(moved.x, props.mapDimensions.width),
                param2: props.pipeline.maturity2 || 0,
            },
            props.pipeline.name,
        );
    }

    function endDragX2(moved: MovedPosition): void {
        positionUpdater.update(
            {
                param1: props.pipeline.maturity1 || 0,
                param2: positionCalc.xToMaturity(moved.x, props.mapDimensions.width),
            },
            props.pipeline.name,
        );
    }

    const x1 = positionCalc.maturityToX(props.pipeline.maturity1 || 0, props.mapDimensions.width);
    const x2 = positionCalc.maturityToX(props.pipeline.maturity2 || 0, props.mapDimensions.width);
    const y = positionCalc.visibilityToY(props.pipeline.visibility, props.mapDimensions.height) + 2;
    const pipelineBoxHeight = 22; // Height of the pipeline box from ModernPipelineBoxSymbol
    const centeredY = y + pipelineBoxHeight / 2; // Center the symbols vertically in the pipeline box

    // Ensure we have valid dimensions for the pipeline box
    if (isNaN(x1) || isNaN(x2) || isNaN(y) || x1 === x2) {
        console.warn(`Pipeline ${props.pipeline.name} has invalid coordinates: x1=${x1}, x2=${x2}, y=${y}`);
        return <></>;
    }

    // Log the calculated coordinates for debugging
    console.log(`Pipeline ${props.pipeline.name} box: x1=${x1}, x2=${x2}, y=${y}`);

    return (
        <>
            <ModernPipelineBoxSymbol
                id={'pipeline_box_' + props.pipeline.id}
                y={y}
                x1={x1 - 15}
                x2={x2 + 15}
                styles={props.mapStyleDefs.component}
                stroke={props.mapStyleDefs.component.stroke}
                isHighlighted={props.isHighlighted}
                onMouseEnter={
                    props.selectedToolbarItem?.id === 'component' ? () => props.onPipelineMouseEnter?.(props.pipeline.name) : undefined
                }
                onMouseLeave={props.selectedToolbarItem?.id === 'component' ? props.onPipelineMouseLeave : undefined}
            />
            <Movable
                id={'pipeline_x1_' + props.pipeline.id}
                onMove={endDragX1}
                x={x1}
                y={centeredY}
                fixedY={true}
                fixedX={false}
                scaleFactor={props.scaleFactor}>
                <ComponentSymbol
                    id={'pipeline_circle_x1_' + props.pipeline.id}
                    styles={props.mapStyleDefs.component}
                    component={{
                        id: `pipeline_circle_x1_${props.pipeline.id}`,
                        name: props.pipeline.name,
                        maturity: props.pipeline.maturity1 || 0,
                        visibility: props.pipeline.visibility,
                        line: props.pipeline.line,
                        label: {x: 0, y: 0},
                    }}
                    onClick={() => props.setHighlightLine(props.pipeline.line)}
                />
            </Movable>
            <Movable
                id={'pipeline_x2_' + props.pipeline.id}
                onMove={endDragX2}
                x={x2}
                y={centeredY}
                fixedY={true}
                fixedX={false}
                scaleFactor={props.scaleFactor}>
                <ComponentSymbol
                    id={'pipeline_circle_x2_' + props.pipeline.id}
                    styles={props.mapStyleDefs.component}
                    component={{
                        id: `pipeline_circle_x2_${props.pipeline.id}`,
                        name: props.pipeline.name,
                        maturity: props.pipeline.maturity2 || 0,
                        visibility: props.pipeline.visibility,
                        line: props.pipeline.line,
                        label: {x: 0, y: 0},
                    }}
                    onClick={() => props.setHighlightLine(props.pipeline.line)}
                />
            </Movable>
        </>
    );
}

export default React.memo(Pipeline);
