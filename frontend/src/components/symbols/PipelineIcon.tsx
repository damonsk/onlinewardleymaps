import React from 'react';
import {IconProps, SVGWrapper} from './icons';

/**
 * Pipeline Icon Component
 * Visual representation of a pipeline for the toolbar
 */
export const PipelineIcon: React.FunctionComponent<IconProps> = ({id, hideLabel, mapStyleDefs, onClick}) => {
    const iconWidth = hideLabel ? '50px' : '120px';
    const iconHeight = '40px';
    const stroke = mapStyleDefs.component?.stroke || '#000';
    const fill = mapStyleDefs.component?.fill || 'none';

    return (
        <SVGWrapper width={iconWidth} height={iconHeight} mapStyleDefs={mapStyleDefs} onClick={onClick} title={`Pipeline-${id}`}>
            {hideLabel === false && (
                <text
                    x="45"
                    y="15"
                    fontFamily={mapStyleDefs.fontFamily}
                    fontSize={mapStyleDefs.component?.fontSize || mapStyleDefs.fontSize}
                    fill={mapStyleDefs.component?.stroke}>
                    Pipeline
                </text>
            )}
            <g transform="translate(21, 21) scale(0.8)">
                {/* Horizontal pipeline box - wider and thinner */}
                <rect x="-18" y="-6" width="36" height="12" stroke={stroke} strokeWidth="2" fill={fill} />
                {/* Small square centered on top line both horizontally and vertically */}
                <rect x="-3" y="-9" width="6" height="6" stroke={stroke} strokeWidth="2" fill={fill} />
            </g>
        </SVGWrapper>
    );
};

export default PipelineIcon;
