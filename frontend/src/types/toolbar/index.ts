import React from 'react';
import {MapTheme} from '../../constants/mapstyles';

/**
 * Interface for individual toolbar items
 */
export interface ToolbarItem {
    id: string;
    label: string;
    icon: React.ComponentType<ToolbarIconProps>;
    template: (name: string, y: string, x: string) => string;
    category: 'component' | 'method' | 'note' | 'pipeline' | 'other';
    defaultName: string;
}

/**
 * Simplified props interface for toolbar icons
 */
export interface ToolbarIconProps {
    id: string;
    mapStyleDefs: MapTheme;
    onClick?: React.MouseEventHandler<SVGSVGElement>;
}

/**
 * Configuration interface for the toolbar
 */
export interface ToolbarConfiguration {
    items: ToolbarItem[];
    categories: ToolbarCategory[];
}

/**
 * Interface for toolbar categories
 */
export interface ToolbarCategory {
    id: string;
    label: string;
    items: string[]; // Array of toolbar item IDs
}

/**
 * Props interface for the main WysiwygToolbar component
 */
export interface WysiwygToolbarProps {
    mapStyleDefs: MapTheme;
    mapDimensions: {width: number; height: number};
    mapText: string;
    mutateMapText: (newText: string) => void;
    onItemSelect: (item: ToolbarItem | null) => void;
    selectedItem: ToolbarItem | null;
    className?: string;
}

/**
 * Props interface for individual ToolbarItem components
 */
export interface ToolbarItemProps {
    item: ToolbarItem;
    isSelected: boolean;
    onClick: () => void;
    mapStyleDefs: MapTheme;
}

/**
 * Props interface for the DragPreview component
 */
export interface DragPreviewProps {
    selectedItem: ToolbarItem | null;
    mousePosition: {x: number; y: number};
    isValidDropZone: boolean;
    mapStyleDefs: MapTheme;
}

/**
 * Interface for coordinate conversion utilities
 */
export interface CoordinatePosition {
    x: number;
    y: number;
}

/**
 * Interface for map dimensions
 */
export interface MapDimensions {
    width: number;
    height: number;
}
