import React from 'react';
import {MapDimensions} from '../../constants/defaults';
import InertiaSymbol from '../symbols/InertiaSymbol';
import PositionCalculator from './PositionCalculator';

interface InertiaProps {
    maturity: number;
    visibility: number;
    mapDimensions: MapDimensions;
}

const Inertia: React.FC<InertiaProps> = ({maturity, visibility, mapDimensions}) => {
    const positionCalc = new PositionCalculator();
    const x = positionCalc.maturityToX(maturity, mapDimensions.width);
    const y = positionCalc.visibilityToY(typeof visibility === 'string' ? parseFloat(visibility) : visibility, mapDimensions.height);

    return <InertiaSymbol x={x} y={y} />;
};

export default Inertia;
