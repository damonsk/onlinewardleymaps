import React, {MouseEventHandler, memo} from 'react';
import {MapTheme} from '../../constants/mapstyles';
import {useI18n} from '../../hooks/useI18n';
import {SVGWrapper} from './icons';

const iconWidth = '50px';
const iconHeight = '40px';

export interface RedoIconProps {
    id: string;
    mapStyleDefs: MapTheme;
    onClick?: MouseEventHandler<SVGSVGElement>;
    hideLabel?: boolean;
    disabled?: boolean;
}

/**
 * RedoIcon component showing a curved arrow pointing right
 * Used in the toolbar for the redo functionality
 */
export const RedoIcon: React.FC<RedoIconProps> = ({id, mapStyleDefs, onClick, hideLabel = true, disabled = false}) => {
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
            title={t('editor.redo.title', 'Redo')}
            style={{
                cursor: disabled ? 'not-allowed' : 'pointer',
            }}>
            {/* Curved arrow path for redo */}
            <path
                d="M 15 18 
                   C 15 12, 20 8, 25 8
                   C 32 8, 38 14, 38 22
                   C 38 26, 36 29, 33 30"
                stroke={strokeColor}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Arrow head with base at curve end, pointing down and right */}
            <path d="M 28 34 L 38 34 L 33 23 Z" fill={strokeColor} stroke="none" />

            {/* Accessibility attributes */}
            <title>{t('editor.redo.description', 'Redo last undone action')}</title>
            <desc>{t('editor.redo.tooltip', 'Click to redo the last action that was undone')}</desc>
        </SVGWrapper>
    );
};

export default memo(RedoIcon);
