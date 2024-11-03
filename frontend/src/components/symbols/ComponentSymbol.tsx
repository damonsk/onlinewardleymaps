import React, { memo } from 'react';
import { MapComponentTheme } from '../../constants/mapstyles';

export interface ComponentSymbolProps {
    onClick?: (...args: any[]) => any;
    id?: string;
    cx?: string;
    cy?: string;
    styles: MapComponentTheme;
    evolved?: boolean;
}

const ComponentSymbol: React.FunctionComponent<ComponentSymbolProps> = ({
    id,
    cx,
    cy,
    evolved,
    onClick,
    styles,
}) => {
    const fill = evolved ? styles.evolvedFill : styles.fill;
    const stroke = evolved ? styles.evolved : styles.stroke;

    return (
        <circle
            id={id}
            cx={cx}
            cy={cy}
            strokeWidth={styles.strokeWidth}
            r={styles.radius}
            stroke={stroke}
            fill={fill}
            onClick={onClick}
        />
    );
};

export default memo(ComponentSymbol);
