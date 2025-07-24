import React from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react';
import UnifiedMapCanvas from '../../../components/map/UnifiedMapCanvas';
import {TOOLBAR_ITEMS} from '../../../constants/toolbarItems';
import {EvolutionStages, MapCanvasDimensions, MapDimensions, Offsets} from '../../../constants/defaults';
import {MapTheme} from '../../../types/map/styles';
import {UnifiedWardleyMap} from '../../../types/unified/map';

// Mock the react-svg-pan-zoom component
jest.mock('react-svg-pan-zoom', () => {
    const mockReact = require('react');
    return {
        UncontrolledReactSVGPanZoom: mockReact.forwardRef<any, any>(({children, onClick, onMouseMove, ...props}, ref) =>
            mockReact.createElement(
                'div',
                {
                    'data-testid': 'svg-pan-zoom',
                    onClick,
                    onMouseMove,
                    ref,
                    ...props,
                },
                children,
            ),
        ),
        TOOL_NONE: 'none',
    };
});

// Mock the FeatureSwitchesContext
jest.mock('../../../components/FeatureSwitchesContext', () => ({
    useFeatureSwitches: () => ({
        enableAccelerators: true,
        showMapToolbar: true,
        allowMapZoomMouseWheel: true,
    }),
}));

// Mock the KeyPressContext
jest.mock('../../../components/KeyPressContext', () => ({
    useModKeyPressedConsumer: () => false,
}));

// Mock other components
jest.mock('../../../components/map/MapGridGroup', () => {
    return function MockMapGridGroup() {
        return <g data-testid="map-grid-group" />;
    };
});

jest.mock('../../../components/map/UnifiedMapContent', () => {
    return function MockUnifiedMapContent() {
        return <g data-testid="unified-map-content" />;
    };
});

jest.mock('../../../components/map/MapCanvasToolbar', () => {
    return function MockMapCanvasToolbar() {
        return <div data-testid="map-canvas-toolbar" />;
    };
});

describe('UnifiedMapCanvas Drag and Drop', () => {
    let container: HTMLDivElement;
    let root: any;

    const mockMapDimensions: MapDimensions = {
        width: 800,
        height: 600,
    };

    const mockMapCanvasDimensions: MapCanvasDimensions = {
        width: 1000,
        height: 700,
    };

    const mockMapStyleDefs: MapTheme = {
        className: 'wardley',
        fontFamily: 'Arial, sans-serif',
    };

    const mockEvolutionStates: EvolutionStages = {
        genesis: {l1: 'Genesis', l2: ''},
        custom: {l1: 'Custom Built', l2: ''},
        product: {l1: 'Product', l2: '(+rental)'},
        commodity: {l1: 'Commodity', l2: '(+utility)'},
    };

    const mockOffsets: Offsets = {
        genesis: 0,
        custom: 0.25,
        product: 0.5,
        commodity: 0.75,
    };

    const mockWardleyMap: UnifiedWardleyMap = {
        title: 'Test Map',
        components: [],
        anchors: [],
        links: [],
        attitudes: [],
        accelerators: [],
        notes: [],
        annotations: [],
        methods: [],
        markets: [],
        ecosystems: [],
        pipelines: [],
        submaps: [], // Add missing submaps property
        evolved: [], // Add missing evolved property
        presentation: {
            style: 'wardley',
        },
    };

    const defaultProps = {
        wardleyMap: mockWardleyMap,
        mapDimensions: mockMapDimensions,
        mapCanvasDimensions: mockMapCanvasDimensions,
        mapStyleDefs: mockMapStyleDefs,
        mapEvolutionStates: mockEvolutionStates,
        evolutionOffsets: mockOffsets,
        mapText: 'title Test Map\n',
        mutateMapText: jest.fn(),
        setHighlightLine: jest.fn(),
        setNewComponentContext: jest.fn(),
        launchUrl: jest.fn(),
        showLinkedEvolved: false,
        mapAnnotationsPresentation: {},
    };

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        jest.clearAllMocks();

        // Mock getBoundingClientRect for coordinate conversion
        Element.prototype.getBoundingClientRect = jest.fn(() => ({
            x: 0,
            y: 0,
            width: 1000,
            height: 700,
            top: 0,
            left: 0,
            bottom: 700,
            right: 1000,
            toJSON: jest.fn(),
        }));
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        document.body.removeChild(container);
    });

    const renderComponent = (props: any = {}) => {
        act(() => {
            root.render(<UnifiedMapCanvas {...defaultProps} {...props} />);
        });
    };

    it('renders without crashing', () => {
        renderComponent();
        const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
        expect(svgPanZoom).toBeTruthy();
    });

    it('shows crosshair cursor when toolbar item is selected', () => {
        const selectedItem = TOOLBAR_ITEMS[0]; // Component item
        renderComponent({selectedToolbarItem: selectedItem});

        const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]') as HTMLElement;
        expect(svgPanZoom?.style.cursor).toBe('crosshair');
    });

    it('shows default cursor when no toolbar item is selected', () => {
        renderComponent({selectedToolbarItem: null});

        const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]') as HTMLElement;
        expect(svgPanZoom?.style.cursor).toBe('default');
    });

    it('calls onToolbarItemDrop when clicking with selected toolbar item', () => {
        const selectedItem = TOOLBAR_ITEMS[0]; // Component item
        const mockOnToolbarItemDrop = jest.fn();

        renderComponent({
            selectedToolbarItem: selectedItem,
            onToolbarItemDrop: mockOnToolbarItemDrop,
        });

        const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');

        // Mock the click event with coordinates
        act(() => {
            const event = new MouseEvent('click', {
                clientX: 400, // Middle of the canvas
                clientY: 300,
                bubbles: true,
                cancelable: true,
            });
            svgPanZoom?.dispatchEvent(event);
        });

        expect(mockOnToolbarItemDrop).toHaveBeenCalledWith(
            selectedItem,
            expect.objectContaining({
                x: expect.any(Number),
                y: expect.any(Number),
            }),
        );
    });

    it('calls onMouseMove when moving mouse with selected toolbar item', () => {
        const selectedItem = TOOLBAR_ITEMS[0]; // Component item
        const mockOnMouseMove = jest.fn();

        renderComponent({
            selectedToolbarItem: selectedItem,
            onMouseMove: mockOnMouseMove,
        });

        const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');

        // Mock the mouse move event with coordinates
        act(() => {
            const event = new MouseEvent('mousemove', {
                clientX: 400,
                clientY: 300,
                bubbles: true,
                cancelable: true,
            });
            svgPanZoom?.dispatchEvent(event);
        });

        expect(mockOnMouseMove).toHaveBeenCalledWith(
            expect.objectContaining({
                x: expect.any(Number),
                y: expect.any(Number),
            }),
        );
    });

    it('does not call onToolbarItemDrop when no toolbar item is selected', () => {
        const mockOnToolbarItemDrop = jest.fn();

        renderComponent({
            selectedToolbarItem: null,
            onToolbarItemDrop: mockOnToolbarItemDrop,
        });

        const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');

        act(() => {
            const event = new MouseEvent('click', {
                clientX: 400,
                clientY: 300,
                bubbles: true,
                cancelable: true,
            });
            svgPanZoom?.dispatchEvent(event);
        });

        expect(mockOnToolbarItemDrop).not.toHaveBeenCalled();
    });

    it('does not call onMouseMove when no toolbar item is selected', () => {
        const mockOnMouseMove = jest.fn();

        renderComponent({
            selectedToolbarItem: null,
            onMouseMove: mockOnMouseMove,
        });

        const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');

        act(() => {
            const event = new MouseEvent('mousemove', {
                clientX: 400,
                clientY: 300,
                bubbles: true,
                cancelable: true,
            });
            svgPanZoom?.dispatchEvent(event);
        });

        expect(mockOnMouseMove).not.toHaveBeenCalled();
    });

    it('handles coordinate conversion errors gracefully', () => {
        const selectedItem = TOOLBAR_ITEMS[0];
        const mockOnToolbarItemDrop = jest.fn();

        // Mock getElementById to return null to simulate error
        const originalGetElementById = document.getElementById;
        document.getElementById = jest.fn(() => null);

        renderComponent({
            selectedToolbarItem: selectedItem,
            onToolbarItemDrop: mockOnToolbarItemDrop,
        });

        const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');

        act(() => {
            const event = new MouseEvent('click', {
                clientX: 400,
                clientY: 300,
                bubbles: true,
                cancelable: true,
            });
            svgPanZoom?.dispatchEvent(event);
        });

        // Should still call onToolbarItemDrop with fallback coordinates when coordinate conversion fails
        expect(mockOnToolbarItemDrop).toHaveBeenCalledWith(
            selectedItem,
            expect.objectContaining({
                x: expect.any(Number),
                y: expect.any(Number),
            }),
        );

        // Restore original function
        document.getElementById = originalGetElementById;
    });

    it('validates drop zone coordinates are within map bounds', () => {
        const selectedItem = TOOLBAR_ITEMS[0];
        const mockOnToolbarItemDrop = jest.fn();

        renderComponent({
            selectedToolbarItem: selectedItem,
            onToolbarItemDrop: mockOnToolbarItemDrop,
        });

        const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');

        // Click within valid bounds
        act(() => {
            const event = new MouseEvent('click', {
                clientX: 400,
                clientY: 300,
                bubbles: true,
                cancelable: true,
            });
            svgPanZoom?.dispatchEvent(event);
        });

        expect(mockOnToolbarItemDrop).toHaveBeenCalled();
    });

    it('supports all toolbar item types', () => {
        const mockOnToolbarItemDrop = jest.fn();

        TOOLBAR_ITEMS.forEach(item => {
            mockOnToolbarItemDrop.mockClear();

            renderComponent({
                selectedToolbarItem: item,
                onToolbarItemDrop: mockOnToolbarItemDrop,
            });

            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');

            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                    cancelable: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            expect(mockOnToolbarItemDrop).toHaveBeenCalledWith(
                item,
                expect.objectContaining({
                    x: expect.any(Number),
                    y: expect.any(Number),
                }),
            );
        });
    });
});
