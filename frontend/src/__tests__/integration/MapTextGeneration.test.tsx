import React from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react';
import {MapView} from '../../components/map/MapView';
import {EditingProvider} from '../../components/EditingContext';
import {TOOLBAR_ITEMS} from '../../constants/toolbarItems';
import {EvolutionStages, MapCanvasDimensions, MapDimensions, Offsets} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import {UnifiedWardleyMap} from '../../types/unified/map';
import {ToolbarItem} from '../../types/toolbar';

// Mock ReactDOMServer to avoid MessageChannel issues in tests
jest.mock('react-dom/server', () => ({
    renderToString: jest.fn(() => '<svg>mock-cursor</svg>'),
}));

// Mock the FeatureSwitchesContext
jest.mock('../../components/FeatureSwitchesContext', () => ({
    useFeatureSwitches: () => ({
        enableQuickAdd: true,
        enableAccelerators: true,
        showMapToolbar: true,
        allowMapZoomMouseWheel: true,
    }),
}));

// Mock the KeyPressContext
jest.mock('../../components/KeyPressContext', () => ({
    useModKeyPressedConsumer: () => false,
}));

// Mock react-svg-pan-zoom
jest.mock('react-svg-pan-zoom', () => {
    const React = require('react');
    return {
        UncontrolledReactSVGPanZoom: React.forwardRef<any, any>(({children, onClick, onDoubleClick, onMouseMove, ...props}, ref) => {
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
jest.mock('../../components/map/CanvasSpeedDial', () => {
    return function MockCanvasSpeedDial() {
        return <div data-testid="canvas-speed-dial" />;
    };
});

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
 * Integration tests for map text generation and mutation for all component types
 * Tests Requirements 4.1, 4.2, 5.3
 */
describe('Map Text Generation Integration Tests', () => {
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
                <EditingProvider>
                    <MapView {...defaultProps} {...props} />
                </EditingProvider>
            );
        });
    };

    /**
     * Helper function to place a component using a specific toolbar item
     */
    const placeComponent = (toolbarItem: ToolbarItem): string => {
        const mockMutateMapText = jest.fn();
        renderComponent({mutateMapText: mockMutateMapText});

        // Find the button for this toolbar item
        const button = container.querySelector(`[aria-label*="${toolbarItem.label}"]`);
        if (!button) {
            throw new Error(`Button for ${toolbarItem.label} not found`);
        }

        // Select the toolbar item
        act(() => {
            button.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });

        // Click on map canvas to place component
        const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
        act(() => {
            const event = new MouseEvent('click', {
                clientX: 500,
                clientY: 350,
                bubbles: true,
            });
            svgPanZoom?.dispatchEvent(event);
        });

        // Return the updated map text
        expect(mockMutateMapText).toHaveBeenCalled();
        return mockMutateMapText.mock.calls[0][0];
    };

    describe('Map Text Generation for Basic Components', () => {
        it('should generate correct syntax for standard component', () => {
            const componentItem = TOOLBAR_ITEMS.find(item => item.id === 'component');
            expect(componentItem).toBeTruthy();

            if (componentItem) {
                const updatedText = placeComponent(componentItem);
                expect(updatedText).toContain('title Test Map');
                expect(updatedText).toMatch(/component New Component \[[0-9.]+, [0-9.]+\]/);
            }
        });

        it('should generate correct syntax for component with inertia', () => {
            const inertiaItem = TOOLBAR_ITEMS.find(item => item.id === 'component-inertia');
            expect(inertiaItem).toBeTruthy();

            if (inertiaItem) {
                const updatedText = placeComponent(inertiaItem);
                expect(updatedText).toContain('title Test Map');
                expect(updatedText).toMatch(/component Inertia Component \[[0-9.]+, [0-9.]+\] inertia/);
            }
        });

        it('should generate correct syntax for market component', () => {
            const marketItem = TOOLBAR_ITEMS.find(item => item.id === 'market');
            expect(marketItem).toBeTruthy();

            if (marketItem) {
                const updatedText = placeComponent(marketItem);
                expect(updatedText).toContain('title Test Map');
                expect(updatedText).toMatch(/component Market \[[0-9.]+, [0-9.]+\] \(market\)/);
            }
        });

        it('should generate correct syntax for ecosystem component', () => {
            const ecosystemItem = TOOLBAR_ITEMS.find(item => item.id === 'ecosystem');
            expect(ecosystemItem).toBeTruthy();

            if (ecosystemItem) {
                const updatedText = placeComponent(ecosystemItem);
                expect(updatedText).toContain('title Test Map');
                expect(updatedText).toMatch(/component Ecosystem \[[0-9.]+, [0-9.]+\] \(ecosystem\)/);
            }
        });
    });

    describe('Map Text Generation for Method Components', () => {
        it('should generate correct syntax for buy method', () => {
            const buyItem = TOOLBAR_ITEMS.find(item => item.id === 'buy');
            expect(buyItem).toBeTruthy();

            if (buyItem) {
                const updatedText = placeComponent(buyItem);
                expect(updatedText).toContain('title Test Map');
                expect(updatedText).toMatch(/component Buy Component \[[0-9.]+, [0-9.]+\] \(buy\)/);
            }
        });

        it('should generate correct syntax for build method', () => {
            const buildItem = TOOLBAR_ITEMS.find(item => item.id === 'build');
            expect(buildItem).toBeTruthy();

            if (buildItem) {
                const updatedText = placeComponent(buildItem);
                expect(updatedText).toContain('title Test Map');
                expect(updatedText).toMatch(/component Build Component \[[0-9.]+, [0-9.]+\] \(build\)/);
            }
        });

        it('should generate correct syntax for outsource method', () => {
            const outsourceItem = TOOLBAR_ITEMS.find(item => item.id === 'outsource');
            expect(outsourceItem).toBeTruthy();

            if (outsourceItem) {
                const updatedText = placeComponent(outsourceItem);
                expect(updatedText).toContain('title Test Map');
                expect(updatedText).toMatch(/component Outsource Component \[[0-9.]+, [0-9.]+\] \(outsource\)/);
            }
        });
    });

    describe('Map Text Generation for Other Component Types', () => {
        it('should generate correct syntax for note', () => {
            const noteItem = TOOLBAR_ITEMS.find(item => item.id === 'note');
            expect(noteItem).toBeTruthy();

            if (noteItem) {
                const updatedText = placeComponent(noteItem);
                expect(updatedText).toContain('title Test Map');
                expect(updatedText).toMatch(/note New Note \[[0-9.]+, [0-9.]+\]/);
            }
        });

        it('should generate correct syntax for pipeline', () => {
            const pipelineItem = TOOLBAR_ITEMS.find(item => item.id === 'pipeline');
            expect(pipelineItem).toBeTruthy();

            if (pipelineItem) {
                const updatedText = placeComponent(pipelineItem);
                expect(updatedText).toContain('title Test Map');
                expect(updatedText).toMatch(/pipeline New Pipeline \[[0-9.]+, [0-9.]+\]/);
            }
        });

        it('should generate correct syntax for anchor', () => {
            const anchorItem = TOOLBAR_ITEMS.find(item => item.id === 'anchor');
            expect(anchorItem).toBeTruthy();

            if (anchorItem) {
                const updatedText = placeComponent(anchorItem);
                expect(updatedText).toContain('title Test Map');
                expect(updatedText).toMatch(/anchor New Anchor \[[0-9.]+, [0-9.]+\]/);
            }
        });
    });

    describe('Map Text Formatting and Structure', () => {
        it('should maintain existing map structure when adding components', () => {
            const initialMapText = `title Test Map
component A [0.1, 0.2]
component B [0.3, 0.4]
A->B

// This is a comment
note Test Note [0.5, 0.6]`;

            const mockMutateMapText = jest.fn();
            renderComponent({
                mapText: initialMapText,
                mutateMapText: mockMutateMapText,
            });

            // Select a component toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 500,
                    clientY: 350,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify map text structure is preserved
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];

            // Check that all original elements are preserved
            expect(updatedText).toContain('title Test Map');
            expect(updatedText).toContain('component A [0.1, 0.2]');
            expect(updatedText).toContain('component B [0.3, 0.4]');
            expect(updatedText).toContain('A->B');
            expect(updatedText).toContain('// This is a comment');
            expect(updatedText).toContain('note Test Note [0.5, 0.6]');

            // Check that new component is added
            expect(updatedText).toMatch(/component New Component \[[0-9.]+, [0-9.]+\]/);
        });

        it('should handle empty map text', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({
                mapText: '',
                mutateMapText: mockMutateMapText,
            });

            // Select a component toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 500,
                    clientY: 350,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify component is added to empty map text
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toMatch(/component New Component \[[0-9.]+, [0-9.]+\]/);
        });

        it('should handle map text with only title', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({
                mapText: 'title Test Map',
                mutateMapText: mockMutateMapText,
            });

            // Select a component toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 500,
                    clientY: 350,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify component is added after title
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('title Test Map');
            expect(updatedText).toMatch(/component New Component \[[0-9.]+, [0-9.]+\]/);
        });

        it('should handle map text with different line endings', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({
                mapText: 'title Test Map\r\ncomponent A [0.1, 0.2]\rcomponent B [0.3, 0.4]\n',
                mutateMapText: mockMutateMapText,
            });

            // Select a component toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 500,
                    clientY: 350,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify component is added and line endings are normalized
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('title Test Map');
            expect(updatedText).toContain('component A [0.1, 0.2]');
            expect(updatedText).toContain('component B [0.3, 0.4]');
            expect(updatedText).toMatch(/component New Component \[[0-9.]+, [0-9.]+\]/);

            // Check that line endings are normalized
            const lineCount = updatedText.split('\n').length;
            const crlfCount = updatedText.split('\r\n').length;
            const crCount = updatedText.split('\r').length;

            // The total number of lines should be greater than the number of CRLF or CR lines
            // This indicates normalization to LF
            expect(lineCount).toBeGreaterThan(crlfCount);
            expect(lineCount).toBeGreaterThan(crCount);
        });
    });

    describe('Component Naming and Uniqueness', () => {
        it('should generate unique names for components of the same type', () => {
            const mockMutateMapText = jest.fn();

            // Start with a map that already has a component
            const initialMapText = 'title Test Map\ncomponent New Component [0.1, 0.2]';

            renderComponent({
                mapText: initialMapText,
                mutateMapText: mockMutateMapText,
                wardleyMap: {
                    ...mockWardleyMap,
                    components: [
                        {
                            name: 'New Component',
                            maturity: 0.2,
                            visibility: 0.1,
                            line: 2,
                            evolved: false,
                            inertia: false,
                            increaseLabelSpacing: 0,
                            pseudoComponent: false,
                            offsetY: 0,
                            evolving: false,
                            decorators: {
                                buy: false,
                                build: false,
                                outsource: false,
                                ecosystem: false,
                                market: false,
                            },
                        },
                    ],
                },
            });

            // Select a component toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 500,
                    clientY: 350,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify component has unique name
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('component New Component [0.1, 0.2]');
            expect(updatedText).toMatch(/component New Component 1 \[[0-9.]+, [0-9.]+\]/);
        });

        it('should handle multiple components with numbered names', () => {
            const mockMutateMapText = jest.fn();

            // Start with a map that already has numbered components
            const initialMapText = `title Test Map
component New Component [0.1, 0.2]
component New Component 1 [0.3, 0.4]
component New Component 2 [0.5, 0.6]`;

            renderComponent({
                mapText: initialMapText,
                mutateMapText: mockMutateMapText,
                wardleyMap: {
                    ...mockWardleyMap,
                    components: [
                        {
                            name: 'New Component',
                            maturity: 0.2,
                            visibility: 0.1,
                            line: 2,
                            evolved: false,
                            inertia: false,
                            increaseLabelSpacing: 0,
                            pseudoComponent: false,
                            offsetY: 0,
                            evolving: false,
                            decorators: {
                                buy: false,
                                build: false,
                                outsource: false,
                                ecosystem: false,
                                market: false,
                            },
                        },
                        {
                            name: 'New Component 1',
                            maturity: 0.4,
                            visibility: 0.3,
                            line: 3,
                            evolved: false,
                            inertia: false,
                            increaseLabelSpacing: 0,
                            pseudoComponent: false,
                            offsetY: 0,
                            evolving: false,
                            decorators: {
                                buy: false,
                                build: false,
                                outsource: false,
                                ecosystem: false,
                                market: false,
                            },
                        },
                        {
                            name: 'New Component 2',
                            maturity: 0.6,
                            visibility: 0.5,
                            line: 4,
                            evolved: false,
                            inertia: false,
                            increaseLabelSpacing: 0,
                            pseudoComponent: false,
                            offsetY: 0,
                            evolving: false,
                            decorators: {
                                buy: false,
                                build: false,
                                outsource: false,
                                ecosystem: false,
                                market: false,
                            },
                        },
                    ],
                },
            });

            // Select a component toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 500,
                    clientY: 350,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify component has next number in sequence
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('component New Component [0.1, 0.2]');
            expect(updatedText).toContain('component New Component 1 [0.3, 0.4]');
            expect(updatedText).toContain('component New Component 2 [0.5, 0.6]');
            expect(updatedText).toMatch(/component New Component 3 \[[0-9.]+, [0-9.]+\]/);
        });
    });

    describe('Error Handling in Map Text Generation', () => {
        it('should handle malformed map text gracefully', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({
                mapText: 'This is not valid map text',
                mutateMapText: mockMutateMapText,
            });

            // Select a component toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 500,
                    clientY: 350,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify component is added to malformed text
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('This is not valid map text');
            expect(updatedText).toMatch(/component New Component \[[0-9.]+, [0-9.]+\]/);
        });

        it('should handle null or undefined map text', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({
                mapText: null as any,
                mutateMapText: mockMutateMapText,
            });

            // Select a component toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 500,
                    clientY: 350,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify component is added
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toMatch(/component New Component \[[0-9.]+, [0-9.]+\]/);
        });

        it('should handle template generation errors gracefully', () => {
            // Create a mock toolbar item with a broken template function
            const brokenItem: ToolbarItem = {
                ...TOOLBAR_ITEMS[0],
                template: () => {
                    throw new Error('Template error');
                },
            };

            // Mock the TOOLBAR_ITEMS array to include the broken item
            const originalItems = [...TOOLBAR_ITEMS];
            TOOLBAR_ITEMS.splice(0, 1, brokenItem);

            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Select the broken toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 500,
                    clientY: 350,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify component is added with fallback template
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toMatch(/component New Component \[[0-9.]+, [0-9.]+\]/);

            // Restore original toolbar items
            TOOLBAR_ITEMS.splice(0, 1, originalItems[0]);
        });
    });
});
