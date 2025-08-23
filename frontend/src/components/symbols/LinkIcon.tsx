import React, {MouseEventHandler, memo} from 'react';
import {MapTheme} from '../../constants/mapstyles';
import {useI18n} from '../../hooks/useI18n';
import {SVGWrapper} from './icons';

const iconWidth = '50px';
const iconHeight = '40px';

export interface LinkIconProps {
    id: string;
    mapStyleDefs: MapTheme;
    onClick?: MouseEventHandler<SVGSVGElement>;
    hideLabel?: boolean;
}

/**
 * LinkIcon component showing two circles connected by a line
 * Used in the toolbar for the component linking tool
 */
export const LinkIcon: React.FC<LinkIconProps> = ({id, mapStyleDefs, onClick, hideLabel = true}) => {
    const {t} = useI18n();
    const strokeColor = mapStyleDefs.component?.stroke || '#000000';
    const fillColor = mapStyleDefs.component?.fill || '#ffffff';

    return (
        <SVGWrapper
            width={iconWidth}
            height={iconHeight}
            mapStyleDefs={mapStyleDefs}
            onClick={onClick || (() => {})}
            viewBox="0 0 50 40"
            title={t('components.linkComponents', 'Link Components')}>
            {/* First circle (source) */}
            <circle cx="12" cy="20" r="6" fill={fillColor} stroke={strokeColor} strokeWidth="2" />

            {/* Connection line */}
            <line x1="18" y1="20" x2="32" y2="20" stroke={strokeColor} strokeWidth="2" />

            {/* Second circle (target) */}
            <circle cx="38" cy="20" r="6" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
        </SVGWrapper>
    );
};

export default memo(LinkIcon);
