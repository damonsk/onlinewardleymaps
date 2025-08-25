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
    ToolbarRedoIcon,
    ToolbarUndoIcon,
} from '../components/map/ToolbarIconWrappers';
import {ToolbarCategory, ToolbarConfiguration, ToolbarItem, ToolbarSubItem} from '../types/toolbar';
import {generateNoteText, generatePipelineMapTextWithGlobalUniqueness} from '../utils/mapTextGeneration';

/**
 * Enhanced template function type that includes access to existing map text for global uniqueness
 */
type PipelineTemplateFunction = (name: string, y: string, x: string, existingMapText?: string) => string;

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
    note: (name: string, y: string, x: string) => generateNoteText(name, y, x),
    pipeline: ((name: string, y: string, x: string, existingMapText: string = '') => {
        try {
            const position = { x: parseFloat(x), y: parseFloat(y) };
            return generatePipelineMapTextWithGlobalUniqueness(name, position, existingMapText);
        } catch (error) {
            console.warn('Failed to generate enhanced pipeline text with global uniqueness, using basic fallback:', error);
            return `pipeline ${name} [${y}, ${x}]`;
        }
    }) as PipelineTemplateFunction,
    anchor: (name: string, y: string, x: string) => `anchor ${name} [${y}, ${x}]`,
} as const;

/**
 * PST sub-items configuration for dropdown selection
 */
export const PST_SUB_ITEMS: ToolbarSubItem[] = [
    {
        id: 'pioneers',
        label: 'Pioneers',
        color: '#3ccaf8', // Light blue (matches map styles)
        template: (maturity1: string, visibilityHigh: string, maturity2: string, visibilityLow: string) =>
            `pioneers [${visibilityHigh}, ${maturity1}, ${visibilityLow}, ${maturity2}]`,
    },
    {
        id: 'settlers',
        label: 'Settlers',
        color: '#599afa', // Blue (matches map styles)
        template: (maturity1: string, visibilityHigh: string, maturity2: string, visibilityLow: string) =>
            `settlers [${visibilityHigh}, ${maturity1}, ${visibilityLow}, ${maturity2}]`,
    },
    {
        id: 'townplanners',
        label: 'Town Planners',
        color: '#936ff9', // Purple (matches map styles)
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
        id: 'method-inertia',
        label: 'Inertia',
        icon: ToolbarInertiaIcon,
        category: 'method',
        toolType: 'method-application',
        methodName: 'inertia',
        keyboardShortcut: 'i',
    },
    {
        id: 'method-market',
        label: 'Market',
        icon: ToolbarMarketIcon,
        category: 'method',
        toolType: 'method-application',
        methodName: 'market',
        keyboardShortcut: 'm',
    },
    {
        id: 'method-ecosystem',
        label: 'Ecosystem',
        icon: ToolbarEcosystemIcon,
        category: 'method',
        toolType: 'method-application',
        methodName: 'ecosystem',
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
    {
        id: 'link',
        label: 'Link Components',
        icon: ToolbarLinkIcon,
        category: 'link',
        toolType: 'linking',
        keyboardShortcut: 'l',
    },
    {
        id: 'pst',
        label: 'PST Boxes',
        icon: ToolbarPSTIcon,
        category: 'pst',
        toolType: 'drawing',
        keyboardShortcut: 't',
        subItems: PST_SUB_ITEMS,
    },
    {
        id: 'undo',
        label: 'Undo',
        icon: ToolbarUndoIcon,
        category: 'action',
        toolType: 'action',
        keyboardShortcut: 'ctrl+z', // Platform-specific handling in component
        action: 'undo',
    },
    {
        id: 'redo',
        label: 'Redo',
        icon: ToolbarRedoIcon,
        category: 'action',
        toolType: 'action',
        keyboardShortcut: 'ctrl+y', // Platform-specific handling in component
        action: 'redo',
    },
];

/**
 * Toolbar categories for organizing items
 */
export const TOOLBAR_CATEGORIES: ToolbarCategory[] = [
    {
        id: 'component',
        label: 'Components',
        items: ['component'],
    },
    {
        id: 'method',
        label: 'Methods',
        items: ['method-build', 'method-buy', 'method-outsource', 'method-inertia', 'method-market', 'method-ecosystem'],
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
    {
        id: 'action',
        label: 'Actions',
        items: ['undo', 'redo'],
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
    l: 'link',
    n: 'note',
    p: 'pipeline',
    a: 'anchor',
    b: 'method-build', // Build method
    u: 'method-buy', // Buy method (U for bUy)
    o: 'method-outsource', // Outsource method
    i: 'method-inertia', // Inertia method
    m: 'method-market', // Market method
    e: 'method-ecosystem', // Ecosystem method
    t: 'pst', // PST boxes
    'ctrl+z': 'undo', // Undo action (platform-specific handling in component)
    'ctrl+y': 'redo', // Redo action (platform-specific handling in component)
};

/**
 * Helper function to get toolbar item by keyboard shortcut
 */
export const getToolbarItemByShortcut = (key: string): ToolbarItem | undefined => {
    const itemId = KEYBOARD_SHORTCUTS[key.toLowerCase()];
    return itemId ? getToolbarItemById(itemId) : undefined;
};
