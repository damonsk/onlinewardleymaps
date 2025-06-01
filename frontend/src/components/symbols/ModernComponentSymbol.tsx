import React, { memo, MouseEvent } from 'react';
import { MapComponentTheme } from '../../constants/mapstyles';
import { UnifiedComponent } from '../../types/unified';

/**
 * ModernComponentSymbol Props - using unified type system directly
 * This interface eliminates legacy types and improves type safety
 */
interface ModernComponentSymbolProps {
    onClick?: (e: MouseEvent<SVGElement>) => void;
    id?: string;
    cx?: string;
    cy?: string;
    styles: MapComponentTheme;
    component?: UnifiedComponent; // Direct reference to UnifiedComponent
}

/**
 * ModernComponentSymbol - Component symbol representation using unified types
 * This component eliminates legacy type dependencies and improves rendering performance
 */
const ModernComponentSymbol: React.FunctionComponent<
    ModernComponentSymbolProps
> = ({ id, cx, cy, component, onClick, styles }) => {
    // Use component properties directly from unified type
    const evolved = component?.evolved || false;
    const fill = evolved ? styles.evolvedFill : styles.fill;
    const stroke = evolved ? styles.evolved : styles.stroke;

    return (
        <circle
            id={id}
            cx={cx}
            cy={cy}
            strokeWidth={styles.strokeWidth}
            r={styles.radius}
            stroke={stroke}
            fill={fill}
            onClick={onClick}
        />
    );
};

export default memo(ModernComponentSymbol);
