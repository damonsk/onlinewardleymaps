import {renderHook, act} from '@testing-library/react';
import {useUndoRedoManager} from '../../hooks/useUndoRedoManager';
import {ActionType} from '../../types/undo-redo';

// Mock the utilities
jest.mock('../../utils/undoRedoUtils', () => ({
    ...jest.requireActual('../../utils/undoRedoUtils'),
    debounce: jest.fn((fn, delay) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    }),
}));

describe('useUndoRedoManager', () => {
    let mockMutateMapText: jest.Mock;
    const defaultProps = {
        mapText: 'initial map text',
        maxHistorySize: 5,
        debounceMs: 100,
    };

    beforeEach(() => {
        mockMutateMapText = jest.fn();
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Initial State', () => {
        it('should initialize with empty stacks and correct initial state', () => {
            const {result} = renderHook(() =>
                useUndoRedoManager({
                    ...defaultProps,
                    mutateMapText: mockMutateMapText,
                }),
            );

            expect(result.current.undoStack).toEqual([]);
            expect(result.current.redoStack).toEqual([]);
            expect(result.current.canUndo).toBe(false);
            expect(result.current.canRedo).toBe(false);
            expect(result.current.isUndoRedoOperation).toBe(false);
            expect(result.current.getLastAction()).toBeNull();
            expect(result.current.getNextAction()).toBeNull();
        });
    });

    describe('Recording Changes', () => {
        it('should record a change after debounce delay', async () => {
            const {result} = renderHook(() =>
                useUndoRedoManager({
                    ...defaultProps,
                    mutateMapText: mockMutateMapText,
                }),
            );

            act(() => {
                result.current.recordChange('new map text', 'toolbar-component', 'Add component "Test"');
            });

            // Should not be recorded immediately
            expect(result.current.undoStack).toHaveLength(0);
            expect(result.current.canUndo).toBe(false);

            // Fast-forward past debounce delay
            act(() => {
                jest.advanceTimersByTime(150);
            });

            // Should now be recorded
            expect(result.current.undoStack).toHaveLength(1);
            expect(result.current.canUndo).toBe(true);
            expect(result.current.undoStack[0].previousMapText).toBe('initial map text');
            expect(result.current.undoStack[0].currentMapText).toBe('new map text');
            expect(result.current.undoStack[0].actionType).toBe('toolbar-component');
            expect(result.current.undoStack[0].actionDescription).toBe('Add component "Test"');
        });

        it('should not record changes during undo/redo operations', async () => {
            const {result} = renderHook(() =>
                useUndoRedoManager({
                    ...defaultProps,
                    mutateMapText: mockMutateMapText,
                }),
            );

            // First, add a change to enable undo
            act(() => {
                result.current.recordChange('change 1', 'toolbar-component', 'Add component');
                jest.advanceTimersByTime(150);
            });

            expect(result.current.undoStack).toHaveLength(1);

            // Perform undo operation and advance timers to trigger the async operation
            act(() => {
                result.current.undo();
                jest.advanceTimersByTime(50); // Allow the setTimeout(0) to execute
            });

            // The isUndoRedoOperation flag should be true after the async operation starts
            expect(result.current.isUndoRedoOperation).toBe(true);

            // Try to record while undo is in progress
            act(() => {
                result.current.recordChange('change 2', 'toolbar-component', 'Add another component');
                jest.advanceTimersByTime(150);
            });

            // Should not have recorded the second change because isUndoRedoOperation was true
            expect(result.current.undoStack).toHaveLength(0);
            expect(result.current.redoStack).toHaveLength(1);

            // Wait for the flag to reset
            act(() => {
                jest.advanceTimersByTime(100);
            });

            expect(result.current.isUndoRedoOperation).toBe(false);
        });

        it('should not record changes when map text is the same', () => {
            const {result} = renderHook(() =>
                useUndoRedoManager({
                    ...defaultProps,
                    mutateMapText: mockMutateMapText,
                }),
            );

            act(() => {
                result.current.recordChange(
                    'initial map text', // Same as current mapText
                    'toolbar-component',
                    'Add component',
                );
                jest.advanceTimersByTime(150);
            });

            expect(result.current.undoStack).toHaveLength(0);
            expect(result.current.canUndo).toBe(false);
        });

        it('should handle invalid map text gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            const {result} = renderHook(() =>
                useUndoRedoManager({
                    ...defaultProps,
                    mutateMapText: mockMutateMapText,
                }),
            );

            act(() => {
                result.current.recordChange('text with null\0character', 'toolbar-component', 'Add component');
                jest.advanceTimersByTime(150);
            });

            expect(consoleSpy).toHaveBeenCalledWith('Invalid map text provided to recordChange:', 'text with null\0character');
            expect(result.current.undoStack).toHaveLength(0);

            consoleSpy.mockRestore();
        });
    });

    describe('Undo Operations', () => {
        it('should perform undo operation correctly', () => {
            const {result, rerender} = renderHook(
                ({mapText}) =>
                    useUndoRedoManager({
                        mapText,
                        mutateMapText: mockMutateMapText,
                        maxHistorySize: 5,
                        debounceMs: 100,
                    }),
                {initialProps: {mapText: 'initial text'}},
            );

            // Record a change
            act(() => {
                result.current.recordChange('changed text', 'toolbar-component', 'Add component');
                jest.advanceTimersByTime(150);
            });

            // Update mapText to simulate the change being applied
            rerender({mapText: 'changed text'});

            expect(result.current.canUndo).toBe(true);
            expect(result.current.undoStack).toHaveLength(1);

            // Perform undo
            act(() => {
                result.current.undo();
                jest.advanceTimersByTime(100); // Wait for isUndoRedoOperation flag to reset
            });

            expect(mockMutateMapText).toHaveBeenCalledWith('initial text');
            expect(result.current.undoStack).toHaveLength(0);
            expect(result.current.redoStack).toHaveLength(1);
            expect(result.current.canUndo).toBe(false);
            expect(result.current.canRedo).toBe(true);
        });

        it('should not perform undo when no actions are available', () => {
            const {result} = renderHook(() =>
                useUndoRedoManager({
                    ...defaultProps,
                    mutateMapText: mockMutateMapText,
                }),
            );

            act(() => {
                result.current.undo();
            });

            expect(mockMutateMapText).not.toHaveBeenCalled();
            expect(result.current.undoStack).toHaveLength(0);
            expect(result.current.redoStack).toHaveLength(0);
        });

        it('should handle undo errors gracefully', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            mockMutateMapText.mockImplementation(() => {
                throw new Error('Mutation failed');
            });

            const {result, rerender} = renderHook(
                ({mapText}) =>
                    useUndoRedoManager({
                        mapText,
                        mutateMapText: mockMutateMapText,
                        maxHistorySize: 5,
                        debounceMs: 100,
                    }),
                {initialProps: {mapText: 'initial text'}},
            );

            // Record a change
            act(() => {
                result.current.recordChange('changed text', 'toolbar-component', 'Add component');
                jest.advanceTimersByTime(150);
            });

            rerender({mapText: 'changed text'});

            // Perform undo that will fail
            act(() => {
                result.current.undo();
                jest.advanceTimersByTime(100);
            });

            expect(consoleErrorSpy).toHaveBeenCalledWith('Error during undo operation:', expect.any(Error));

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Redo Operations', () => {
        it('should perform redo operation correctly', () => {
            const {result, rerender} = renderHook(
                ({mapText}) =>
                    useUndoRedoManager({
                        mapText,
                        mutateMapText: mockMutateMapText,
                        maxHistorySize: 5,
                        debounceMs: 100,
                    }),
                {initialProps: {mapText: 'initial text'}},
            );

            // Record a change and perform undo first
            act(() => {
                result.current.recordChange('changed text', 'toolbar-component', 'Add component');
                jest.advanceTimersByTime(150);
            });

            rerender({mapText: 'changed text'});

            act(() => {
                result.current.undo();
                jest.advanceTimersByTime(100);
            });

            rerender({mapText: 'initial text'});

            expect(result.current.canRedo).toBe(true);

            // Perform redo
            act(() => {
                result.current.redo();
                jest.advanceTimersByTime(100);
            });

            expect(mockMutateMapText).toHaveBeenLastCalledWith('changed text');
            expect(result.current.undoStack).toHaveLength(1);
            expect(result.current.redoStack).toHaveLength(0);
            expect(result.current.canUndo).toBe(true);
            expect(result.current.canRedo).toBe(false);
        });

        it('should not perform redo when no actions are available', () => {
            const {result} = renderHook(() =>
                useUndoRedoManager({
                    ...defaultProps,
                    mutateMapText: mockMutateMapText,
                }),
            );

            act(() => {
                result.current.redo();
            });

            expect(mockMutateMapText).not.toHaveBeenCalled();
        });
    });

    describe('History Management', () => {
        it('should enforce maximum history size', () => {
            const {result} = renderHook(() =>
                useUndoRedoManager({
                    mapText: 'initial text',
                    mutateMapText: mockMutateMapText,
                    maxHistorySize: 3,
                    debounceMs: 100,
                }),
            );

            // Add more changes than the maximum
            for (let i = 1; i <= 5; i++) {
                act(() => {
                    result.current.recordChange(`text ${i}`, 'toolbar-component', `Add component ${i}`);
                    jest.advanceTimersByTime(150);
                });
            }

            // Should only keep the last 3 entries
            expect(result.current.undoStack).toHaveLength(3);
            expect(result.current.undoStack[0].currentMapText).toBe('text 3');
            expect(result.current.undoStack[1].currentMapText).toBe('text 4');
            expect(result.current.undoStack[2].currentMapText).toBe('text 5');
        });

        it('should clear redo stack when new action is recorded', () => {
            const {result, rerender} = renderHook(
                ({mapText}) =>
                    useUndoRedoManager({
                        mapText,
                        mutateMapText: mockMutateMapText,
                        maxHistorySize: 5,
                        debounceMs: 100,
                    }),
                {initialProps: {mapText: 'initial text'}},
            );

            // Record changes and undo to create redo stack
            act(() => {
                result.current.recordChange('text 1', 'toolbar-component', 'Add component 1');
                jest.advanceTimersByTime(150);
            });

            rerender({mapText: 'text 1'});

            act(() => {
                result.current.recordChange('text 2', 'toolbar-component', 'Add component 2');
                jest.advanceTimersByTime(150);
            });

            rerender({mapText: 'text 2'});

            act(() => {
                result.current.undo();
                jest.advanceTimersByTime(100);
            });

            expect(result.current.redoStack).toHaveLength(1);

            // Record new action should clear redo stack
            rerender({mapText: 'text 1'});

            act(() => {
                result.current.recordChange('text 3', 'toolbar-component', 'Add component 3');
                jest.advanceTimersByTime(150);
            });

            expect(result.current.redoStack).toHaveLength(0);
        });

        it('should clear all history', () => {
            const {result} = renderHook(() =>
                useUndoRedoManager({
                    ...defaultProps,
                    mutateMapText: mockMutateMapText,
                }),
            );

            // Add some history
            act(() => {
                result.current.recordChange('text 1', 'toolbar-component', 'Add component');
                jest.advanceTimersByTime(150);
            });

            expect(result.current.undoStack).toHaveLength(1);

            // Clear history
            act(() => {
                result.current.clearHistory();
            });

            expect(result.current.undoStack).toHaveLength(0);
            expect(result.current.redoStack).toHaveLength(0);
            expect(result.current.canUndo).toBe(false);
            expect(result.current.canRedo).toBe(false);
            expect(result.current.getLastAction()).toBeNull();
            expect(result.current.getNextAction()).toBeNull();
        });
    });

    describe('Action Retrieval', () => {
        it('should return correct last and next actions', () => {
            const {result, rerender} = renderHook(
                ({mapText}) =>
                    useUndoRedoManager({
                        mapText,
                        mutateMapText: mockMutateMapText,
                        maxHistorySize: 5,
                        debounceMs: 100,
                    }),
                {initialProps: {mapText: 'initial text'}},
            );

            // Add action
            act(() => {
                result.current.recordChange('text 1', 'toolbar-component', 'Add component');
                jest.advanceTimersByTime(150);
            });

            const lastAction = result.current.getLastAction();
            expect(lastAction).not.toBeNull();
            expect(lastAction?.actionDescription).toBe('Add component');
            expect(result.current.getNextAction()).toBeNull();

            // Undo to create redo action
            rerender({mapText: 'text 1'});

            act(() => {
                result.current.undo();
                jest.advanceTimersByTime(100);
            });

            expect(result.current.getLastAction()).toBeNull();
            const nextAction = result.current.getNextAction();
            expect(nextAction).not.toBeNull();
            expect(nextAction?.actionDescription).toBe('Add component');
        });
    });

    describe('Debouncing and Grouping', () => {
        it('should debounce rapid changes', () => {
            const {result} = renderHook(() =>
                useUndoRedoManager({
                    ...defaultProps,
                    mutateMapText: mockMutateMapText,
                }),
            );

            // Record multiple rapid changes
            act(() => {
                result.current.recordChange('text 1', 'editor-text', 'Edit text');
                result.current.recordChange('text 2', 'editor-text', 'Edit text');
                result.current.recordChange('text 3', 'editor-text', 'Edit text');
            });

            // Should not be recorded yet
            expect(result.current.undoStack).toHaveLength(0);

            // Fast-forward past debounce delay
            act(() => {
                jest.advanceTimersByTime(150);
            });

            // Should only record the last change
            expect(result.current.undoStack).toHaveLength(1);
            expect(result.current.undoStack[0].currentMapText).toBe('text 3');
        });

        it('should clear pending changes when clearHistory is called', () => {
            const {result} = renderHook(() =>
                useUndoRedoManager({
                    ...defaultProps,
                    mutateMapText: mockMutateMapText,
                }),
            );

            // Record a change but don't wait for debounce
            act(() => {
                result.current.recordChange('text 1', 'toolbar-component', 'Add component');
            });

            // Clear history should also clear pending changes
            act(() => {
                result.current.clearHistory();
                jest.advanceTimersByTime(150);
            });

            // Should not have recorded the pending change
            expect(result.current.undoStack).toHaveLength(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle external map text changes', () => {
            const {result, rerender} = renderHook(
                ({mapText}) =>
                    useUndoRedoManager({
                        mapText,
                        mutateMapText: mockMutateMapText,
                        maxHistorySize: 5,
                        debounceMs: 100,
                    }),
                {initialProps: {mapText: 'initial text'}},
            );

            // Record a pending change
            act(() => {
                result.current.recordChange('text 1', 'toolbar-component', 'Add component');
            });

            // Simulate external change to mapText
            rerender({mapText: 'external change'});

            // Fast-forward past debounce - should not record the pending change
            act(() => {
                jest.advanceTimersByTime(150);
            });

            expect(result.current.undoStack).toHaveLength(0);
        });

        it('should cleanup timeouts on unmount', () => {
            const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
            const {result, unmount} = renderHook(() =>
                useUndoRedoManager({
                    ...defaultProps,
                    mutateMapText: mockMutateMapText,
                }),
            );

            // Record a change to create a timeout
            act(() => {
                result.current.recordChange('text 1', 'toolbar-component', 'Add component');
            });

            unmount();

            expect(clearTimeoutSpy).toHaveBeenCalled();
            clearTimeoutSpy.mockRestore();
        });
    });
});
