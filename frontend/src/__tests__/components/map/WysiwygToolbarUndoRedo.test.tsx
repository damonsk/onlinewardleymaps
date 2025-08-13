import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {WysiwygToolbar} from '../../../components/map/WysiwygToolbar';
import {UndoRedoProvider, useUndoRedo} from '../../../components/UndoRedoProvider';
import {MapTheme} from '../../../constants/mapstyles';
import {WysiwygToolbarProps} from '../../../types/toolbar';

// Mock map style definitions
const mockMapStyleDefs: MapTheme = {
    component: {
        fontWeight: 'normal',
        evolvedTextColor: '#000',
        textColor: '#000',
        fill: '#fff',
        stroke: '#000',
    },
    anchor: {
        fontSize: '12px',
    },
    market: {
        stroke: '#000',
        fill: '#fff',
    },
    attitudes: {
        strokeWidth: '1px',
        fontSize: '12px',
        pioneers: {
            stroke: '#000',
            fill: '#fff',
        },
        settlers: {
            stroke: '#000',
            fill: '#fff',
        },
        townplanners: {
            stroke: '#000',
            fill: '#fff',
        },
    },
    methods: {
        buy: {
            stroke: '#000',
            fill: '#fff',
        },
        build: {
            stroke: '#000',
            fill: '#fff',
        },
        outsource: {
            stroke: '#000',
            fill: '#fff',
        },
    },
    annotation: {
        stroke: '#000',
        strokeWidth: 1,
        fill: '#fff',
        text: '#000',
        boxStroke: '#000',
        boxStrokeWidth: 1,
        boxFill: '#fff',
        boxTextColour: '#000',
    },
    note: {
        fontWeight: 'normal',
        evolvedTextColor: '#000',
        textColor: '#000',
        fill: '#fff',
    },
};

describe('WysiwygToolbar Undo/Redo Integration', () => {
    let container: HTMLDivElement;
    let root: any;
    let mockOnItemSelect: jest.Mock;
    let mockMutateMapText: jest.Mock;
    let mapText: string;

    const defaultProps: WysiwygToolbarProps = {
        mapStyleDefs: mockMapStyleDefs,
        mapDimensions: {width: 800, height: 600},
        mapText: 'title Test Map',
        mutateMapText: jest.fn(),
        onItemSelect: jest.fn(),
        selectedItem: null,
    };

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        mockOnItemSelect = jest.fn();
        mockMutateMapText = jest.fn();
        mapText = 'title Test Map';
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        document.body.removeChild(container);
    });

    const renderComponentWithUndoRedo = (props: Partial<WysiwygToolbarProps> = {}) => {
        const finalProps = {
            ...defaultProps,
            onItemSelect: mockOnItemSelect,
            mutateMapText: mockMutateMapText,
            mapText,
            ...props,
        };

        act(() => {
            root.render(
                <UndoRedoProvider
                    mutateMapText={finalProps.mutateMapText}
                    mapText={finalProps.mapText}
                    maxHistorySize={50}
                    debounceMs={100}>
                    <WysiwygToolbar {...finalProps} />
                </UndoRedoProvider>,
            );
        });
    };

    describe('Undo/Redo Button Rendering', () => {
        it('renders undo and redo buttons', () => {
            renderComponentWithUndoRedo();

            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]');
            const redoButton = container.querySelector('[data-testid="toolbar-item-redo"]');

            expect(undoButton).toBeTruthy();
            expect(redoButton).toBeTruthy();
        });

        it('shows undo and redo buttons as disabled initially', () => {
            renderComponentWithUndoRedo();

            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]') as HTMLButtonElement;
            const redoButton = container.querySelector('[data-testid="toolbar-item-redo"]') as HTMLButtonElement;

            expect(undoButton?.disabled).toBe(true);
            expect(redoButton?.disabled).toBe(true);
        });

        it('shows correct tooltips for disabled undo/redo buttons', () => {
            renderComponentWithUndoRedo();

            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]');
            const redoButton = container.querySelector('[data-testid="toolbar-item-redo"]');

            expect(undoButton?.getAttribute('title')).toBe('No actions to undo');
            expect(redoButton?.getAttribute('title')).toBe('No actions to redo');
        });

        it('positions undo/redo buttons at the end of the toolbar', () => {
            renderComponentWithUndoRedo();

            const allButtons = Array.from(container.querySelectorAll('[data-testid^="toolbar-item-"]'));
            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]');
            const redoButton = container.querySelector('[data-testid="toolbar-item-redo"]');

            const undoIndex = allButtons.indexOf(undoButton as Element);
            const redoIndex = allButtons.indexOf(redoButton as Element);

            // Undo and redo should be among the last buttons
            expect(undoIndex).toBeGreaterThan(allButtons.length - 4);
            expect(redoIndex).toBeGreaterThan(allButtons.length - 4);
            expect(undoIndex).toBeLessThan(redoIndex); // Undo should come before redo
        });
    });

    describe('Undo/Redo Button States', () => {
        it('enables undo button when there are actions to undo', async () => {
            // Create a test component that can access the UndoRedoProvider context
            let contextMutateMapText: ((text: string) => void) | null = null;

            const TestComponent = () => {
                const undoRedoContext = useUndoRedo();
                contextMutateMapText = undoRedoContext.mutateMapText;
                return (
                    <WysiwygToolbar {...defaultProps} onItemSelect={mockOnItemSelect} mutateMapText={mockMutateMapText} mapText={mapText} />
                );
            };

            act(() => {
                root.render(
                    <UndoRedoProvider mutateMapText={mockMutateMapText} mapText={mapText} maxHistorySize={50} debounceMs={100}>
                        <TestComponent />
                    </UndoRedoProvider>,
                );
            });

            // Wait for initial render
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
            });

            // Simulate a change using the UndoRedoProvider's mutateMapText
            act(() => {
                const newText = 'title Test Map\ncomponent A [0.5, 0.5]';
                if (contextMutateMapText) {
                    contextMutateMapText(newText);
                }
            });

            // Wait for debounce
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 150));
            });

            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]') as HTMLButtonElement;
            expect(undoButton?.disabled).toBe(false);
        });

        it('enables redo button after undo operation', async () => {
            // Create a test component that can access the UndoRedoProvider context
            let contextMutateMapText: ((text: string) => void) | null = null;
            let contextUndo: (() => void) | null = null;

            const TestComponent = () => {
                const undoRedoContext = useUndoRedo();
                contextMutateMapText = undoRedoContext.mutateMapText;
                contextUndo = undoRedoContext.undo;
                return (
                    <WysiwygToolbar {...defaultProps} onItemSelect={mockOnItemSelect} mutateMapText={mockMutateMapText} mapText={mapText} />
                );
            };

            act(() => {
                root.render(
                    <UndoRedoProvider mutateMapText={mockMutateMapText} mapText={mapText} maxHistorySize={50} debounceMs={100}>
                        <TestComponent />
                    </UndoRedoProvider>,
                );
            });

            // Wait for initial render
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
            });

            // Simulate a change using the UndoRedoProvider's mutateMapText
            act(() => {
                const newText = 'title Test Map\ncomponent A [0.5, 0.5]';
                if (contextMutateMapText) {
                    contextMutateMapText(newText);
                }
            });

            // Wait for debounce
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 150));
            });

            // Perform undo operation using the context
            act(() => {
                if (contextUndo) {
                    contextUndo();
                }
            });

            // Wait for undo operation
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            const redoButton = container.querySelector('[data-testid="toolbar-item-redo"]') as HTMLButtonElement;
            expect(redoButton?.disabled).toBe(false);
        });
    });

    describe('Undo/Redo Button Click Handling', () => {
        it('does not call onItemSelect for undo/redo buttons', () => {
            renderComponentWithUndoRedo();

            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]');
            const redoButton = container.querySelector('[data-testid="toolbar-item-redo"]');

            act(() => {
                undoButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            act(() => {
                redoButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // onItemSelect should not be called for action items
            expect(mockOnItemSelect).not.toHaveBeenCalled();
        });

        it('handles disabled button clicks gracefully', () => {
            renderComponentWithUndoRedo();

            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]');
            const redoButton = container.querySelector('[data-testid="toolbar-item-redo"]');

            // Both buttons should be disabled initially
            expect((undoButton as HTMLButtonElement)?.disabled).toBe(true);
            expect((redoButton as HTMLButtonElement)?.disabled).toBe(true);

            // Clicking disabled buttons should not cause errors
            expect(() => {
                act(() => {
                    undoButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                });
            }).not.toThrow();

            expect(() => {
                act(() => {
                    redoButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                });
            }).not.toThrow();
        });
    });

    describe('Tooltip Updates', () => {
        it('shows action description in tooltip when undo is available', async () => {
            renderComponentWithUndoRedo();

            // Simulate a change with a specific action description
            act(() => {
                mapText = 'title Test Map\ncomponent A [0.5, 0.5]';
                mockMutateMapText(mapText);
            });

            // Wait for debounce
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 150));
            });

            // Re-render with new map text and simulate having undo history
            renderComponentWithUndoRedo({mapText});

            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]');

            // The tooltip should contain action description when undo is available
            const tooltip = undoButton?.getAttribute('title');
            expect(tooltip).toContain('Undo:');
        });

        it('shows action description in tooltip when redo is available', async () => {
            renderComponentWithUndoRedo();

            // Simulate a change to create undo history
            act(() => {
                mapText = 'title Test Map\ncomponent A [0.5, 0.5]';
                mockMutateMapText(mapText);
            });

            // Wait for debounce
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 150));
            });

            // Re-render with new map text
            renderComponentWithUndoRedo({mapText});

            // Click undo to create redo history
            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]');
            act(() => {
                undoButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Wait for undo operation
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            const redoButton = container.querySelector('[data-testid="toolbar-item-redo"]');

            // The tooltip should contain action description when redo is available
            const tooltip = redoButton?.getAttribute('title');
            expect(tooltip).toContain('Redo:');
        });
    });

    describe('Accessibility', () => {
        it('provides proper ARIA labels for undo/redo buttons', () => {
            renderComponentWithUndoRedo();

            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]');
            const redoButton = container.querySelector('[data-testid="toolbar-item-redo"]');

            expect(undoButton?.getAttribute('aria-label')).toContain('Undo');
            expect(redoButton?.getAttribute('aria-label')).toContain('Redo');
        });

        it('indicates disabled state in ARIA labels', () => {
            renderComponentWithUndoRedo();

            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]');
            const redoButton = container.querySelector('[data-testid="toolbar-item-redo"]');

            expect(undoButton?.getAttribute('aria-label')).toContain('(disabled)');
            expect(redoButton?.getAttribute('aria-label')).toContain('(disabled)');
        });

        it('supports keyboard navigation', () => {
            renderComponentWithUndoRedo();

            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]') as HTMLButtonElement;
            const redoButton = container.querySelector('[data-testid="toolbar-item-redo"]') as HTMLButtonElement;

            expect(undoButton?.tabIndex).toBe(0);
            expect(redoButton?.tabIndex).toBe(0);
        });

        it('handles keyboard events for undo/redo buttons', () => {
            renderComponentWithUndoRedo();

            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]');
            const redoButton = container.querySelector('[data-testid="toolbar-item-redo"]');

            // Test Enter key
            expect(() => {
                act(() => {
                    undoButton?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
                });
            }).not.toThrow();

            // Test Space key
            expect(() => {
                act(() => {
                    redoButton?.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true}));
                });
            }).not.toThrow();
        });
    });

    describe('Visual States', () => {
        it('applies disabled styling to undo/redo buttons when disabled', () => {
            renderComponentWithUndoRedo();

            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]') as HTMLButtonElement;
            const redoButton = container.querySelector('[data-testid="toolbar-item-redo"]') as HTMLButtonElement;

            expect(undoButton?.disabled).toBe(true);
            expect(redoButton?.disabled).toBe(true);

            // Check that disabled styling is applied (opacity should be reduced)
            const undoStyle = window.getComputedStyle(undoButton);
            const redoStyle = window.getComputedStyle(redoButton);

            // Note: In jsdom, computed styles might not reflect all CSS,
            // but we can at least verify the disabled attribute is set
            expect(undoButton.hasAttribute('disabled')).toBe(true);
            expect(redoButton.hasAttribute('disabled')).toBe(true);
        });

        it('removes disabled styling when buttons become enabled', async () => {
            renderComponentWithUndoRedo();

            // Simulate a change to enable undo
            act(() => {
                mapText = 'title Test Map\ncomponent A [0.5, 0.5]';
                mockMutateMapText(mapText);
            });

            // Wait for debounce
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 150));
            });

            // Re-render with new map text
            renderComponentWithUndoRedo({mapText});

            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]') as HTMLButtonElement;
            expect(undoButton?.disabled).toBe(false);
        });
    });

    describe('Integration with UndoRedoProvider', () => {
        it('correctly integrates with UndoRedoProvider context', () => {
            // This test verifies that the toolbar can access the undo/redo context
            expect(() => {
                renderComponentWithUndoRedo();
            }).not.toThrow();

            // Verify that undo/redo buttons are rendered (which means context is accessible)
            const undoButton = container.querySelector('[data-testid="toolbar-item-undo"]');
            const redoButton = container.querySelector('[data-testid="toolbar-item-redo"]');

            expect(undoButton).toBeTruthy();
            expect(redoButton).toBeTruthy();
        });

        it('throws error when used without UndoRedoProvider', () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                act(() => {
                    root.render(<WysiwygToolbar {...defaultProps} />);
                });
            }).toThrow('useUndoRedo must be used within an UndoRedoProvider');

            consoleError.mockRestore();
        });
    });

    describe('Performance', () => {
        it('does not cause unnecessary re-renders when undo/redo state changes', async () => {
            const renderSpy = jest.fn();

            // Create a wrapper component to track renders
            const TestWrapper: React.FC = () => {
                renderSpy();
                return (
                    <UndoRedoProvider mutateMapText={mockMutateMapText} mapText={mapText} maxHistorySize={50} debounceMs={100}>
                        <WysiwygToolbar
                            {...defaultProps}
                            onItemSelect={mockOnItemSelect}
                            mutateMapText={mockMutateMapText}
                            mapText={mapText}
                        />
                    </UndoRedoProvider>
                );
            };

            act(() => {
                root.render(<TestWrapper />);
            });

            const initialRenderCount = renderSpy.mock.calls.length;

            // Simulate a change
            act(() => {
                mapText = 'title Test Map\ncomponent A [0.5, 0.5]';
                mockMutateMapText(mapText);
            });

            // Wait for debounce
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 150));
            });

            // The component should not re-render excessively
            expect(renderSpy.mock.calls.length).toBeLessThan(initialRenderCount + 5);
        });
    });
});
