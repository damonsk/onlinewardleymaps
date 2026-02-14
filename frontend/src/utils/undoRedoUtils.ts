import {ActionType, HistoryEntry} from '../types/undo-redo';
import {ACTION_DESCRIPTIONS, GROUPABLE_ACTIONS, MAX_GROUP_INTERVAL_MS} from '../constants/undoRedo';

/**
 * Generates a unique ID for history entries
 */
export const generateHistoryId = (): string => {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generates a human-readable description for an action
 */
export const generateActionDescription = (actionType: ActionType, details?: string): string => {
    const generator = ACTION_DESCRIPTIONS[actionType];
    return generator(details);
};

/**
 * Creates a new history entry
 */
export const createHistoryEntry = (
    previousMapText: string,
    currentMapText: string,
    actionType: ActionType,
    description?: string,
    groupId?: string,
): HistoryEntry => {
    return {
        id: generateHistoryId(),
        timestamp: Date.now(),
        previousMapText,
        currentMapText,
        actionType,
        actionDescription: description || generateActionDescription(actionType),
        groupId,
    };
};

/**
 * Determines if two actions can be grouped together
 */
export const canGroupActions = (lastEntry: HistoryEntry | null, newActionType: ActionType, newTimestamp: number = Date.now()): boolean => {
    if (!lastEntry) {
        return false;
    }

    // Check if both actions are groupable
    if (!GROUPABLE_ACTIONS.has(lastEntry.actionType) || !GROUPABLE_ACTIONS.has(newActionType)) {
        return false;
    }

    // Check if actions are of the same type
    if (lastEntry.actionType !== newActionType) {
        return false;
    }

    // Check if actions are within the grouping time window
    const timeDiff = newTimestamp - lastEntry.timestamp;
    return timeDiff <= MAX_GROUP_INTERVAL_MS;
};

/**
 * Generates a group ID for related actions
 */
export const generateGroupId = (actionType: ActionType): string => {
    return `group_${actionType}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
};

/**
 * Validates that a map text string is not empty and contains basic structure
 */
export const isValidMapText = (mapText: string): boolean => {
    if (typeof mapText !== 'string') {
        return false;
    }

    // Allow empty strings as they represent valid empty maps
    if (mapText.trim() === '') {
        return true;
    }

    // Basic validation - should not contain null characters or be excessively long
    if (mapText.includes('\0') || mapText.length > 1000000) {
        return false;
    }

    return true;
};

/**
 * Truncates history stacks to maintain size limits
 */
export const truncateHistoryStack = <T>(stack: T[], maxSize: number): T[] => {
    if (stack.length <= maxSize) {
        return stack;
    }

    // Remove oldest entries (from the beginning of the array)
    return stack.slice(stack.length - maxSize);
};

/**
 * Calculates the memory usage of a history entry (approximate)
 */
export const calculateEntryMemoryUsage = (entry: HistoryEntry): number => {
    // Rough calculation of memory usage in bytes
    const baseSize = 200; // Approximate size of the entry object structure
    const textSize = (entry.previousMapText.length + entry.currentMapText.length) * 2; // UTF-16 characters
    const descriptionSize = entry.actionDescription.length * 2;
    const groupIdSize = entry.groupId ? entry.groupId.length * 2 : 0;

    return baseSize + textSize + descriptionSize + groupIdSize;
};

/**
 * Calculates the total memory usage of a history stack
 */
export const calculateStackMemoryUsage = (stack: HistoryEntry[]): number => {
    return stack.reduce((total, entry) => total + calculateEntryMemoryUsage(entry), 0);
};

/**
 * Detects if the browser is running on macOS
 */
export const isMacOS = (): boolean => {
    return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
};

/**
 * Gets the appropriate keyboard shortcut text for the current platform
 */
export const getUndoShortcutText = (): string => {
    return isMacOS() ? 'Cmd+Z' : 'Ctrl+Z';
};

/**
 * Gets the appropriate keyboard shortcut text for redo on the current platform
 */
export const getRedoShortcutText = (): string => {
    return isMacOS() ? 'Cmd+Shift+Z' : 'Ctrl+Y';
};

/**
 * Checks if a keyboard event matches the undo shortcut
 */
export const isUndoShortcut = (event: KeyboardEvent): boolean => {
    const isMac = isMacOS();

    if (isMac) {
        return event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'z';
    } else {
        return event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'z';
    }
};

/**
 * Checks if a keyboard event matches the redo shortcut
 */
export const isRedoShortcut = (event: KeyboardEvent): boolean => {
    const isMac = isMacOS();

    if (isMac) {
        return event.metaKey && event.shiftKey && !event.ctrlKey && !event.altKey && event.key.toLowerCase() === 'z';
    } else {
        return event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'y';
    }
};

/**
 * Debounces a function call
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
};

/**
 * Creates a throttled version of a function
 */
export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean = false;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};
