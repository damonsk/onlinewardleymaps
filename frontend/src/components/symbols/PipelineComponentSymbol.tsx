import React, {memo, MouseEvent} from 'react';
import {MapComponentTheme} from '../../constants/mapstyles';
import {UnifiedComponent} from '../../types/unified';

interface ModernPipelineComponentSymbolProps {
    id?: string;
    x?: string;
    y?: string;
    width?: string;
    height?: string;
    onClick?: (e: MouseEvent<SVGElement>) => void;
    styles: MapComponentTheme;
    component?: UnifiedComponent; // Direct reference to UnifiedComponent
}

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
