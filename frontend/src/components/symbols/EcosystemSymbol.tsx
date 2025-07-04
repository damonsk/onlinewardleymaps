import React, {memo, MouseEvent} from 'react';
import {MapComponentTheme} from '../../constants/mapstyles';
import {UnifiedComponent} from '../../types/unified';

export interface ModernEcosystemSymbolProps {
    onClick?: (e: MouseEvent<SVGGElement>) => void;
    id?: string;
    cx?: string;
    cy?: string;
    styles: MapComponentTheme;
    component?: UnifiedComponent; // Direct reference to UnifiedComponent
}

const EcosystemSymbol: React.FunctionComponent<ModernEcosystemSymbolProps> = ({
    id,
    cx,
    cy,
    onClick,
    styles,
    component, // Direct access to UnifiedComponent
}) => {
    const evolved = component?.evolved || false;
    const fill = evolved ? styles.evolvedFill : '#d7d7d7';
    const stroke = evolved ? styles.evolved : styles.stroke;

    return (
        <g id={id} onClick={onClick}>
            <circle cx={cx} cy={cy} r="30" fill={fill} strokeWidth="1" stroke={stroke} />
            <circle cx={cx} cy={cy} r="25" fill="white" strokeWidth="1" stroke="#9e9b9e" />
            <circle cx={cx} cy={cy} r="25" fill="url(#diagonalHatch)" />
            <circle cx={cx} cy={cy} r="10" fill="white" strokeWidth="1" stroke="#6e6e6e" />
        </g>
    );
};

export default memo(EcosystemSymbol);
