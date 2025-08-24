import React, {createContext, useCallback, useContext, useMemo} from 'react';
import {UNDO_REDO_CONFIG} from '../constants/undoRedo';
import {useUndoRedoManager} from '../hooks/useUndoRedoManager';
import {ActionType, UndoRedoContextValue, UndoRedoProviderProps} from '../types/undo-redo';

/**
 * Context for undo/redo functionality
 */
export const UndoRedoContext = createContext<UndoRedoContextValue | null>(null);

/**
 * Hook to access the undo/redo context
 * @throws Error if used outside of UndoRedoProvider
 */
export const useUndoRedo = (): UndoRedoContextValue => {
    const context = useContext(UndoRedoContext);
    if (!context) {
        throw new Error('useUndoRedo must be used within an UndoRedoProvider');
    }
    return context;
};

/**
 * UndoRedoProvider component that provides undo/redo functionality to child components
 *
 * This component:
 * - Uses the useUndoRedoManager hook for core functionality
 * - Provides context with proper state management and memoization
 * - Handles error boundaries for invalid states and memory constraints
 * - Implements clearHistory and utility methods for external access
 *
 * @param props Configuration and children for the provider
 */
export const UndoRedoProvider: React.FC<UndoRedoProviderProps> = ({
    children,
    mutateMapText,
    mapText,
    maxHistorySize = UNDO_REDO_CONFIG.MAX_HISTORY_SIZE,
    debounceMs = UNDO_REDO_CONFIG.DEBOUNCE_MS,
}) => {
    // Input validation
    if (typeof mutateMapText !== 'function') {
        throw new Error('UndoRedoProvider: mutateMapText must be a function');
    }

    if (typeof mapText !== 'string') {
        throw new Error('UndoRedoProvider: mapText must be a string');
    }

    if (maxHistorySize <= 0 || !Number.isInteger(maxHistorySize)) {
        throw new Error('UndoRedoProvider: maxHistorySize must be a positive integer');
    }

    if (debounceMs < 0 || !Number.isInteger(debounceMs)) {
        throw new Error('UndoRedoProvider: debounceMs must be a non-negative integer');
    }

    // Use the undo/redo manager hook
    const undoRedoManager = useUndoRedoManager({
        mutateMapText,
        mapText,
        maxHistorySize,
        debounceMs,
    });

    // Enhanced undo function with error handling
    const enhancedUndo = useCallback(() => {
        try {
            undoRedoManager.undo();
        } catch (error) {
            console.error('Error during undo operation:', error);
            // Optionally, you could emit an error event or show a user notification here
        }
    }, [undoRedoManager]);

    // Enhanced redo function with error handling
    const enhancedRedo = useCallback(() => {
        try {
            undoRedoManager.redo();
        } catch (error) {
            console.error('Error during redo operation:', error);
            // Optionally, you could emit an error event or show a user notification here
        }
    }, [undoRedoManager]);

    // Enhanced recordChange function with error handling and validation
    const enhancedRecordChange = useCallback(
        (newText: string, actionType: Parameters<typeof undoRedoManager.recordChange>[1], description: string, groupId?: string) => {
            try {
                // Additional validation
                if (typeof newText !== 'string') {
                    console.warn('UndoRedoProvider: newText must be a string, received:', typeof newText);
                    return;
                }

                if (typeof description !== 'string' || description.trim() === '') {
                    console.warn('UndoRedoProvider: description must be a non-empty string');
                    return;
                }

                undoRedoManager.recordChange(newText, actionType, description, groupId);
            } catch (error) {
                console.error('Error recording change in undo/redo history:', error);
                // Continue execution - don't break the user's workflow due to history recording issues
            }
        },
        [undoRedoManager],
    );

    // Enhanced clearHistory function with error handling
    const enhancedClearHistory = useCallback(() => {
        try {
            undoRedoManager.clearHistory();
        } catch (error) {
            console.error('Error clearing undo/redo history:', error);
        }
    }, [undoRedoManager]);

    // Enhanced getLastAction function with error handling
    const enhancedGetLastAction = useCallback(() => {
        try {
            return undoRedoManager.getLastAction();
        } catch (error) {
            console.error('Error getting last action:', error);
            return null;
        }
    }, [undoRedoManager]);

    // Enhanced getNextAction function with error handling
    const enhancedGetNextAction = useCallback(() => {
        try {
            return undoRedoManager.getNextAction();
        } catch (error) {
            console.error('Error getting next action:', error);
            return null;
        }
    }, [undoRedoManager]);

    // Enhanced mutateMapText function that automatically records changes
    const enhancedMutateMapText = useCallback(
        (newText: string, actionType?: ActionType, description?: string, groupId?: string) => {
            try {
                if (!undoRedoManager.isUndoRedoOperation) {
                    // For normal operations, record the change first, then apply it
                    enhancedRecordChange(newText, actionType || 'unknown', description || 'Map text changed', groupId);
                }
                // Always apply the change (whether it's a normal operation or undo/redo)
                mutateMapText(newText);
            } catch (error) {
                console.error('Error in enhanced mutateMapText:', error);
                // Fallback to direct mutation if recording fails
                mutateMapText(newText);
            }
        },
        [mutateMapText, undoRedoManager.isUndoRedoOperation, enhancedRecordChange],
    );

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo<UndoRedoContextValue>(
        () => ({
            canUndo: undoRedoManager.canUndo,
            canRedo: undoRedoManager.canRedo,
            undo: enhancedUndo,
            redo: enhancedRedo,
            recordChange: enhancedRecordChange,
            mutateMapText: enhancedMutateMapText,
            clearHistory: enhancedClearHistory,
            getLastAction: enhancedGetLastAction,
            getNextAction: enhancedGetNextAction,
            isUndoRedoOperation: undoRedoManager.isUndoRedoOperation,
        }),
        [
            undoRedoManager.canUndo,
            undoRedoManager.canRedo,
            undoRedoManager.isUndoRedoOperation,
            enhancedUndo,
            enhancedRedo,
            enhancedRecordChange,
            enhancedMutateMapText,
            enhancedClearHistory,
            enhancedGetLastAction,
            enhancedGetNextAction,
        ],
    );

    return <UndoRedoContext.Provider value={contextValue}>{children}</UndoRedoContext.Provider>;
};

/**
 * Error boundary component for undo/redo operations
 * This can be used to wrap components that use undo/redo functionality
 */
interface UndoRedoErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class UndoRedoErrorBoundary extends React.Component<
    {children: React.ReactNode; fallback?: React.ComponentType<{error: Error}>},
    UndoRedoErrorBoundaryState
> {
    constructor(props: {children: React.ReactNode; fallback?: React.ComponentType<{error: Error}>}) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error: Error): UndoRedoErrorBoundaryState {
        return {hasError: true, error};
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('UndoRedoErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error} />;
            }

            return (
                <div style={{padding: '20px', border: '1px solid #ff6b6b', borderRadius: '4px', backgroundColor: '#ffe0e0'}}>
                    <h3>Undo/Redo Error</h3>
                    <p>
                        An error occurred in the undo/redo system. The application will continue to work, but undo/redo functionality may be
                        limited.
                    </p>
                    <details>
                        <summary>Error Details</summary>
                        <pre style={{fontSize: '12px', overflow: 'auto'}}>{this.state.error.message}</pre>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default UndoRedoProvider;
