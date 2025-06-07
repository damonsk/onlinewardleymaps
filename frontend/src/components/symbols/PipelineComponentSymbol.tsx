import React, { memo } from 'react';
import { MapComponentTheme } from '../../constants/mapstyles';
import { UnifiedComponent } from '../../types/unified';

/**
 * PipelineComponentSymbol Props - using unified type system directly
 * This interface eliminates legacy types and improves type safety
 */
interface ModernPipelineComponentSymbolProps {
    id?: string;
    x?: string;
    y?: string;
    width?: string;
    height?: string;
    onClick?: () => void;
    styles: MapComponentTheme;
    component?: UnifiedComponent; // Direct reference to UnifiedComponent
}

/**
 * PipelineComponentSymbol - Pipeline component representation using unified types
 * This component eliminates legacy type dependencies and improves rendering performance
 */
const PipelineComponentSymbol: React.FC<ModernPipelineComponentSymbolProps> = ({
    id,
    x = '-5',
    y = '-5',
    width = '10',
    height = '10',
    onClick,
    styles,
    component, // Direct access to UnifiedComponent
}) => {
    // Use component properties directly from unified type
    const evolved = component?.evolved || false;
    const fill = evolved ? styles.evolvedFill : styles.fill;
    const stroke = evolved ? styles.evolved : styles.stroke;

    return (
        <rect
            onClick={onClick}
            id={id}
            x={x}
            y={y}
            fill={fill}
            stroke={stroke}
            width={width}
            height={height}
            strokeWidth={styles.pipelineStrokeWidth}
        />
    );
};

export default memo(PipelineComponentSymbol);
