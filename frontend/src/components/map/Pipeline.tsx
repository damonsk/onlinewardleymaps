import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../types/map/styles';
import { PipelineData } from '../../types/unified/components';
import ComponentSymbol from '../symbols/ComponentSymbol';
import PipelineBoxSymbol from '../symbols/PipelineBoxSymbol';
import Movable from './Movable';
import PositionCalculator from './PositionCalculator';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';

interface MovedPosition {
    x: number;
    y: number;
}

interface PipelineProps {
    pipeline: PipelineData;
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (text: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: (line?: number) => void;
    scaleFactor: number;
}

function Pipeline(props: PipelineProps): JSX.Element {
    const positionCalc = new PositionCalculator();
    const positionUpdater = new DefaultPositionUpdater(
        'pipeline',
        props.mapText,
        props.mutateMapText,
        [ExistingCoordsMatcher, NotDefinedCoordsMatcher],
    );

    function endDragX1(moved: MovedPosition): void {
        positionUpdater.update(
            {
                param1: positionCalc.xToMaturity(
                    moved.x,
                    props.mapDimensions.width,
                ),
                param2: props.pipeline.maturity2 || 0,
            },
            props.pipeline.name,
        );
    }

    function endDragX2(moved: MovedPosition): void {
        positionUpdater.update(
            {
                param1: props.pipeline.maturity1 || 0,
                param2: positionCalc.xToMaturity(
                    moved.x,
                    props.mapDimensions.width,
                ),
            },
            props.pipeline.name,
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
    const y =
        positionCalc.visibilityToY(
            props.pipeline.visibility,
            props.mapDimensions.height,
        ) + 2;

    return (
        <>
            <PipelineBoxSymbol
                id={'pipeline_box_' + props.pipeline.id}
                y={y}
                x1={x1}
                x2={x2}
                styles={props.mapStyleDefs.component}
            />
            <Movable
                id={'pipeline_x1_' + props.pipeline.id}
                onMove={endDragX1}
                x={x1}
                y={y}
                fixedY={true}
                fixedX={false}
                scaleFactor={props.scaleFactor}
            >
                <ComponentSymbol
                    id={'pipeline_circle_x1_' + props.pipeline.id}
                    cx="10"
                    cy="12"
                    styles={props.mapStyleDefs.component}
                    onClick={() => props.setHighlightLine(props.pipeline.line)}
                />
            </Movable>
            <Movable
                id={'pipeline_x2_' + props.pipeline.id}
                onMove={endDragX2}
                x={x2}
                y={y}
                fixedY={true}
                fixedX={false}
                scaleFactor={props.scaleFactor}
            >
                <ComponentSymbol
                    id={'pipeline_circle_x2_' + props.pipeline.id}
                    cx={'-10'}
                    cy="12"
                    styles={props.mapStyleDefs.component}
                    onClick={() => props.setHighlightLine(props.pipeline.line)}
                />
            </Movable>
        </>
    );
}

export default Pipeline;
