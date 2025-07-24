import React from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react';
import {ToolbarItem} from '../../../components/map/ToolbarItem';
import {ToolbarItem as ToolbarItemType} from '../../../types/toolbar';
import {MapTheme} from '../../../constants/mapstyles';

// Mock icon component for testing
const MockIcon: React.FC<{id: string; mapStyleDefs: MapTheme; onClick?: React.MouseEventHandler<SVGSVGElement>}> = ({id}) => (
    <svg data-testid={`icon-${id}`}>
        <circle cx="12" cy="12" r="10" />
    </svg>
);

// Mock toolbar item for testing
const mockToolbarItem: ToolbarItemType = {
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

describe('ToolbarItem', () => {
    let container: HTMLDivElement;
    let root: any;
    const mockOnClick = jest.fn();

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        mockOnClick.mockClear();
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        document.body.removeChild(container);
    });

    const renderComponent = (props: any) => {
        act(() => {
            root.render(
                <ToolbarItem item={mockToolbarItem} isSelected={false} onClick={mockOnClick} mapStyleDefs={mockMapStyleDefs} {...props} />,
            );
        });
    };

    describe('Rendering', () => {
        it('renders toolbar item with correct attributes', () => {
            renderComponent({});

            const button = container.querySelector('button');
            expect(button).toBeTruthy();
            expect(button?.getAttribute('title')).toBe('Test Component');
            expect(button?.getAttribute('aria-label')).toBe('Test Component tool');
            expect(button?.getAttribute('aria-pressed')).toBe('false');
            expect(button?.getAttribute('tabIndex')).toBe('0');
            expect(button?.getAttribute('data-testid')).toBe('toolbar-item-test-component');
        });

        it('renders selected state correctly', () => {
            renderComponent({isSelected: true});

            const button = container.querySelector('button');
            expect(button?.getAttribute('aria-label')).toBe('Test Component tool (selected)');
            expect(button?.getAttribute('aria-pressed')).toBe('true');
        });

        it('renders icon component', () => {
            renderComponent({});

            const icon = container.querySelector('[data-testid="icon-toolbar-test-component"]');
            expect(icon).toBeTruthy();
        });
    });

    describe('Click Handling', () => {
        it('calls onClick when button is clicked', () => {
            renderComponent({});

            const button = container.querySelector('button');
            act(() => {
                button?.click();
            });

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('Keyboard Navigation', () => {
        it('calls onClick when Enter key is pressed', () => {
            renderComponent({});

            const button = container.querySelector('button');
            act(() => {
                const event = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true});
                Object.defineProperty(event, 'preventDefault', {
                    value: jest.fn(),
                    writable: true,
                });
                button?.dispatchEvent(event);
            });

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it('calls onClick when Space key is pressed', () => {
            renderComponent({});

            const button = container.querySelector('button');
            act(() => {
                const event = new KeyboardEvent('keydown', {key: ' ', bubbles: true, cancelable: true});
                Object.defineProperty(event, 'preventDefault', {
                    value: jest.fn(),
                    writable: true,
                });
                button?.dispatchEvent(event);
            });

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it('does not call onClick for other keys', () => {
            renderComponent({});

            const button = container.querySelector('button');
            act(() => {
                const escapeEvent = new KeyboardEvent('keydown', {key: 'Escape'});
                const tabEvent = new KeyboardEvent('keydown', {key: 'Tab'});
                const aEvent = new KeyboardEvent('keydown', {key: 'a'});

                button?.dispatchEvent(escapeEvent);
                button?.dispatchEvent(tabEvent);
                button?.dispatchEvent(aEvent);
            });

            expect(mockOnClick).not.toHaveBeenCalled();
        });

        it('is focusable with keyboard navigation', () => {
            renderComponent({});

            const button = container.querySelector('button');
            expect(button?.getAttribute('tabIndex')).toBe('0');
        });
    });

    describe('Visual States', () => {
        it('applies selected styling when isSelected is true', () => {
            renderComponent({isSelected: false});
            let button = container.querySelector('button');
            expect(button?.getAttribute('aria-pressed')).toBe('false');

            renderComponent({isSelected: true});
            button = container.querySelector('button');
            expect(button?.getAttribute('aria-pressed')).toBe('true');
        });
    });

    describe('Component Props', () => {
        it('handles different toolbar item types', () => {
            const noteItem: ToolbarItemType = {
                ...mockToolbarItem,
                id: 'note',
                label: 'Note',
                category: 'note',
            };

            renderComponent({item: noteItem});

            const button = container.querySelector('button');
            expect(button?.getAttribute('data-testid')).toBe('toolbar-item-note');
            expect(button?.getAttribute('aria-label')).toBe('Note tool');
        });
    });

    describe('Template Function', () => {
        it('has correct template function', () => {
            const result = mockToolbarItem.template('TestName', '0.5', '0.7');
            expect(result).toBe('component TestName [0.5, 0.7]');
        });
    });
});
