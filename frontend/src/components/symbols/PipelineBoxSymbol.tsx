import React, {memo} from 'react';

interface PipelineBoxSymbolProps {
    id?: string;
    y: number;
    x1: number;
    x2: number;
    stroke?: string;
    styles?: {
        stroke?: string;
    };
}

const PipelineBoxSymbol: React.FC<PipelineBoxSymbolProps> = ({id, y, x1, x2, stroke, styles = {}}) => {
    const str = stroke || styles.stroke;
    return (
        <g id={id} transform={`translate(${x1},${y})`}>
            <line x1={0} y1={0} x2={x2 - x1} y2={0} strokeWidth={1} stroke={str} />
            <line x1={x2 - x1} y1={0} x2={x2 - x1} y2={22} strokeWidth={1} stroke={str} />
            <line x1={x2 - x1} y1={22} x2={0} y2={22} strokeWidth={1} stroke={str} />
            <line x1={0} y1={22} x2={0} y2={0} strokeWidth={1} stroke={str} />
        </g>
    );
};

export default memo(PipelineBoxSymbol);
