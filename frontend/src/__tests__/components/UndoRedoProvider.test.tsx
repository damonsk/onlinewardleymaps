import React from 'react';
import {render, screen, act, waitFor} from '@testing-library/react';
import {UndoRedoProvider, useUndoRedo, UndoRedoErrorBoundary} from '../../components/UndoRedoProvider';
import {ActionType} from '../../types/undo-redo';

// Mock the useUndoRedoManager hook
jest.mock('../../hooks/useUndoRedoManager');

const mockUndoRedoManager = {
    canUndo: false,
    canRedo: false,
    undo: jest.fn(),
    redo: jest.fn(),
    recordChange: jest.fn(),
    clearHistory: jest.fn(),
    getLastAction: jest.fn(() => null),
    getNextAction: jest.fn(() => null),
    isUndoRedoOperation: false,
    undoStack: [],
    redoStack: [],
};

// Test component that uses the undo/redo context
const TestConsumer: React.FC = () => {
    const undoRedo = useUndoRedo();

    return (
        <div>
            <button data-testid="undo-btn" onClick={undoRedo.undo} disabled={!undoRedo.canUndo}>
                Undo
            </button>
            <button data-testid="redo-btn" onClick={undoRedo.redo} disabled={!undoRedo.canRedo}>
                Redo
            </button>
            <button data-testid="record-btn" onClick={() => undoRedo.recordChange('new text', 'toolbar-component', 'Add component')}>
                Record Change
            </button>
            <button data-testid="clear-btn" onClick={undoRedo.clearHistory}>
                Clear History
            </button>
            <div data-testid="can-undo">{undoRedo.canUndo.toString()}</div>
            <div data-testid="can-redo">{undoRedo.canRedo.toString()}</div>
            <div data-testid="is-operation">{undoRedo.isUndoRedoOperation.toString()}</div>
        </div>
    );
};

describe('UndoRedoProvider', () => {
    const mockMutateMapText = jest.fn();
    const defaultProps = {
        mutateMapText: mockMutateMapText,
        mapText: 'initial map text',
        maxHistorySize: 50,
        debounceMs: 300,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset the mock implementation
        const {useUndoRedoManager} = require('../../hooks/useUndoRedoManager');
        useUndoRedoManager.mockReturnValue(mockUndoRedoManager);
    });

    describe('Provider Setup and Context', () => {
        it('should provide context to child components', () => {
            render(
                <UndoRedoProvider {...defaultProps}>
                    <TestConsumer />
                </UndoRedoProvider>,
            );

            expect(screen.getByTestId('undo-btn')).toBeInTheDocument();
            expect(screen.getByTestId('redo-btn')).toBeInTheDocument();
            expect(screen.getByTestId('can-undo')).toHaveTextContent('false');
            expect(screen.getByTestId('can-redo')).toHaveTextContent('false');
        });

        it('should throw error when useUndoRedo is used outside provider', () => {
            // Suppress console.error for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                render(<TestConsumer />);
            }).toThrow('useUndoRedo must be used within an UndoRedoProvider');

            consoleSpy.mockRestore();
        });

        it('should use default values for optional props', () => {
            const {useUndoRedoManager} = require('../../hooks/useUndoRedoManager');

            render(
                <UndoRedoProvider mutateMapText={mockMutateMapText} mapText="test">
                    <TestConsumer />
                </UndoRedoProvider>,
            );

            expect(useUndoRedoManager).toHaveBeenCalledWith({
                mutateMapText: mockMutateMapText,
                mapText: 'test',
                maxHistorySize: 50, // Default value
                debounceMs: 300, // Default value
            });
        });
    });

    describe('Input Validation', () => {
        it('should throw error for invalid mutateMapText', () => {
            expect(() => {
                render(
                    <UndoRedoProvider {...defaultProps} mutateMapText={'not a function' as any}>
                        <TestConsumer />
                    </UndoRedoProvider>,
                );
            }).toThrow('UndoRedoProvider: mutateMapText must be a function');
        });

        it('should throw error for invalid mapText', () => {
            expect(() => {
                render(
                    <UndoRedoProvider {...defaultProps} mapText={123 as any}>
                        <TestConsumer />
                    </UndoRedoProvider>,
                );
            }).toThrow('UndoRedoProvider: mapText must be a string');
        });

        it('should throw error for invalid maxHistorySize', () => {
            expect(() => {
                render(
                    <UndoRedoProvider {...defaultProps} maxHistorySize={0}>
                        <TestConsumer />
                    </UndoRedoProvider>,
                );
            }).toThrow('UndoRedoProvider: maxHistorySize must be a positive integer');

            expect(() => {
                render(
                    <UndoRedoProvider {...defaultProps} maxHistorySize={-1}>
                        <TestConsumer />
                    </UndoRedoProvider>,
                );
            }).toThrow('UndoRedoProvider: maxHistorySize must be a positive integer');

            expect(() => {
                render(
                    <UndoRedoProvider {...defaultProps} maxHistorySize={1.5}>
                        <TestConsumer />
                    </UndoRedoProvider>,
                );
            }).toThrow('UndoRedoProvider: maxHistorySize must be a positive integer');
        });

        it('should throw error for invalid debounceMs', () => {
            expect(() => {
                render(
                    <UndoRedoProvider {...defaultProps} debounceMs={-1}>
                        <TestConsumer />
                    </UndoRedoProvider>,
                );
            }).toThrow('UndoRedoProvider: debounceMs must be a non-negative integer');

            expect(() => {
                render(
                    <UndoRedoProvider {...defaultProps} debounceMs={1.5}>
                        <TestConsumer />
                    </UndoRedoProvider>,
                );
            }).toThrow('UndoRedoProvider: debounceMs must be a non-negative integer');
        });
    });

    describe('Context Operations', () => {
        it('should call undo when undo function is invoked', async () => {
            const {useUndoRedoManager} = require('../../hooks/useUndoRedoManager');
            useUndoRedoManager.mockReturnValue({
                ...mockUndoRedoManager,
                canUndo: true, // Enable undo for this test
            });

            render(
                <UndoRedoProvider {...defaultProps}>
                    <TestConsumer />
                </UndoRedoProvider>,
            );

            const undoBtn = screen.getByTestId('undo-btn');

            await act(async () => {
                undoBtn.click();
            });

            expect(mockUndoRedoManager.undo).toHaveBeenCalledTimes(1);
        });

        it('should call redo when redo function is invoked', async () => {
            const {useUndoRedoManager} = require('../../hooks/useUndoRedoManager');
            useUndoRedoManager.mockReturnValue({
                ...mockUndoRedoManager,
                canRedo: true, // Enable redo for this test
            });

            render(
                <UndoRedoProvider {...defaultProps}>
                    <TestConsumer />
                </UndoRedoProvider>,
            );

            const redoBtn = screen.getByTestId('redo-btn');

            await act(async () => {
                redoBtn.click();
            });

            expect(mockUndoRedoManager.redo).toHaveBeenCalledTimes(1);
        });

        it('should call recordChange with correct parameters', async () => {
            render(
                <UndoRedoProvider {...defaultProps}>
                    <TestConsumer />
                </UndoRedoProvider>,
            );

            const recordBtn = screen.getByTestId('record-btn');

            await act(async () => {
                recordBtn.click();
            });

            expect(mockUndoRedoManager.recordChange).toHaveBeenCalledWith('new text', 'toolbar-component', 'Add component', undefined);
        });

        it('should call clearHistory when clearHistory function is invoked', async () => {
            render(
                <UndoRedoProvider {...defaultProps}>
                    <TestConsumer />
                </UndoRedoProvider>,
            );

            const clearBtn = screen.getByTestId('clear-btn');

            await act(async () => {
                clearBtn.click();
            });

            expect(mockUndoRedoManager.clearHistory).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Handling', () => {
        it('should handle undo errors gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const {useUndoRedoManager} = require('../../hooks/useUndoRedoManager');

            const mockManagerWithError = {
                ...mockUndoRedoManager,
                canUndo: true,
                undo: jest.fn(() => {
                    throw new Error('Undo failed');
                }),
            };

            useUndoRedoManager.mockReturnValue(mockManagerWithError);

            render(
                <UndoRedoProvider {...defaultProps}>
                    <TestConsumer />
                </UndoRedoProvider>,
            );

            const undoBtn = screen.getByTestId('undo-btn');

            await act(async () => {
                undoBtn.click();
            });

            expect(consoleSpy).toHaveBeenCalledWith('Error during undo operation:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('should handle redo errors gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const {useUndoRedoManager} = require('../../hooks/useUndoRedoManager');

            const mockManagerWithError = {
                ...mockUndoRedoManager,
                canRedo: true,
                redo: jest.fn(() => {
                    throw new Error('Redo failed');
                }),
            };

            useUndoRedoManager.mockReturnValue(mockManagerWithError);

            render(
                <UndoRedoProvider {...defaultProps}>
                    <TestConsumer />
                </UndoRedoProvider>,
            );

            const redoBtn = screen.getByTestId('redo-btn');

            await act(async () => {
                redoBtn.click();
            });

            expect(consoleSpy).toHaveBeenCalledWith('Error during redo operation:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('should handle recordChange errors gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockUndoRedoManager.recordChange.mockImplementation(() => {
                throw new Error('Record change failed');
            });

            render(
                <UndoRedoProvider {...defaultProps}>
                    <TestConsumer />
                </UndoRedoProvider>,
            );

            const recordBtn = screen.getByTestId('record-btn');

            await act(async () => {
                recordBtn.click();
            });

            expect(consoleSpy).toHaveBeenCalledWith('Error recording change in undo/redo history:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('should validate recordChange parameters', async () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            const TestConsumerWithInvalidParams: React.FC = () => {
                const undoRedo = useUndoRedo();

                return (
                    <div>
                        <button
                            data-testid="invalid-text-btn"
                            onClick={() => undoRedo.recordChange(123 as any, 'toolbar-component', 'Add component')}>
                            Invalid Text
                        </button>
                        <button
                            data-testid="invalid-description-btn"
                            onClick={() => undoRedo.recordChange('text', 'toolbar-component', '')}>
                            Invalid Description
                        </button>
                    </div>
                );
            };

            render(
                <UndoRedoProvider {...defaultProps}>
                    <TestConsumerWithInvalidParams />
                </UndoRedoProvider>,
            );

            await act(async () => {
                screen.getByTestId('invalid-text-btn').click();
            });

            expect(consoleSpy).toHaveBeenCalledWith('UndoRedoProvider: newText must be a string, received:', 'number');

            await act(async () => {
                screen.getByTestId('invalid-description-btn').click();
            });

            expect(consoleSpy).toHaveBeenCalledWith('UndoRedoProvider: description must be a non-empty string');

            consoleSpy.mockRestore();
        });
    });

    describe('State Updates and Memoization', () => {
        it('should update context when manager state changes', async () => {
            const {useUndoRedoManager} = require('../../hooks/useUndoRedoManager');

            // Initial state
            useUndoRedoManager.mockReturnValue({
                ...mockUndoRedoManager,
                canUndo: false,
                canRedo: false,
            });

            const {rerender} = render(
                <UndoRedoProvider {...defaultProps}>
                    <TestConsumer />
                </UndoRedoProvider>,
            );

            expect(screen.getByTestId('can-undo')).toHaveTextContent('false');
            expect(screen.getByTestId('can-redo')).toHaveTextContent('false');

            // Update state
            useUndoRedoManager.mockReturnValue({
                ...mockUndoRedoManager,
                canUndo: true,
                canRedo: true,
            });

            rerender(
                <UndoRedoProvider {...defaultProps}>
                    <TestConsumer />
                </UndoRedoProvider>,
            );

            expect(screen.getByTestId('can-undo')).toHaveTextContent('true');
            expect(screen.getByTestId('can-redo')).toHaveTextContent('true');
        });

        it('should handle isUndoRedoOperation flag changes', async () => {
            const {useUndoRedoManager} = require('../../hooks/useUndoRedoManager');

            useUndoRedoManager.mockReturnValue({
                ...mockUndoRedoManager,
                isUndoRedoOperation: true,
            });

            render(
                <UndoRedoProvider {...defaultProps}>
                    <TestConsumer />
                </UndoRedoProvider>,
            );

            expect(screen.getByTestId('is-operation')).toHaveTextContent('true');
        });
    });

    describe('Utility Methods', () => {
        it('should call getLastAction and handle errors', async () => {
            const mockHistoryEntry = {
                id: 'test-id',
                timestamp: Date.now(),
                previousMapText: 'old text',
                currentMapText: 'new text',
                actionType: 'toolbar-component' as ActionType,
                actionDescription: 'Add component',
            };

            mockUndoRedoManager.getLastAction.mockReturnValue(mockHistoryEntry);

            const TestConsumerWithGetters: React.FC = () => {
                const undoRedo = useUndoRedo();

                return (
                    <div>
                        <button
                            data-testid="get-last-btn"
                            onClick={() => {
                                const lastAction = undoRedo.getLastAction();
                                console.log('Last action:', lastAction);
                            }}>
                            Get Last Action
                        </button>
                    </div>
                );
            };

            render(
                <UndoRedoProvider {...defaultProps}>
                    <TestConsumerWithGetters />
                </UndoRedoProvider>,
            );

            const getLastBtn = screen.getByTestId('get-last-btn');

            await act(async () => {
                getLastBtn.click();
            });

            expect(mockUndoRedoManager.getLastAction).toHaveBeenCalledTimes(1);
        });

        it('should handle getLastAction errors gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockUndoRedoManager.getLastAction.mockImplementation(() => {
                throw new Error('Get last action failed');
            });

            const TestConsumerWithGetters: React.FC = () => {
                const undoRedo = useUndoRedo();

                return (
                    <div>
                        <button
                            data-testid="get-last-btn"
                            onClick={() => {
                                const lastAction = undoRedo.getLastAction();
                                expect(lastAction).toBeNull();
                            }}>
                            Get Last Action
                        </button>
                    </div>
                );
            };

            render(
                <UndoRedoProvider {...defaultProps}>
                    <TestConsumerWithGetters />
                </UndoRedoProvider>,
            );

            const getLastBtn = screen.getByTestId('get-last-btn');

            await act(async () => {
                getLastBtn.click();
            });

            expect(consoleSpy).toHaveBeenCalledWith('Error getting last action:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });
});

describe('UndoRedoErrorBoundary', () => {
    const ThrowingComponent: React.FC = () => {
        throw new Error('Test error');
    };

    beforeEach(() => {
        // Suppress console.error for error boundary tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        (console.error as jest.Mock).mockRestore();
    });

    it('should catch errors and display default fallback', () => {
        render(
            <UndoRedoErrorBoundary>
                <ThrowingComponent />
            </UndoRedoErrorBoundary>,
        );

        expect(screen.getByText('Undo/Redo Error')).toBeInTheDocument();
        expect(screen.getByText(/An error occurred in the undo\/redo system/)).toBeInTheDocument();
        expect(screen.getByText('Error Details')).toBeInTheDocument();
    });

    it('should use custom fallback component when provided', () => {
        const CustomFallback: React.FC<{error: Error}> = ({error}) => (
            <div data-testid="custom-fallback">Custom error: {error.message}</div>
        );

        render(
            <UndoRedoErrorBoundary fallback={CustomFallback}>
                <ThrowingComponent />
            </UndoRedoErrorBoundary>,
        );

        expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
        expect(screen.getByText('Custom error: Test error')).toBeInTheDocument();
    });

    it('should render children normally when no error occurs', () => {
        const NormalComponent: React.FC = () => <div data-testid="normal-component">Normal content</div>;

        render(
            <UndoRedoErrorBoundary>
                <NormalComponent />
            </UndoRedoErrorBoundary>,
        );

        expect(screen.getByTestId('normal-component')).toBeInTheDocument();
        expect(screen.getByText('Normal content')).toBeInTheDocument();
    });
});
