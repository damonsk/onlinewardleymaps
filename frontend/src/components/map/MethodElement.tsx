import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../types/map/styles';
import MethodSymbol from '../symbols/MethodSymbol';
import PositionCalculator from './PositionCalculator';

interface MethodElementProps {
    element: {
        id?: string | number;
        maturity?: number;
        visibility: string | number;
    };
    mapDimensions: MapDimensions;
    method: string;
    mapStyleDefs: MapTheme;
}

const MethodElement: React.FC<MethodElementProps> = ({
    element,
    mapDimensions,
    method,
    mapStyleDefs,
}) => {
    const positionCalc = new PositionCalculator();
    const x = positionCalc.maturityToX(
        element.maturity || 0,
        mapDimensions.width,
    );
    const y = positionCalc.visibilityToY(
        Number(element.visibility),
        mapDimensions.height,
    );
    return (
        <MethodSymbol
            id={'method_' + element.id}
            x={x}
            y={y}
            method={method}
            styles={mapStyleDefs.methods}
        />
    );
};

export default MethodElement;
