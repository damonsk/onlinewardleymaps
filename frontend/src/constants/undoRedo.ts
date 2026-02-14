import {ActionType, UndoRedoConfig, ActionDescriptions} from '../types/undo-redo';

/**
 * Configuration constants for undo/redo functionality
 */
export const UNDO_REDO_CONFIG: UndoRedoConfig = {
    MAX_HISTORY_SIZE: 50, // Maximum number of undo entries
    DEBOUNCE_MS: 300, // Milliseconds to wait before recording a new entry
    GROUP_TIMEOUT_MS: 1000, // Milliseconds to group related actions
    STORAGE_KEY: 'wardley-map-undo-redo-settings', // For user preferences
} as const;

/**
 * Action descriptions for user feedback
 * These functions generate human-readable descriptions for each action type
 */
export const ACTION_DESCRIPTIONS: ActionDescriptions = {
    'toolbar-component': (name?: string) => `Add component${name ? ` "${name}"` : ''}`,
    'toolbar-link': (link?: string) => `Create link${link ? ` ${link}` : ''}`,
    'toolbar-pst': (type?: string) => `Draw ${type || 'PST'} box`,
    'toolbar-method': (method?: string) => `Apply ${method || 'method'} decorator`,
    'canvas-move': (name?: string) => `Move ${name || 'component'}`,
    'canvas-rename': (name?: string) => `Rename to "${name || 'component'}"`,
    'canvas-delete': (name?: string) => `Delete ${name || 'component'}`,
    'editor-text': () => 'Edit map text',
    unknown: () => 'Change map',
} as const;

/**
 * Default debounce time for different action types
 * Some actions may need different debounce times
 */
export const ACTION_DEBOUNCE_TIMES: Record<ActionType, number> = {
    'toolbar-component': 100,
    'toolbar-link': 100,
    'toolbar-pst': 200,
    'toolbar-method': 100,
    'canvas-move': 500, // Longer debounce for drag operations
    'canvas-rename': 200,
    'canvas-delete': 100,
    'editor-text': 1000, // Longer debounce for text editing
    unknown: 300,
} as const;

/**
 * Actions that should be grouped together when performed in sequence
 */
export const GROUPABLE_ACTIONS: Set<ActionType> = new Set<ActionType>(['canvas-move', 'editor-text']);

/**
 * Maximum time between actions to consider them part of the same group
 */
export const MAX_GROUP_INTERVAL_MS = 2000;

/**
 * Keyboard shortcuts for undo/redo operations
 */
export const UNDO_REDO_SHORTCUTS = {
    UNDO: {
        windows: 'Ctrl+Z',
        mac: 'Cmd+Z',
        key: 'z',
        ctrlKey: true,
        metaKey: false, // Will be set to true on Mac
    },
    REDO: {
        windows: 'Ctrl+Y',
        mac: 'Cmd+Shift+Z',
        key: 'y', // For Windows
        altKey: 'z', // For Mac (with Shift)
        ctrlKey: true,
        metaKey: false, // Will be set to true on Mac
        shiftKey: false, // Will be set to true on Mac
    },
} as const;
