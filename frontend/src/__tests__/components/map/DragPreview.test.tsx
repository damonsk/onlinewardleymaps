import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {DragPreview} from '../../../components/map/DragPreview';
import {MapTheme} from '../../../constants/mapstyles';
import {DragPreviewProps, ToolbarItem} from '../../../types/toolbar';

// Mock icon component for testing
const MockIcon: React.FC<{id: string; mapStyleDefs: MapTheme; onClick?: React.MouseEventHandler<SVGSVGElement>}> = ({id}) => (
    <svg data-testid={`icon-${id}`}>
        <circle cx="12" cy="12" r="10" />
    </svg>
);

// Mock toolbar item for testing
const mockToolbarItem: ToolbarItem = {
    id: 'test-component',
    label: 'Test Component',
    icon: MockIcon,
    template: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}]`,
    category: 'component',
    defaultName: 'Test Component',
};

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

describe('DragPreview', () => {
    let container: HTMLDivElement;
    let root: any;

    const defaultProps: DragPreviewProps = {
        selectedItem: mockToolbarItem,
        mousePosition: {x: 100, y: 200},
        isValidDropZone: true,
        mapStyleDefs: mockMapStyleDefs,
    };

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        document.body.removeChild(container);
    });

    const renderComponent = (props: Partial<DragPreviewProps> = {}) => {
        act(() => {
            root.render(<DragPreview {...defaultProps} {...props} />);
        });
    };

    describe('Rendering', () => {
        it('renders drag preview when selectedItem is provided', () => {
            renderComponent();

            const preview = container.querySelector('[data-testid="drag-preview"]');
            expect(preview).toBeTruthy();
            expect(preview?.getAttribute('role')).toBe('img');
            expect(preview?.getAttribute('aria-label')).toBe('Dragging Test Component');
        });

        it('does not render when selectedItem is null', () => {
            renderComponent({selectedItem: null});

            const preview = container.querySelector('[data-testid="drag-preview"]');
            expect(preview).toBeFalsy();
        });

        it('renders icon component with correct props', () => {
            renderComponent();

            const icon = container.querySelector('[data-testid="icon-preview-test-component"]');
            expect(icon).toBeTruthy();
        });

        it('renders component label', () => {
            renderComponent();

            const label = container.textContent;
            expect(label).toContain('Click to Drop');
        });

        it('renders drop zone indicator text', () => {
            renderComponent({isValidDropZone: true});

            const text = container.textContent;
            expect(text).toContain('Click to Drop');
        });

        it('renders invalid drop zone indicator text', () => {
            renderComponent({isValidDropZone: false});

            const text = container.textContent;
            expect(text).toContain('Invalid drop zone');
        });
    });

    describe('Positioning', () => {
        it('renders at different mouse positions without error', () => {
            const positions = [
                {x: 150, y: 250},
                {x: 0, y: 0},
                {x: 9999, y: 9999},
            ];

            positions.forEach(position => {
                renderComponent({mousePosition: position});
                const preview = container.querySelector('[data-testid="drag-preview"]');
                expect(preview).toBeInTheDocument();
            });
        });
    });

    describe('Drop Zone States', () => {
        it('shows appropriate feedback for valid and invalid drop zones', () => {
            // Valid drop zone
            renderComponent({isValidDropZone: true});
            expect(container.textContent).toContain('Click to Drop');

            // Invalid drop zone
            renderComponent({isValidDropZone: false});
            expect(container.textContent).toContain('Invalid drop zone');
        });
    });

    describe('Visibility Management', () => {
        it('shows preview when selectedItem is provided', async () => {
            renderComponent();

            const preview = container.querySelector('[data-testid="drag-preview"]');
            expect(preview).toBeTruthy();
        });

        it('hides preview when selectedItem becomes null', () => {
            renderComponent({selectedItem: mockToolbarItem});

            let preview = container.querySelector('[data-testid="drag-preview"]');
            expect(preview).toBeTruthy();

            renderComponent({selectedItem: null});

            preview = container.querySelector('[data-testid="drag-preview"]');
            expect(preview).toBeFalsy();
        });

        it('handles rapid selection changes', () => {
            const item1 = {...mockToolbarItem, id: 'item1', label: 'Item 1'};
            const item2 = {...mockToolbarItem, id: 'item2', label: 'Item 2'};

            renderComponent({selectedItem: item1});
            expect(container.textContent).toContain('Click to Drop');

            renderComponent({selectedItem: item2});
            expect(container.textContent).toContain('Click to Drop');

            renderComponent({selectedItem: null});
            const preview = container.querySelector('[data-testid="drag-preview"]');
            expect(preview).toBeFalsy();
        });
    });

    describe('Different Toolbar Items', () => {
        it('renders different component types correctly', () => {
            const noteItem: ToolbarItem = {
                id: 'note',
                label: 'Note',
                icon: MockIcon,
                template: (name: string, y: string, x: string) => `note ${name} [${y}, ${x}]`,
                category: 'note',
                defaultName: 'New Note',
            };

            renderComponent({selectedItem: noteItem});

            const preview = container.querySelector('[data-testid="drag-preview"]');
            expect(preview?.getAttribute('aria-label')).toBe('Dragging Note');
            expect(container.textContent).toContain('Click to Drop');

            const icon = container.querySelector('[data-testid="icon-preview-note"]');
            expect(icon).toBeTruthy();
        });

        it('renders method items correctly', () => {
            const methodItem: ToolbarItem = {
                id: 'buy',
                label: 'Buy',
                icon: MockIcon,
                template: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}] (buy)`,
                category: 'method',
                defaultName: 'Buy Component',
            };

            renderComponent({selectedItem: methodItem});

            const preview = container.querySelector('[data-testid="drag-preview"]');
            expect(preview?.getAttribute('aria-label')).toBe('Dragging Buy');
            expect(container.textContent).toContain('Click to Drop');

            const icon = container.querySelector('[data-testid="icon-preview-buy"]');
            expect(icon).toBeTruthy();
        });

        it('renders pipeline items correctly', () => {
            const pipelineItem: ToolbarItem = {
                id: 'pipeline',
                label: 'Pipeline',
                icon: MockIcon,
                template: (name: string, y: string, x: string) => `pipeline ${name} [${y}, ${x}]`,
                category: 'pipeline',
                defaultName: 'New Pipeline',
            };

            renderComponent({selectedItem: pipelineItem});

            const preview = container.querySelector('[data-testid="drag-preview"]');
            expect(preview?.getAttribute('aria-label')).toBe('Dragging Pipeline');
            expect(container.textContent).toContain('Click to Drop');

            const icon = container.querySelector('[data-testid="icon-preview-pipeline"]');
            expect(icon).toBeTruthy();
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA attributes', () => {
            renderComponent();

            const preview = container.querySelector('[data-testid="drag-preview"]');
            expect(preview?.getAttribute('role')).toBe('img');
            expect(preview?.getAttribute('aria-label')).toBe('Dragging Test Component');
        });

        it('updates aria-label when selectedItem changes', () => {
            const item1 = {...mockToolbarItem, id: 'item1', label: 'Item 1'};
            const item2 = {...mockToolbarItem, id: 'item2', label: 'Item 2'};

            renderComponent({selectedItem: item1});
            let preview = container.querySelector('[data-testid="drag-preview"]');
            expect(preview?.getAttribute('aria-label')).toBe('Dragging Item 1');

            renderComponent({selectedItem: item2});
            preview = container.querySelector('[data-testid="drag-preview"]');
            expect(preview?.getAttribute('aria-label')).toBe('Dragging Item 2');
        });

        it('provides clear visual feedback for screen readers', () => {
            renderComponent({isValidDropZone: true});
            expect(container.textContent).toContain('Click to Drop');

            renderComponent({isValidDropZone: false});
            expect(container.textContent).toContain('Invalid drop zone');
        });
    });

    describe('Edge Cases', () => {
        it('handles no selected item', () => {
            renderComponent({selectedItem: null});
            const preview = container.querySelector('[data-testid="drag-preview"]');
            expect(preview).not.toBeInTheDocument();
        });

        it('handles different item types correctly', () => {
            const items = [
                {...mockToolbarItem, label: 'Component'},
                {...mockToolbarItem, label: 'Note', id: 'note'},
                {...mockToolbarItem, label: 'Pipeline', id: 'pipeline'},
            ];

            items.forEach(item => {
                renderComponent({selectedItem: item});
                const preview = container.querySelector('[data-testid="drag-preview"]');
                expect(preview?.getAttribute('aria-label')).toContain(`Dragging ${item.label}`);
            });
        });
    });
});
