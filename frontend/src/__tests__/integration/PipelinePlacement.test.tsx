import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {ComponentSelectionProvider} from '../../components/ComponentSelectionContext';
import {EditingProvider} from '../../components/EditingContext';
import {MapView} from '../../components/map/MapView';
import UndoRedoProvider from '../../components/UndoRedoProvider';
import {EvolutionStages, MapCanvasDimensions, MapDimensions, Offsets} from '../../constants/defaults';
import {TOOLBAR_ITEMS} from '../../constants/toolbarItems';
import {MapTheme} from '../../types/map/styles';
import {UnifiedWardleyMap} from '../../types/unified/map';

// Mock ReactDOMServer to avoid MessageChannel issues in tests
jest.mock('react-dom/server', () => ({
    renderToString: jest.fn(() => '<svg>mock-cursor</svg>'),
}));

jest.mock('../../components/FeatureSwitchesContext', () => ({
    useFeatureSwitches: () => ({
        enableAccelerators: true,
        showMapToolbar: true,
        allowMapZoomMouseWheel: true,
    }),
}));

jest.mock('react-svg-pan-zoom', () => {
    const React = require('react');
    return {
        UncontrolledReactSVGPanZoom: React.forwardRef<any, any>(function MockUncontrolledReactSVGPanZoom(
            {children, onClick, onDoubleClick, onMouseMove, ...props},
            ref,
        ) {
            const mockRef = {
                fitSelection: jest.fn(),
                setState: jest.fn(),
                getValue: jest.fn().mockReturnValue({
                    a: 1, // Scale factor
                    b: 0,
                    c: 0,
                    d: 1,
                    e: 0, // Translation X
                    f: 0, // Translation Y
                }),
            };

            if (ref) {
                if (typeof ref === 'function') {
                    ref(mockRef);
                } else {
                    ref.current = mockRef;
                }
            }

            return React.createElement(
                'div',
                {
                    'data-testid': 'svg-pan-zoom',
                    onClick,
                    onDoubleClick,
                    onMouseMove,
                    ...props,
                },
                children,
            );
        }),
        TOOL_NONE: 'none',
    };
});

// Mock other components

jest.mock('../../components/map/MapGridGroup', () => {
    return function MockMapGridGroup() {
        return <g data-testid="map-grid-group" />;
    };
});

jest.mock('../../components/map/UnifiedMapContent', () => {
    return function MockUnifiedMapContent() {
        return <g data-testid="unified-map-content" />;
    };
});

jest.mock('../../components/map/MapCanvasToolbar', () => {
    return function MockMapCanvasToolbar() {
        return <div data-testid="map-canvas-toolbar" />;
    };
});

/**
 * Integration tests for pipeline placement as standalone entities
 */
describe('Pipeline Placement Integration Tests', () => {
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
        component: {
            fill: '#000',
            stroke: '#000',
            strokeWidth: 1,
        },
        attitudes: {
            pioneers: {fill: '#000'},
            settlers: {fill: '#000'},
            townPlanners: {fill: '#000'},
        },
        methods: {
            buy: {fill: '#000'},
            build: {fill: '#000'},
            outsource: {fill: '#000'},
        },
        annotation: {
            fill: '#000',
            stroke: '#000',
        },
        note: {
            fill: '#000',
            stroke: '#000',
        },
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
        submaps: [],
        evolved: [],
        presentation: {
            style: 'wardley',
            annotations: {},
            size: {width: 800, height: 600},
        },
    };

    const defaultProps = {
        wardleyMap: mockWardleyMap,
        shouldHideNav: jest.fn(),
        hideNav: false,
        mapTitle: 'Test Map',
        mapAnnotationsPresentation: {},
        mapStyleDefs: mockMapStyleDefs,
        mapCanvasDimensions: mockMapCanvasDimensions,
        mapDimensions: mockMapDimensions,
        mapEvolutionStates: mockEvolutionStates,
        mapRef: {current: null} as React.RefObject<HTMLElement>,
        mapText: 'title Test Map\n',
        mutateMapText: jest.fn(),
        evolutionOffsets: mockOffsets,
        launchUrl: jest.fn(),
        setHighlightLine: jest.fn(),
        setNewComponentContext: jest.fn(),
        showLinkedEvolved: false,
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

        // Mock getElementById for SVG element
        const mockSvgElement = document.createElement('svg');
        mockSvgElement.id = 'svgMap';
        mockSvgElement.getBoundingClientRect = jest.fn(() => ({
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
        document.getElementById = jest.fn(id => {
            if (id === 'svgMap') return mockSvgElement;
            return null;
        });
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        document.body.removeChild(container);
    });

    const renderComponent = (props: any = {}) => {
        act(() => {
            root.render(
                <ComponentSelectionProvider>
                    <EditingProvider>
                        <UndoRedoProvider {...defaultProps} {...props}>
                            <MapView {...defaultProps} {...props} />
                        </UndoRedoProvider>
                    </EditingProvider>
                </ComponentSelectionProvider>,
            );
        });
    };

    it('should add only pipeline when placing a pipeline', () => {
        const mockMutateMapText = jest.fn();
        renderComponent({mutateMapText: mockMutateMapText});

        // Find the pipeline toolbar item
        const pipelineItem = TOOLBAR_ITEMS.find(item => item.id === 'pipeline');
        expect(pipelineItem).toBeTruthy();

        if (!pipelineItem) return; // TypeScript guard

        // Find the pipeline button in the toolbar
        const pipelineButton = container.querySelector(`[aria-label*="${pipelineItem.label}"]`);
        expect(pipelineButton).toBeTruthy();

        if (!pipelineButton) return; // TypeScript guard

        // Select the pipeline toolbar item
        act(() => {
            pipelineButton.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });

        // Click on map canvas to place pipeline
        const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
        act(() => {
            const event = new MouseEvent('click', {
                clientX: 500,
                clientY: 350,
                bubbles: true,
            });
            svgPanZoom?.dispatchEvent(event);
        });

        // Verify map text was updated with pipeline
        expect(mockMutateMapText).toHaveBeenCalled();
        const updatedText = mockMutateMapText.mock.calls[0][0];

        // Should contain pipeline but not a separate component entry
        expect(updatedText).toContain('pipeline New Pipeline');
        expect(updatedText).not.toContain('component New Pipeline');

        // Extract the coordinates from pipeline entry
        const pipelineMatch = updatedText.match(/pipeline New Pipeline \[([0-9.]+), ([0-9.]+)\]/);
        expect(pipelineMatch).toBeTruthy();
    });

    it('should place pipeline without unique name generation', () => {
        const mockMutateMapText = jest.fn();

        // Start with a map that already has a pipeline
        const initialMapText = 'title Test Map\npipeline New Pipeline [0.5, 0.5]';

        renderComponent({
            mapText: initialMapText,
            mutateMapText: mockMutateMapText,
            wardleyMap: {
                ...mockWardleyMap,
                pipelines: [
                    {
                        name: 'New Pipeline',
                        maturity: 0.5,
                        visibility: 0.5,
                        line: 2,
                    },
                ],
            },
        });

        // Find the pipeline button in the toolbar
        const pipelineButton = container.querySelector('[aria-label*="Pipeline"]');
        act(() => {
            pipelineButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });

        // Click on map canvas to place pipeline
        const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
        act(() => {
            const event = new MouseEvent('click', {
                clientX: 500,
                clientY: 350,
                bubbles: true,
            });
            svgPanZoom?.dispatchEvent(event);
        });

        // Verify map text was updated with pipeline - no unique naming in mapText
        expect(mockMutateMapText).toHaveBeenCalled();
        const updatedText = mockMutateMapText.mock.calls[0][0];

        // Should contain new pipeline with base name, no unique suffix in mapText
        expect(updatedText).toContain('pipeline New Pipeline');
        expect(updatedText).not.toContain('component New Pipeline');

        // Should also preserve the existing pipeline
        expect(updatedText).toContain('pipeline New Pipeline [0.5, 0.5]');
    });
});
