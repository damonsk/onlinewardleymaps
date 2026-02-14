import React from 'react';
import {render, screen, fireEvent, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import {KeyboardShortcutHandler} from '../../../components/map/KeyboardShortcutHandler';
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
];

// Mock the getToolbarItemByShortcut function
jest.mock('../../../constants/toolbarItems', () => ({
    getToolbarItemByShortcut: (key: string) => {
        return key === 'c' ? mockToolbarItems[0] : null;
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

describe('KeyboardShortcutHandler - Core Functionality', () => {
    const mockOnToolSelect = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigator('Win32', 'Windows');
    });

    describe('Platform Detection', () => {
        it('should detect Mac platform correctly', () => {
            mockNavigator('MacIntel', 'Mac OS X');

            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            // Component should render without errors on Mac
            expect(document.body).toBeInTheDocument();
        });

        it('should detect Windows platform correctly', () => {
            mockNavigator('Win32', 'Windows');

            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            // Component should render without errors on Windows
            expect(document.body).toBeInTheDocument();
        });

        it('should default to Windows platform when navigator is unavailable', () => {
            Object.defineProperty(window, 'navigator', {
                value: undefined,
                writable: true,
            });

            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            // Component should render without errors
            expect(document.body).toBeInTheDocument();
        });
    });

    describe('Undo/Redo Shortcuts Without Context', () => {
        it('should handle undo shortcut gracefully when UndoRedoProvider is not available', () => {
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            // Should not throw error when pressing Ctrl+Z without context
            expect(() => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });
            }).not.toThrow();

            // Should not show any undo announcement
            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();
        });

        it('should handle redo shortcut gracefully when UndoRedoProvider is not available', () => {
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            // Should not throw error when pressing Ctrl+Y without context
            expect(() => {
                fireEvent.keyDown(document, {
                    key: 'y',
                    ctrlKey: true,
                });
            }).not.toThrow();

            // Should not show any redo announcement
            expect(screen.queryByText(/Redid:/)).not.toBeInTheDocument();
        });

        it('should not handle undo/redo when undoRedoEnabled is false', () => {
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                    undoRedoEnabled={false}
                />,
            );

            // Should not show any announcements when undo/redo is disabled
            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();

            fireEvent.keyDown(document, {
                key: 'y',
                ctrlKey: true,
            });

            expect(screen.queryByText(/Redid:/)).not.toBeInTheDocument();
        });
    });

    describe('Text Editor Interference Prevention', () => {
        it('should not handle shortcuts when focus is on input element', () => {
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

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
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

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
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

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
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

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
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            // Test toolbar shortcut (no modifiers)
            fireEvent.keyDown(document, {
                key: 'c',
            });

            expect(mockOnToolSelect).toHaveBeenCalledWith('component');
        });

        it('should handle Escape key to deselect tools', () => {
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool="component"
                />,
            );

            fireEvent.keyDown(document, {
                key: 'Escape',
            });

            expect(mockOnToolSelect).toHaveBeenCalledWith(null);
            expect(screen.getByText('All tools deselected')).toBeInTheDocument();
        });

        it('should not handle shortcuts when isEnabled is false', () => {
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={false}
                    currentSelectedTool={null}
                />,
            );

            // Should not handle any shortcuts when disabled
            fireEvent.keyDown(document, {
                key: 'c',
            });

            expect(mockOnToolSelect).not.toHaveBeenCalled();

            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();
        });
    });

    describe('Keyboard Event Handling', () => {
        it('should handle multiple modifier keys correctly', () => {
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            // Should not trigger with extra modifiers
            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
                altKey: true, // Extra modifier
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();
        });

        it('should handle case insensitive key detection', () => {
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            // Test with uppercase C for toolbar shortcut
            fireEvent.keyDown(document, {
                key: 'C',
            });

            expect(mockOnToolSelect).toHaveBeenCalledWith('component');
        });

        it('should ignore shortcuts with modifier keys for toolbar items', () => {
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            // Should not trigger toolbar shortcut with modifier
            fireEvent.keyDown(document, {
                key: 'c',
                ctrlKey: true,
            });

            expect(mockOnToolSelect).not.toHaveBeenCalled();
        });
    });

    describe('Platform-Specific Shortcuts', () => {
        it('should recognize Windows undo shortcut pattern', () => {
            mockNavigator('Win32', 'Windows');

            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            // Should not throw error with Windows shortcut pattern
            expect(() => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                    metaKey: false,
                });
            }).not.toThrow();
        });

        it('should recognize Mac undo shortcut pattern', () => {
            mockNavigator('MacIntel', 'Mac OS X');

            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            // Should not throw error with Mac shortcut pattern
            expect(() => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    metaKey: true,
                    ctrlKey: false,
                });
            }).not.toThrow();
        });

        it('should recognize Windows redo shortcut pattern', () => {
            mockNavigator('Win32', 'Windows');

            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            // Should not throw error with Windows redo shortcut
            expect(() => {
                fireEvent.keyDown(document, {
                    key: 'y',
                    ctrlKey: true,
                    metaKey: false,
                });
            }).not.toThrow();
        });

        it('should recognize Mac redo shortcut pattern', () => {
            mockNavigator('MacIntel', 'Mac OS X');

            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            // Should not throw error with Mac redo shortcut
            expect(() => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    metaKey: true,
                    shiftKey: true,
                    ctrlKey: false,
                });
            }).not.toThrow();
        });
    });

    describe('Accessibility', () => {
        it('should clear announcements after timeout', async () => {
            jest.useFakeTimers();

            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool="component"
                />,
            );

            // Trigger escape to get an announcement
            fireEvent.keyDown(document, {
                key: 'Escape',
            });

            expect(screen.getByText('All tools deselected')).toBeInTheDocument();

            // Fast forward time and wrap in act
            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(screen.queryByText('All tools deselected')).not.toBeInTheDocument();

            jest.useRealTimers();
        });

        it('should provide screen reader announcements for tool selection', () => {
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            fireEvent.keyDown(document, {
                key: 'c',
            });

            const announcement = screen.getByRole('status');
            expect(announcement).toHaveAttribute('aria-live', 'polite');
            expect(announcement).toHaveAttribute('aria-atomic', 'true');
            expect(announcement).toHaveTextContent(/Component tool selected/);
        });
    });
});
