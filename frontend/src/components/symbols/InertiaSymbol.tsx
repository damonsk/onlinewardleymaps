import React, { memo } from 'react';
type InertiaSymbolProps = {
    id?: string;
    x: number;
    y: number;
    stroke?: string;
    strokeWidth?: number;
};
const InertiaSymbol: React.FunctionComponent<InertiaSymbolProps> = memo(
    function InertiaSymbol(props) {
        const { id, x, y, stroke = 'black', strokeWidth = '6' } = props;
        return (
            <line
                id={id}
                x1={x}
                y1={y - 10}
                x2={x}
                y2={y + 10}
                stroke={stroke}
                strokeWidth={strokeWidth}
            />
        );
    },
);
export default InertiaSymbol;
