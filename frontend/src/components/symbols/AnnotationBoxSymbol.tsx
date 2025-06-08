import React, {ReactNode, memo} from 'react';
import {MapAnnotationTheme} from '../../constants/mapstyles';

interface ModernAnnotationBoxSymbolProps {
    id?: string;
    x?: string | number;
    dy?: string | number;
    theme: MapAnnotationTheme;
    fill?: string;
    textAnchor?: string;
    textDecoration?: string;
    className?: string;
    children: ReactNode;
}

const AnnotationBoxSymbol: React.FC<ModernAnnotationBoxSymbolProps> = ({
    id,
    dy = '0',
    x = '2',
    textAnchor = 'start',
    textDecoration = 'underline',
    className = 'label draggable',
    theme,
    children,
}) => {
    return (
        <text id={id}>
            <tspan className={className} textAnchor={textAnchor} dy={dy} x={x} fill={theme.text} textDecoration={textDecoration}>
                Annotations:
            </tspan>
            {children}
        </text>
    );
};

export default memo(AnnotationBoxSymbol);
