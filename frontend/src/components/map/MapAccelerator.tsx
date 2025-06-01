import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import { UnifiedComponent } from '../../types/unified';
import Movable from './Movable';
import PositionCalculator from './PositionCalculator';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';

interface MapAcceleratorProps {
    element: UnifiedComponent;
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (text: string) => void;
    children: React.ReactNode;
    scaleFactor: number;
}

const MapAccelerator: React.FC<MapAcceleratorProps> = ({
    element,
    mapDimensions,
    mapText,
    mutateMapText,
    children,
    scaleFactor,
}) => {
    const positionCalc = new PositionCalculator();
    const x = positionCalc.maturityToX(element.maturity, mapDimensions.width);
    const y =
        positionCalc.visibilityToY(element.visibility, mapDimensions.height) +
        (element.offsetY ? element.offsetY : 0);

    const positionUpdater = new DefaultPositionUpdater(
        element.type === 'deaccelerator' ? 'deaccelerator' : 'accelerator',
        mapText,
        mutateMapText,
        [NotDefinedCoordsMatcher, ExistingCoordsMatcher],
    );

    const endDrag = (moved: { x: number; y: number }) => {
        const visibility = positionCalc.yToVisibility(
            moved.y,
            mapDimensions.height,
        );
        const maturity = positionCalc.xToMaturity(moved.x, mapDimensions.width);
        positionUpdater.update(
            { param1: visibility, param2: maturity },
            element.name,
        );
    };

    return (
        <Movable
            id={'accelerator_element_' + element.id}
            onMove={endDrag}
            x={x}
            y={y}
            fixedY={element.evolved}
            fixedX={false}
            shouldShowMoving={false}
            isModKeyPressed={false}
            scaleFactor={scaleFactor}
        >
            <>{children}</>
        </Movable>
    );
};

export default MapAccelerator;
