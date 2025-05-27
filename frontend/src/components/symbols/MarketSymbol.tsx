import React, { memo } from 'react';
import { MapComponentTheme } from '../../constants/mapstyles';
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

interface MarketSymbolProps {
    id?: string;
    styles: MapComponentTheme;
    cx?: string;
    cy?: string;
    onClick: (e: React.MouseEvent<SVGElement>) => void;
}

const MarketSymbol: React.FC<MarketSymbolProps> = ({ id, styles, onClick }) => {
    const coords = rotatePoints();
    return (
        <g id={id} onClick={onClick}>
            <circle
                r={SM_CIRC_RADIUS * 1.8}
                fill={styles.fill}
                strokeWidth="1"
                stroke={styles.stroke}
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

export default memo(MarketSymbol);
