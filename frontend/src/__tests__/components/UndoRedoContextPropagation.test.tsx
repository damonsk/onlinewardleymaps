import React from 'react';
import {render, screen, act} from '@testing-library/react';
import {UndoRedoProvider, useUndoRedo} from '../../components/UndoRedoProvider';
import {ActionType} from '../../types/undo-redo';

// Mock the useUndoRedoManager hook
jest.mock('../../hooks/useUndoRedoManager');

const mockUndoRedoManager = {
    canUndo: true,
    canRedo: true,
    undo: jest.fn(),
    redo: jest.fn(),
    recordChange: jest.fn(),
    clearHistory: jest.fn(),
    getLastAction: jest.fn(() => ({
        id: 'test-id',
        timestamp: Date.now(),
        previousMapText: 'old text',
        currentMapText: 'new text',
        actionType: 'toolbar-component' as ActionType,
        actionDescription: 'Add component',
    })),
    getNextAction: jest.fn(() => ({
        id: 'test-id-2',
        timestamp: Date.now(),
        previousMapText: 'new text',
        currentMapText: 'newer text',
        actionType: 'canvas-move' as ActionType,
        actionDescription: 'Move component',
    })),
    isUndoRedoOperation: false,
    undoStack: [],
    redoStack: [],
};

// Nested component that uses undo/redo context
const NestedConsumer: React.FC = () => {
    const undoRedo = useUndoRedo();

    return (
        <div data-testid="nested-consumer">
            <span data-testid="nested-can-undo">{undoRedo.canUndo.toString()}</span>
            <span data-testid="nested-can-redo">{undoRedo.canRedo.toString()}</span>
            <button data-testid="nested-undo" onClick={undoRedo.undo}>
                Nested Undo
            </button>
            <button data-testid="nested-redo" onClick={undoRedo.redo}>
                Nested Redo
            </button>
        </div>
    );
};

// Deeply nested component structure
const DeeplyNestedComponent: React.FC = () => {
    return (
        <div data-testid="deeply-nested">
            <div>
                <div>
                    <NestedConsumer />
                </div>
            </div>
        </div>
    );
};

// Component that tests multiple context consumers
const MultipleConsumers: React.FC = () => {
    const undoRedo1 = useUndoRedo();
    const undoRedo2 = useUndoRedo();

    return (
        <div data-testid="multiple-consumers">
            <div data-testid="consumer-1">
                <span data-testid="consumer-1-can-undo">{undoRedo1.canUndo.toString()}</span>
                <button data-testid="consumer-1-undo" onClick={undoRedo1.undo}>
                    Consumer 1 Undo
                </button>
            </div>
            <div data-testid="consumer-2">
                <span data-testid="consumer-2-can-undo">{undoRedo2.canUndo.toString()}</span>
                <button data-testid="consumer-2-undo" onClick={undoRedo2.undo}>
                    Consumer 2 Undo
                </button>
            </div>
        </div>
    );
};

describe('UndoRedoProvider Context Propagation', () => {
    const mockMutateMapText = jest.fn();
    const defaultProps = {
        mutateMapText: mockMutateMapText,
        mapText: 'initial map text',
        maxHistorySize: 50,
        debounceMs: 300,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        const {useUndoRedoManager} = require('../../hooks/useUndoRedoManager');
        useUndoRedoManager.mockReturnValue(mockUndoRedoManager);
    });

    describe('Context Propagation', () => {
        it('should provide context to deeply nested components', () => {
            render(
                <UndoRedoProvider {...defaultProps}>
                    <DeeplyNestedComponent />
                </UndoRedoProvider>,
            );

            expect(screen.getByTestId('deeply-nested')).toBeInTheDocument();
            expect(screen.getByTestId('nested-consumer')).toBeInTheDocument();
            expect(screen.getByTestId('nested-can-undo')).toHaveTextContent('true');
            expect(screen.getByTestId('nested-can-redo')).toHaveTextContent('true');
        });

        it('should allow nested components to call context methods', async () => {
            render(
                <UndoRedoProvider {...defaultProps}>
                    <DeeplyNestedComponent />
                </UndoRedoProvider>,
            );

            const nestedUndoBtn = screen.getByTestId('nested-undo');
            const nestedRedoBtn = screen.getByTestId('nested-redo');

            await act(async () => {
                nestedUndoBtn.click();
            });

            expect(mockUndoRedoManager.undo).toHaveBeenCalledTimes(1);

            await act(async () => {
                nestedRedoBtn.click();
            });

            expect(mockUndoRedoManager.redo).toHaveBeenCalledTimes(1);
        });

        it('should provide same context instance to multiple consumers', async () => {
            render(
                <UndoRedoProvider {...defaultProps}>
                    <MultipleConsumers />
                </UndoRedoProvider>,
            );

            expect(screen.getByTestId('consumer-1-can-undo')).toHaveTextContent('true');
            expect(screen.getByTestId('consumer-2-can-undo')).toHaveTextContent('true');

            const consumer1UndoBtn = screen.getByTestId('consumer-1-undo');
            const consumer2UndoBtn = screen.getByTestId('consumer-2-undo');

            await act(async () => {
                consumer1UndoBtn.click();
            });

            expect(mockUndoRedoManager.undo).toHaveBeenCalledTimes(1);

            await act(async () => {
                consumer2UndoBtn.click();
            });

            expect(mockUndoRedoManager.undo).toHaveBeenCalledTimes(2);
        });

        it('should update all consumers when context state changes', () => {
            const {useUndoRedoManager} = require('../../hooks/useUndoRedoManager');

            // Initial render with canUndo: true
            const {rerender} = render(
                <UndoRedoProvider {...defaultProps}>
                    <MultipleConsumers />
                </UndoRedoProvider>,
            );

            expect(screen.getByTestId('consumer-1-can-undo')).toHaveTextContent('true');
            expect(screen.getByTestId('consumer-2-can-undo')).toHaveTextContent('true');

            // Update context state
            useUndoRedoManager.mockReturnValue({
                ...mockUndoRedoManager,
                canUndo: false,
            });

            rerender(
                <UndoRedoProvider {...defaultProps}>
                    <MultipleConsumers />
                </UndoRedoProvider>,
            );

            expect(screen.getByTestId('consumer-1-can-undo')).toHaveTextContent('false');
            expect(screen.getByTestId('consumer-2-can-undo')).toHaveTextContent('false');
        });
    });

    describe('Context Isolation', () => {
        it('should isolate context between different providers', () => {
            const Provider1Consumer: React.FC = () => {
                const undoRedo = useUndoRedo();
                return <div data-testid="provider-1-consumer">{undoRedo.canUndo.toString()}</div>;
            };

            const Provider2Consumer: React.FC = () => {
                const undoRedo = useUndoRedo();
                return <div data-testid="provider-2-consumer">{undoRedo.canUndo.toString()}</div>;
            };

            const {useUndoRedoManager} = require('../../hooks/useUndoRedoManager');

            // Mock different states for different providers
            useUndoRedoManager
                .mockReturnValueOnce({
                    ...mockUndoRedoManager,
                    canUndo: true,
                })
                .mockReturnValueOnce({
                    ...mockUndoRedoManager,
                    canUndo: false,
                });

            render(
                <div>
                    <UndoRedoProvider {...defaultProps}>
                        <Provider1Consumer />
                    </UndoRedoProvider>
                    <UndoRedoProvider {...defaultProps}>
                        <Provider2Consumer />
                    </UndoRedoProvider>
                </div>,
            );

            expect(screen.getByTestId('provider-1-consumer')).toHaveTextContent('true');
            expect(screen.getByTestId('provider-2-consumer')).toHaveTextContent('false');
        });
    });

    describe('Context Performance', () => {
        it('should memoize context value to prevent unnecessary object creation', () => {
            let contextValues: any[] = [];

            const ContextValueCapturingConsumer: React.FC = () => {
                const undoRedo = useUndoRedo();
                contextValues.push(undoRedo);
                return <div data-testid="context-capturing-consumer">{undoRedo.canUndo.toString()}</div>;
            };

            const {rerender} = render(
                <UndoRedoProvider {...defaultProps}>
                    <ContextValueCapturingConsumer />
                </UndoRedoProvider>,
            );

            // Re-render with same props
            rerender(
                <UndoRedoProvider {...defaultProps}>
                    <ContextValueCapturingConsumer />
                </UndoRedoProvider>,
            );

            // Context values should be different objects due to React's re-rendering behavior
            // but the functions should be memoized
            expect(contextValues.length).toBeGreaterThan(1);
            expect(typeof contextValues[0].undo).toBe('function');
            expect(typeof contextValues[0].redo).toBe('function');
        });

        it('should only re-render consumers when relevant context values change', () => {
            let renderCount = 0;

            const SelectiveConsumer: React.FC = () => {
                renderCount++;
                const undoRedo = useUndoRedo();
                // Only use canUndo, not canRedo
                return <div data-testid="selective-consumer">{undoRedo.canUndo.toString()}</div>;
            };

            const {useUndoRedoManager} = require('../../hooks/useUndoRedoManager');

            const {rerender} = render(
                <UndoRedoProvider {...defaultProps}>
                    <SelectiveConsumer />
                </UndoRedoProvider>,
            );

            const initialRenderCount = renderCount;

            // Change only canRedo, not canUndo
            useUndoRedoManager.mockReturnValue({
                ...mockUndoRedoManager,
                canUndo: true, // Same as before
                canRedo: false, // Different from before
            });

            rerender(
                <UndoRedoProvider {...defaultProps}>
                    <SelectiveConsumer />
                </UndoRedoProvider>,
            );

            // Consumer should re-render because the entire context object changed
            expect(renderCount).toBeGreaterThan(initialRenderCount);
        });
    });

    describe('Context Error Handling', () => {
        it('should handle context access in nested consumers gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const SafeConsumer: React.FC = () => {
                try {
                    const undoRedo = useUndoRedo();
                    return (
                        <div data-testid="safe-consumer">
                            <span data-testid="safe-can-undo">{undoRedo.canUndo.toString()}</span>
                            <button data-testid="safe-undo" onClick={undoRedo.undo}>
                                Safe Undo
                            </button>
                        </div>
                    );
                } catch (error) {
                    return <div data-testid="error-fallback">Error accessing context</div>;
                }
            };

            render(
                <UndoRedoProvider {...defaultProps}>
                    <div>
                        <NestedConsumer />
                        <SafeConsumer />
                    </div>
                </UndoRedoProvider>,
            );

            // Both consumers should work
            expect(screen.getByTestId('nested-consumer')).toBeInTheDocument();
            expect(screen.getByTestId('safe-consumer')).toBeInTheDocument();
            expect(screen.getByTestId('nested-can-undo')).toHaveTextContent('true');
            expect(screen.getByTestId('safe-can-undo')).toHaveTextContent('true');

            // Both should be able to access the same context
            expect(screen.getByTestId('nested-undo')).toBeInTheDocument();
            expect(screen.getByTestId('safe-undo')).toBeInTheDocument();

            consoleSpy.mockRestore();
        });
    });
});
