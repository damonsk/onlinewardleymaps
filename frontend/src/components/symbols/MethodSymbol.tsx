import React, { memo } from 'react';
import { MapMethodTheme, MapMethodsTheme } from '../../constants/mapstyles';

export interface MethodSymbolProps {
    onClick?: (...args: any[]) => any;
    id?: string;
    x?: string | number;
    y?: string | number;
    method: string;
    styles: MapMethodsTheme;
}

const MethodSymbol: React.FunctionComponent<MethodSymbolProps> = ({
    id,
    x,
    y,
    method,
    styles,
}) => {
    const style = (styles[method as keyof MapMethodsTheme] ||
        styles.build) as MapMethodTheme;
    return (
        <g id={id} transform={'translate (' + x + ',' + y + ')'}>
            <circle
                cx="0"
                cy="0"
                r="20"
                fill={style.fill}
                stroke={style.stroke}
            />
        </g>
    );
};

export default memo(MethodSymbol);
