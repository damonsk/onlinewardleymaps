import React from 'react';
import { MapDimensions } from '../../../constants/defaults';
import { DefaultThemes } from './Fill';

const fill: DefaultThemes = {
    wardley: 'url(#wardleyGradient)',
    colour: 'none',
    plain: 'none',
    handwritten: 'none',
    dark: '#353347',
};

export interface MapBackgroundProps {
    mapDimensions: MapDimensions;
    mapStyleClass: string;
}

const MapBackground: React.FunctionComponent<MapBackgroundProps> = ({
    mapStyleClass,
    mapDimensions,
}) => {
    return (
        <rect
            x="0"
            width={mapDimensions.width}
            y="0"
            height={mapDimensions.height}
            id="fillArea"
            fill={fill[mapStyleClass as keyof DefaultThemes]}
        />
    );
};
export default MapBackground;
