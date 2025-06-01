import React from 'react';
import { MapTheme } from '../../constants/mapstyles';
import ModernAttitudeSymbol from '../symbols/ModernAttitudeSymbol';
import ModernMovable from './ModernMovable';
import PositionCalculator from './PositionCalculator';
import { ExistingManyCoordsMatcher } from './positionUpdaters/ExistingManyCoordsMatcher';
import LineNumberPositionUpdater from './positionUpdaters/LineNumberPositionUpdater';
import { NotDefinedManyCoordsMatcher } from './positionUpdaters/NotDefinedManyCoordsMatcher';

interface ModernAttitudeProps {
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
    mapStyleDefs: MapTheme;
    scaleFactor: number;
}

interface MovedPosition {
    x: number;
    y: number;
}

/**
 * ModernAttitude - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This component renders a movable attitude area on the map
 */
const ModernAttitude: React.FC<ModernAttitudeProps> = ({
    attitude,
    mapDimensions,
    mapText,
    mutateMapText,
    mapStyleDefs,
    scaleFactor
}) => {
    const { height, width } = mapDimensions;
    const type = attitude.attitude;
    const positionCalc = new PositionCalculator();
    const positionUpdater = new LineNumberPositionUpdater(
        type,
        mapText,
        mutateMapText,
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
            <ModernMovable
                id={`modern_attitude_${type}_movable`}
                onMove={endDrag}
                x={x}
                y={y}
                fixedY={false}
                fixedX={false}
                scaleFactor={scaleFactor}
            >
                <ModernAttitudeSymbol
                    id={`modern_attitude_${type}`}
                    attitude={type}
                    height={y2 - y}
                    width={x2 - x}
                    styles={mapStyleDefs.attitudes}
                />
            </ModernMovable>
        </>
    );
};

export default ModernAttitude;
