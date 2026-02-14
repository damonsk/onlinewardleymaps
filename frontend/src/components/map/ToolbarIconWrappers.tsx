import React from 'react';
import {ToolbarIconProps} from '../../types/toolbar';
import {
    BuildMethodIcon,
    BuyMethodIcon,
    ComponentIcon,
    EcosystemIcon,
    GenericNoteIcon,
    InertiaIcon,
    MarketIcon,
    OutSourceMethodIcon,
} from '../symbols/icons';
import PipelineIcon from '../symbols/PipelineIcon';
import AnchorIcon from '../symbols/AnchorIcon';
import LinkIcon from '../symbols/LinkIcon';
import UndoIcon from '../symbols/UndoIcon';
import RedoIcon from '../symbols/RedoIcon';

const noopClick = () => {};

type HideLabelIconProps = ToolbarIconProps & {
    hideLabel?: boolean;
};

const createHideLabelIconWrapper = (IconComponent: React.ComponentType<HideLabelIconProps>): React.FC<ToolbarIconProps> => {
    const WrappedIcon: React.FC<ToolbarIconProps> = ({id, mapStyleDefs, onClick}) => (
        <IconComponent id={id} mapStyleDefs={mapStyleDefs} onClick={onClick || noopClick} hideLabel={true} />
    );
    return WrappedIcon;
};

/**
 * Wrapper for ComponentIcon to normalize props
 */
export const ToolbarComponentIcon: React.FC<ToolbarIconProps> = ({id, mapStyleDefs, onClick}) => (
    <ComponentIcon
        id={id}
        mapStyleDefs={mapStyleDefs}
        onClick={onClick || noopClick}
        hideLabel={true}
        evolved={undefined}
        text="Component"
    />
);

/**
 * Wrapper for InertiaIcon to normalize props
 */
export const ToolbarInertiaIcon = createHideLabelIconWrapper(InertiaIcon);

/**
 * Wrapper for MarketIcon to normalize props
 */
export const ToolbarMarketIcon = createHideLabelIconWrapper(MarketIcon);

/**
 * Wrapper for EcosystemIcon to normalize props
 */
export const ToolbarEcosystemIcon = createHideLabelIconWrapper(EcosystemIcon);

/**
 * Wrapper for BuyMethodIcon to normalize props
 */
export const ToolbarBuyMethodIcon = createHideLabelIconWrapper(BuyMethodIcon);

/**
 * Wrapper for BuildMethodIcon to normalize props
 */
export const ToolbarBuildMethodIcon = createHideLabelIconWrapper(BuildMethodIcon);

/**
 * Wrapper for OutSourceMethodIcon to normalize props
 */
export const ToolbarOutSourceMethodIcon = createHideLabelIconWrapper(OutSourceMethodIcon);

/**
 * Wrapper for GenericNoteIcon to normalize props
 */
export const ToolbarGenericNoteIcon = createHideLabelIconWrapper(GenericNoteIcon);

/**
 * Wrapper for PipelineIcon to normalize props
 */
export const ToolbarPipelineIcon = createHideLabelIconWrapper(PipelineIcon);

/**
 * Wrapper for AnchorIcon to normalize props
 */
export const ToolbarAnchorIcon = createHideLabelIconWrapper(AnchorIcon);

/**
 * Wrapper for LinkIcon to normalize props
 */
export const ToolbarLinkIcon = createHideLabelIconWrapper(LinkIcon);

/**
 * PST Icon component for the toolbar
 * Shows a generic box icon representing PST (Pioneers, Settlers, Town Planners) boxes
 */
export const ToolbarPSTIcon: React.FC<ToolbarIconProps> = ({id, mapStyleDefs, onClick}) => (
    <svg
        id={id}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
        style={{cursor: 'pointer'}}>
        {/* Empty box outline */}
        <rect x="3" y="3" width="18" height="18" rx="2" stroke={mapStyleDefs.component.stroke} strokeWidth="2" fill="none" />
    </svg>
);

/**
 * Enhanced toolbar icon props that include disabled state
 */
export interface EnhancedToolbarIconProps extends ToolbarIconProps {
    disabled?: boolean;
}

/**
 * Wrapper for UndoIcon to normalize props
 */
export const ToolbarUndoIcon: React.FC<EnhancedToolbarIconProps> = ({id, mapStyleDefs, onClick, disabled = false}) => (
    <UndoIcon id={id} mapStyleDefs={mapStyleDefs} onClick={onClick || noopClick} hideLabel={true} disabled={disabled} />
);

/**
 * Wrapper for RedoIcon to normalize props
 */
export const ToolbarRedoIcon: React.FC<EnhancedToolbarIconProps> = ({id, mapStyleDefs, onClick, disabled = false}) => (
    <RedoIcon id={id} mapStyleDefs={mapStyleDefs} onClick={onClick || noopClick} hideLabel={true} disabled={disabled} />
);
