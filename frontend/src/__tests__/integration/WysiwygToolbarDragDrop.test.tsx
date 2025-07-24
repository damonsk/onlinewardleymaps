import React from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react';
import {MapView} from '../../components/map/MapView';
import {TOOLBAR_ITEMS} from '../../constants/toolbarItems';
import {EvolutionStages, MapCanvasDimensions, MapDimensions, Offsets} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import {UnifiedWardleyMap} from '../../types/unified/map';

// Mock ReactDOMServer to avoid MessageChannel issues in tests
jest.mock('react-dom/server', () => ({
    renderToString: jest.fn(() => '<svg>mock-cursor</svg>'),
}));

// Mock the FeatureSwitchesContext to enable both QuickAdd and toolbar
jest.mock('../../components/FeatureSwitchesContext', () => ({
    useFeatureSwitches: () => ({
        enableQuickAdd: true,
        enableAccelerators: true,
        showMapToolbar: true,
        allowMapZoomMouseWheel: true,
    }),
}));

// Mock the KeyPressContext for mod key functionality
jest.mock('../../components/KeyPressContext', () => ({
    useModKeyPressedConsumer: () => false,
}));

// Mock react-svg-pan-zoom to avoid complex setup
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

// Mock other components to simplify testing
jest.mock('../../components/map/CanvasSpeedDial', () => {
    return function MockCanvasSpeedDial({setQuickAdd}: {setQuickAdd: (quickAdd: any) => void}) {
        return (
            <div data-testid="canvas-speed-dial">
                <button
                    data-testid="quickadd-activate"
                    onClick={() => {
                        setQuickAdd({
                            cursor: <div>cursor</div>,
                            template: () => 'component QuickAdd Component [0.5, 0.5]',
                        });
                    }}>
                    Activate QuickAdd
                </button>
            </div>
        );
    };
});

jest.mock('../../components/map/MapGridGroup', () => {
    return function MockMapGridGroup() {
        return <g data-testid="map-grid-group" />;
    };
});

jest.mock('../../components/map/UnifiedMapContent', () => {
    return function MockUnifiedMapContent({clicked}: {clicked: (ctx: any) => void}) {
        return (
            <g data-testid="unified-map-content">
                <circle
                    data-testid="existing-component"
                    cx="400"
                    cy="300"
                    r="10"
                    onClick={e =>
                        clicked({
                            el: {name: 'Existing Component', line: 1},
                            e: e,
                        })
                    }
                />
            </g>
        );
    };
});

jest.mock('../../components/map/MapCanvasToolbar', () => {
    return function MockMapCanvasToolbar() {
        return <div data-testid="map-canvas-toolbar" />;
    };
});

/**
 * Comprehensive integration tests for WYSIWYG Toolbar drag and drop functionality
 * Tests Requirements 3.1, 3.2, 3.3, 4.1, 4.2, 6.1, 6.2
 */
describe('WYSIWYG Toolbar Drag and Drop Integration Tests', () => {
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
        components: [
            {
                name: 'Existing Component',
                maturity: 0.5,
                visibility: 0.7,
                line: 1,
                evolved: false,
                inertia: false,
                increaseLabelSpacing: 0,
                pseudoComponent: false,
                offsetY: 0,
                evolving: false,
                type: 'component',
                id: 'existing-1',
                label: 'Existing Component',
                decorators: {
                    buy: false,
                    build: false,
                    outsource: false,
                    ecosystem: false,
                    market: false,
                },
            },
        ],
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
        mapText: 'title Test Map\ncomponent Existing Component [0.7, 0.5]',
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
            root.render(<MapView {...defaultProps} {...props} />);
        });
    };

    describe('Requirement 3.1: Drag Preview Functionality', () => {
        it('should show component preview when moving mouse over canvas with selected toolbar item', () => {
            renderComponent();

            // Select a toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Move mouse over canvas
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('mousemove', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify drag preview is shown
            // Note: The actual preview is rendered in a portal, so we check for cursor style change
            expect(svgPanZoom?.getAttribute('style')).toContain('cursor: crosshair');
        });

        it('should update preview position when mouse moves', () => {
            renderComponent();

            // Select a toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Move mouse to first position
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('mousemove', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Move mouse to second position
            act(() => {
                const event = new MouseEvent('mousemove', {
                    clientX: 500,
                    clientY: 400,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify cursor style remains crosshair
            expect(svgPanZoom?.getAttribute('style')).toContain('cursor: crosshair');
        });
    });

    describe('Requirement 3.2: Component Placement', () => {
        it('should place component at clicked location', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Select a toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify map text was updated with component at correct position
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            
            // The exact coordinates depend on the conversion logic, but should contain a component
            expect(updatedText).toContain('component New Component');
            expect(updatedText).toMatch(/\[\d+\.\d+, \d+\.\d+\]/); // Should contain coordinates
        });

        it('should place component at different locations based on click position', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Test multiple positions
            const positions = [
                {clientX: 200, clientY: 150},
                {clientX: 600, clientY: 450},
                {clientX: 800, clientY: 200},
            ];

            positions.forEach((pos, index) => {
                mockMutateMapText.mockClear();

                // Select a toolbar item
                const componentButton = container.querySelector('[aria-label*="Component"]');
                act(() => {
                    componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                });

                // Click on map canvas at specific position
                const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
                act(() => {
                    const event = new MouseEvent('click', {
                        clientX: pos.clientX,
                        clientY: pos.clientY,
                        bubbles: true,
                    });
                    svgPanZoom?.dispatchEvent(event);
                });

                // Verify map text was updated
                expect(mockMutateMapText).toHaveBeenCalled();
                
                // Each position should result in different coordinates
                if (index > 0) {
                    const prevText = mockMutateMapText.mock.calls[index - 1][0];
                    const currText = mockMutateMapText.mock.calls[index][0];
                    expect(prevText).not.toBe(currText);
                }
            });
        });
    });

    describe('Requirement 3.3: Default Properties Generation', () => {
        it('should generate appropriate default properties for components', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Select a component toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify default properties
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('component New Component');
        });

        it('should generate appropriate default properties for notes', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Find and select the note toolbar item
            const noteButton = container.querySelector('[aria-label*="Note"]');
            act(() => {
                noteButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place note
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify default properties
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('note New Note');
        });

        it('should generate unique names when placing multiple components of the same type', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Place first component
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Get the updated map text with first component
            const firstText = mockMutateMapText.mock.calls[0][0];
            
            // Update the component props to simulate the first component being added
            const updatedProps = {
                ...defaultProps,
                mapText: firstText,
                mutateMapText: mockMutateMapText,
                wardleyMap: {
                    ...mockWardleyMap,
                    components: [
                        ...mockWardleyMap.components,
                        {
                            name: 'New Component',
                            maturity: 0.5,
                            visibility: 0.5,
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
            };

            // Clear mock and re-render with updated props
            mockMutateMapText.mockClear();
            renderComponent(updatedProps);

            // Place second component
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 500,
                    clientY: 400,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify second component has unique name
            expect(mockMutateMapText).toHaveBeenCalled();
            const secondText = mockMutateMapText.mock.calls[0][0];
            expect(secondText).toContain('component New Component 1');
        });
    });

    describe('Requirement 4.1: Map Text Update', () => {
        it('should automatically update mapText when placing component', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Select a toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify map text was updated
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('title Test Map');
            expect(updatedText).toContain('component Existing Component [0.7, 0.5]');
            expect(updatedText).toContain('component New Component');
        });

        it('should generate correct syntax for different component types', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Test different component types
            const componentTypes = [
                {selector: '[aria-label*="Component"]:not([aria-label*="Inertia"])', expectedText: 'component New Component'},
                {selector: '[aria-label*="Component with Inertia"]', expectedText: 'component Inertia Component', expectedSuffix: 'inertia'},
                {selector: '[aria-label*="Market"]', expectedText: 'component Market', expectedSuffix: '(market)'},
                {selector: '[aria-label*="Note"]', expectedText: 'note New Note'},
            ];

            componentTypes.forEach(({selector, expectedText, expectedSuffix}, index) => {
                mockMutateMapText.mockClear();

                // Select toolbar item
                const button = container.querySelector(selector);
                act(() => {
                    button?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                });

                // Click on map to place component
                const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
                act(() => {
                    const event = new MouseEvent('click', {
                        clientX: 400 + index * 50, // Slightly different positions
                        clientY: 300 + index * 50,
                        bubbles: true,
                    });
                    svgPanZoom?.dispatchEvent(event);
                });

                // Verify correct syntax was generated
                expect(mockMutateMapText).toHaveBeenCalled();
                const updatedText = mockMutateMapText.mock.calls[0][0];
                expect(updatedText).toContain(expectedText);
                
                if (expectedSuffix) {
                    expect(updatedText).toContain(expectedSuffix);
                }
            });
        });
    });

    describe('Requirement 4.2: Map Text Formatting', () => {
        it('should maintain proper formatting and line structure', () => {
            const initialMapText = `title Test Map
component Existing Component [0.7, 0.5]

// This is a comment
`;
            const mockMutateMapText = jest.fn();
            renderComponent({
                mapText: initialMapText,
                mutateMapText: mockMutateMapText,
            });

            // Select a toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify map text formatting is preserved
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('title Test Map');
            expect(updatedText).toContain('component Existing Component [0.7, 0.5]');
            expect(updatedText).toContain('// This is a comment');
            expect(updatedText).toContain('component New Component');
        });

        it('should append new components to the end of the map text', () => {
            const initialMapText = `title Test Map
component A [0.1, 0.2]
component B [0.3, 0.4]
A->B`;

            const mockMutateMapText = jest.fn();
            renderComponent({
                mapText: initialMapText,
                mutateMapText: mockMutateMapText,
            });

            // Select a toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify component is appended to the end
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            
            // Check that the original structure is preserved
            expect(updatedText).toContain('title Test Map');
            expect(updatedText).toContain('component A [0.1, 0.2]');
            expect(updatedText).toContain('component B [0.3, 0.4]');
            expect(updatedText).toContain('A->B');
            
            // Check that the new component is appended at the end
            const lines = updatedText.split('\n');
            const newComponentLine = lines.findIndex(line => line.includes('component New Component'));
            const linkLine = lines.findIndex(line => line.includes('A->B'));
            
            expect(newComponentLine).toBeGreaterThan(linkLine);
        });
    });

    describe('Coordinate Conversion Accuracy', () => {
        it('should convert screen coordinates to map coordinates correctly', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Select a toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas at center
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 500, // Center of 1000px width
                    clientY: 350, // Center of 700px height
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify coordinates are approximately in the middle of the map
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            
            // Extract coordinates from the generated text
            const match = updatedText.match(/component New Component \[([0-9.]+), ([0-9.]+)\]/);
            expect(match).toBeTruthy();
            
            if (match) {
                const y = parseFloat(match[1]);
                const x = parseFloat(match[2]);
                
                // Coordinates should be approximately in the middle (0.5, 0.5)
                // Allow some tolerance due to conversion algorithms
                expect(x).toBeGreaterThan(0.4);
                expect(x).toBeLessThan(0.6);
                expect(y).toBeGreaterThan(0.4);
                expect(y).toBeLessThan(0.6);
            }
        });

        it('should handle different map sizes correctly', () => {
            // Test with different map dimensions
            const mapSizes = [
                {width: 800, height: 600},
                {width: 1200, height: 900},
                {width: 600, height: 400},
            ];

            mapSizes.forEach((size, index) => {
                const mockMutateMapText = jest.fn();
                renderComponent({
                    mapDimensions: size,
                    mutateMapText: mockMutateMapText,
                });

                // Select a toolbar item
                const componentButton = container.querySelector('[aria-label*="Component"]');
                act(() => {
                    componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                });

                // Click on map canvas at center
                const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
                act(() => {
                    const event = new MouseEvent('click', {
                        clientX: 500,
                        clientY: 350,
                        bubbles: true,
                    });
                    svgPanZoom?.dispatchEvent(event);
                });

                // Verify coordinates are generated
                expect(mockMutateMapText).toHaveBeenCalled();
                const updatedText = mockMutateMapText.mock.calls[0][0];
                expect(updatedText).toMatch(/component New Component \[[0-9.]+, [0-9.]+\]/);
            });
        });

        it('should handle zoom levels correctly', () => {
            // Mock different zoom levels by modifying the getValue mock
            const zoomLevels = [
                {a: 1, e: 0, f: 0}, // No zoom
                {a: 2, e: -100, f: -100}, // Zoomed in
                {a: 0.5, e: 50, f: 50}, // Zoomed out
            ];

            zoomLevels.forEach((zoomLevel, index) => {
                // Update the mock for react-svg-pan-zoom
                const mockGetValue = jest.fn().mockReturnValue({
                    ...zoomLevel,
                    b: 0,
                    c: 0,
                    d: zoomLevel.a,
                });

                // Mock the ref
                const mockRef = {
                    fitSelection: jest.fn(),
                    setState: jest.fn(),
                    getValue: mockGetValue,
                };

                // Update the mock for UncontrolledReactSVGPanZoom
                require('react-svg-pan-zoom').UncontrolledReactSVGPanZoom = jest.fn().mockImplementation(
                    ({children, onClick, onMouseMove, ...props}) => {
                        return React.createElement(
                            'div',
                            {
                                'data-testid': 'svg-pan-zoom',
                                onClick,
                                onMouseMove,
                                ref: () => mockRef,
                                ...props,
                            },
                            children,
                        );
                    },
                );

                const mockMutateMapText = jest.fn();
                renderComponent({mutateMapText: mockMutateMapText});

                // Select a toolbar item
                const componentButton = container.querySelector('[aria-label*="Component"]');
                act(() => {
                    componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                });

                // Click on map canvas
                const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
                act(() => {
                    const event = new MouseEvent('click', {
                        clientX: 500,
                        clientY: 350,
                        bubbles: true,
                    });
                    svgPanZoom?.dispatchEvent(event);
                });

                // Verify coordinates are generated
                expect(mockMutateMapText).toHaveBeenCalled();
                const updatedText = mockMutateMapText.mock.calls[0][0];
                expect(updatedText).toMatch(/component New Component \[[0-9.]+, [0-9.]+\]/);
                
                // Verify getValue was called to get zoom level
                expect(mockGetValue).toHaveBeenCalled();
            });
        });
    });

    describe('Map Text Generation for All Component Types', () => {
        it('should generate correct map text for all toolbar item types', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Test all toolbar items
            TOOLBAR_ITEMS.forEach((item, index) => {
                mockMutateMapText.mockClear();

                // Find the button for this toolbar item
                const button = container.querySelector(`[aria-label*="${item.label}"]`);
                if (!button) {
                    console.warn(`Button for ${item.label} not found`);
                    return;
                }

                // Select the toolbar item
                act(() => {
                    button.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                });

                // Click on map canvas to place component
                const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
                act(() => {
                    const event = new MouseEvent('click', {
                        clientX: 400 + index * 20,
                        clientY: 300 + index * 20,
                        bubbles: true,
                    });
                    svgPanZoom?.dispatchEvent(event);
                });

                // Verify map text was updated with correct syntax
                expect(mockMutateMapText).toHaveBeenCalled();
                const updatedText = mockMutateMapText.mock.calls[0][0];
                
                // Check for the default name of the component
                expect(updatedText).toContain(item.defaultName);
                
                // Check for the correct syntax based on category
                switch (item.category) {
                    case 'component':
                        expect(updatedText).toMatch(new RegExp(`component ${item.defaultName} \\[[0-9.]+, [0-9.]+\\]`));
                        break;
                    case 'note':
                        expect(updatedText).toMatch(new RegExp(`note ${item.defaultName} \\[[0-9.]+, [0-9.]+\\]`));
                        break;
                    case 'pipeline':
                        expect(updatedText).toMatch(new RegExp(`pipeline ${item.defaultName} \\[[0-9.]+, [0-9.]+\\]`));
                        break;
                    case 'method':
                        expect(updatedText).toMatch(new RegExp(`component ${item.defaultName} \\[[0-9.]+, [0-9.]+\\]`));
                        if (item.id === 'buy') expect(updatedText).toContain('(buy)');
                        if (item.id === 'build') expect(updatedText).toContain('(build)');
                        if (item.id === 'outsource') expect(updatedText).toContain('(outsource)');
                        break;
                    case 'other':
                        if (item.id === 'anchor') {
                            expect(updatedText).toMatch(new RegExp(`anchor ${item.defaultName} \\[[0-9.]+, [0-9.]+\\]`));
                        }
                        break;
                }
            });
        });
    });

    describe('Interaction with Existing Map Functionality', () => {
        it('should maintain compatibility with existing map functionality', () => {
            const mockSetHighlightLine = jest.fn();
            renderComponent({setHighlightLine: mockSetHighlightLine});

            // Click on existing component should highlight it
            const existingComponent = container.querySelector('[data-testid="existing-component"]');
            act(() => {
                existingComponent?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            expect(mockSetHighlightLine).toHaveBeenCalledWith(1);

            // Select toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // After placing component, should be able to click on existing component again
            act(() => {
                existingComponent?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            expect(mockSetHighlightLine).toHaveBeenCalledTimes(2);
        });

        it('should work alongside QuickAdd functionality', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Activate QuickAdd
            const quickAddButton = container.querySelector('[data-testid="quickadd-activate"]');
            act(() => {
                quickAddButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place QuickAdd component
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify QuickAdd component was added
            expect(mockMutateMapText).toHaveBeenCalled();
            const quickAddText = mockMutateMapText.mock.calls[0][0];
            expect(quickAddText).toContain('QuickAdd Component');

            // Clear mock
            mockMutateMapText.mockClear();

            // Now use toolbar
            const componentButton = container.querySelector('[aria-label*="Component"]');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas to place toolbar component
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 500,
                    clientY: 400,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify toolbar component was added
            expect(mockMutateMapText).toHaveBeenCalled();
            const toolbarText = mockMutateMapText.mock.calls[0][0];
            expect(toolbarText).toContain('New Component');
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle coordinate conversion errors gracefully', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Mock getElementById to return null to simulate error
            const originalGetElementById = document.getElementById;
            document.getElementById = jest.fn(() => null);

            // Select a toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Should still generate component with fallback coordinates
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('component New Component');
            expect(updatedText).toMatch(/\[[0-9.]+, [0-9.]+\]/);

            // Restore original function
            document.getElementById = originalGetElementById;
        });

        it('should handle clicks outside valid map boundaries', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Select a toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click outside valid map area
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: -100, // Outside canvas
                    clientY: -100,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Should still generate component with clamped coordinates
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('component New Component');
            
            // Coordinates should be clamped to valid range (0-1)
            const match = updatedText.match(/component New Component \[([0-9.]+), ([0-9.]+)\]/);
            expect(match).toBeTruthy();
            
            if (match) {
                const y = parseFloat(match[1]);
                const x = parseFloat(match[2]);
                
                expect(x).toBeGreaterThanOrEqual(0);
                expect(x).toBeLessThanOrEqual(1);
                expect(y).toBeGreaterThanOrEqual(0);
                expect(y).toBeLessThanOrEqual(1);
            }
        });

        it('should handle empty map text', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({
                mapText: '',
                mutateMapText: mockMutateMapText,
            });

            // Select a toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Should generate component even with empty initial map text
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('component New Component');
        });

        it('should handle malformed map text', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({
                mapText: 'This is not valid map text',
                mutateMapText: mockMutateMapText,
            });

            // Select a toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Click on map canvas
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Should append component to existing text
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('This is not valid map text');
            expect(updatedText).toContain('component New Component');
        });
    });
});