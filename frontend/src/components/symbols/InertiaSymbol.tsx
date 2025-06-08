import React, {memo} from 'react';

interface InertiaSymbolProps {
    id?: string;
    x: number;
    y: number;
    stroke?: string;
    strokeWidth?: number;
    className?: string;
}

const InertiaSymbol: React.FC<InertiaSymbolProps> = ({id, x, y, stroke = 'black', strokeWidth = 6, className = ''}) => {
    return (
        <line
            id={id}
            className={`inertia-symbol ${className}`}
            x1={x}
            y1={y - 10}
            x2={x}
            y2={y + 10}
            stroke={stroke}
            strokeWidth={strokeWidth}
        />
    );
};

export default memo(InertiaSymbol);
