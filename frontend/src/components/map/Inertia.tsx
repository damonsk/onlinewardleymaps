import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import InertiaSymbol from '../symbols/InertiaSymbol';
import PositionCalculator from './PositionCalculator';

interface InertiaProps {
    maturity: number;
    visibility: number;
    mapDimensions: MapDimensions;
}

/**
 * Inertia - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This component handles the positioning of inertia indicators on the map
 * Inertia indicators show resistance to change for components
 */
const Inertia: React.FC<InertiaProps> = ({
    maturity,
    visibility,
    mapDimensions,
}) => {
    const positionCalc = new PositionCalculator();

    // Make sure maturity is defined with a proper offset for inertia indicator
    // We add a standard 0.05 offset to position the inertia indicator slightly
    // to the right of the component
    const adjustedMaturity = maturity + 0.05;

    const x = positionCalc.maturityToX(adjustedMaturity, mapDimensions.width);
    const y = positionCalc.visibilityToY(
        typeof visibility === 'string' ? parseFloat(visibility) : visibility,
        mapDimensions.height,
    );

    return <InertiaSymbol x={x} y={y} />;
};

export default Inertia;
