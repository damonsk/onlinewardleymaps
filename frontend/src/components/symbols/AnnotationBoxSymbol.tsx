import React, { ReactNode, memo } from 'react';

export interface AnnotationBoxSymbolProps {
    id?: string;
    x?: string | number;
    dy?: string | number;
    fill?: string;
    textAnchor?: string;
    textDecoration?: string;
    className?: string;
    children: ReactNode;
}

const AnnotationBoxSymbol: React.FunctionComponent<AnnotationBoxSymbolProps> = ({
    id,
    dy = '0',
    x = '2',
    fill,
    textAnchor = 'start',
    textDecoration = 'underline',
    className = 'label draggable',
    children,
}) => {
    return (
        <text id={id}>
            <tspan
                className={className}
                textAnchor={textAnchor}
                dy={dy}
                x={x}
                fill={fill}
                textDecoration={textDecoration}
            >
                Annotations:
            </tspan>
            {children}
        </text>
    );
};

export default memo(AnnotationBoxSymbol);
