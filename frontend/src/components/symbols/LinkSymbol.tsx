import React, {memo, useState} from 'react';

interface LinkStyles {
    evolvedStroke: string;
    stroke: string;
    evolvedStrokeWidth: number;
    strokeWidth: number;
    flowStrokeWidth: number;
    flow: string;
    contextFontSize?: string;
}

interface ModernLinkSymbolProps {
    id?: string;
    x1: string | number;
    x2: string | number;
    y1: string | number;
    y2: string | number;
    flow?: boolean;
    evolved?: boolean;
    strokeDasharray?: string;
    marker?: string;
    isMarkerStart?: boolean;
    styles?: Partial<LinkStyles>;
    filter?: string;
    onClick?: (event: React.MouseEvent) => void;
    onContextMenu?: (event: React.MouseEvent) => void;
    isSelected?: boolean;
    isHighlighted?: boolean;
}

const defaultStyles: LinkStyles = {
    evolvedStroke: '#000000',
    stroke: '#000000',
    evolvedStrokeWidth: 2,
    strokeWidth: 1,
    flowStrokeWidth: 1,
    flow: 'none',
};

const LinkSymbol: React.FC<ModernLinkSymbolProps> = ({
    id,
    x1,
    x2,
    y1,
    y2,
    flow,
    evolved,
    strokeDasharray,
    isMarkerStart,
    marker,
    styles = {},
    filter,
    onClick,
    onContextMenu,
    isSelected,
    isHighlighted = false,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const finalStyles = {...defaultStyles, ...styles};
    const stroke = evolved ? finalStyles.evolvedStroke : finalStyles.stroke;
    const strokeWidth = evolved ? finalStyles.evolvedStrokeWidth : finalStyles.strokeWidth;

    // Highlighting styles
    const highlightColor = '#2196F3';
    const highlightStrokeWidth = Math.max(strokeWidth * 1.5, 3);
    
    // Apply highlighting when link is part of a component's dependency chain
    const effectiveStroke = isHighlighted ? highlightColor : stroke;
    const effectiveStrokeWidth = isHighlighted ? highlightStrokeWidth : strokeWidth;
    const effectiveOpacity = isHighlighted ? 0.6 : 1;

    // Apply selection and hover styling
    const getStroke = () => {
        if (isSelected) return '#007acc';
        if (isHovered && onClick) return '#87ceeb'; // Light blue on hover
        return effectiveStroke;
    };

    const getStrokeWidth = () => {
        if (isSelected) return strokeWidth + 2;
        if (isHovered && onClick) return strokeWidth + 4;
        return effectiveStrokeWidth;
    };

    const selectionStroke = getStroke();
    const selectionStrokeWidth = getStrokeWidth();
    const cursor = onClick ? 'pointer' : 'default';

    return (
        <g id={id} style={{cursor}}>
            {/* Invisible thicker line for easier clicking */}
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth={Math.max(10, strokeWidth + 6)}
                onClick={onClick}
                onContextMenu={onContextMenu}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{cursor}}
            />
            {/* Visible line */}
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeDasharray={strokeDasharray}
                stroke={selectionStroke}
                strokeWidth={selectionStrokeWidth}
                strokeOpacity={effectiveOpacity}
                markerStart={isMarkerStart ? marker : undefined}
                markerEnd={isMarkerStart ? undefined : marker}
                filter={filter}
                onClick={onClick}
                onContextMenu={onContextMenu}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    cursor,
                    transition: 'stroke 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), stroke-width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), stroke-opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
            />
            {flow && (
                <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    strokeWidth={finalStyles.flowStrokeWidth}
                    stroke={isHighlighted ? highlightColor : finalStyles.flow}
                    strokeOpacity={effectiveOpacity}
                    onClick={onClick}
                    onContextMenu={onContextMenu}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        cursor,
                        transition: 'stroke 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), stroke-opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    }}
                />
            )}
        </g>
    );
};

export default memo(LinkSymbol);
