import React, { memo } from 'react';
import { MapAnnotationTheme } from '../../constants/mapstyles';

export interface MapAnnotation {
    number?: number;
    text?: string;
}
export interface AnnotationElementSymbolProps {
    id?: string;
    annotation: MapAnnotation;
    styles: MapAnnotationTheme;
}
const AnnotationElementSymbol: React.FunctionComponent<AnnotationElementSymbolProps> = ({
    annotation,
    styles,
}) => {
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
export default memo(AnnotationElementSymbol);
