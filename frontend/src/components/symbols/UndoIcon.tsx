import React, {MouseEventHandler, memo} from 'react';
import {MapTheme} from '../../constants/mapstyles';
import {useI18n} from '../../hooks/useI18n';
import {SVGWrapper} from './icons';

const iconWidth = '50px';
const iconHeight = '40px';

export interface UndoIconProps {
    id: string;
    mapStyleDefs: MapTheme;
    onClick?: MouseEventHandler<SVGSVGElement>;
    hideLabel?: boolean;
    disabled?: boolean;
}

/**
 * UndoIcon component showing a curved arrow pointing left
 * Used in the toolbar for the undo functionality
 */
export const UndoIcon: React.FC<UndoIconProps> = ({id, mapStyleDefs, onClick, hideLabel = true, disabled = false}) => {
    const {t} = useI18n();

    // Helper function to create disabled color
    const createDisabledColor = (color: string | undefined, fallback: string) => {
        if (!color) return fallback;
        // If color is already hex format, append alpha
        if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
            return `${color}99`; // Use 99 for better visibility (60% opacity)
        }
        // For other formats, use CSS opacity
        return color;
    };

    const strokeColor = disabled
        ? createDisabledColor(mapStyleDefs.component?.stroke, '#00000099')
        : mapStyleDefs.component?.stroke || '#000000';

    const fillColor = disabled ? createDisabledColor(mapStyleDefs.component?.fill, '#ffffff99') : mapStyleDefs.component?.fill || 'none';

    return (
        <SVGWrapper
            width={iconWidth}
            height={iconHeight}
            mapStyleDefs={mapStyleDefs}
            onClick={disabled ? () => {} : onClick || (() => {})}
            viewBox="0 0 50 40"
            title={t('editor.undo.title', 'Undo')}
            style={{
                cursor: disabled ? 'not-allowed' : 'pointer',
            }}>
            {/* Curved arrow path for undo */}
            <path
                d="M 35 18 
                   C 35 12, 30 8, 25 8
                   C 18 8, 12 14, 12 22
                   C 12 26, 14 29, 17 30"
                stroke={strokeColor}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Arrow head with base at curve end, pointing down and left */}
            <path d="M 12 34 L 22 34 L 17 23 Z" fill={strokeColor} stroke="none" />

            {/* Accessibility attributes */}
            <title>{t('editor.undo.description', 'Undo last action')}</title>
            <desc>{t('editor.undo.tooltip', 'Click to undo the last action performed on the map')}</desc>
        </SVGWrapper>
    );
};

export default memo(UndoIcon);
