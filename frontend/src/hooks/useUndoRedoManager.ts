import {useState, useCallback, useRef, useEffect} from 'react';
import {UseUndoRedoManagerProps, UseUndoRedoManagerResult, HistoryEntry, ActionType} from '../types/undo-redo';
import {createHistoryEntry, canGroupActions, generateGroupId, isValidMapText, truncateHistoryStack} from '../utils/undoRedoUtils';
import {UNDO_REDO_CONFIG} from '../constants/undoRedo';

/**
 * Custom hook that manages undo/redo functionality with history stack logic
 *
 * This hook provides:
 * - Undo and redo stack management with size limits
 * - Debounced change recording with grouping logic
 * - History size limit enforcement and cleanup mechanisms
 * - Undo/redo operation functions with state validation
 *
 * @param props Configuration for the undo/redo manager
 * @returns Object containing undo/redo state and operations
 */
export const useUndoRedoManager = ({
    mutateMapText,
    mapText,
    maxHistorySize,
    debounceMs,
}: UseUndoRedoManagerProps): UseUndoRedoManagerResult => {
    // History stacks
    const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);
    const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);

    // Flag to prevent recursive history recording during undo/redo operations
    const [isUndoRedoOperation, setIsUndoRedoOperation] = useState(false);
    const isUndoRedoOperationRef = useRef(false);

    // Refs for managing debounced operations and grouping
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastActionRef = useRef<HistoryEntry | null>(null);
    const currentGroupIdRef = useRef<string | null>(null);
    const pendingChangeRef = useRef<{
        newText: string;
        actionType: ActionType;
        description: string;
        groupId?: string;
    } | null>(null);

    // Derived state
    const canUndo = undoStack.length > 0;
    const canRedo = redoStack.length > 0;

    /**
     * Clears all history stacks
     */
    const clearHistory = useCallback(() => {
        setUndoStack([]);
        setRedoStack([]);
        lastActionRef.current = null;
        currentGroupIdRef.current = null;
        pendingChangeRef.current = null;

        // Clear any pending debounced operations
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }
    }, []);

    /**
     * Validates and cleans a history stack to remove invalid entries
     */
    const cleanHistoryStack = useCallback((stack: HistoryEntry[]): HistoryEntry[] => {
        const cleanedStack: HistoryEntry[] = [];

        for (let i = 0; i < stack.length; i++) {
            const entry = stack[i];

            // Skip entries that don't actually represent a change
            if (entry.previousMapText === entry.currentMapText) {
                console.warn('Removing no-op history entry:', entry.id);
                continue;
            }

            // Skip duplicate consecutive entries
            const lastCleanEntry = cleanedStack[cleanedStack.length - 1];
            if (
                lastCleanEntry &&
                lastCleanEntry.currentMapText === entry.currentMapText &&
                lastCleanEntry.previousMapText === entry.previousMapText
            ) {
                console.warn('Removing duplicate history entry:', entry.id);
                continue;
            }

            cleanedStack.push(entry);
        }

        return cleanedStack;
    }, []);

    /**
     * Cleans up corrupted history entries from both stacks
     */
    const cleanupHistory = useCallback(() => {
        setUndoStack(prevStack => cleanHistoryStack(prevStack));
        setRedoStack(prevStack => cleanHistoryStack(prevStack));
    }, [cleanHistoryStack]);

    /**
     * Gets the last action that can be undone
     */
    const getLastAction = useCallback((): HistoryEntry | null => {
        return undoStack.length > 0 ? undoStack[undoStack.length - 1] : null;
    }, [undoStack]);

    /**
     * Gets the next action that can be redone
     */
    const getNextAction = useCallback((): HistoryEntry | null => {
        return redoStack.length > 0 ? redoStack[redoStack.length - 1] : null;
    }, [redoStack]);

    /**
     * Adds a history entry to the undo stack and clears redo stack
     */
    const addToHistory = useCallback(
        (entry: HistoryEntry) => {
            setUndoStack(prevStack => {
                const newStack = [...prevStack, entry];
                const cleanedStack = cleanHistoryStack(newStack);
                return truncateHistoryStack(cleanedStack, maxHistorySize);
            });

            // Clear redo stack when new action is performed
            setRedoStack([]);

            // Update last action reference
            lastActionRef.current = entry;
        },
        [maxHistorySize, cleanHistoryStack],
    );

    /**
     * Processes a pending change and adds it to history
     */
    const processPendingChange = useCallback(() => {
        const pending = pendingChangeRef.current;
        if (!pending) return;

        // Don't process if we're in the middle of an undo/redo operation
        if (isUndoRedoOperation || isUndoRedoOperationRef.current) {
            return;
        }

        const {newText, actionType, description, groupId} = pending;

        // Validate the new map text
        if (!isValidMapText(newText)) {
            console.warn('Invalid map text provided to undo/redo system:', newText);
            pendingChangeRef.current = null;
            return;
        }

        // Don't record if text hasn't actually changed
        if (newText === mapText) {
            pendingChangeRef.current = null;
            return;
        }

        // Don't record if this would create a duplicate entry
        const lastEntry = undoStack[undoStack.length - 1];
        if (lastEntry && lastEntry.currentMapText === newText && lastEntry.previousMapText === mapText) {
            console.warn('Duplicate history entry detected, skipping');
            pendingChangeRef.current = null;
            return;
        }

        // Create history entry
        const entry = createHistoryEntry(mapText, newText, actionType, description, groupId);

        addToHistory(entry);
        pendingChangeRef.current = null;
    }, [mapText, addToHistory, isUndoRedoOperation, undoStack]);

    /**
     * Debounced function to process pending changes
     */
    const debouncedProcessChange = useCallback(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(processPendingChange, debounceMs);
    }, [processPendingChange, debounceMs]);

    /**
     * Records a change in the history with debouncing and grouping logic
     */
    const recordChange = useCallback(
        (newText: string, actionType: ActionType, description: string, groupId?: string) => {
            // Don't record changes during undo/redo operations
            if (isUndoRedoOperation || isUndoRedoOperationRef.current) {
                return;
            }

            // Validate the new map text
            if (!isValidMapText(newText)) {
                console.warn('Invalid map text provided to recordChange:', newText);
                return;
            }

            // Don't record if text hasn't actually changed
            if (newText === mapText) {
                return;
            }

            const now = Date.now();
            const lastAction = lastActionRef.current;

            // Determine if this action should be grouped with the previous one
            let finalGroupId = groupId;
            if (!finalGroupId && canGroupActions(lastAction, actionType, now)) {
                // Use existing group ID or create a new one
                finalGroupId = currentGroupIdRef.current || generateGroupId(actionType);
                currentGroupIdRef.current = finalGroupId;
            } else if (!finalGroupId) {
                // Reset group ID for new action type or time gap
                currentGroupIdRef.current = null;
            }

            // Store the pending change
            pendingChangeRef.current = {
                newText,
                actionType,
                description,
                groupId: finalGroupId,
            };

            // Clear any existing debounce timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            // Set up debounced processing
            debouncedProcessChange();
        },
        [isUndoRedoOperation, mapText, debounceMs, processPendingChange],
    );

    /**
     * Processes pending changes immediately (used during undo/redo)
     */
    const processPendingChangeImmediate = useCallback(() => {
        const pending = pendingChangeRef.current;
        if (!pending) return;

        const {newText, actionType, description, groupId} = pending;

        // Validate the new map text
        if (!isValidMapText(newText)) {
            console.warn('Invalid map text provided to undo/redo system:', newText);
            return;
        }

        // Don't record if text hasn't actually changed
        if (newText === mapText) {
            return;
        }

        // Create history entry
        const entry = createHistoryEntry(mapText, newText, actionType, description, groupId);

        addToHistory(entry);
        pendingChangeRef.current = null;
    }, [mapText, addToHistory]);

    /**
     * Performs an undo operation
     */
    const undo = useCallback(() => {
        if (isUndoRedoOperation || isUndoRedoOperationRef.current || undoStack.length === 0) {
            return;
        }

        // Set flag immediately to prevent race conditions
        isUndoRedoOperationRef.current = true;
        setIsUndoRedoOperation(true);

        // Clear any pending changes without processing them
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }
        pendingChangeRef.current = null;

        try {
            const lastEntry = undoStack[undoStack.length - 1];

            // Validate that the undo would actually change the state
            if (lastEntry.previousMapText === mapText) {
                console.warn('Undo operation would not change state, skipping');
                setIsUndoRedoOperation(false);
                return;
            }

            // Apply the previous state
            mutateMapText(lastEntry.previousMapText);

            // Move entry from undo to redo stack
            setUndoStack(prevStack => prevStack.slice(0, -1));
            setRedoStack(prevStack => {
                const newStack = [...prevStack, lastEntry];
                return truncateHistoryStack(newStack, maxHistorySize);
            });

            // Update references
            const newLastAction = undoStack.length > 1 ? undoStack[undoStack.length - 2] : null;
            lastActionRef.current = newLastAction;
        } catch (error) {
            console.error('Error during undo operation:', error);
        } finally {
            // Reset flag after a brief delay to allow map text to update
            setTimeout(() => {
                isUndoRedoOperationRef.current = false;
                setIsUndoRedoOperation(false);
            }, 50);
        }
    }, [isUndoRedoOperation, undoStack, mapText, mutateMapText, maxHistorySize]);

    /**
     * Performs a redo operation
     */
    const redo = useCallback(() => {
        if (!canRedo || isUndoRedoOperation || isUndoRedoOperationRef.current || redoStack.length === 0) {
            return;
        }

        const nextEntry = redoStack[redoStack.length - 1];
        if (!nextEntry) {
            return;
        }

        // Set flag immediately to prevent race conditions
        isUndoRedoOperationRef.current = true;
        setIsUndoRedoOperation(true);

        // Clear any pending changes without processing them
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }
        pendingChangeRef.current = null;

        try {
            // Validate that the redo would actually change the state
            if (nextEntry.currentMapText === mapText) {
                console.warn('Redo operation would not change state, skipping');
                setIsUndoRedoOperation(false);
                return;
            }

            // Apply the next state
            mutateMapText(nextEntry.currentMapText);

            // Move entry from redo to undo stack
            setRedoStack(prevStack => prevStack.slice(0, -1));
            setUndoStack(prevStack => {
                const newStack = [...prevStack, nextEntry];
                return truncateHistoryStack(newStack, maxHistorySize);
            });

            // Update references
            lastActionRef.current = nextEntry;
        } catch (error) {
            console.error('Error during redo operation:', error);
        } finally {
            // Reset flag after a brief delay to allow map text to update
            setTimeout(() => {
                isUndoRedoOperationRef.current = false;
                setIsUndoRedoOperation(false);
            }, 50);
        }
    }, [canRedo, isUndoRedoOperation, redoStack, mapText, mutateMapText, maxHistorySize]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    // Process any pending changes when component unmounts or mapText changes externally
    useEffect(() => {
        // If mapText changed externally and we have a pending change, process it
        if (pendingChangeRef.current && !isUndoRedoOperation && !isUndoRedoOperationRef.current) {
            const pending = pendingChangeRef.current;
            if (pending.newText !== mapText) {
                // External change detected, clear pending change
                pendingChangeRef.current = null;
                if (debounceTimeoutRef.current) {
                    clearTimeout(debounceTimeoutRef.current);
                    debounceTimeoutRef.current = null;
                }
            }
        }
    }, [mapText, isUndoRedoOperation]);

    return {
        undoStack,
        redoStack,
        canUndo,
        canRedo,
        undo,
        redo,
        recordChange,
        clearHistory,
        cleanupHistory,
        getLastAction,
        getNextAction,
        isUndoRedoOperation,
    };
};
