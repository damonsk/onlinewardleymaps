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

/**
 * Wrapper for ComponentIcon to normalize props
 */
export const ToolbarComponentIcon: React.FC<ToolbarIconProps> = ({id, mapStyleDefs, onClick}) => (
    <ComponentIcon
        id={id}
        mapStyleDefs={mapStyleDefs}
        onClick={onClick || (() => {})}
        hideLabel={true}
        evolved={undefined}
        text="Component"
    />
);

/**
 * Wrapper for InertiaIcon to normalize props
 */
export const ToolbarInertiaIcon: React.FC<ToolbarIconProps> = ({id, mapStyleDefs, onClick}) => (
    <InertiaIcon id={id} mapStyleDefs={mapStyleDefs} onClick={onClick || (() => {})} hideLabel={true} />
);

/**
 * Wrapper for MarketIcon to normalize props
 */
export const ToolbarMarketIcon: React.FC<ToolbarIconProps> = ({id, mapStyleDefs, onClick}) => (
    <MarketIcon id={id} mapStyleDefs={mapStyleDefs} onClick={onClick || (() => {})} hideLabel={true} />
);

/**
 * Wrapper for EcosystemIcon to normalize props
 */
export const ToolbarEcosystemIcon: React.FC<ToolbarIconProps> = ({id, mapStyleDefs, onClick}) => (
    <EcosystemIcon id={id} mapStyleDefs={mapStyleDefs} onClick={onClick || (() => {})} hideLabel={true} />
);

/**
 * Wrapper for BuyMethodIcon to normalize props
 */
export const ToolbarBuyMethodIcon: React.FC<ToolbarIconProps> = ({id, mapStyleDefs, onClick}) => (
    <BuyMethodIcon id={id} mapStyleDefs={mapStyleDefs} onClick={onClick || (() => {})} hideLabel={true} />
);

/**
 * Wrapper for BuildMethodIcon to normalize props
 */
export const ToolbarBuildMethodIcon: React.FC<ToolbarIconProps> = ({id, mapStyleDefs, onClick}) => (
    <BuildMethodIcon id={id} mapStyleDefs={mapStyleDefs} onClick={onClick || (() => {})} hideLabel={true} />
);

/**
 * Wrapper for OutSourceMethodIcon to normalize props
 */
export const ToolbarOutSourceMethodIcon: React.FC<ToolbarIconProps> = ({id, mapStyleDefs, onClick}) => (
    <OutSourceMethodIcon id={id} mapStyleDefs={mapStyleDefs} onClick={onClick || (() => {})} hideLabel={true} />
);

/**
 * Wrapper for GenericNoteIcon to normalize props
 */
export const ToolbarGenericNoteIcon: React.FC<ToolbarIconProps> = ({id, mapStyleDefs, onClick}) => (
    <GenericNoteIcon id={id} mapStyleDefs={mapStyleDefs} onClick={onClick || (() => {})} hideLabel={true} />
);

/**
 * Wrapper for PipelineIcon to normalize props
 */
export const ToolbarPipelineIcon: React.FC<ToolbarIconProps> = ({id, mapStyleDefs, onClick}) => (
    <PipelineIcon id={id} mapStyleDefs={mapStyleDefs} onClick={onClick || (() => {})} hideLabel={true} />
);

/**
 * Wrapper for AnchorIcon to normalize props
 */
export const ToolbarAnchorIcon: React.FC<ToolbarIconProps> = ({id, mapStyleDefs, onClick}) => (
    <AnchorIcon id={id} mapStyleDefs={mapStyleDefs} onClick={onClick || (() => {})} hideLabel={true} />
);

/**
 * Wrapper for LinkIcon to normalize props
 */
export const ToolbarLinkIcon: React.FC<ToolbarIconProps> = ({id, mapStyleDefs, onClick}) => (
    <LinkIcon id={id} mapStyleDefs={mapStyleDefs} onClick={onClick || (() => {})} hideLabel={true} />
);

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
