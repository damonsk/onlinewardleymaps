import {
    ToolbarAnchorIcon,
    ToolbarBuildMethodIcon,
    ToolbarBuyMethodIcon,
    ToolbarComponentIcon,
    ToolbarEcosystemIcon,
    ToolbarGenericNoteIcon,
    ToolbarInertiaIcon,
    ToolbarMarketIcon,
    ToolbarOutSourceMethodIcon,
    ToolbarPipelineIcon,
} from '../components/map/ToolbarIconWrappers';
import {ToolbarCategory, ToolbarConfiguration, ToolbarItem} from '../types/toolbar';

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
    },
    {
        id: 'component-inertia',
        label: 'Component with Inertia',
        icon: ToolbarInertiaIcon,
        template: TOOLBAR_TEMPLATES.componentInertia,
        category: 'component',
        defaultName: DEFAULT_COMPONENT_NAMES.componentInertia,
    },
    {
        id: 'market',
        label: 'Market',
        icon: ToolbarMarketIcon,
        template: TOOLBAR_TEMPLATES.market,
        category: 'component',
        defaultName: DEFAULT_COMPONENT_NAMES.market,
    },
    {
        id: 'ecosystem',
        label: 'Ecosystem',
        icon: ToolbarEcosystemIcon,
        template: TOOLBAR_TEMPLATES.ecosystem,
        category: 'component',
        defaultName: DEFAULT_COMPONENT_NAMES.ecosystem,
    },
    {
        id: 'buy',
        label: 'Buy',
        icon: ToolbarBuyMethodIcon,
        template: TOOLBAR_TEMPLATES.buy,
        category: 'method',
        defaultName: DEFAULT_COMPONENT_NAMES.buy,
    },
    {
        id: 'build',
        label: 'Build',
        icon: ToolbarBuildMethodIcon,
        template: TOOLBAR_TEMPLATES.build,
        category: 'method',
        defaultName: DEFAULT_COMPONENT_NAMES.build,
    },
    {
        id: 'outsource',
        label: 'Outsource',
        icon: ToolbarOutSourceMethodIcon,
        template: TOOLBAR_TEMPLATES.outsource,
        category: 'method',
        defaultName: DEFAULT_COMPONENT_NAMES.outsource,
    },
    {
        id: 'note',
        label: 'Note',
        icon: ToolbarGenericNoteIcon,
        template: TOOLBAR_TEMPLATES.note,
        category: 'note',
        defaultName: DEFAULT_COMPONENT_NAMES.note,
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
    },
    {
        id: 'anchor',
        label: 'Anchor',
        icon: ToolbarAnchorIcon,
        template: TOOLBAR_TEMPLATES.anchor,
        category: 'other',
        defaultName: DEFAULT_COMPONENT_NAMES.anchor,
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
        items: ['buy', 'build', 'outsource'],
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
