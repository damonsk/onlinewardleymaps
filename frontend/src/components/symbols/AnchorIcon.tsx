import React from 'react';
import {IconProps, SVGWrapper} from './icons';

/**
 * Anchor Icon Component
 * Visual representation of an anchor for the toolbar
 */
export const AnchorIcon: React.FunctionComponent<IconProps> = ({id, hideLabel = false, mapStyleDefs, onClick}) => {
    const iconWidth = hideLabel ? '50px' : '120px';
    const iconHeight = '40px';
    const stroke = mapStyleDefs.component?.stroke || '#000';
    const fill = mapStyleDefs.component?.fill || 'none';

    return (
        <SVGWrapper width={iconWidth} height={iconHeight} mapStyleDefs={mapStyleDefs} onClick={onClick || (() => {})} title={`Anchor-${id}`}>
            {hideLabel === false && (
                <text
                    x="45"
                    y="15"
                    fontFamily={mapStyleDefs.fontFamily}
                    fontSize={mapStyleDefs.component?.fontSize || mapStyleDefs.fontSize}
                    fill={mapStyleDefs.component?.stroke}>
                    Anchor
                </text>
            )}
            <g transform="translate(21, 21) scale(0.8)">
                {/* Anchor symbol */}
                <circle cx="0" cy="0" r="8" stroke={stroke} strokeWidth="1" fill={fill} />
                <line x1="0" y1="-8" x2="0" y2="8" stroke={stroke} strokeWidth="1" />
                <line x1="-8" y1="0" x2="8" y2="0" stroke={stroke} strokeWidth="1" />
            </g>
        </SVGWrapper>
    );
};

export default AnchorIcon;
