import React from 'react';
import {MapTheme} from '../../constants/mapstyles';

/**
 * Interface for toolbar sub-items (used in dropdowns like PST)
 */
export interface ToolbarSubItem {
    id: string;
    label: string;
    color: string;
    template: (maturity1: string, visibilityHigh: string, maturity2: string, visibilityLow: string) => string;
}

/**
 * Interface for individual toolbar items
 */
export interface ToolbarItem {
    id: string;
    label: string;
    icon: React.ComponentType<ToolbarIconProps>;
    template?: (name: string, y: string, x: string) => string;
    category: 'component' | 'method' | 'note' | 'pipeline' | 'link' | 'pst' | 'other';
    defaultName?: string;
    toolType?: 'placement' | 'linking' | 'drawing' | 'method-application';
    keyboardShortcut?: string; // Single character keyboard shortcut
    subItems?: ToolbarSubItem[]; // For dropdown items like PST
    selectedSubItem?: ToolbarSubItem; // Currently selected sub-item for dropdown tools
    methodName?: string; // For method application tools (build, buy, outsource)
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
    keyboardShortcutsEnabled?: boolean;
}

/**
 * Props interface for individual ToolbarItem components
 */
export interface ToolbarItemProps {
    item: ToolbarItem;
    isSelected: boolean;
    onClick: () => void;
    mapStyleDefs: MapTheme;
    onSubItemSelect?: (subItem: ToolbarSubItem) => void;
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

/**
 * Props interface for the KeyboardShortcutHandler component
 */
export interface KeyboardShortcutHandlerProps {
    toolbarItems: ToolbarItem[];
    onToolSelect: (toolId: string | null) => void;
    isEnabled: boolean;
    currentSelectedTool: string | null;
}

/**
 * Props interface for the ToolbarDropdown component
 */
export interface ToolbarDropdownProps {
    items: ToolbarSubItem[];
    isOpen: boolean;
    onSelect: (item: ToolbarSubItem) => void;
    onClose: () => void;
    position: {x: number; y: number};
    mapStyleDefs: MapTheme;
}
