import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {ComponentSelectionProvider} from '../../components/ComponentSelectionContext';
import {EditingProvider} from '../../components/EditingContext';
import {MapView} from '../../components/map/MapView';
import UndoRedoProvider from '../../components/UndoRedoProvider';
import {EvolutionStages, MapCanvasDimensions, MapDimensions, Offsets} from '../../constants/defaults';
import {TOOLBAR_ITEMS} from '../../constants/toolbarItems';
import {MapTheme} from '../../types/map/styles';
import {ToolbarItem} from '../../types/toolbar';
import {UnifiedWardleyMap} from '../../types/unified/map';

// Mock ReactDOMServer to avoid MessageChannel issues in tests
jest.mock('react-dom/server', () => ({
    renderToString: jest.fn(() => '<svg>mock-cursor</svg>'),
}));

// Mock the FeatureSwitchesContext
jest.mock('../../components/FeatureSwitchesContext', () => ({
    useFeatureSwitches: () => ({
        enableAccelerators: true,
        showMapToolbar: true,
        allowMapZoomMouseWheel: true,
    }),
}));

// Mock react-svg-pan-zoom
jest.mock('react-svg-pan-zoom', () => {
    const React = require('react');
    return {
        UncontrolledReactSVGPanZoom: React.forwardRef<any, any>(function MockUncontrolledReactSVGPanZoom({children, onClick, onDoubleClick, onMouseMove, ...props}, ref) {
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

    /**
     * Helper function to place a component using a placement toolbar item
     * Only works with items that have toolType: 'placement'
     */
    const placeComponent = (toolbarItem: ToolbarItem): string => {
        if (toolbarItem.toolType !== 'placement') {
            throw new Error(`Cannot place component with toolType: ${toolbarItem.toolType}. Only 'placement' tools can be used.`);
        }

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

        it('should have method-inertia tool available for method application', () => {
            const inertiaItem = TOOLBAR_ITEMS.find(item => item.id === 'method-inertia');
            expect(inertiaItem).toBeTruthy();
            expect(inertiaItem?.toolType).toBe('method-application');
            expect(inertiaItem?.methodName).toBe('inertia');
        });

        it('should have method-market tool available for method application', () => {
            const marketItem = TOOLBAR_ITEMS.find(item => item.id === 'method-market');
            expect(marketItem).toBeTruthy();
            expect(marketItem?.toolType).toBe('method-application');
            expect(marketItem?.methodName).toBe('market');
        });

        it('should have method-ecosystem tool available for method application', () => {
            const ecosystemItem = TOOLBAR_ITEMS.find(item => item.id === 'method-ecosystem');
            expect(ecosystemItem).toBeTruthy();
            expect(ecosystemItem?.toolType).toBe('method-application');
            expect(ecosystemItem?.methodName).toBe('ecosystem');
        });
    });

    describe('Method Application Behavior', () => {
        it('should have method toolbar items available for component decoration', () => {
            const methodItems = TOOLBAR_ITEMS.filter(item => item.toolType === 'method-application');

            expect(methodItems).toHaveLength(6);

            const methodNames = methodItems.map(item => item.methodName);
            expect(methodNames).toContain('buy');
            expect(methodNames).toContain('build');
            expect(methodNames).toContain('outsource');
            expect(methodNames).toContain('inertia');
            expect(methodNames).toContain('market');
            expect(methodNames).toContain('ecosystem');
        });

        it('should identify method items correctly in toolbar', () => {
            const buyMethodItem = TOOLBAR_ITEMS.find(item => item.methodName === 'buy');
            const buildMethodItem = TOOLBAR_ITEMS.find(item => item.methodName === 'build');
            const outsourceMethodItem = TOOLBAR_ITEMS.find(item => item.methodName === 'outsource');
            const inertiaMethodItem = TOOLBAR_ITEMS.find(item => item.methodName === 'inertia');
            const marketMethodItem = TOOLBAR_ITEMS.find(item => item.methodName === 'market');
            const ecosystemMethodItem = TOOLBAR_ITEMS.find(item => item.methodName === 'ecosystem');

            expect(buyMethodItem).toBeDefined();
            expect(buyMethodItem?.id).toBe('method-buy');
            expect(buyMethodItem?.toolType).toBe('method-application');

            expect(buildMethodItem).toBeDefined();
            expect(buildMethodItem?.id).toBe('method-build');
            expect(buildMethodItem?.toolType).toBe('method-application');

            expect(outsourceMethodItem).toBeDefined();
            expect(outsourceMethodItem?.id).toBe('method-outsource');
            expect(outsourceMethodItem?.toolType).toBe('method-application');

            expect(inertiaMethodItem).toBeDefined();
            expect(inertiaMethodItem?.id).toBe('method-inertia');
            expect(inertiaMethodItem?.toolType).toBe('method-application');

            expect(marketMethodItem).toBeDefined();
            expect(marketMethodItem?.id).toBe('method-market');
            expect(marketMethodItem?.toolType).toBe('method-application');

            expect(ecosystemMethodItem).toBeDefined();
            expect(ecosystemMethodItem?.id).toBe('method-ecosystem');
            expect(ecosystemMethodItem?.toolType).toBe('method-application');
        });

        it('should have keyboard shortcuts for method items', () => {
            const buyMethodItem = TOOLBAR_ITEMS.find(item => item.methodName === 'buy');
            const buildMethodItem = TOOLBAR_ITEMS.find(item => item.methodName === 'build');
            const outsourceMethodItem = TOOLBAR_ITEMS.find(item => item.methodName === 'outsource');
            const inertiaMethodItem = TOOLBAR_ITEMS.find(item => item.methodName === 'inertia');
            const marketMethodItem = TOOLBAR_ITEMS.find(item => item.methodName === 'market');
            const ecosystemMethodItem = TOOLBAR_ITEMS.find(item => item.methodName === 'ecosystem');

            expect(buyMethodItem?.keyboardShortcut).toBe('u'); // U for bUy
            expect(buildMethodItem?.keyboardShortcut).toBe('b');
            expect(outsourceMethodItem?.keyboardShortcut).toBe('o');
            expect(inertiaMethodItem?.keyboardShortcut).toBe('i');
            expect(marketMethodItem?.keyboardShortcut).toBe('m');
            expect(ecosystemMethodItem?.keyboardShortcut).toBe('e');
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

        it('should demonstrate different naming patterns for different component types', () => {
            // Test that different component types get their appropriate default names
            const testCases = [
                {itemId: 'note', expectedNamePattern: /note New Note/},
                {itemId: 'pipeline', expectedNamePattern: /pipeline New Pipeline/},
                {itemId: 'anchor', expectedNamePattern: /anchor New Anchor/},
                {itemId: 'market', expectedNamePattern: /component Market/},
            ];

            testCases.forEach(({itemId, expectedNamePattern}) => {
                const toolbarItem = TOOLBAR_ITEMS.find(item => item.id === itemId);
                if (toolbarItem && toolbarItem.toolType === 'placement') {
                    const updatedText = placeComponent(toolbarItem);
                    expect(updatedText).toMatch(expectedNamePattern);
                }
            });
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

        it('should handle missing template functions gracefully', () => {
            // Test that items without templates (like method items) don't cause crashes
            const methodItems = TOOLBAR_ITEMS.filter(item => item.toolType === 'method-application');

            methodItems.forEach(item => {
                expect(item.template).toBeUndefined();
            });

            // Verify the application still renders with method items present
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // The component should render without errors even with method items that lack templates
            expect(container.querySelector('#map-canvas')).toBeInTheDocument();
        });
    });
});
