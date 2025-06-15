import React, {memo} from 'react';

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
}) => {
    const finalStyles = {...defaultStyles, ...styles};
    const stroke = evolved ? finalStyles.evolvedStroke : finalStyles.stroke;
    const strokeWidth = evolved ? finalStyles.evolvedStrokeWidth : finalStyles.strokeWidth;

    return (
        <g id={id}>
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeDasharray={strokeDasharray}
                stroke={stroke}
                strokeWidth={strokeWidth}
                markerStart={isMarkerStart ? marker : undefined}
                markerEnd={isMarkerStart ? undefined : marker}
                filter={filter}
            />
            {flow && <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={finalStyles.flowStrokeWidth} stroke={finalStyles.flow} />}
        </g>
    );
};

export default memo(LinkSymbol);
