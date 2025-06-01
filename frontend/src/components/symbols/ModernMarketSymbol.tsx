import React, { memo, MouseEvent } from 'react';
import { MapComponentTheme } from '../../constants/mapstyles';
import { UnifiedComponent } from '../../types/unified';

const SM_CIRC_RADIUS = 10;
const polarCoord = (radius: number, angle: number): [number, number] => [
    Math.round(radius * Math.cos((angle * Math.PI) / 180)),
    Math.round(radius * Math.sin((angle * Math.PI) / 180)),
];

const rotatePoints = (): [number, number][] => {
    const START_ANGLE = 30;
    const ROTATE = 120;
    const coords: [number, number][] = [];
    for (let i = 0; i < 3; i++) {
        coords.push(polarCoord(SM_CIRC_RADIUS, START_ANGLE + ROTATE * i));
    }
    return coords;
};

const drawInsideCircles = (
    coords: [number, number][],
    styles: MapComponentTheme,
) =>
    coords.map((cxy, i) => (
        <circle
            key={i}
            cx={cxy[0]}
            cy={cxy[1]}
            r="5"
            fill={styles.fill}
            strokeWidth="3"
            stroke={styles.stroke}
        />
    ));

/**
 * ModernMarketSymbol Props - using unified type system directly
 * This interface eliminates legacy types and improves type safety
 */
interface ModernMarketSymbolProps {
    id?: string;
    styles: MapComponentTheme;
    cx?: string;
    cy?: string;
    component?: UnifiedComponent; // Direct reference to UnifiedComponent
    onClick: (e: MouseEvent<SVGElement>) => void;
}

/**
 * ModernMarketSymbol - Market symbol representation using unified types
 * This component eliminates legacy type dependencies and improves rendering performance
 */
const ModernMarketSymbol: React.FC<ModernMarketSymbolProps> = ({
    id,
    styles,
    onClick,
    component, // Direct access to UnifiedComponent
}) => {
    const coords = rotatePoints();

    // Could use component properties directly if needed
    const fill = component?.evolved ? styles.evolvedFill : styles.fill;
    const stroke = component?.evolved ? styles.evolved : styles.stroke;

    return (
        <g id={id} onClick={onClick}>
            <circle
                r={SM_CIRC_RADIUS * 1.8}
                fill={fill}
                strokeWidth="1"
                stroke={stroke}
            />
            <path
                strokeWidth="2"
                stroke="black"
                fill="none"
                opacity=".8"
                d={`M${coords[0]} L${coords[1]} L${coords[2]} Z`}
            />
            {drawInsideCircles(coords, styles)}
        </g>
    );
};

export default memo(ModernMarketSymbol);
