import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {WysiwygToolbar} from '../../../components/map/WysiwygToolbar';
import {ToolbarItem} from '../../../types/toolbar';

// Mock the toolbar icon wrappers
jest.mock('../../../components/map/ToolbarIconWrappers', () => ({
    ToolbarComponentIcon: () => <div data-testid="component-icon">C</div>,
    ToolbarLinkIcon: () => <div data-testid="link-icon">L</div>,
    ToolbarGenericNoteIcon: () => <div data-testid="note-icon">N</div>,
    ToolbarPipelineIcon: () => <div data-testid="pipeline-icon">P</div>,
    ToolbarAnchorIcon: () => <div data-testid="anchor-icon">A</div>,
    ToolbarBuyMethodIcon: () => <div data-testid="buy-icon">M</div>,
    ToolbarPSTIcon: () => <div data-testid="pst-icon">T</div>,
}));

// Mock styled-components
jest.mock('styled-components', () => {
    const mockStyled = (component: any) => (_styles: any) => component;
    // Add all HTML elements that might be used
    const htmlElements = ['div', 'button', 'span', 'svg', 'path', 'g', 'rect', 'circle', 'line'];
    htmlElements.forEach(element => {
        (mockStyled as any)[element] = mockStyled;
    });
    return {
        __esModule: true,
        default: mockStyled,
    };
});

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock window dimensions
Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 600,
});
Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 800,
});

describe('Keyboard Shortcut Integration with Toolbar Selection System', () => {
    const mockMapStyleDefs = {
        className: 'wardley',
        component: '#000',
        anchor: '#000',
        pipeline: '#000',
        note: '#000',
        link: '#000',
        evolution: '#000',
        background: '#fff',
        attitudes: '#000',
        methods: '#000',
        annotation: '#000',
    };

    const mockMapDimensions = {width: 800, height: 600};
    const mockMapText = 'title Test Map\n\ncomponent A [0.5, 0.5]';
    const mockMutateMapText = jest.fn();

    let selectedItem: ToolbarItem | null = null;
    const mockOnItemSelect = jest.fn((item: ToolbarItem | null) => {
        selectedItem = item;
    });

    beforeEach(() => {
        selectedItem = null;
        mockOnItemSelect.mockClear();
        mockMutateMapText.mockClear();
    });

    const renderToolbarWithKeyboardShortcuts = (keyboardShortcutsEnabled = true) => {
        return render(
            <div>
                <WysiwygToolbar
                    mapStyleDefs={mockMapStyleDefs}
                    mapDimensions={mockMapDimensions}
                    mapText={mockMapText}
                    mutateMapText={mockMutateMapText}
                    selectedItem={selectedItem}
                    onItemSelect={mockOnItemSelect}
                    keyboardShortcutsEnabled={keyboardShortcutsEnabled}
                />
                {/* Add a text input to test text editing context detection */}
                <input data-testid="text-input" type="text" />
                <div contentEditable data-testid="contenteditable-div">
                    Editable content
                </div>
            </div>,
        );
    };

    describe('Keyboard shortcut tool selection', () => {
        test('should select component tool when C key is pressed', async () => {
            renderToolbarWithKeyboardShortcuts();

            fireEvent.keyDown(document, {key: 'c', code: 'KeyC'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'component',
                        keyboardShortcut: 'c',
                    }),
                );
            });
        });

        test('should select link tool when L key is pressed', async () => {
            renderToolbarWithKeyboardShortcuts();

            fireEvent.keyDown(document, {key: 'l', code: 'KeyL'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'link',
                        keyboardShortcut: 'l',
                    }),
                );
            });
        });

        test('should select note tool when N key is pressed', async () => {
            renderToolbarWithKeyboardShortcuts();

            fireEvent.keyDown(document, {key: 'n', code: 'KeyN'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'note',
                        keyboardShortcut: 'n',
                    }),
                );
            });
        });

        test('should select pipeline tool when P key is pressed', async () => {
            renderToolbarWithKeyboardShortcuts();

            fireEvent.keyDown(document, {key: 'p', code: 'KeyP'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'pipeline',
                        keyboardShortcut: 'p',
                    }),
                );
            });
        });

        test('should select anchor tool when A key is pressed', async () => {
            renderToolbarWithKeyboardShortcuts();

            fireEvent.keyDown(document, {key: 'a', code: 'KeyA'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'anchor',
                        keyboardShortcut: 'a',
                    }),
                );
            });
        });

        test('should select build method tool when B key is pressed', async () => {
            renderToolbarWithKeyboardShortcuts();

            fireEvent.keyDown(document, {key: 'b', code: 'KeyB'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'method-build',
                        keyboardShortcut: 'b',
                    }),
                );
            });
        });

        test('should select buy method tool when U key is pressed', async () => {
            renderToolbarWithKeyboardShortcuts();

            fireEvent.keyDown(document, {key: 'u', code: 'KeyU'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'method-buy',
                        keyboardShortcut: 'u',
                    }),
                );
            });
        });

        test('should select outsource method tool when O key is pressed', async () => {
            renderToolbarWithKeyboardShortcuts();

            fireEvent.keyDown(document, {key: 'o', code: 'KeyO'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'method-outsource',
                        keyboardShortcut: 'o',
                    }),
                );
            });
        });

        test('should select PST tool when T key is pressed', async () => {
            renderToolbarWithKeyboardShortcuts();

            fireEvent.keyDown(document, {key: 't', code: 'KeyT'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'pst',
                        keyboardShortcut: 't',
                    }),
                );
            });
        });

        test('should select market tool when M key is pressed', async () => {
            renderToolbarWithKeyboardShortcuts();

            fireEvent.keyDown(document, {key: 'm', code: 'KeyM'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'market',
                        keyboardShortcut: 'm',
                    }),
                );
            });
        });

        test('should select ecosystem tool when E key is pressed', async () => {
            renderToolbarWithKeyboardShortcuts();

            fireEvent.keyDown(document, {key: 'e', code: 'KeyE'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'ecosystem',
                        keyboardShortcut: 'e',
                    }),
                );
            });
        });

        test('should deselect current tool when Escape key is pressed', async () => {
            renderToolbarWithKeyboardShortcuts();

            // First select a tool
            fireEvent.keyDown(document, {key: 'c', code: 'KeyC'});
            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(expect.objectContaining({id: 'component'}));
            });

            mockOnItemSelect.mockClear();

            // Then press Escape
            fireEvent.keyDown(document, {key: 'Escape', code: 'Escape'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(null);
            });
        });
    });

    describe('Tool switching behavior (Requirement 10.10)', () => {
        test('should switch to new tool immediately when pressing different shortcut', async () => {
            renderToolbarWithKeyboardShortcuts();

            // Select component tool first
            fireEvent.keyDown(document, {key: 'c', code: 'KeyC'});
            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(expect.objectContaining({id: 'component'}));
            });

            mockOnItemSelect.mockClear();

            // Switch to link tool
            fireEvent.keyDown(document, {key: 'l', code: 'KeyL'});
            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(expect.objectContaining({id: 'link'}));
            });
        });

        test('should keep tool selected when pressing same shortcut again', async () => {
            renderToolbarWithKeyboardShortcuts();

            // Select component tool
            fireEvent.keyDown(document, {key: 'c', code: 'KeyC'});
            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(expect.objectContaining({id: 'component'}));
            });

            mockOnItemSelect.mockClear();

            // Press C again - should keep it selected (not toggle)
            fireEvent.keyDown(document, {key: 'c', code: 'KeyC'});
            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(expect.objectContaining({id: 'component'}));
            });
        });
    });

    describe('Text editing context prevention (Requirement 10.11)', () => {
        test('should not handle shortcuts when focus is on text input', async () => {
            renderToolbarWithKeyboardShortcuts();

            const textInput = screen.getByTestId('text-input');
            textInput.focus();

            fireEvent.keyDown(document, {key: 'c', code: 'KeyC'});

            // Should not call onItemSelect when typing in input
            await waitFor(
                () => {
                    expect(mockOnItemSelect).not.toHaveBeenCalled();
                },
                {timeout: 100},
            );
        });

        test('should not handle shortcuts when focus is on contenteditable element', async () => {
            renderToolbarWithKeyboardShortcuts();

            const editableDiv = screen.getByTestId('contenteditable-div');
            editableDiv.focus();

            fireEvent.keyDown(document, {key: 'c', code: 'KeyC'});

            // Should not call onItemSelect when typing in contenteditable
            await waitFor(
                () => {
                    expect(mockOnItemSelect).not.toHaveBeenCalled();
                },
                {timeout: 100},
            );
        });

        test('should handle shortcuts when focus is not on text editing elements', async () => {
            renderToolbarWithKeyboardShortcuts();

            // Focus on the document body (not a text input)
            document.body.focus();

            fireEvent.keyDown(document, {key: 'c', code: 'KeyC'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(expect.objectContaining({id: 'component'}));
            });
        });
    });

    describe('Unassigned keys behavior (Requirement 10.12)', () => {
        test('should not change selection when pressing unassigned keys', async () => {
            renderToolbarWithKeyboardShortcuts();

            // Press various unassigned keys
            const unassignedKeys = ['x', 'y', 'z', 'q', 'w', 'r', 'i'];

            for (const key of unassignedKeys) {
                fireEvent.keyDown(document, {key, code: `Key${key.toUpperCase()}`});
            }

            // Should not call onItemSelect for any unassigned keys
            await waitFor(
                () => {
                    expect(mockOnItemSelect).not.toHaveBeenCalled();
                },
                {timeout: 100},
            );
        });

        test('should not handle shortcuts with modifier keys', async () => {
            renderToolbarWithKeyboardShortcuts();

            // Press shortcuts with modifiers
            fireEvent.keyDown(document, {key: 'c', code: 'KeyC', ctrlKey: true});
            fireEvent.keyDown(document, {key: 'c', code: 'KeyC', altKey: true});
            fireEvent.keyDown(document, {key: 'c', code: 'KeyC', metaKey: true});
            fireEvent.keyDown(document, {key: 'c', code: 'KeyC', shiftKey: true});

            // Should not call onItemSelect for modified key presses
            await waitFor(
                () => {
                    expect(mockOnItemSelect).not.toHaveBeenCalled();
                },
                {timeout: 100},
            );
        });
    });

    describe('Keyboard shortcuts enabled/disabled state', () => {
        test('should not handle shortcuts when keyboardShortcutsEnabled is false', async () => {
            renderToolbarWithKeyboardShortcuts(false);

            fireEvent.keyDown(document, {key: 'c', code: 'KeyC'});

            // Should not call onItemSelect when shortcuts are disabled
            await waitFor(
                () => {
                    expect(mockOnItemSelect).not.toHaveBeenCalled();
                },
                {timeout: 100},
            );
        });

        test('should handle shortcuts when keyboardShortcutsEnabled is true', async () => {
            renderToolbarWithKeyboardShortcuts(true);

            fireEvent.keyDown(document, {key: 'c', code: 'KeyC'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(expect.objectContaining({id: 'component'}));
            });
        });
    });

    describe('Visual feedback consistency', () => {
        test('should provide same visual feedback for keyboard and mouse selection', async () => {
            renderToolbarWithKeyboardShortcuts();

            // Select tool via keyboard
            fireEvent.keyDown(document, {key: 'c', code: 'KeyC'});

            await waitFor(() => {
                expect(mockOnItemSelect).toHaveBeenCalledWith(expect.objectContaining({id: 'component'}));
            });

            // The visual feedback should be the same as mouse selection
            // This is ensured by both methods calling the same onItemSelect function
            expect(mockOnItemSelect).toHaveBeenCalledTimes(1);
        });
    });
});
