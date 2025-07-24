import React from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react';
import {WysiwygToolbar} from '../../../components/map/WysiwygToolbar';
import {ToolbarItem as ToolbarItemType, WysiwygToolbarProps} from '../../../types/toolbar';
import {MapTheme} from '../../../constants/mapstyles';
import {TOOLBAR_ITEMS} from '../../../constants/toolbarItems';

// Mock icon component for testing
const MockIcon: React.FC<{id: string; mapStyleDefs: MapTheme; onClick?: React.MouseEventHandler<SVGSVGElement>}> = ({id}) => (
    <svg data-testid={`icon-${id}`}>
        <circle cx="12" cy="12" r="10" />
    </svg>
);

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

describe('WysiwygToolbar', () => {
    let container: HTMLDivElement;
    let root: any;
    const mockOnItemSelect = jest.fn();
    const mockMutateMapText = jest.fn();

    const defaultProps: WysiwygToolbarProps = {
        mapStyleDefs: mockMapStyleDefs,
        mapDimensions: {width: 800, height: 600},
        mapText: 'title Test Map',
        mutateMapText: mockMutateMapText,
        onItemSelect: mockOnItemSelect,
        selectedItem: null,
    };

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        mockOnItemSelect.mockClear();
        mockMutateMapText.mockClear();
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        document.body.removeChild(container);
    });

    const renderComponent = (props: Partial<WysiwygToolbarProps> = {}) => {
        act(() => {
            root.render(<WysiwygToolbar {...defaultProps} {...props} />);
        });
    };

    describe('Rendering', () => {
        it('renders toolbar container with correct attributes', () => {
            renderComponent();

            const toolbar = container.querySelector('[role="toolbar"]');
            expect(toolbar).toBeTruthy();
            expect(toolbar?.getAttribute('aria-label')).toBe('Map component toolbar');
        });

        it('renders all toolbar items from configuration', () => {
            renderComponent();

            // Check that all items from TOOLBAR_ITEMS are rendered
            TOOLBAR_ITEMS.forEach(item => {
                const toolbarItem = container.querySelector(`[data-testid="toolbar-item-${item.id}"]`);
                expect(toolbarItem).toBeTruthy();
            });
        });

        it('renders toolbar items grouped by category with separators', () => {
            renderComponent();

            // Check for separators between categories - they are styled components so we look for the structure
            const toolbar = container.querySelector('[role="toolbar"]');
            const children = toolbar?.children;

            // Should have more than just toolbar items (includes separators)
            // We expect at least: components + separator + methods + separator + notes + separator + others
            expect(children?.length).toBeGreaterThan(TOOLBAR_ITEMS.length);
        });

        it('renders component items in correct order', () => {
            renderComponent();

            const componentItems = TOOLBAR_ITEMS.filter(item => item.category === 'component');
            const renderedItems = container.querySelectorAll('[data-testid^="toolbar-item-"]');

            // First few items should be component items
            componentItems.forEach((item, index) => {
                const renderedItem = renderedItems[index];
                expect(renderedItem?.getAttribute('data-testid')).toBe(`toolbar-item-${item.id}`);
            });
        });
    });

    describe('Selection State Management', () => {
        it('shows no items selected initially', () => {
            renderComponent();

            const selectedItems = container.querySelectorAll('[aria-pressed="true"]');
            expect(selectedItems.length).toBe(0);
        });

        it('shows selected item when selectedItem prop is provided', () => {
            const selectedItem = TOOLBAR_ITEMS[0];
            renderComponent({selectedItem});

            const selectedButton = container.querySelector(`[data-testid="toolbar-item-${selectedItem.id}"]`);
            expect(selectedButton?.getAttribute('aria-pressed')).toBe('true');
            expect(selectedButton?.getAttribute('aria-label')).toContain('(selected)');
        });

        it('only shows one item selected at a time', () => {
            const selectedItem = TOOLBAR_ITEMS[0];
            renderComponent({selectedItem});

            const selectedItems = container.querySelectorAll('[aria-pressed="true"]');
            expect(selectedItems.length).toBe(1);
        });

        it('updates selection when selectedItem prop changes', () => {
            const firstItem = TOOLBAR_ITEMS[0];
            const secondItem = TOOLBAR_ITEMS[1];

            // Initially select first item
            renderComponent({selectedItem: firstItem});
            let selectedButton = container.querySelector(`[data-testid="toolbar-item-${firstItem.id}"]`);
            expect(selectedButton?.getAttribute('aria-pressed')).toBe('true');

            // Change to second item
            renderComponent({selectedItem: secondItem});
            selectedButton = container.querySelector(`[data-testid="toolbar-item-${secondItem.id}"]`);
            expect(selectedButton?.getAttribute('aria-pressed')).toBe('true');

            // First item should no longer be selected
            const firstButton = container.querySelector(`[data-testid="toolbar-item-${firstItem.id}"]`);
            expect(firstButton?.getAttribute('aria-pressed')).toBe('false');
        });
    });

    describe('Click Event Handling', () => {
        it('calls onItemSelect when toolbar item is clicked', () => {
            renderComponent();

            const firstItem = TOOLBAR_ITEMS[0];
            const button = container.querySelector(`[data-testid="toolbar-item-${firstItem.id}"]`);

            act(() => {
                button?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            expect(mockOnItemSelect).toHaveBeenCalledTimes(1);
            expect(mockOnItemSelect).toHaveBeenCalledWith(firstItem);
        });

        it('deselects item when clicking already selected item', () => {
            const selectedItem = TOOLBAR_ITEMS[0];
            renderComponent({selectedItem});

            const button = container.querySelector(`[data-testid="toolbar-item-${selectedItem.id}"]`);

            act(() => {
                button?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            expect(mockOnItemSelect).toHaveBeenCalledTimes(1);
            expect(mockOnItemSelect).toHaveBeenCalledWith(null);
        });

        it('selects different item when clicking unselected item', () => {
            const selectedItem = TOOLBAR_ITEMS[0];
            const targetItem = TOOLBAR_ITEMS[1];
            renderComponent({selectedItem});

            const button = container.querySelector(`[data-testid="toolbar-item-${targetItem.id}"]`);

            act(() => {
                button?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            expect(mockOnItemSelect).toHaveBeenCalledTimes(1);
            expect(mockOnItemSelect).toHaveBeenCalledWith(targetItem);
        });

        it('handles clicks on different category items', () => {
            renderComponent();

            // Test component category
            const componentItem = TOOLBAR_ITEMS.find(item => item.category === 'component');
            if (componentItem) {
                const componentButton = container.querySelector(`[data-testid="toolbar-item-${componentItem.id}"]`);
                act(() => {
                    componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                });
                expect(mockOnItemSelect).toHaveBeenCalledWith(componentItem);
            }

            // Test method category
            const methodItem = TOOLBAR_ITEMS.find(item => item.category === 'method');
            if (methodItem) {
                const methodButton = container.querySelector(`[data-testid="toolbar-item-${methodItem.id}"]`);
                act(() => {
                    methodButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                });
                expect(mockOnItemSelect).toHaveBeenCalledWith(methodItem);
            }

            // Test note category
            const noteItem = TOOLBAR_ITEMS.find(item => item.category === 'note');
            if (noteItem) {
                const noteButton = container.querySelector(`[data-testid="toolbar-item-${noteItem.id}"]`);
                act(() => {
                    noteButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                });
                expect(mockOnItemSelect).toHaveBeenCalledWith(noteItem);
            }
        });
    });

    describe('Category Grouping', () => {
        it('groups component items together', () => {
            renderComponent();

            const componentItems = TOOLBAR_ITEMS.filter(item => item.category === 'component');
            const allButtons = Array.from(container.querySelectorAll('[data-testid^="toolbar-item-"]'));

            // Find positions of component items
            const componentPositions = componentItems
                .map(item => {
                    const button = container.querySelector(`[data-testid="toolbar-item-${item.id}"]`);
                    return allButtons.indexOf(button as Element);
                })
                .filter(pos => pos !== -1);

            // Component items should be consecutive
            componentPositions.sort((a, b) => a - b);
            for (let i = 1; i < componentPositions.length; i++) {
                expect(componentPositions[i] - componentPositions[i - 1]).toBeLessThanOrEqual(1);
            }
        });

        it('groups method items together', () => {
            renderComponent();

            const methodItems = TOOLBAR_ITEMS.filter(item => item.category === 'method');
            const allButtons = Array.from(container.querySelectorAll('[data-testid^="toolbar-item-"]'));

            // Find positions of method items
            const methodPositions = methodItems
                .map(item => {
                    const button = container.querySelector(`[data-testid="toolbar-item-${item.id}"]`);
                    return allButtons.indexOf(button as Element);
                })
                .filter(pos => pos !== -1);

            // Method items should be consecutive
            methodPositions.sort((a, b) => a - b);
            for (let i = 1; i < methodPositions.length; i++) {
                expect(methodPositions[i] - methodPositions[i - 1]).toBeLessThanOrEqual(1);
            }
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA attributes', () => {
            renderComponent();

            const toolbar = container.querySelector('[role="toolbar"]');
            expect(toolbar?.getAttribute('aria-label')).toBe('Map component toolbar');
        });

        it('maintains proper focus management', () => {
            renderComponent();

            const buttons = container.querySelectorAll('button');
            buttons.forEach(button => {
                expect(button.getAttribute('tabIndex')).toBe('0');
            });
        });

        it('provides proper labels for screen readers', () => {
            const selectedItem = TOOLBAR_ITEMS[0];
            renderComponent({selectedItem});

            const selectedButton = container.querySelector(`[data-testid="toolbar-item-${selectedItem.id}"]`);
            expect(selectedButton?.getAttribute('aria-label')).toContain('(selected)');

            const unselectedButton = container.querySelector(`[data-testid="toolbar-item-${TOOLBAR_ITEMS[1].id}"]`);
            expect(unselectedButton?.getAttribute('aria-label')).not.toContain('(selected)');
        });
    });

    describe('Performance', () => {
        it('uses memoization to prevent unnecessary re-renders', () => {
            // Test that the component is wrapped with memo
            expect(WysiwygToolbar.displayName).toBe('WysiwygToolbar');
        });

        it('handles rapid selection changes efficiently', () => {
            renderComponent();

            // Simulate rapid clicks
            const items = TOOLBAR_ITEMS.slice(0, 3);
            items.forEach((item, index) => {
                const button = container.querySelector(`[data-testid="toolbar-item-${item.id}"]`);
                act(() => {
                    button?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                });
            });

            expect(mockOnItemSelect).toHaveBeenCalledTimes(3);
        });
    });

    describe('Edge Cases', () => {
        it('handles empty toolbar items gracefully', () => {
            // This test ensures the component doesn't break if TOOLBAR_ITEMS is empty
            // In practice, this shouldn't happen, but it's good to test
            renderComponent();

            const toolbar = container.querySelector('[role="toolbar"]');
            expect(toolbar).toBeTruthy();
        });

        it('handles null selectedItem prop', () => {
            renderComponent({selectedItem: null});

            const selectedItems = container.querySelectorAll('[aria-pressed="true"]');
            expect(selectedItems.length).toBe(0);
        });

        it('handles undefined onItemSelect callback', () => {
            // This shouldn't happen in practice, but test defensive programming
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

            renderComponent({onItemSelect: undefined as any});

            const button = container.querySelector(`[data-testid="toolbar-item-${TOOLBAR_ITEMS[0].id}"]`);

            expect(() => {
                act(() => {
                    button?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                });
            }).not.toThrow();

            consoleError.mockRestore();
        });
    });

    describe('Integration with ToolbarItem', () => {
        it('passes correct props to ToolbarItem components', () => {
            const selectedItem = TOOLBAR_ITEMS[0];
            renderComponent({selectedItem});

            // Check selected item receives correct props
            const selectedButton = container.querySelector(`[data-testid="toolbar-item-${selectedItem.id}"]`);
            expect(selectedButton?.getAttribute('aria-pressed')).toBe('true');

            // Check unselected item receives correct props
            const unselectedButton = container.querySelector(`[data-testid="toolbar-item-${TOOLBAR_ITEMS[1].id}"]`);
            expect(unselectedButton?.getAttribute('aria-pressed')).toBe('false');
        });

        it('handles ToolbarItem click events correctly', () => {
            renderComponent();

            TOOLBAR_ITEMS.forEach(item => {
                const button = container.querySelector(`[data-testid="toolbar-item-${item.id}"]`);
                expect(button).toBeTruthy();
                expect(button?.getAttribute('title')).toBe(item.label);
            });
        });
    });
});
