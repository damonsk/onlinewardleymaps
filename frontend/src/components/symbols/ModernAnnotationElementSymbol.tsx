import React, {memo} from 'react';
import {MapAnnotationTheme} from '../../constants/mapstyles';
import {MapAnnotations} from '../../types/base';

interface ModernAnnotationElementSymbolProps {
    id?: string;
    annotation: MapAnnotations;
    styles: MapAnnotationTheme;
}

const ModernAnnotationElementSymbol: React.FC<ModernAnnotationElementSymbolProps> = ({id, annotation, styles}) => {
    return (
        <>
            <circle
                id={id}
                cx="-0"
                cy="0"
                className="draggable"
                r="15"
                fill={styles.fill}
                stroke={styles.stroke}
                strokeWidth={styles.strokeWidth}
            />
            <text x="0" y="0" className="label draggable" textAnchor="middle" dominantBaseline="middle">
                {annotation.number}
            </text>
        </>
    );
};

export default memo(ModernAnnotationElementSymbol, (prevProps, nextProps) => {
    return prevProps.annotation.number === nextProps.annotation.number && prevProps.styles === nextProps.styles;
});
