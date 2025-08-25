import React, {memo} from 'react';

interface ModernPipelineBoxSymbolProps {
    id?: string;
    y: number;
    x1: number;
    x2: number;
    stroke?: string;
    styles?: {
        stroke?: string;
        pipelineStrokeWidth?: number;
    };
    isHighlighted?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const ModernPipelineBoxSymbol: React.FC<ModernPipelineBoxSymbolProps> = ({
    id, 
    y, 
    x1, 
    x2, 
    stroke, 
    styles = {},
    isHighlighted = false,
    onMouseEnter,
    onMouseLeave
}) => {
    // Use blue highlight color when highlighted, similar to note selection
    const highlightColor = '#2196F3';
    const effectiveStroke = isHighlighted ? highlightColor : (stroke || styles.stroke || 'black');
    const strokeWidth = styles.pipelineStrokeWidth || 1;
    // Slightly increase stroke width when highlighted for better visibility
    const effectiveStrokeWidth = isHighlighted ? Math.max(strokeWidth + 1, 2) : strokeWidth;

    return (
        <g 
            id={id} 
            transform={`translate(${x1},${y})`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{ cursor: onMouseEnter ? 'pointer' : 'default' }}
        >
            {/* Transparent rectangle covering the entire pipeline area for mouse events */}
            <rect
                x={0}
                y={0}
                width={x2 - x1}
                height={22}
                fill="transparent"
                stroke="none"
            />
            <line 
                x1={0} 
                y1={0} 
                x2={x2 - x1} 
                y2={0} 
                strokeWidth={effectiveStrokeWidth} 
                stroke={effectiveStroke}
                style={{
                    transition: isHighlighted ? 'none' : 'stroke 0.2s ease-in-out, stroke-width 0.2s ease-in-out'
                }}
            />
            <line 
                x1={x2 - x1} 
                y1={0} 
                x2={x2 - x1} 
                y2={22} 
                strokeWidth={effectiveStrokeWidth} 
                stroke={effectiveStroke}
                style={{
                    transition: isHighlighted ? 'none' : 'stroke 0.2s ease-in-out, stroke-width 0.2s ease-in-out'
                }}
            />
            <line 
                x1={x2 - x1} 
                y1={22} 
                x2={0} 
                y2={22} 
                strokeWidth={effectiveStrokeWidth} 
                stroke={effectiveStroke}
                style={{
                    transition: isHighlighted ? 'none' : 'stroke 0.2s ease-in-out, stroke-width 0.2s ease-in-out'
                }}
            />
            <line 
                x1={0} 
                y1={22} 
                x2={0} 
                y2={0} 
                strokeWidth={effectiveStrokeWidth} 
                stroke={effectiveStroke}
                style={{
                    transition: isHighlighted ? 'none' : 'stroke 0.2s ease-in-out, stroke-width 0.2s ease-in-out'
                }}
            />
        </g>
    );
};

export default memo(ModernPipelineBoxSymbol);
