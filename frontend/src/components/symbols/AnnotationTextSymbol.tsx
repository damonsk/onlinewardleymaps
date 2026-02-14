import React, {memo} from 'react';
import {MapAnnotationTheme} from '../../constants/mapstyles';
import {MapAnnotations} from '../../types/base';

interface ModernAnnotationTextSymbolProps {
    id?: string;
    annotation: MapAnnotations;
    styles: MapAnnotationTheme;
    onDoubleClick?: (event: React.MouseEvent<SVGTSpanElement>) => void;
}

const AnnotationTextSymbol: React.FC<ModernAnnotationTextSymbolProps> = ({id, annotation, styles, onDoubleClick}) => {
    return (
        <tspan id={id} className="label" textAnchor="start" dy={18} x={0} fill={styles.boxTextColour} onDoubleClick={onDoubleClick}>
            &nbsp;{annotation.number}. {annotation.text}&nbsp;
        </tspan>
    );
};

export default memo(AnnotationTextSymbol);
