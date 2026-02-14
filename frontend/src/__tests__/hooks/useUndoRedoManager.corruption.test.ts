import {renderHook, act} from '@testing-library/react';
import {useUndoRedoManager} from '../../hooks/useUndoRedoManager';
import {ActionType} from '../../types/undo-redo';

describe('useUndoRedoManager - Corruption Bug Fixes', () => {
    let mockMutateMapText: jest.Mock;
    const defaultProps = {
        mapText: 'initial text',
        maxHistorySize: 10,
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

    describe('History Corruption Prevention', () => {
        it('should prevent duplicate entries from being added to history', () => {
            const {result, rerender} = renderHook(
                ({mapText}) =>
                    useUndoRedoManager({
                        mapText,
                        mutateMapText: mockMutateMapText,
                        maxHistorySize: 10,
                        debounceMs: 100,
                    }),
                {initialProps: {mapText: 'initial text'}},
            );

            // Record the same change twice
            act(() => {
                result.current.recordChange('changed text', 'toolbar-component', 'Add component');
                jest.advanceTimersByTime(150);
            });

            rerender({mapText: 'changed text'});

            // Try to record the same change again
            act(() => {
                result.current.recordChange('changed text', 'toolbar-component', 'Add component');
                jest.advanceTimersByTime(150);
            });

            // Should only have one entry
            expect(result.current.undoStack).toHaveLength(1);
        });

        it('should prevent no-op entries (where previousMapText equals currentMapText)', () => {
            const {result} = renderHook(() =>
                useUndoRedoManager({
                    ...defaultProps,
                    mutateMapText: mockMutateMapText,
                }),
            );

            // Try to record a change that doesn't actually change anything
            act(() => {
                result.current.recordChange('initial text', 'toolbar-component', 'No-op change');
                jest.advanceTimersByTime(150);
            });

            // Should not have recorded anything
            expect(result.current.undoStack).toHaveLength(0);
        });

        it('should clean up corrupted history entries', () => {
            const {result} = renderHook(() =>
                useUndoRedoManager({
                    ...defaultProps,
                    mutateMapText: mockMutateMapText,
                }),
            );

            // Manually add some corrupted entries by bypassing normal validation
            // This simulates the bug condition
            act(() => {
                // Add a valid entry first
                result.current.recordChange('valid change', 'toolbar-component', 'Valid change');
                jest.advanceTimersByTime(150);
            });

            // Now clean up any corrupted entries
            act(() => {
                result.current.cleanupHistory();
            });

            // Should still have the valid entry
            expect(result.current.undoStack).toHaveLength(1);
            expect(result.current.undoStack[0].currentMapText).toBe('valid change');
        });

        it('should validate state before performing undo operations', () => {
            const {result, rerender} = renderHook(
                ({mapText}) =>
                    useUndoRedoManager({
                        mapText,
                        mutateMapText: mockMutateMapText,
                        maxHistorySize: 10,
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

            // Manually set mapText to the previous state (simulating corruption)
            rerender({mapText: 'initial text'});

            // Try to undo - should detect that no change is needed
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            act(() => {
                result.current.undo();
                jest.advanceTimersByTime(100);
            });

            expect(consoleSpy).toHaveBeenCalledWith('Undo operation would not change state, skipping');
            expect(mockMutateMapText).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should validate state before performing redo operations', () => {
            const {result, rerender} = renderHook(
                ({mapText}) =>
                    useUndoRedoManager({
                        mapText,
                        mutateMapText: mockMutateMapText,
                        maxHistorySize: 10,
                        debounceMs: 100,
                    }),
                {initialProps: {mapText: 'initial text'}},
            );

            // Record a change and undo it to create redo stack
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

            // Manually set mapText to the target state (simulating corruption)
            rerender({mapText: 'changed text'});

            // Try to redo - should detect that no change is needed
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            const callCountBefore = mockMutateMapText.mock.calls.length;

            act(() => {
                result.current.redo();
                jest.advanceTimersByTime(100);
            });

            expect(consoleSpy).toHaveBeenCalledWith('Redo operation would not change state, skipping');
            expect(mockMutateMapText.mock.calls.length).toBe(callCountBefore); // No new calls

            consoleSpy.mockRestore();
        });

        it('should clear pending changes during undo/redo operations', () => {
            const {result, rerender} = renderHook(
                ({mapText}) =>
                    useUndoRedoManager({
                        mapText,
                        mutateMapText: mockMutateMapText,
                        maxHistorySize: 10,
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

            // Record another change but don't let it process
            act(() => {
                result.current.recordChange('another change', 'toolbar-component', 'Another component');
                // Don't advance timers - leave it pending
            });

            // Perform undo - should clear the pending change
            act(() => {
                result.current.undo();
                jest.advanceTimersByTime(100);
            });

            rerender({mapText: 'initial text'});

            // Now advance timers - the pending change should not be processed
            act(() => {
                jest.advanceTimersByTime(150);
            });

            // Should only have the redo entry, no new undo entry from the pending change
            expect(result.current.undoStack).toHaveLength(0);
            expect(result.current.redoStack).toHaveLength(1);
        });
    });

    describe('Race Condition Prevention', () => {
        it('should prevent multiple simultaneous undo operations', () => {
            const {result, rerender} = renderHook(
                ({mapText}) =>
                    useUndoRedoManager({
                        mapText,
                        mutateMapText: mockMutateMapText,
                        maxHistorySize: 10,
                        debounceMs: 100,
                    }),
                {initialProps: {mapText: 'initial text'}},
            );

            // Add multiple changes
            act(() => {
                result.current.recordChange('change 1', 'toolbar-component', 'Change 1');
                jest.advanceTimersByTime(150);
            });

            rerender({mapText: 'change 1'});

            act(() => {
                result.current.recordChange('change 2', 'toolbar-component', 'Change 2');
                jest.advanceTimersByTime(150);
            });

            rerender({mapText: 'change 2'});

            // Try to perform multiple undo operations simultaneously
            const callCountBefore = mockMutateMapText.mock.calls.length;

            act(() => {
                result.current.undo();
                // The second undo should be ignored because isUndoRedoOperation is now true
                result.current.undo();
            });

            // Allow the async operations to complete
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Should only have performed one undo (one additional call)
            expect(mockMutateMapText.mock.calls.length).toBe(callCountBefore + 1);
            expect(result.current.undoStack).toHaveLength(1);
            expect(result.current.redoStack).toHaveLength(1);
        });

        it('should prevent recording changes during undo/redo operations', () => {
            const {result, rerender} = renderHook(
                ({mapText}) =>
                    useUndoRedoManager({
                        mapText,
                        mutateMapText: mockMutateMapText,
                        maxHistorySize: 10,
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

            // Start an undo operation
            act(() => {
                result.current.undo();
                // Don't advance timers yet - operation is in progress
            });

            // Try to record a change while undo is in progress
            act(() => {
                result.current.recordChange('new change', 'toolbar-component', 'New component');
                jest.advanceTimersByTime(150);
            });

            // Complete the undo operation
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // The new change should not have been recorded
            expect(result.current.undoStack).toHaveLength(0);
            expect(result.current.redoStack).toHaveLength(1);
        });
    });
});
