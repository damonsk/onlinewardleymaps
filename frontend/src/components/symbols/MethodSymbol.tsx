import React, { memo } from 'react';
import { MapMethodTheme, MapMethodsTheme } from '../../constants/mapstyles';

export interface ModernMethodSymbolProps {
    onClick?: (e: React.MouseEvent) => void;
    id?: string;
    x?: string | number;
    y?: string | number;
    method: string;
    styles: MapMethodsTheme;
}

/**
 * MethodSymbol - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This component displays a method indicator (build/buy/outsource) on the map
 */
const MethodSymbol: React.FC<ModernMethodSymbolProps> = ({
    id,
    x,
    y,
    method,
    styles,
    onClick,
}) => {
    const style = (styles[method as keyof MapMethodsTheme] ||
        styles.build) as MapMethodTheme;

    return (
        <g
            id={id}
            transform={`translate(${x},${y})`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <circle
                cx="0"
                cy="0"
                r="15"
                fill={style.fill}
                stroke={style.stroke}
            />
        </g>
    );
};

export default memo(MethodSymbol);
