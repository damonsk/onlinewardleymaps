import React, { memo } from 'react';

interface LinkSymbolProps {
    id?: string;
    x1: string | number;
    x2: string | number;
    y1: string | number;
    y2: string | number;
    flow?: boolean;
    evolved?: boolean;
    strokeDasharray?: string;
    markerStart?: string;
    styles: {
        evolvedStroke: string;
        stroke: string;
        evolvedStrokeWidth: number;
        strokeWidth: number;
        flowStrokeWidth: number;
        flow: string;
    };
    filter?: string;
}

const LinkSymbol: React.FC<LinkSymbolProps> = ({
    id,
    x1,
    x2,
    y1,
    y2,
    flow,
    evolved,
    strokeDasharray,
    markerStart,
    styles,
    filter,
}) => {
    const stroke = evolved ? styles.evolvedStroke : styles.stroke;
    const strokeWidth = evolved
        ? styles.evolvedStrokeWidth
        : styles.strokeWidth;
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
                markerStart={markerStart}
                filter={filter}
            />
            {flow && (
                <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    strokeWidth={styles.flowStrokeWidth}
                    stroke={styles.flow}
                />
            )}
        </g>
    );
};

export default memo(LinkSymbol);
