import React from 'react';

/**
 * Core types and interfaces for the undo/redo functionality
 */

/**
 * Enum defining the different types of actions that can be undone/redone
 */
export type ActionType =
    | 'toolbar-component' // Component placed via toolbar
    | 'toolbar-link' // Link created via toolbar
    | 'toolbar-pst' // PST box drawn via toolbar
    | 'toolbar-method' // Method applied via toolbar
    | 'canvas-move' // Component moved on canvas
    | 'canvas-rename' // Component renamed via double-click
    | 'canvas-delete' // Component deleted via canvas
    | 'editor-text' // Direct text editing
    | 'unknown'; // Fallback for unclassified changes

/**
 * Interface representing a single entry in the undo/redo history
 */
export interface HistoryEntry {
    /** Unique identifier for the entry */
    id: string;
    /** Timestamp when the change was made */
    timestamp: number;
    /** Map text before the change */
    previousMapText: string;
    /** Map text after the change */
    currentMapText: string;
    /** Type of action that caused the change */
    actionType: ActionType;
    /** Human-readable description of the action */
    actionDescription: string;
    /** Optional grouping identifier for related changes */
    groupId?: string;
}

/**
 * Context value interface for the UndoRedoProvider
 */
export interface UndoRedoContextValue {
    /** Whether undo operation is available */
    canUndo: boolean;
    /** Whether redo operation is available */
    canRedo: boolean;
    /** Function to perform undo operation */
    undo: () => void;
    /** Function to perform redo operation */
    redo: () => void;
    /** Function to record a new change in history */
    recordChange: (newText: string, actionType: ActionType, description: string, groupId?: string) => void;
    /** Enhanced mutateMapText function that automatically records changes */
    mutateMapText: (newText: string, actionType?: ActionType, description?: string, groupId?: string) => void;
    /** Function to clear all history */
    clearHistory: () => void;
    /** Function to get the last action that can be undone */
    getLastAction: () => HistoryEntry | null;
    /** Function to get the next action that can be redone */
    getNextAction: () => HistoryEntry | null;
    /** Flag indicating if an undo/redo operation is currently in progress */
    isUndoRedoOperation: boolean;
}

/**
 * Props interface for the UndoRedoProvider component
 */
export interface UndoRedoProviderProps {
    /** Child components */
    children: React.ReactNode;
    /** Function to mutate the map text */
    mutateMapText: (newText: string) => void;
    /** Current map text */
    mapText: string;
    /** Maximum number of history entries (default: 50) */
    maxHistorySize?: number;
    /** Debounce time in milliseconds for grouping rapid changes (default: 300) */
    debounceMs?: number;
}

/**
 * Props interface for the useUndoRedoManager hook
 */
export interface UseUndoRedoManagerProps {
    /** Function to mutate the map text */
    mutateMapText: (newText: string) => void;
    /** Current map text */
    mapText: string;
    /** Maximum number of history entries */
    maxHistorySize: number;
    /** Debounce time in milliseconds */
    debounceMs: number;
}

/**
 * Return type for the useUndoRedoManager hook
 */
export interface UseUndoRedoManagerResult {
    /** Array of undo history entries */
    undoStack: HistoryEntry[];
    /** Array of redo history entries */
    redoStack: HistoryEntry[];
    /** Whether undo operation is available */
    canUndo: boolean;
    /** Whether redo operation is available */
    canRedo: boolean;
    /** Function to perform undo operation */
    undo: () => void;
    /** Function to perform redo operation */
    redo: () => void;
    /** Function to record a new change in history */
    recordChange: (newText: string, actionType: ActionType, description: string, groupId?: string) => void;
    /** Function to clear all history */
    clearHistory: () => void;
    /** Function to clean up corrupted history entries */
    cleanupHistory: () => void;
    /** Function to get the last action that can be undone */
    getLastAction: () => HistoryEntry | null;
    /** Function to get the next action that can be redone */
    getNextAction: () => HistoryEntry | null;
    /** Flag indicating if an undo/redo operation is currently in progress */
    isUndoRedoOperation: boolean;
}

/**
 * Interface for undo/redo configuration settings
 */
export interface UndoRedoConfig {
    /** Maximum number of undo entries */
    readonly MAX_HISTORY_SIZE: number;
    /** Milliseconds to wait before recording a new entry */
    readonly DEBOUNCE_MS: number;
    /** Milliseconds to group related actions */
    readonly GROUP_TIMEOUT_MS: number;
    /** LocalStorage key for user preferences */
    readonly STORAGE_KEY: string;
}

/**
 * Interface for action description generator function
 */
export type ActionDescriptionGenerator = (details?: string) => string;

/**
 * Type for the action descriptions mapping
 */
export type ActionDescriptions = {
    readonly [K in ActionType]: ActionDescriptionGenerator;
};
