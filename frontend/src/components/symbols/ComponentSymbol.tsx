import React, {memo, MouseEvent} from 'react';
import {MapComponentTheme} from '../../constants/mapstyles';
import {BaseMapElement, EvolvableElement, LabelableElement} from '../../types/unified';

interface ModernComponentSymbolProps {
    onClick?: (e: MouseEvent<SVGElement>) => void;
    id?: string;
    cx?: string;
    cy?: string;
    styles: MapComponentTheme;
    component?: BaseMapElement & EvolvableElement & LabelableElement;
    evolved?: boolean; // Support for evolved prop used in icons.tsx
}

const ComponentSymbol: React.FunctionComponent<ModernComponentSymbolProps> = ({id, cx, cy, component, onClick, styles}) => {
    const evolved = component?.evolved || false;
    const fill = evolved ? styles.evolvedFill : styles.fill;
    const stroke = evolved ? styles.evolved : styles.stroke;

    return (
        <circle id={id} cx={cx} cy={cy} strokeWidth={styles.strokeWidth} r={styles.radius} stroke={stroke} fill={fill} onClick={onClick} />
    );
};

export default memo(ComponentSymbol);
