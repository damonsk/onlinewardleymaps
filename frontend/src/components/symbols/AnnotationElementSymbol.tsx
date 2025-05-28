import React, { memo } from 'react';
import { MapAnnotationTheme } from '../../constants/mapstyles';
import { MapAnnotations } from '../../types/base';

export interface AnnotationElementSymbolProps {
    id?: string;
    annotation: MapAnnotations;
    styles: MapAnnotationTheme;
}
const AnnotationElementSymbol: React.FunctionComponent<
    AnnotationElementSymbolProps
> = ({ annotation, styles }) => {
    return (
        <>
            <circle
                cx="-0"
                cy="0"
                className="draggable"
                r="15"
                fill={styles.fill}
                stroke={styles.stroke}
                strokeWidth={styles.strokeWidth}
            />
            <text x="-5" y="5" className="label draggable" textAnchor="start">
                {annotation.number}
            </text>
        </>
    );
};

// Use React.memo with a custom equality function for props
export default memo(AnnotationElementSymbol, (prevProps, nextProps) => {
    // Only re-render when annotation number or styles change
    return (
        prevProps.annotation.number === nextProps.annotation.number &&
        prevProps.styles === nextProps.styles
    );
});
