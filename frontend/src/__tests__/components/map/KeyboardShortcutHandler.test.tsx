import React from 'react';
import {render, screen, fireEvent, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import {KeyboardShortcutHandler} from '../../../components/map/KeyboardShortcutHandler';
import {UndoRedoProvider, useUndoRedo} from '../../../components/UndoRedoProvider';
import {ToolbarItem} from '../../../types/toolbar';

// Mock the toolbar items
const mockToolbarItems: ToolbarItem[] = [
    {
        id: 'component',
        label: 'Component',
        icon: () => <div>Component Icon</div>,
        category: 'component',
        keyboardShortcut: 'c',
    },
    {
        id: 'link',
        label: 'Link',
        icon: () => <div>Link Icon</div>,
        category: 'link',
        keyboardShortcut: 'l',
    },
];

// Mock the getToolbarItemByShortcut function
jest.mock('../../../constants/toolbarItems', () => ({
    getToolbarItemByShortcut: (key: string) => {
        const items: Record<string, any> = {
            c: mockToolbarItems[0],
            l: mockToolbarItems[1],
        };
        return items[key];
    },
}));

// Mock navigator.platform for platform detection tests
const mockNavigator = (platform: string, userAgent: string = '') => {
    Object.defineProperty(window, 'navigator', {
        value: {
            platform,
            userAgent,
        },
        writable: true,
    });
};

describe('KeyboardShortcutHandler', () => {
    const mockOnToolSelect = jest.fn();
    const mockMutateMapText = jest.fn();
    const mockOnDeleteComponent = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset to default platform
        mockNavigator('Win32', 'Windows');
    });

    const renderWithUndoRedo = (props: any = {}) => {
        return render(
            <UndoRedoProvider mutateMapText={mockMutateMapText} mapText="test map">
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                    {...props}
                />
            </UndoRedoProvider>,
        );
    };

    const renderWithoutUndoRedo = (props: any = {}) => {
        return render(
            <KeyboardShortcutHandler
                toolbarItems={mockToolbarItems}
                onToolSelect={mockOnToolSelect}
                isEnabled={true}
                currentSelectedTool={null}
                {...props}
            />,
        );
    };

    describe('Platform Detection', () => {
        it('should detect Mac platform correctly', () => {
            mockNavigator('MacIntel', 'Mac OS X');
            renderWithUndoRedo();

            // Test Mac-specific undo shortcut (Cmd+Z)
            fireEvent.keyDown(document, {
                key: 'z',
                metaKey: true,
                ctrlKey: false,
            });

            // Should not trigger because there's nothing to undo initially
            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();
        });

        it('should detect Windows platform correctly', () => {
            mockNavigator('Win32', 'Windows');
            renderWithUndoRedo();

            // Test Windows-specific undo shortcut (Ctrl+Z)
            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
                metaKey: false,
            });

            // Should not trigger because there's nothing to undo initially
            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();
        });

        it('should default to Windows platform when navigator is unavailable', () => {
            // Mock navigator as undefined
            Object.defineProperty(window, 'navigator', {
                value: undefined,
                writable: true,
            });

            renderWithUndoRedo();

            // Should use Windows shortcuts by default
            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
                metaKey: false,
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();
        });
    });

    describe('Undo Shortcuts', () => {
        it('should handle Ctrl+Z on Windows', async () => {
            mockNavigator('Win32', 'Windows');

            // Create a test component that sets up history and tests undo
            const TestComponent = () => {
                const undoRedoContext = useUndoRedo();
                const [historyCreated, setHistoryCreated] = React.useState(false);

                React.useEffect(() => {
                    if (!historyCreated) {
                        // Create some history by recording a change
                        undoRedoContext.recordChange('new map text', 'editor-text', 'Test change');
                        setHistoryCreated(true);
                    }
                }, [undoRedoContext, historyCreated]);

                return (
                    <KeyboardShortcutHandler
                        toolbarItems={mockToolbarItems}
                        onToolSelect={mockOnToolSelect}
                        isEnabled={true}
                        currentSelectedTool={null}
                    />
                );
            };

            render(
                <UndoRedoProvider mutateMapText={mockMutateMapText} mapText="initial text">
                    <TestComponent />
                </UndoRedoProvider>,
            );

            // Wait for history to be created and debounced
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 350));
            });

            // Now trigger undo
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                    metaKey: false,
                });
            });

            // Should show undo announcement
            expect(screen.getByText(/Undid:/)).toBeInTheDocument();
        });

        it('should handle Cmd+Z on Mac', async () => {
            mockNavigator('MacIntel', 'Mac OS X');
            const {container} = renderWithUndoRedo();

            // First, create some history
            act(() => {
                mockMutateMapText('new map text');
            });

            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    metaKey: true,
                    ctrlKey: false,
                });
            });

            expect(screen.getByText(/Undid:/)).toBeInTheDocument();
        });

        it('should not trigger undo when canUndo is false', () => {
            renderWithUndoRedo();

            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
                metaKey: false,
            });

            // Should not show undo announcement when there's nothing to undo
            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();
        });

        it('should prevent default behavior when undo is triggered', async () => {
            const {container} = renderWithUndoRedo();

            // Create some history first
            act(() => {
                mockMutateMapText('new map text');
            });

            const event = new KeyboardEvent('keydown', {
                key: 'z',
                ctrlKey: true,
                bubbles: true,
                cancelable: true,
            });

            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

            await act(async () => {
                fireEvent(document, event);
            });

            expect(preventDefaultSpy).toHaveBeenCalled();
        });
    });

    describe('Redo Shortcuts', () => {
        it('should handle Ctrl+Y on Windows', async () => {
            mockNavigator('Win32', 'Windows');
            const {container} = renderWithUndoRedo();

            // Create history and then undo to have something to redo
            act(() => {
                mockMutateMapText('new map text');
            });

            // Undo first
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                    metaKey: false,
                });
            });

            // Now redo
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'y',
                    ctrlKey: true,
                    metaKey: false,
                });
            });

            expect(screen.getByText(/Redid:/)).toBeInTheDocument();
        });

        it('should handle Cmd+Shift+Z on Mac', async () => {
            mockNavigator('MacIntel', 'Mac OS X');
            const {container} = renderWithUndoRedo();

            // Create history and undo
            act(() => {
                mockMutateMapText('new map text');
            });

            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    metaKey: true,
                    ctrlKey: false,
                });
            });

            // Now redo with Mac shortcut
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    metaKey: true,
                    shiftKey: true,
                    ctrlKey: false,
                });
            });

            expect(screen.getByText(/Redid:/)).toBeInTheDocument();
        });

        it('should not trigger redo when canRedo is false', () => {
            renderWithUndoRedo();

            fireEvent.keyDown(document, {
                key: 'y',
                ctrlKey: true,
                metaKey: false,
            });

            // Should not show redo announcement when there's nothing to redo
            expect(screen.queryByText(/Redid:/)).not.toBeInTheDocument();
        });
    });

    describe('Text Editor Interference Prevention', () => {
        it('should not handle shortcuts when focus is on input element', () => {
            renderWithUndoRedo();

            // Create an input element and focus it
            const input = document.createElement('input');
            document.body.appendChild(input);
            input.focus();

            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
            });

            // Should not show undo announcement when input is focused
            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();

            document.body.removeChild(input);
        });

        it('should not handle shortcuts when focus is on textarea element', () => {
            renderWithUndoRedo();

            const textarea = document.createElement('textarea');
            document.body.appendChild(textarea);
            textarea.focus();

            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();

            document.body.removeChild(textarea);
        });

        it('should not handle shortcuts when focus is on contenteditable element', () => {
            renderWithUndoRedo();

            const div = document.createElement('div');
            div.contentEditable = 'true';
            document.body.appendChild(div);
            div.focus();

            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();

            document.body.removeChild(div);
        });

        it('should not handle shortcuts when focus is on ace editor', () => {
            renderWithUndoRedo();

            const aceInput = document.createElement('div');
            aceInput.className = 'ace_text-input';
            document.body.appendChild(aceInput);
            aceInput.focus();

            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();

            document.body.removeChild(aceInput);
        });
    });

    describe('Integration with Existing Shortcuts', () => {
        it('should handle toolbar shortcuts alongside undo/redo', () => {
            renderWithUndoRedo();

            // Test toolbar shortcut (no modifiers)
            fireEvent.keyDown(document, {
                key: 'c',
            });

            expect(mockOnToolSelect).toHaveBeenCalledWith('component');
        });

        it('should prioritize undo/redo shortcuts over toolbar shortcuts', async () => {
            const {container} = renderWithUndoRedo();

            // Create some history
            act(() => {
                mockMutateMapText('new map text');
            });

            // Press Ctrl+Z (should trigger undo, not toolbar shortcut)
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });
            });

            // Should show undo announcement, not call onToolSelect
            expect(screen.getByText(/Undid:/)).toBeInTheDocument();
            expect(mockOnToolSelect).not.toHaveBeenCalled();
        });

        it('should handle Escape key to deselect tools', () => {
            renderWithUndoRedo({currentSelectedTool: 'component'});

            fireEvent.keyDown(document, {
                key: 'Escape',
            });

            expect(mockOnToolSelect).toHaveBeenCalledWith(null);
            expect(screen.getByText('All tools deselected')).toBeInTheDocument();
        });
    });

    describe('Disabled States', () => {
        it('should not handle undo/redo when undoRedoEnabled is false', () => {
            renderWithUndoRedo({undoRedoEnabled: false});

            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();
        });

        it('should not handle shortcuts when isEnabled is false', () => {
            renderWithUndoRedo({isEnabled: false});

            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();
        });

        it('should handle gracefully when UndoRedoProvider is not available', () => {
            // Render without UndoRedoProvider
            renderWithoutUndoRedo();

            // Should not throw error
            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should provide screen reader announcements for undo operations', async () => {
            const {container} = renderWithUndoRedo();

            // Create history
            act(() => {
                mockMutateMapText('new map text');
            });

            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });
            });

            const announcement = screen.getByRole('status');
            expect(announcement).toHaveAttribute('aria-live', 'polite');
            expect(announcement).toHaveAttribute('aria-atomic', 'true');
            expect(announcement).toHaveTextContent(/Undid:/);
        });

        it('should provide screen reader announcements for redo operations', async () => {
            const {container} = renderWithUndoRedo();

            // Create history, undo, then redo
            act(() => {
                mockMutateMapText('new map text');
            });

            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });
            });

            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'y',
                    ctrlKey: true,
                });
            });

            const announcement = screen.getByRole('status');
            expect(announcement).toHaveTextContent(/Redid:/);
        });

        it('should clear announcements after timeout', async () => {
            jest.useFakeTimers();
            const {container} = renderWithUndoRedo();

            act(() => {
                mockMutateMapText('new map text');
            });

            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });
            });

            expect(screen.getByText(/Undid:/)).toBeInTheDocument();

            // Fast forward time
            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();

            jest.useRealTimers();
        });
    });

    describe('Edge Cases', () => {
        it('should handle multiple modifier keys correctly', () => {
            renderWithUndoRedo();

            // Should not trigger with extra modifiers
            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
                altKey: true, // Extra modifier
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();
        });

        it('should handle case insensitive key detection', async () => {
            const {container} = renderWithUndoRedo();

            act(() => {
                mockMutateMapText('new map text');
            });

            // Test with uppercase Z
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'Z',
                    ctrlKey: true,
                });
            });

            expect(screen.getByText(/Undid:/)).toBeInTheDocument();
        });

        it('should handle rapid key presses without issues', async () => {
            const {container} = renderWithUndoRedo();

            // Create multiple history entries
            act(() => {
                mockMutateMapText('text 1');
                mockMutateMapText('text 2');
                mockMutateMapText('text 3');
            });

            // Rapid undo operations
            await act(async () => {
                fireEvent.keyDown(document, {key: 'z', ctrlKey: true});
                fireEvent.keyDown(document, {key: 'z', ctrlKey: true});
                fireEvent.keyDown(document, {key: 'z', ctrlKey: true});
            });

            // Should handle gracefully without errors
            expect(screen.getByText(/Undid:/)).toBeInTheDocument();
        });
    });

    describe('Component Deletion Shortcuts', () => {
        it('should handle Delete key when component is selected', () => {
            renderWithUndoRedo({
                selectedComponentId: 'test-component',
                onDeleteComponent: mockOnDeleteComponent,
            });

            fireEvent.keyDown(document, {
                key: 'Delete',
            });

            expect(mockOnDeleteComponent).toHaveBeenCalledWith('test-component');
            expect(screen.getByText('Component deleted')).toBeInTheDocument();
        });

        it('should handle Backspace key when component is selected', () => {
            renderWithUndoRedo({
                selectedComponentId: 'test-component',
                onDeleteComponent: mockOnDeleteComponent,
            });

            fireEvent.keyDown(document, {
                key: 'Backspace',
            });

            expect(mockOnDeleteComponent).toHaveBeenCalledWith('test-component');
            expect(screen.getByText('Component deleted')).toBeInTheDocument();
        });

        it('should not handle deletion when no component is selected', () => {
            renderWithUndoRedo({
                selectedComponentId: null,
                onDeleteComponent: mockOnDeleteComponent,
            });

            fireEvent.keyDown(document, {
                key: 'Delete',
            });

            expect(mockOnDeleteComponent).not.toHaveBeenCalled();
            expect(screen.queryByText('Component deleted')).not.toBeInTheDocument();
        });

        it('should not handle deletion when onDeleteComponent is not provided', () => {
            renderWithUndoRedo({
                selectedComponentId: 'test-component',
                onDeleteComponent: undefined,
            });

            fireEvent.keyDown(document, {
                key: 'Delete',
            });

            expect(mockOnDeleteComponent).not.toHaveBeenCalled();
            expect(screen.queryByText('Component deleted')).not.toBeInTheDocument();
        });

        it('should not handle deletion with modifier keys', () => {
            renderWithUndoRedo({
                selectedComponentId: 'test-component',
                onDeleteComponent: mockOnDeleteComponent,
            });

            fireEvent.keyDown(document, {
                key: 'Delete',
                ctrlKey: true,
            });

            expect(mockOnDeleteComponent).not.toHaveBeenCalled();
            expect(screen.queryByText('Component deleted')).not.toBeInTheDocument();
        });

        it('should not handle deletion when focus is on text input', () => {
            renderWithUndoRedo({
                selectedComponentId: 'test-component',
                onDeleteComponent: mockOnDeleteComponent,
            });

            const input = document.createElement('input');
            document.body.appendChild(input);
            input.focus();

            fireEvent.keyDown(document, {
                key: 'Delete',
            });

            expect(mockOnDeleteComponent).not.toHaveBeenCalled();
            expect(screen.queryByText('Component deleted')).not.toBeInTheDocument();

            document.body.removeChild(input);
        });

        it('should prevent default behavior when deletion is triggered', () => {
            renderWithUndoRedo({
                selectedComponentId: 'test-component',
                onDeleteComponent: mockOnDeleteComponent,
            });

            const event = new KeyboardEvent('keydown', {
                key: 'Delete',
                bubbles: true,
                cancelable: true,
            });

            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

            fireEvent(document, event);

            expect(preventDefaultSpy).toHaveBeenCalled();
            expect(mockOnDeleteComponent).toHaveBeenCalledWith('test-component');
        });

        it('should provide screen reader announcement for deletion', () => {
            renderWithUndoRedo({
                selectedComponentId: 'test-component',
                onDeleteComponent: mockOnDeleteComponent,
            });

            fireEvent.keyDown(document, {
                key: 'Delete',
            });

            const announcement = screen.getByRole('status');
            expect(announcement).toHaveAttribute('aria-live', 'polite');
            expect(announcement).toHaveAttribute('aria-atomic', 'true');
            expect(announcement).toHaveTextContent('Component deleted');
        });

        it('should clear deletion announcement after timeout', () => {
            jest.useFakeTimers();

            renderWithUndoRedo({
                selectedComponentId: 'test-component',
                onDeleteComponent: mockOnDeleteComponent,
            });

            fireEvent.keyDown(document, {
                key: 'Delete',
            });

            expect(screen.getByText('Component deleted')).toBeInTheDocument();

            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(screen.queryByText('Component deleted')).not.toBeInTheDocument();

            jest.useRealTimers();
        });

        it('should prioritize deletion over toolbar shortcuts', () => {
            renderWithUndoRedo({
                selectedComponentId: 'test-component',
                onDeleteComponent: mockOnDeleteComponent,
            });

            // Delete key should trigger deletion, not any toolbar shortcut
            fireEvent.keyDown(document, {
                key: 'Delete',
            });

            expect(mockOnDeleteComponent).toHaveBeenCalledWith('test-component');
            expect(mockOnToolSelect).not.toHaveBeenCalled();
        });
    });
});
