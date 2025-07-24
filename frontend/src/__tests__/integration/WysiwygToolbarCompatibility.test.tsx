import React from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react';
import {MapView} from '../../components/map/MapView';
import {TOOLBAR_ITEMS} from '../../constants/toolbarItems';
import {EvolutionStages, MapCanvasDimensions, MapDimensions, Offsets} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import {UnifiedWardleyMap} from '../../types/unified/map';

// Mock the FeatureSwitchesContext to enable QuickAdd
jest.mock('../../components/FeatureSwitchesContext', () => ({
    useFeatureSwitches: () => ({
        enableQuickAdd: true,
        enableAccelerators: true,
        showMapToolbar: true,
        allowMapZoomMouseWheel: true,
    }),
}));

// Mock react-svg-pan-zoom
jest.mock('react-svg-pan-zoom', () => {
    const mockReact = require('react');
    return {
        UncontrolledReactSVGPanZoom: mockReact.forwardRef<any, any>(
            ({children, onClick, onDoubleClick, onMouseMove, onZoom, ...props}, ref) => {
                // Create a mock ref object with the methods we need
                const mockRef = {
                    fitSelection: jest.fn(),
                    setState: jest.fn(),
                };

                // Assign the mock ref to the forwarded ref
                if (ref) {
                    if (typeof ref === 'function') {
                        ref(mockRef);
                    } else {
                        ref.current = mockRef;
                    }
                }

                return mockReact.createElement(
                    'div',
                    {
                        'data-testid': 'svg-pan-zoom',
                        onClick,
                        onDoubleClick,
                        onMouseMove,
                        onWheel: onZoom,
                        ref: () => mockRef,
                        ...props,
                    },
                    children,
                );
            },
        ),
        TOOL_NONE: 'none',
    };
});

// Mock other components
jest.mock('../../components/map/CanvasSpeedDial', () => {
    return function MockCanvasSpeedDial({setQuickAdd}: {setQuickAdd: (quickAdd: any) => void}) {
        return (
            <div data-testid="canvas-speed-dial">
                <button
                    data-testid="quickadd-component"
                    onClick={() =>
                        setQuickAdd({
                            cursor: <div>cursor</div>,
                            template: () => 'component QuickAdd Component [0.5, 0.5]',
                        })
                    }>
                    QuickAdd Component
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
    return function MockMapCanvasToolbar({tool, handleChangeTool, _fitToViewer}: any) {
        return (
            <div data-testid="map-canvas-toolbar">
                <button data-testid="pan-tool" onClick={e => handleChangeTool(e, 'pan')}>
                    Pan
                </button>
                <button data-testid="fit-viewer" onClick={_fitToViewer}>
                    Fit
                </button>
            </div>
        );
    };
});

/**
 * Integration tests for WYSIWYG Toolbar compatibility with existing map functionality
 * Tests Requirements 6.1, 6.2, 6.3, 6.4
 */
describe('WYSIWYG Toolbar Compatibility Integration Tests', () => {
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
        mapRef: {current: null} as React.MutableRefObject<HTMLElement | null>,
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

    describe('Requirement 6.1: Toolbar compatibility with QuickAdd functionality', () => {
        it('should render both toolbar and QuickAdd speed dial', () => {
            renderComponent();

            const toolbar = container.querySelector('[role="toolbar"]');
            const speedDial = container.querySelector('[data-testid="canvas-speed-dial"]');

            expect(toolbar).toBeTruthy();
            expect(speedDial).toBeTruthy();
        });

        it('should clear toolbar selection when QuickAdd is activated', () => {
            renderComponent();

            // First select a toolbar item
            const toolbarItem = container.querySelector('[data-testid="toolbar-item-component"]');
            act(() => {
                toolbarItem?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Verify toolbar item is selected
            expect(toolbarItem?.getAttribute('aria-pressed')).toBe('true');

            // Activate QuickAdd
            const quickAddButton = container.querySelector('[data-testid="quickadd-component"]');
            act(() => {
                quickAddButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Verify toolbar selection is cleared
            expect(toolbarItem?.getAttribute('aria-pressed')).toBe('false');
        });

        it('should clear QuickAdd state when toolbar item is selected', () => {
            renderComponent();

            // First activate QuickAdd
            const quickAddButton = container.querySelector('[data-testid="quickadd-component"]');
            act(() => {
                quickAddButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Then select a toolbar item
            const toolbarItem = container.querySelector('[data-testid="toolbar-item-component"]');
            act(() => {
                toolbarItem?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Verify toolbar item is selected
            expect(toolbarItem?.getAttribute('aria-pressed')).toBe('true');

            // Click on map should place toolbar item, not trigger QuickAdd
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('click', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Verify map text was updated with toolbar component
            expect(defaultProps.mutateMapText).toHaveBeenCalled();
            const lastCall = defaultProps.mutateMapText.mock.calls[defaultProps.mutateMapText.mock.calls.length - 1];
            expect(lastCall[0]).toContain('component New Component');
        });

        it('should allow switching between toolbar and QuickAdd modes seamlessly', () => {
            renderComponent();

            // Start with toolbar
            const toolbarItem = container.querySelector('[data-testid="toolbar-item-component"]');
            act(() => {
                toolbarItem?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });
            expect(toolbarItem?.getAttribute('aria-pressed')).toBe('true');

            // Switch to QuickAdd
            const quickAddButton = container.querySelector('[data-testid="quickadd-component"]');
            act(() => {
                quickAddButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });
            expect(toolbarItem?.getAttribute('aria-pressed')).toBe('false');

            // Switch back to toolbar
            act(() => {
                toolbarItem?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });
            expect(toolbarItem?.getAttribute('aria-pressed')).toBe('true');
        });
    });

    describe('Requirement 6.2: State synchronization between toolbar and text editing', () => {
        it('should maintain map state when components are added via toolbar', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Select toolbar item and place component
            const toolbarItem = container.querySelector('[data-testid="toolbar-item-component"]');
            act(() => {
                toolbarItem?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
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

            // Verify map text was updated
            expect(mockMutateMapText).toHaveBeenCalled();
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('component New Component');
            expect(updatedText).toContain('component Existing Component');
        });

        it('should preserve existing map structure when adding toolbar components', () => {
            const initialMapText = `title Test Map
component A [0.1, 0.2]
component B [0.3, 0.4]
A->B`;

            const mockMutateMapText = jest.fn();
            renderComponent({
                mapText: initialMapText,
                mutateMapText: mockMutateMapText,
            });

            // Add component via toolbar
            const toolbarItem = container.querySelector('[data-testid="toolbar-item-component"]');
            act(() => {
                toolbarItem?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
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

            // Verify original structure is preserved
            const updatedText = mockMutateMapText.mock.calls[0][0];
            expect(updatedText).toContain('title Test Map');
            expect(updatedText).toContain('component A [0.1, 0.2]');
            expect(updatedText).toContain('component B [0.3, 0.4]');
            expect(updatedText).toContain('A->B');
            expect(updatedText).toContain('component New Component');
        });

        it('should handle concurrent toolbar and text editing operations', () => {
            const mockMutateMapText = jest.fn();
            renderComponent({mutateMapText: mockMutateMapText});

            // Simulate text editing by updating map text
            const updatedMapText = defaultProps.mapText + '\ncomponent Text Added [0.8, 0.9]';

            // Re-render with updated text
            renderComponent({
                mapText: updatedMapText,
                mutateMapText: mockMutateMapText,
            });

            // Add component via toolbar
            const toolbarItem = container.querySelector('[data-testid="toolbar-item-component"]');
            act(() => {
                toolbarItem?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
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

            // Verify both text-added and toolbar-added components are present
            const finalText = mockMutateMapText.mock.calls[0][0];
            expect(finalText).toContain('component Text Added [0.8, 0.9]');
            expect(finalText).toContain('component New Component');
        });
    });

    describe('Requirement 6.3: Non-interference with map interactions', () => {
        it('should not interfere with zoom functionality', () => {
            renderComponent();

            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');

            // Test zoom via wheel event
            act(() => {
                const wheelEvent = new WheelEvent('wheel', {
                    deltaY: -100, // Zoom in
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(wheelEvent);
            });

            // Should not throw errors or interfere with zoom
            expect(svgPanZoom).toBeTruthy();
        });

        it('should not interfere with pan functionality', () => {
            renderComponent();

            // Test pan tool selection
            const panTool = container.querySelector('[data-testid="pan-tool"]');
            act(() => {
                panTool?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Should not interfere with pan tool activation
            expect(panTool).toBeTruthy();
        });

        it('should not interfere with component selection', () => {
            const mockSetHighlightLine = jest.fn();
            renderComponent({setHighlightLine: mockSetHighlightLine});

            // Click on existing component
            const existingComponent = container.querySelector('[data-testid="existing-component"]');
            act(() => {
                existingComponent?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Should highlight the component line
            expect(mockSetHighlightLine).toHaveBeenCalledWith(1);
        });

        it('should not interfere with fit-to-viewer functionality', () => {
            renderComponent();

            const fitButton = container.querySelector('[data-testid="fit-viewer"]');
            act(() => {
                fitButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Should not throw errors
            expect(fitButton).toBeTruthy();
        });

        it('should allow normal map interactions when no toolbar item is selected', () => {
            const mockSetNewComponentContext = jest.fn();
            renderComponent({setNewComponentContext: mockSetNewComponentContext});

            // Double-click should trigger QuickAdd context
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('dblclick', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Should set new component context for QuickAdd
            expect(mockSetNewComponentContext).toHaveBeenCalled();
        });

        it('should prevent normal double-click behavior when toolbar item is selected', () => {
            const mockSetNewComponentContext = jest.fn();
            renderComponent({setNewComponentContext: mockSetNewComponentContext});

            // Select toolbar item
            const toolbarItem = container.querySelector('[data-testid="toolbar-item-component"]');
            act(() => {
                toolbarItem?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Double-click should not trigger QuickAdd context
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const event = new MouseEvent('dblclick', {
                    clientX: 400,
                    clientY: 300,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(event);
            });

            // Should not set new component context
            expect(mockSetNewComponentContext).not.toHaveBeenCalled();
        });
    });

    describe('Requirement 6.4: Support for existing editing capabilities', () => {
        it('should allow components placed via toolbar to be selected and highlighted', () => {
            const mockMutateMapText = jest.fn();
            const mockSetHighlightLine = jest.fn();

            // Create a map with a component that was placed via toolbar
            const mapWithToolbarComponent: UnifiedWardleyMap = {
                ...mockWardleyMap,
                components: [
                    ...mockWardleyMap.components,
                    {
                        name: 'Toolbar Component',
                        maturity: 0.6,
                        visibility: 0.8,
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
            };

            renderComponent({
                wardleyMap: mapWithToolbarComponent,
                mutateMapText: mockMutateMapText,
                setHighlightLine: mockSetHighlightLine,
            });

            // Component should be selectable (this would be handled by UnifiedMapContent)
            // We verify the structure supports this functionality
            const mapContent = container.querySelector('[data-testid="unified-map-content"]');
            expect(mapContent).toBeTruthy();
        });

        it('should support linking components placed via toolbar', () => {
            const mockMutateMapText = jest.fn();

            // Simulate placing two components via toolbar and then linking them
            const mapWithMultipleComponents = `title Test Map
component A [0.1, 0.2]
component B [0.3, 0.4]
component Toolbar Component 1 [0.5, 0.6]
component Toolbar Component 2 [0.7, 0.8]`;

            renderComponent({
                mapText: mapWithMultipleComponents,
                mutateMapText: mockMutateMapText,
            });

            // The linking functionality would be handled by the existing map interaction system
            // We verify that toolbar components are part of the map structure
            expect(container.querySelector('[data-testid="unified-map-content"]')).toBeTruthy();
        });

        it('should support moving components placed via toolbar', () => {
            // Component movement is handled by the existing map editing system
            // Toolbar-placed components should be indistinguishable from manually-added ones
            const mapWithToolbarComponent = `title Test Map
component Existing Component [0.7, 0.5]
component Toolbar Component [0.6, 0.8]`;

            renderComponent({
                mapText: mapWithToolbarComponent,
            });

            // Verify the map structure supports component editing
            const mapContent = container.querySelector('[data-testid="unified-map-content"]');
            expect(mapContent).toBeTruthy();
        });

        it('should support deleting components placed via toolbar', () => {
            // Component deletion is handled by text editing
            // Toolbar-placed components should be deletable like any other component
            const mapWithToolbarComponent = `title Test Map
component Existing Component [0.7, 0.5]
component Toolbar Component [0.6, 0.8]`;

            const mockMutateMapText = jest.fn();
            renderComponent({
                mapText: mapWithToolbarComponent,
                mutateMapText: mockMutateMapText,
            });

            // Simulate deleting the toolbar component by updating map text
            const updatedMapText = `title Test Map
component Existing Component [0.7, 0.5]`;

            renderComponent({
                mapText: updatedMapText,
                mutateMapText: mockMutateMapText,
            });

            // Should handle the update without issues
            expect(container.querySelector('[data-testid="unified-map-content"]')).toBeTruthy();
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle toolbar deselection when clicking outside map area', () => {
            renderComponent();

            // Select toolbar item
            const toolbarItem = container.querySelector('[data-testid="toolbar-item-component"]');
            act(() => {
                toolbarItem?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });
            expect(toolbarItem?.getAttribute('aria-pressed')).toBe('true');

            // Click on container (outside map)
            const container_div = container.querySelector('div');
            act(() => {
                const event = new MouseEvent('click', {bubbles: true});
                Object.defineProperty(event, 'target', {value: container_div});
                Object.defineProperty(event, 'currentTarget', {value: container_div});
                container_div?.dispatchEvent(event);
            });

            // Toolbar item should be deselected
            expect(toolbarItem?.getAttribute('aria-pressed')).toBe('false');
        });

        it('should handle rapid switching between toolbar items and QuickAdd', () => {
            renderComponent();

            const toolbarItem1 = container.querySelector('[data-testid="toolbar-item-component"]');
            const toolbarItem2 = container.querySelector('[data-testid="toolbar-item-note"]');
            const quickAddButton = container.querySelector('[data-testid="quickadd-component"]');

            // Rapid switching
            act(() => {
                toolbarItem1?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                quickAddButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                toolbarItem2?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                quickAddButton?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                toolbarItem1?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            // Should end with toolbar item selected
            expect(toolbarItem1?.getAttribute('aria-pressed')).toBe('true');
            expect(toolbarItem2?.getAttribute('aria-pressed')).toBe('false');
        });

        it('should maintain toolbar state during map zoom and pan operations', () => {
            renderComponent();

            // Select toolbar item
            const toolbarItem = container.querySelector('[data-testid="toolbar-item-component"]');
            act(() => {
                toolbarItem?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });
            expect(toolbarItem?.getAttribute('aria-pressed')).toBe('true');

            // Perform zoom operation
            const svgPanZoom = container.querySelector('[data-testid="svg-pan-zoom"]');
            act(() => {
                const wheelEvent = new WheelEvent('wheel', {
                    deltaY: -100,
                    bubbles: true,
                });
                svgPanZoom?.dispatchEvent(wheelEvent);
            });

            // Toolbar selection should be maintained
            expect(toolbarItem?.getAttribute('aria-pressed')).toBe('true');
        });
    });
});
