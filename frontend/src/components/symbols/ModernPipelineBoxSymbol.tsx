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
}

const ModernPipelineBoxSymbol: React.FC<ModernPipelineBoxSymbolProps> = ({id, y, x1, x2, stroke, styles = {}}) => {
    const str = stroke || styles.stroke || 'black';
    const strokeWidth = styles.pipelineStrokeWidth || 1;

    return (
        <g id={id} transform={`translate(${x1},${y})`}>
            <line x1={0} y1={0} x2={x2 - x1} y2={0} strokeWidth={strokeWidth} stroke={str} />
            <line x1={x2 - x1} y1={0} x2={x2 - x1} y2={22} strokeWidth={strokeWidth} stroke={str} />
            <line x1={x2 - x1} y1={22} x2={0} y2={22} strokeWidth={strokeWidth} stroke={str} />
            <line x1={0} y1={22} x2={0} y2={0} strokeWidth={strokeWidth} stroke={str} />
        </g>
    );
};

export default memo(ModernPipelineBoxSymbol);
