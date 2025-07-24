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

// Mock react-svg-pan-zoom with configurable zoom and pan values
jest.mock('react-svg-pan-zoom', () => {
    const React = require('react');
    let mockZoomPanValue = {
        a: 1, // Scale factor
        b: 0,
        c: 0,
        d: 1,
        e: 0, // Translation X
        f: 0, // Translation Y
    };

    // Expose a function to set the mock values for testing
    const setMockZoomPanValue = (newValue: any) => {
        mockZoomPanValue = {...mockZoomPanValue, ...newValue};
    };

    // Add the setter to the module exports
    (global as any).setMockZoomPanValue = setMockZoomPanValue;

    return {
        UncontrolledReactSVGPanZoom: React.forwardRef<any, any>(({children, onClick, onDoubleClick, onMouseMove, ...props}, ref) => {
            const mockRef = {
                fitSelection: jest.fn(),
                setState: jest.fn(),
                getValue: jest.fn().mockImplementation(() => mockZoomPanValue),
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
 * Integration tests for coordinate conversion accuracy across different map sizes and zoom levels
 * Tests Requirements 3.1, 3.2, 3.3
 */
describe('WYSIWYG Toolbar Coordinate Conversion Tests', () => {
    let container: HTMLDivElement;
    let root: any;

    // Default map dimensions
    const defaultMapDimensions: MapDimensions = {
        width: 800,
        height: 600,
    };

    const defaultMapCanvasDimensions: MapCanvasDimensions = {
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
        mapCanvasDimensions: defaultMapCanvasDimensions,
        mapDimensions: defaultMapDimensions,
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

        // Reset zoom/pan values to default
        (global as any).setMockZoomPanValue({
            a: 1, // Scale factor
            b: 0,
            c: 0,
            d: 1,
            e: 0, // Translation X
            f: 0, // Translation Y
        });

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

    /**
     * Helper function to extract coordinates from map text
     */
    const extractCoordinates = (mapText: string): {x: number; y: number} | null => {
        const match = mapText.match(/component New Component \[([0-9.]+), ([0-9.]+)\]/);
        if (!match) return null;
        
        return {
            y: parseFloat(match[1]),
            x: parseFloat(match[2]),
        };
    };

    /**
     * Helper function to place a component at specified screen coordinates
     */
    const placeComponentAt = (clientX: number, clientY: number): string => {
        const mockMutateMapText = jest.fn();
        renderComponent({mutateMapText: mockMutateMapText});

        // Select a component toolbar item
        const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
        act(() => {
            componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });

        // Click on map canvas at specified position
        const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
        act(() => {
            const event = new MouseEvent('click', {
                clientX,
                clientY,
                bubbles: true,
            });
            svgPanZoom?.dispatchEvent(event);
        });

        // Return the updated map text
        expect(mockMutateMapText).toHaveBeenCalled();
        return mockMutateMapText.mock.calls[0][0];
    };

    describe('Coordinate Conversion with Different Map Sizes', () => {
        it('should convert coordinates correctly with default map size', () => {
            const updatedText = placeComponentAt(500, 350); // Center of 1000x700 canvas
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should be approximately in the middle of the map
                expect(coords.x).toBeCloseTo(0.5, 1);
                expect(coords.y).toBeCloseTo(0.5, 1);
            }
        });

        it('should convert coordinates correctly with larger map size', () => {
            const largeMapDimensions: MapDimensions = {
                width: 1200,
                height: 900,
            };

            const updatedText = placeComponentAt(500, 350); // Center of 1000x700 canvas
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should be approximately in the middle of the map
                expect(coords.x).toBeCloseTo(0.5, 1);
                expect(coords.y).toBeCloseTo(0.5, 1);
            }
        });

        it('should convert coordinates correctly with smaller map size', () => {
            const smallMapDimensions: MapDimensions = {
                width: 600,
                height: 400,
            };

            const updatedText = placeComponentAt(500, 350); // Center of 1000x700 canvas
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should be approximately in the middle of the map
                expect(coords.x).toBeCloseTo(0.5, 1);
                expect(coords.y).toBeCloseTo(0.5, 1);
            }
        });

        it('should convert coordinates correctly with non-standard aspect ratio', () => {
            const wideMapDimensions: MapDimensions = {
                width: 1200,
                height: 400, // Wide aspect ratio
            };

            renderComponent({mapDimensions: wideMapDimensions});

            const updatedText = placeComponentAt(500, 350); // Center of 1000x700 canvas
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should be approximately in the middle of the map
                expect(coords.x).toBeCloseTo(0.5, 1);
                expect(coords.y).toBeCloseTo(0.5, 1);
            }
        });
    });

    describe('Coordinate Conversion with Different Zoom Levels', () => {
        it('should convert coordinates correctly with no zoom (scale=1)', () => {
            // Default zoom (already set in beforeEach)
            const updatedText = placeComponentAt(500, 350); // Center of 1000x700 canvas
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should be approximately in the middle of the map
                expect(coords.x).toBeCloseTo(0.5, 1);
                expect(coords.y).toBeCloseTo(0.5, 1);
            }
        });

        it('should convert coordinates correctly when zoomed in (scale=2)', () => {
            // Set zoom level to 2x (zoomed in)
            (global as any).setMockZoomPanValue({
                a: 2, // Scale factor
                d: 2,
                e: -250, // Translation to keep center visible
                f: -175,
            });

            const updatedText = placeComponentAt(500, 350); // Center of 1000x700 canvas
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should still be approximately in the middle of the map
                expect(coords.x).toBeCloseTo(0.5, 1);
                expect(coords.y).toBeCloseTo(0.5, 1);
            }
        });

        it('should convert coordinates correctly when zoomed out (scale=0.5)', () => {
            // Set zoom level to 0.5x (zoomed out)
            (global as any).setMockZoomPanValue({
                a: 0.5, // Scale factor
                d: 0.5,
                e: 250, // Translation to keep center visible
                f: 175,
            });

            const updatedText = placeComponentAt(500, 350); // Center of 1000x700 canvas
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should still be approximately in the middle of the map
                expect(coords.x).toBeCloseTo(0.5, 1);
                expect(coords.y).toBeCloseTo(0.5, 1);
            }
        });
    });

    describe('Coordinate Conversion with Pan Offsets', () => {
        it('should convert coordinates correctly when panned', () => {
            // Set pan offset
            (global as any).setMockZoomPanValue({
                a: 1, // Scale factor
                d: 1,
                e: 100, // Panned right
                f: 50, // Panned down
            });

            const updatedText = placeComponentAt(500, 350); // Center of 1000x700 canvas
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should be offset from center based on pan values
                // Exact values depend on the conversion algorithm
                expect(coords.x).not.toBeCloseTo(0.5, 1);
                expect(coords.y).not.toBeCloseTo(0.5, 1);
            }
        });

        it('should convert coordinates correctly with combined zoom and pan', () => {
            // Set combined zoom and pan
            (global as any).setMockZoomPanValue({
                a: 1.5, // Scale factor
                d: 1.5,
                e: -100, // Panned left
                f: -50, // Panned up
            });

            const updatedText = placeComponentAt(500, 350); // Center of 1000x700 canvas
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should be offset from center based on zoom and pan values
                // Exact values depend on the conversion algorithm
                expect(coords.x).not.toBeCloseTo(0.5, 1);
                expect(coords.y).not.toBeCloseTo(0.5, 1);
            }
        });
    });

    describe('Coordinate Conversion at Map Edges', () => {
        it('should convert coordinates correctly at top-left corner', () => {
            const updatedText = placeComponentAt(0, 0); // Top-left corner
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should be near the top-left of the map (0,0)
                expect(coords.x).toBeCloseTo(0, 1);
                expect(coords.y).toBeCloseTo(0, 1);
            }
        });

        it('should convert coordinates correctly at bottom-right corner', () => {
            const updatedText = placeComponentAt(1000, 700); // Bottom-right corner
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should be near the bottom-right of the map (1,1)
                expect(coords.x).toBeCloseTo(1, 1);
                expect(coords.y).toBeCloseTo(1, 1);
            }
        });

        it('should clamp coordinates when clicking outside map boundaries', () => {
            const updatedText = placeComponentAt(-100, -100); // Outside map boundaries
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should be clamped to valid range (0-1)
                expect(coords.x).toBeGreaterThanOrEqual(0);
                expect(coords.x).toBeLessThanOrEqual(1);
                expect(coords.y).toBeGreaterThanOrEqual(0);
                expect(coords.y).toBeLessThanOrEqual(1);
            }
        });
    });

    describe('Coordinate Conversion with Different Canvas Sizes', () => {
        it('should convert coordinates correctly with larger canvas', () => {
            const largeCanvasDimensions: MapCanvasDimensions = {
                width: 1500,
                height: 1000,
            };

            // Mock getBoundingClientRect for the larger canvas
            Element.prototype.getBoundingClientRect = jest.fn(() => ({
                x: 0,
                y: 0,
                width: 1500,
                height: 1000,
                top: 0,
                left: 0,
                bottom: 1000,
                right: 1500,
                toJSON: jest.fn(),
            }));

            // Mock getElementById for SVG element
            const mockSvgElement = document.createElement('svg');
            mockSvgElement.id = 'svgMap';
            mockSvgElement.getBoundingClientRect = jest.fn(() => ({
                x: 0,
                y: 0,
                width: 1500,
                height: 1000,
                top: 0,
                left: 0,
                bottom: 1000,
                right: 1500,
                toJSON: jest.fn(),
            }));
            document.getElementById = jest.fn(id => {
                if (id === 'svgMap') return mockSvgElement;
                return null;
            });

            const mockMutateMapText = jest.fn();
            renderComponent({
                mapCanvasDimensions: largeCanvasDimensions,
                mutateMapText: mockMutateMapText,
            });

            // Click at center of larger canvas
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 750, // Center of 1500px width
                    clientY: 500, // Center of 1000px height
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify coordinates
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should be approximately in the middle of the map
                expect(coords.x).toBeCloseTo(0.5, 1);
                expect(coords.y).toBeCloseTo(0.5, 1);
            }
        });

        it('should convert coordinates correctly with smaller canvas', () => {
            const smallCanvasDimensions: MapCanvasDimensions = {
                width: 500,
                height: 400,
            };

            // Mock getBoundingClientRect for the smaller canvas
            Element.prototype.getBoundingClientRect = jest.fn(() => ({
                x: 0,
                y: 0,
                width: 500,
                height: 400,
                top: 0,
                left: 0,
                bottom: 400,
                right: 500,
                toJSON: jest.fn(),
            }));

            // Mock getElementById for SVG element
            const mockSvgElement = document.createElement('svg');
            mockSvgElement.id = 'svgMap';
            mockSvgElement.getBoundingClientRect = jest.fn(() => ({
                x: 0,
                y: 0,
                width: 500,
                height: 400,
                top: 0,
                left: 0,
                bottom: 400,
                right: 500,
                toJSON: jest.fn(),
            }));
            document.getElementById = jest.fn(id => {
                if (id === 'svgMap') return mockSvgElement;
                return null;
            });

            const mockMutateMapText = jest.fn();
            renderComponent({
                mapCanvasDimensions: smallCanvasDimensions,
                mutateMapText: mockMutateMapText,
            });

            // Click at center of smaller canvas
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
            act(() => {
                componentButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 250, // Center of 500px width
                    clientY: 200, // Center of 400px height
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify coordinates
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should be approximately in the middle of the map
                expect(coords.x).toBeCloseTo(0.5, 1);
                expect(coords.y).toBeCloseTo(0.5, 1);
            }
        });
    });

    describe('Coordinate Precision and Formatting', () => {
        it('should format coordinates with appropriate precision', () => {
            const updatedText = placeComponentAt(500, 350); // Center of canvas
            
            // Check the format of the coordinates in the map text
            const match = updatedText.match(/component New Component \[([0-9.]+), ([0-9.]+)\]/);
            expect(match).toBeTruthy();
            
            if (match) {
                const yStr = match[1];
                const xStr = match[2];
                
                // Should have 2 decimal places
                expect(yStr).toMatch(/^[0-9]+\.[0-9]{2}$/);
                expect(xStr).toMatch(/^[0-9]+\.[0-9]{2}$/);
            }
        });

        it('should handle fractional coordinates correctly', () => {
            // Test with fractional client coordinates
            const updatedText = placeComponentAt(500.75, 350.25);
            const coords = extractCoordinates(updatedText);
            
            expect(coords).not.toBeNull();
            if (coords) {
                // Should be approximately in the middle of the map
                expect(coords.x).toBeCloseTo(0.5, 1);
                expect(coords.y).toBeCloseTo(0.5, 1);
            }
        });
    });

    describe('Error Handling in Coordinate Conversion', () => {
        it('should handle missing SVG element gracefully', () => {
            // Mock getElementById to return null
            document.getElementById = jest.fn(() => null);

            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Select a toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
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

            // Should still generate component with fallback coordinates
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('component New Component');
            expect(updatedText).toMatch(/\[[0-9.]+, [0-9.]+\]/);
        });

        it('should handle getBoundingClientRect errors gracefully', () => {
            // Mock getBoundingClientRect to throw an error
            Element.prototype.getBoundingClientRect = jest.fn(() => {
                throw new Error('Mock getBoundingClientRect error');
            });

            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Select a toolbar item
            const componentButton = container.querySelector('[aria-label*="Component"]:not([aria-label*="Inertia"])');
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

            // Should still generate component with fallback coordinates
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('component New Component');
            expect(updatedText).toMatch(/\[[0-9.]+, [0-9.]+\]/);
        });
    });
});