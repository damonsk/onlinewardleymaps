import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import InertiaSymbol from '../symbols/InertiaSymbol';
import PositionCalculator from './PositionCalculator';

interface InertiaProps {
    maturity: number;
    visibility: number;
    mapDimensions: MapDimensions;
}

const Inertia: React.FC<InertiaProps> = (props) => {
    const positionCalc = new PositionCalculator();
    const x = () =>
        positionCalc.maturityToX(props.maturity, props.mapDimensions.width);
    const y = () =>
        positionCalc.visibilityToY(
            props.visibility,
            props.mapDimensions.height,
        );

    return <InertiaSymbol x={x()} y={y()} />;
};

export default Inertia;
