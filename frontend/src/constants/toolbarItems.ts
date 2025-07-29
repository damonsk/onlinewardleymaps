import {
    ToolbarAnchorIcon,
    ToolbarBuildMethodIcon,
    ToolbarBuyMethodIcon,
    ToolbarComponentIcon,
    ToolbarEcosystemIcon,
    ToolbarGenericNoteIcon,
    ToolbarInertiaIcon,
    ToolbarLinkIcon,
    ToolbarMarketIcon,
    ToolbarOutSourceMethodIcon,
    ToolbarPipelineIcon,
    ToolbarPSTIcon,
} from '../components/map/ToolbarIconWrappers';
import {ToolbarCategory, ToolbarConfiguration, ToolbarItem, ToolbarSubItem} from '../types/toolbar';

/**
 * Template functions for generating map text syntax
 */
export const TOOLBAR_TEMPLATES = {
    component: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}]`,
    componentInertia: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}] inertia`,
    market: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}] (market)`,
    ecosystem: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}] (ecosystem)`,
    buy: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}] (buy)`,
    build: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}] (build)`,
    outsource: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}] (outsource)`,
    note: (name: string, y: string, x: string) => `note ${name} [${y}, ${x}]`,
    pipeline: (name: string, y: string, x: string) => `pipeline ${name} [${y}, ${x}]`,
    anchor: (name: string, y: string, x: string) => `anchor ${name} [${y}, ${x}]`,
} as const;

/**
 * PST sub-items configuration for dropdown selection
 */
export const PST_SUB_ITEMS: ToolbarSubItem[] = [
    {
        id: 'pioneers',
        label: 'Pioneers',
        color: '#FF6B6B', // Red
        template: (maturity1: string, visibilityHigh: string, maturity2: string, visibilityLow: string) =>
            `pioneers [${visibilityHigh}, ${maturity1}, ${visibilityLow}, ${maturity2}]`,
    },
    {
        id: 'settlers',
        label: 'Settlers',
        color: '#4ECDC4', // Teal
        template: (maturity1: string, visibilityHigh: string, maturity2: string, visibilityLow: string) =>
            `settlers [${visibilityHigh}, ${maturity1}, ${visibilityLow}, ${maturity2}]`,
    },
    {
        id: 'townplanners',
        label: 'Town Planners',
        color: '#45B7D1', // Blue
        template: (maturity1: string, visibilityHigh: string, maturity2: string, visibilityLow: string) =>
            `townplanners [${visibilityHigh}, ${maturity1}, ${visibilityLow}, ${maturity2}]`,
    },
];

/**
 * Default names for new components
 */
export const DEFAULT_COMPONENT_NAMES = {
    component: 'New Component',
    componentInertia: 'Inertia Component',
    market: 'Market',
    ecosystem: 'Ecosystem',
    buy: 'Buy Component',
    build: 'Build Component',
    outsource: 'Outsource Component',
    note: 'New Note',
    pipeline: 'New Pipeline',
    anchor: 'New Anchor',
} as const;

/**
 * All available toolbar items with their configurations
 */
export const TOOLBAR_ITEMS: ToolbarItem[] = [
    {
        id: 'component',
        label: 'Component',
        icon: ToolbarComponentIcon,
        template: TOOLBAR_TEMPLATES.component,
        category: 'component',
        defaultName: DEFAULT_COMPONENT_NAMES.component,
        toolType: 'placement',
        keyboardShortcut: 'c',
    },
    {
        id: 'component-inertia',
        label: 'Component with Inertia',
        icon: ToolbarInertiaIcon,
        template: TOOLBAR_TEMPLATES.componentInertia,
        category: 'component',
        defaultName: DEFAULT_COMPONENT_NAMES.componentInertia,
        toolType: 'placement',
    },
    {
        id: 'market',
        label: 'Market',
        icon: ToolbarMarketIcon,
        template: TOOLBAR_TEMPLATES.market,
        category: 'component',
        defaultName: DEFAULT_COMPONENT_NAMES.market,
        toolType: 'placement',
        keyboardShortcut: 'm',
    },
    {
        id: 'ecosystem',
        label: 'Ecosystem',
        icon: ToolbarEcosystemIcon,
        template: TOOLBAR_TEMPLATES.ecosystem,
        category: 'component',
        defaultName: DEFAULT_COMPONENT_NAMES.ecosystem,
        toolType: 'placement',
        keyboardShortcut: 'e',
    },
    {
        id: 'method-build',
        label: 'Build Method',
        icon: ToolbarBuildMethodIcon,
        category: 'method',
        toolType: 'method-application',
        methodName: 'build',
        keyboardShortcut: 'b',
    },
    {
        id: 'method-buy',
        label: 'Buy Method',
        icon: ToolbarBuyMethodIcon,
        category: 'method',
        toolType: 'method-application',
        methodName: 'buy',
        keyboardShortcut: 'u',
    },
    {
        id: 'method-outsource',
        label: 'Outsource Method',
        icon: ToolbarOutSourceMethodIcon,
        category: 'method',
        toolType: 'method-application',
        methodName: 'outsource',
        keyboardShortcut: 'o',
    },
    {
        id: 'note',
        label: 'Note',
        icon: ToolbarGenericNoteIcon,
        template: TOOLBAR_TEMPLATES.note,
        category: 'note',
        defaultName: DEFAULT_COMPONENT_NAMES.note,
        toolType: 'placement',
        keyboardShortcut: 'n',
    },
    // Note: Pipeline and Anchor icons will be created in a later task
    // For now, we'll use placeholder icons that will be replaced
    {
        id: 'pipeline',
        label: 'Pipeline',
        icon: ToolbarPipelineIcon,
        template: TOOLBAR_TEMPLATES.pipeline,
        category: 'pipeline',
        defaultName: DEFAULT_COMPONENT_NAMES.pipeline,
        toolType: 'placement',
        keyboardShortcut: 'p',
    },
    {
        id: 'anchor',
        label: 'Anchor',
        icon: ToolbarAnchorIcon,
        template: TOOLBAR_TEMPLATES.anchor,
        category: 'other',
        defaultName: DEFAULT_COMPONENT_NAMES.anchor,
        toolType: 'placement',
        keyboardShortcut: 'a',
    },
    // New linking tool
    {
        id: 'link',
        label: 'Link Components',
        icon: ToolbarLinkIcon,
        category: 'link',
        toolType: 'linking',
        keyboardShortcut: 'l',
    },
    // PST tool with dropdown
    {
        id: 'pst',
        label: 'PST Boxes',
        icon: ToolbarPSTIcon,
        category: 'pst',
        toolType: 'drawing',
        keyboardShortcut: 't',
        subItems: PST_SUB_ITEMS,
    },
];

/**
 * Toolbar categories for organizing items
 */
export const TOOLBAR_CATEGORIES: ToolbarCategory[] = [
    {
        id: 'component',
        label: 'Components',
        items: ['component', 'component-inertia', 'market', 'ecosystem'],
    },
    {
        id: 'method',
        label: 'Methods',
        items: ['method-build', 'method-buy', 'method-outsource'],
    },
    {
        id: 'note',
        label: 'Notes',
        items: ['note'],
    },
    {
        id: 'pipeline',
        label: 'Pipelines',
        items: ['pipeline'],
    },
    {
        id: 'link',
        label: 'Links',
        items: ['link'],
    },
    {
        id: 'pst',
        label: 'PST Boxes',
        items: ['pst'],
    },
    {
        id: 'other',
        label: 'Other',
        items: ['anchor'],
    },
];

/**
 * Complete toolbar configuration
 */
export const TOOLBAR_CONFIGURATION: ToolbarConfiguration = {
    items: TOOLBAR_ITEMS,
    categories: TOOLBAR_CATEGORIES,
};

/**
 * Helper function to get toolbar item by ID
 */
export const getToolbarItemById = (id: string): ToolbarItem | undefined => {
    return TOOLBAR_ITEMS.find(item => item.id === id);
};

/**
 * Helper function to get toolbar items by category
 */
export const getToolbarItemsByCategory = (categoryId: string): ToolbarItem[] => {
    const category = TOOLBAR_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) return [];

    return category.items.map(itemId => getToolbarItemById(itemId)).filter((item): item is ToolbarItem => item !== undefined);
};

/**
 * Keyboard shortcut mapping for quick lookup
 */
export const KEYBOARD_SHORTCUTS: Record<string, string> = {
    c: 'component',
    m: 'market',
    e: 'ecosystem',
    l: 'link',
    n: 'note',
    p: 'pipeline',
    a: 'anchor',
    b: 'method-build', // Build method
    u: 'method-buy', // Buy method (U for bUy)
    o: 'method-outsource', // Outsource method
    t: 'pst', // PST boxes
};

/**
 * Helper function to get toolbar item by keyboard shortcut
 */
export const getToolbarItemByShortcut = (key: string): ToolbarItem | undefined => {
    const itemId = KEYBOARD_SHORTCUTS[key.toLowerCase()];
    return itemId ? getToolbarItemById(itemId) : undefined;
};
