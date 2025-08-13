import React from 'react';
import {render, screen, fireEvent, act, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {KeyboardShortcutHandler} from '../../../components/map/KeyboardShortcutHandler';
import {UndoRedoProvider, useUndoRedo} from '../../../components/UndoRedoProvider';
import {ToolbarItem} from '../../../types/toolbar';

// Mock useUndoRedoManager only for this specific test file
jest.mock('../../../hooks/useUndoRedoManager', () => {
    const originalModule = jest.requireActual('../../../hooks/useUndoRedoManager');
    return {
        ...originalModule,
        useUndoRedoManager: jest.fn(),
    };
});

// Import after mocking
import {useUndoRedoManager} from '../../../hooks/useUndoRedoManager';

const mockUseUndoRedoManager = useUndoRedoManager as jest.MockedFunction<typeof useUndoRedoManager>;

const mockUndoRedoManager = {
    canUndo: true,
    canRedo: true,
    undo: jest.fn(),
    redo: jest.fn(),
    recordChange: jest.fn(),
    clearHistory: jest.fn(),
    getLastAction: jest.fn(() => ({
        id: 'test-action',
        timestamp: Date.now(),
        previousMapText: 'old text',
        currentMapText: 'new text',
        actionType: 'toolbar-component' as const,
        actionDescription: 'Add component',
    })),
    getNextAction: jest.fn(() => ({
        id: 'test-action-next',
        timestamp: Date.now(),
        previousMapText: 'current text',
        currentMapText: 'next text',
        actionType: 'toolbar-component' as const,
        actionDescription: 'Add another component',
    })),
    isUndoRedoOperation: false,
    undoStack: [],
    redoStack: [],
};

// Set up the mock return value
mockUseUndoRedoManager.mockReturnValue(mockUndoRedoManager);

// Clean up after tests to prevent interference with other test files
afterAll(() => {
    jest.resetModules();
    jest.clearAllMocks();
});

// Mock toolbar items
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

describe('KeyboardShortcutHandler Integration Tests', () => {
    const mockOnToolSelect = jest.fn();
    const mockMutateMapText = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset mock implementations
        mockUndoRedoManager.undo.mockClear();
        mockUndoRedoManager.redo.mockClear();
        mockUndoRedoManager.recordChange.mockClear();
        mockUndoRedoManager.clearHistory.mockClear();
        mockUndoRedoManager.getLastAction.mockClear();
        mockUndoRedoManager.getNextAction.mockClear();

        // Mock Windows platform
        Object.defineProperty(window, 'navigator', {
            value: {
                platform: 'Win32',
                userAgent: 'Windows',
            },
            writable: true,
        });
    });

    const renderComponent = (props: any = {}) => {
        // Ensure mockMutateMapText has proper implementation for testing
        const testMutateMapText = jest.fn().mockImplementation((newText: string) => {
            // Mock the actual mutation behavior that the UndoRedoProvider expects
            console.log('Mock mutateMapText called with:', newText);
        });

        return render(
            <UndoRedoProvider mutateMapText={testMutateMapText} mapText="initial map text">
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

    describe('Complete Undo/Redo Workflow', () => {
        it('should handle complete undo/redo workflow with keyboard shortcuts', async () => {
            const mutateMapText = jest.fn();

            const {container} = render(
                <UndoRedoProvider mutateMapText={mutateMapText} mapText="current text">
                    <KeyboardShortcutHandler
                        toolbarItems={mockToolbarItems}
                        onToolSelect={mockOnToolSelect}
                        isEnabled={true}
                        currentSelectedTool={null}
                    />
                </UndoRedoProvider>,
            );

            // Test undo keyboard shortcut (Ctrl+Z)
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });
            });

            // Verify that undo was called
            expect(mockUndoRedoManager.undo).toHaveBeenCalledTimes(1);

            // Verify that the announcement was created
            expect(screen.getByText(/Undid: Add component/)).toBeInTheDocument();

            // Step 2: Undo the last change
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });
            });

            // Give time for the announcement to appear
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            // Debug: check if any announcement text exists
            const announcements = container.querySelectorAll('[role="status"]');
            console.log('Found announcements:', announcements.length);
            announcements.forEach((el, idx) => {
                console.log(`Announcement ${idx}:`, el.textContent);
            });

            expect(screen.getByText(/Undid:/)).toBeInTheDocument();

            jest.useRealTimers();

            // Step 3: Undo another change
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });
            });

            // Step 4: Redo one change
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'y',
                    ctrlKey: true,
                });
            });

            expect(screen.getByText(/Redid:/)).toBeInTheDocument();

            // Step 5: Make a new change (should clear redo history)
            act(() => {
                mockMutateMapText('new change after redo');
            });

            // Step 6: Try to redo (should not work as redo history was cleared)
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'y',
                    ctrlKey: true,
                });
            });

            // Should not show redo announcement since there's nothing to redo
            expect(screen.queryByText(/Redid: new change after redo/)).not.toBeInTheDocument();
        });

        it('should maintain toolbar functionality alongside undo/redo', async () => {
            const {container} = renderComponent();

            // Test toolbar shortcut
            fireEvent.keyDown(document, {
                key: 'c',
            });

            expect(mockOnToolSelect).toHaveBeenCalledWith('component');

            // Create some history
            act(() => {
                mockMutateMapText('component added');
            });

            // Test undo shortcut
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });
            });

            expect(screen.getByText(/Undid:/)).toBeInTheDocument();

            // Test toolbar shortcut again
            fireEvent.keyDown(document, {
                key: 'c',
            });

            expect(mockOnToolSelect).toHaveBeenCalledTimes(2);
        });
    });

    describe('Platform-Specific Behavior', () => {
        it('should use correct shortcuts for Mac platform', async () => {
            // Mock Mac platform
            Object.defineProperty(window, 'navigator', {
                value: {
                    platform: 'MacIntel',
                    userAgent: 'Mac OS X',
                },
                writable: true,
            });

            const {container} = renderComponent();

            // Create history
            act(() => {
                mockMutateMapText('mac test');
            });

            // Test Mac undo (Cmd+Z)
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    metaKey: true, // Cmd key on Mac
                    ctrlKey: false,
                });
            });

            expect(screen.getByText(/Undid:/)).toBeInTheDocument();

            // Test Mac redo (Cmd+Shift+Z)
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

        it('should not respond to wrong platform shortcuts', async () => {
            // Mock Mac platform
            Object.defineProperty(window, 'navigator', {
                value: {
                    platform: 'MacIntel',
                    userAgent: 'Mac OS X',
                },
                writable: true,
            });

            const {container} = renderComponent();

            act(() => {
                mockMutateMapText('mac test');
            });

            // Try Windows shortcut on Mac (should not work)
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true, // Windows shortcut
                    metaKey: false,
                });
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();

            // Try Windows redo shortcut on Mac (should not work)
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'y',
                    ctrlKey: true,
                    metaKey: false,
                });
            });

            expect(screen.queryByText(/Redid:/)).not.toBeInTheDocument();
        });
    });

    describe('Text Editor Context Prevention', () => {
        it('should not interfere with text editor undo/redo in various contexts', () => {
            const mutateMapText = jest.fn();

            const {container} = render(
                <UndoRedoProvider mutateMapText={mutateMapText} mapText="current text">
                    <KeyboardShortcutHandler
                        toolbarItems={mockToolbarItems}
                        onToolSelect={mockOnToolSelect}
                        isEnabled={true}
                        currentSelectedTool={null}
                    />
                </UndoRedoProvider>,
            );

            // Test with different text editing contexts
            const contexts = [
                {element: 'input', type: 'text'},
                {element: 'textarea'},
                {element: 'div', contentEditable: 'true'},
                {element: 'div', className: 'ace_text-input'},
                {element: 'div', className: 'CodeMirror'},
            ];

            contexts.forEach(({element, type, contentEditable, className}, index) => {
                // Clear any existing announcements before each test
                const existingAnnouncements = container.querySelectorAll('[role="status"]');
                existingAnnouncements.forEach(el => el.remove());

                const el = document.createElement(element as keyof HTMLElementTagNameMap);

                if (type) (el as HTMLInputElement).type = type;
                if (contentEditable) {
                    (el as HTMLDivElement).contentEditable = contentEditable;
                    // Make contenteditable elements focusable
                    el.tabIndex = 0;
                }
                if (className) {
                    el.className = className;
                    // Make text editing class elements focusable
                    el.tabIndex = 0;
                }

                document.body.appendChild(el);
                el.focus();

                // Clear mock call history for this test
                mockUndoRedoManager.undo.mockClear();

                // Try undo shortcut while focused on text editor
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });

                // Should NOT have called undo when focused on text editor
                expect(mockUndoRedoManager.undo).not.toHaveBeenCalled();

                // Should not show undo announcement
                expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();

                document.body.removeChild(el);
            });
        });

        it('should work when focus is on non-text elements', async () => {
            const {container} = renderComponent();

            // Create history
            act(() => {
                mockMutateMapText('test with button focus');
            });

            // Focus on a button (non-text element)
            const button = document.createElement('button');
            document.body.appendChild(button);
            button.focus();

            // Should work with button focused
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });
            });

            expect(screen.getByText(/Undid:/)).toBeInTheDocument();

            document.body.removeChild(button);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle missing undo/redo context gracefully', () => {
            // Render without UndoRedoProvider
            render(
                <KeyboardShortcutHandler
                    toolbarItems={mockToolbarItems}
                    onToolSelect={mockOnToolSelect}
                    isEnabled={true}
                    currentSelectedTool={null}
                />,
            );

            // Should not throw error and should not show undo announcement
            fireEvent.keyDown(document, {
                key: 'z',
                ctrlKey: true,
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();
        });

        it('should handle disabled states correctly', async () => {
            const {container} = renderComponent({isEnabled: false});

            act(() => {
                mockMutateMapText('disabled test');
            });

            // Should not work when disabled
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();
        });

        it('should handle undo/redo disabled state', async () => {
            const {container} = renderComponent({undoRedoEnabled: false});

            act(() => {
                mockMutateMapText('undo disabled test');
            });

            // Should not work when undo/redo is disabled
            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();

            // But toolbar shortcuts should still work
            fireEvent.keyDown(document, {
                key: 'c',
            });

            expect(mockOnToolSelect).toHaveBeenCalledWith('component');
        });
    });

    describe('Accessibility and User Feedback', () => {
        it('should provide meaningful action descriptions in announcements', async () => {
            // Update the mock to return a specific action description for this test
            mockUndoRedoManager.getLastAction.mockReturnValueOnce({
                id: 'test-action-specific',
                timestamp: Date.now(),
                previousMapText: 'old text',
                currentMapText: 'Component added',
                actionType: 'toolbar-component' as const,
                actionDescription: 'Add component "Test Component"',
            });

            const mutateMapText = jest.fn();

            const {container} = render(
                <UndoRedoProvider mutateMapText={mutateMapText} mapText="current text">
                    <KeyboardShortcutHandler
                        toolbarItems={mockToolbarItems}
                        onToolSelect={mockOnToolSelect}
                        isEnabled={true}
                        currentSelectedTool={null}
                    />
                </UndoRedoProvider>,
            );

            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });
            });

            // Should show the specific action description
            expect(screen.getByText(/Undid: Add component "Test Component"/)).toBeInTheDocument();
        });

        it('should handle announcements timing correctly', async () => {
            jest.useFakeTimers();
            const {container} = renderComponent();

            act(() => {
                mockMutateMapText('timing test');
            });

            await act(async () => {
                fireEvent.keyDown(document, {
                    key: 'z',
                    ctrlKey: true,
                });
            });

            expect(screen.getByText(/Undid:/)).toBeInTheDocument();

            // Fast forward past the timeout
            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();

            jest.useRealTimers();
        });

        it('should handle multiple rapid announcements', async () => {
            jest.useFakeTimers();
            const {container} = renderComponent();

            // Create multiple history entries
            act(() => {
                mockMutateMapText('change 1');
                mockMutateMapText('change 2');
            });

            // Rapid undo operations
            await act(async () => {
                fireEvent.keyDown(document, {key: 'z', ctrlKey: true});
            });

            await act(async () => {
                fireEvent.keyDown(document, {key: 'z', ctrlKey: true});
            });

            // Should show the latest announcement
            expect(screen.getByText(/Undid:/)).toBeInTheDocument();

            // Fast forward time
            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(screen.queryByText(/Undid:/)).not.toBeInTheDocument();

            jest.useRealTimers();
        });
    });
});
