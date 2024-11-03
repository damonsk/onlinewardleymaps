import React, { memo } from 'react';
import { MapComponentTheme } from '../../constants/mapstyles';

export interface EcosystemSymbolProps {
    onClick?: (...args: any[]) => any;
    id?: string;
    cx?: string;
    cy?: string;
    styles: MapComponentTheme;
}

const EcosystemSymbol: React.FunctionComponent<EcosystemSymbolProps> = ({
    id,
    cx,
    cy,
    onClick,
    styles,
}) => {
    return (
        <g id={id} onClick={onClick}>
            <circle
                cx={cx}
                cy={cy}
                r="30"
                fill="#d7d7d7"
                strokeWidth="1"
                stroke={styles.stroke}
            />
            <circle
                cx={cx}
                cy={cy}
                r="25"
                fill="white"
                strokeWidth="1"
                stroke="#9e9b9e"
            />
            <circle cx={cx} cy={cy} r="25" fill="url(#diagonalHatch)" />
            <circle
                cx={cx}
                cy={cy}
                r="10"
                fill="white"
                strokeWidth="1"
                stroke="#6e6e6e"
            />
        </g>
    );
};

export default memo(EcosystemSymbol);
