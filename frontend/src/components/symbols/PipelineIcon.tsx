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
                {/* Pipeline box representation */}
                <rect x="-15" y="-10" width="30" height="20" stroke={stroke} strokeWidth="1" fill={fill} />
                {/* Internal pipeline segments */}
                <line x1="-15" y1="-3" x2="15" y2="-3" stroke={stroke} strokeWidth="1" />
                <line x1="-15" y1="4" x2="15" y2="4" stroke={stroke} strokeWidth="1" />
            </g>
        </SVGWrapper>
    );
};

export default PipelineIcon;
