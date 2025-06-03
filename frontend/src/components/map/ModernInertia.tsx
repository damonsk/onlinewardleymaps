import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import ModernInertiaSymbol from '../symbols/ModernInertiaSymbol';
import ModernPositionCalculator from './ModernPositionCalculator';

interface ModernInertiaProps {
    maturity: number;
    visibility: number;
    mapDimensions: MapDimensions;
}

/**
 * ModernInertia - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This component handles the positioning of inertia indicators on the map
 */
const ModernInertia: React.FC<ModernInertiaProps> = ({
    maturity,
    visibility,
    mapDimensions,
}) => {
    const positionCalc = new ModernPositionCalculator();

    // Make sure maturity is defined with a proper offset for inertia indicator
    // If maturity isn't already calculated with an offset, we add a standard 0.05 offset
    const adjustedMaturity = maturity;

    const x = positionCalc.maturityToX(adjustedMaturity, mapDimensions.width);
    const y = positionCalc.visibilityToY(
        typeof visibility === 'string' ? parseFloat(visibility) : visibility,
        mapDimensions.height,
    );

    return <ModernInertiaSymbol x={x} y={y} />;
};

export default ModernInertia;
