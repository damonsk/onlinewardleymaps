import React, { memo } from 'react';

interface ModernInertiaSymbolProps {
    id?: string;
    x: number;
    y: number;
    stroke?: string;
    strokeWidth?: number;
}

/**
 * ModernInertiaSymbol - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This component displays the visual representation of inertia on the map
 */
const ModernInertiaSymbol: React.FC<ModernInertiaSymbolProps> = ({
    id,
    x,
    y,
    stroke = 'black',
    strokeWidth = 6,
}) => {
    return (
        <line
            id={id}
            x1={x}
            y1={y - 10}
            x2={x}
            y2={y + 10}
            stroke={stroke}
            strokeWidth={strokeWidth}
        />
    );
};

export default memo(ModernInertiaSymbol);
