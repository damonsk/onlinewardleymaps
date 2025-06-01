import React, { memo } from 'react';
import { MapAnnotationTheme } from '../../constants/mapstyles';
import { MapAnnotations } from '../../types/base';

interface ModernAnnotationTextSymbolProps {
    id?: string;
    annotation: MapAnnotations;
    styles: MapAnnotationTheme;
}

/**
 * ModernAnnotationTextSymbol - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This component renders a single annotation text line
 */
const ModernAnnotationTextSymbol: React.FC<ModernAnnotationTextSymbolProps> = ({
    id,
    annotation,
    styles,
}) => {
    return (
        <tspan
            id={id}
            className="label"
            textAnchor="start"
            dy={18}
            x={0}
            fill={styles.boxTextColour}
        >
            &nbsp;{annotation.number}. {annotation.text}&nbsp;
        </tspan>
    );
};

export default memo(ModernAnnotationTextSymbol);
