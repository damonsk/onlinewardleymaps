import React, { memo } from 'react';
import { MapAnnotationTheme } from '../../constants/mapstyles';
import { MapAnnotations } from '../../conversion/Converter';

export interface AnnotationTextSymbolProps {
    id?: string;
    annotation: MapAnnotations;
    styles: MapAnnotationTheme;
}

const AnnotationTextSymbol: React.FunctionComponent<
    AnnotationTextSymbolProps
> = ({ id, annotation, styles }) => {
    return (
        <tspan
            id={id}
            className="label"
            textAnchor="start"
            dy={18}
            x={0}
            fill={styles.boxTextColour}
        >
            &nbsp;{annotation.number}. {annotation.text}&nbsp;
        </tspan>
    );
};

export default memo(AnnotationTextSymbol);
