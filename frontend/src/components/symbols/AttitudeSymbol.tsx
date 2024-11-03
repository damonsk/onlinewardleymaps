import React, { memo } from 'react';
import {
    MapAttitudeTheme,
    MapAttitudeTypeTheme,
} from '../../constants/mapstyles';
const defaultHeight = '100';
const defaultWidth = '200';

type AttitudeSymbolProps = {
    id?: string;
    fill?: string;
    stroke?: string;
    attitude: string;
    fillOpacity?: number;
    strokeOpacity?: number;
    styles: MapAttitudeTheme;
    height: number;
    width: number;
};

const AttitudeSymbol: React.FunctionComponent<AttitudeSymbolProps> = ({
    id,
    height,
    width,
    fill,
    stroke,
    fillOpacity,
    strokeOpacity,
    attitude,
    styles,
}) => {
    const style = (styles[attitude as keyof MapAttitudeTheme] ||
        styles.pioneers) as MapAttitudeTypeTheme;

    return (
        <rect
            id={id}
            fill={fill || style.fill}
            stroke={stroke || style.stroke}
            fillOpacity={fillOpacity || style.fillOpacity}
            strokeOpacity={strokeOpacity || style.strokeOpacity}
            height={height || defaultHeight}
            width={width || defaultWidth}
            strokeWidth={styles.strokeWidth}
        />
    );
};

export default memo(AttitudeSymbol);
