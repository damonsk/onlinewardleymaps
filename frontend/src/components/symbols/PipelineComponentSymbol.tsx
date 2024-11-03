import React, { memo } from 'react';

interface PipelineComponentSymbolProps {
    id?: string;
    x?: string;
    y?: string;
    width?: string;
    height?: string;
    evolved?: boolean;
    onClick?: () => void;
    styles: {
        evolvedFill?: string;
        fill?: string;
        evolved?: string;
        stroke?: string;
        pipelineStrokeWidth?: string;
    };
}

const PipelineComponentSymbol: React.FC<PipelineComponentSymbolProps> = ({
    id,
    x = '-5',
    y = '-5',
    width = '10',
    height = '10',
    evolved,
    onClick,
    styles = {},
}) => {
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
