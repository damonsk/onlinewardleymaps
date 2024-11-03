import React from 'react';
import AttitudeSymbol from '../symbols/AttitudeSymbol';
import Movable from './Movable';
import PositionCalculator from './PositionCalculator';
import { ExistingManyCoordsMatcher } from './positionUpdaters/ExistingManyCoordsMatcher';
import LineNumberPositionUpdater from './positionUpdaters/LineNumberPositionUpdater';
import { NotDefinedManyCoordsMatcher } from './positionUpdaters/NotDefinedManyCoordsMatcher';

interface AttitudeProps {
    attitude: {
        attitude: string;
        maturity: number;
        maturity2: number;
        visibility: number;
        visibility2: number;
        line: number;
    };
    mapDimensions: {
        height: number;
        width: number;
    };
    mapText: string;
    mutateMapText: (text: string) => void;
    mapStyleDefs: {
        attitudes: React.CSSProperties;
    };
    scaleFactor: number;
}

interface MovedPosition {
    x: number;
    y: number;
}

const Attitude: React.FC<AttitudeProps> = props => {
    const { attitude, mapDimensions } = props;
    const { height, width } = mapDimensions;
    const type = attitude.attitude;
    const positionCalc = new PositionCalculator();
    const positionUpdater = new LineNumberPositionUpdater(
        type,
        props.mapText,
        props.mutateMapText,
        [ExistingManyCoordsMatcher, NotDefinedManyCoordsMatcher],
    );
    const x = positionCalc.maturityToX(attitude.maturity, width);
    const x2 = positionCalc.maturityToX(attitude.maturity2, width);
    const y = positionCalc.visibilityToY(attitude.visibility, height);
    const y2 = positionCalc.visibilityToY(attitude.visibility2, height);

    function endDrag(moved: MovedPosition): void {
        const visibility = parseFloat(
            positionCalc.yToVisibility(moved.y, height),
        );
        const maturity = parseFloat(positionCalc.xToMaturity(moved.x, width));
        let visibility2 = attitude.visibility2;
        let maturity2 = attitude.maturity2;
        if (attitude.visibility < visibility) {
            visibility2 =
                visibility - attitude.visibility + attitude.visibility2;
        }
        if (attitude.visibility > visibility) {
            visibility2 =
                visibility - attitude.visibility + attitude.visibility2;
        }
        if (attitude.maturity < maturity) {
            maturity2 = maturity - attitude.maturity + attitude.maturity2;
        }
        if (attitude.maturity > maturity) {
            maturity2 = maturity - attitude.maturity + attitude.maturity2;
        }

        positionUpdater.update(
            {
                param1: parseFloat(visibility.toFixed(2)),
                param2: parseFloat(maturity.toFixed(2)),
                param3: parseFloat(visibility2.toFixed(2)),
                param4: parseFloat(maturity2.toFixed(2)),
            },
            '',
            attitude.line,
        );
    }

    return (
        <>
            <Movable
                id={`attitude_${type}_movable`}
                onMove={endDrag}
                x={x}
                y={y}
                fixedY={false}
                fixedX={false}
                scaleFactor={props.scaleFactor}
            >
                <AttitudeSymbol
                    id={`attitude_${type}`}
                    attitude={type}
                    height={y2 - y}
                    width={x2 - x}
                    textAnchor="middle"
                    styles={props.mapStyleDefs.attitudes}
                />
            </Movable>
        </>
    );
};

export default Attitude;
