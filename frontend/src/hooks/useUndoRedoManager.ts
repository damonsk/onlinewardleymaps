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
                return truncateHistoryStack(newStack, maxHistorySize);
            });

            // Clear redo stack when new action is performed
            setRedoStack([]);

            // Update last action reference
            lastActionRef.current = entry;
        },
        [maxHistorySize],
    );

    /**
     * Processes a pending change and adds it to history
     */
    const processPendingChange = useCallback(() => {
        const pending = pendingChangeRef.current;
        if (!pending) return;

        // Don't process if we're in the middle of an undo/redo operation
        if (isUndoRedoOperation) {
            return;
        }

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
    }, [mapText, addToHistory, isUndoRedoOperation]);

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
            if (isUndoRedoOperation) {
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
        if (isUndoRedoOperation) {
            return;
        }

        // Process any pending changes first
        if (pendingChangeRef.current) {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
            }
            processPendingChangeImmediate();
        }

        // After processing pending changes, check if we can undo
        // Use a timeout to allow state to update
        setTimeout(() => {
            setUndoStack(currentUndoStack => {
                if (currentUndoStack.length === 0) {
                    return currentUndoStack;
                }

                const lastEntry = currentUndoStack[currentUndoStack.length - 1];

                // Set flag to prevent recursive recording
                setIsUndoRedoOperation(true);

                try {
                    // Apply the previous state
                    mutateMapText(lastEntry.previousMapText);

                    // Move entry from undo to redo stack
                    setRedoStack(prevStack => {
                        const newStack = [...prevStack, lastEntry];
                        return truncateHistoryStack(newStack, maxHistorySize);
                    });

                    // Update references
                    const newLastAction = currentUndoStack.length > 1 ? currentUndoStack[currentUndoStack.length - 2] : null;
                    lastActionRef.current = newLastAction;

                    // Reset flag after a brief delay
                    setTimeout(() => {
                        setIsUndoRedoOperation(false);
                    }, 50);

                    return currentUndoStack.slice(0, -1);
                } catch (error) {
                    console.error('Error during undo operation:', error);
                    setIsUndoRedoOperation(false);
                    return currentUndoStack;
                }
            });
        }, 0);
    }, [isUndoRedoOperation, mutateMapText, maxHistorySize, processPendingChangeImmediate]);

    /**
     * Performs a redo operation
     */
    const redo = useCallback(() => {
        if (!canRedo || isUndoRedoOperation) {
            return;
        }

        const nextEntry = redoStack[redoStack.length - 1];
        if (!nextEntry) {
            return;
        }

        // Set flag to prevent recursive recording
        setIsUndoRedoOperation(true);

        try {
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
                setIsUndoRedoOperation(false);
            }, 50);
        }
    }, [canRedo, isUndoRedoOperation, redoStack, mutateMapText, maxHistorySize]);

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
        if (pendingChangeRef.current && !isUndoRedoOperation) {
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
        getLastAction,
        getNextAction,
        isUndoRedoOperation,
    };
};
