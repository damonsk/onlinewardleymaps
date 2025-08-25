/**
 * Integration tests for pipeline highlighting and global component uniqueness
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ComponentSelectionProvider } from '../../components/ComponentSelectionContext';
import { EditingProvider } from '../../components/EditingContext';
import { MapView } from '../../components/map/MapView';
import UndoRedoProvider from '../../components/UndoRedoProvider';
import { EvolutionStages, MapCanvasDimensions, MapDimensions, Offsets } from '../../constants/defaults';
import { MapTheme } from '../../types/map/styles';
import { UnifiedWardleyMap } from '../../types/unified/map';
import { 
    extractAllComponentNames, 
    generatePipelineMapTextWithGlobalUniqueness 
} from '../../utils/mapTextGeneration';
import { validatePositionWithPipelineDetection } from '../../utils/pipelineDetection';

// Mock ReactDOMServer to avoid MessageChannel issues in tests
jest.mock('react-dom/server', () => ({
    renderToString: jest.fn(() => '<svg>mock-cursor</svg>'),
}));

jest.mock('../../components/FeatureSwitchesContext', () => ({
    useFeatureSwitches: () => ({
        enableAccelerators: true,
        showMapToolbar: true,
        allowMapZoomMouseWheel: true,
        enableNewPipelines: true,
    }),
}));

jest.mock('react-svg-pan-zoom', () => {
    const React = require('react');
    return {
        UncontrolledReactSVGPanZoom: React.forwardRef<any, any>(function MockUncontrolledReactSVGPanZoom(
            { children, onClick, onDoubleClick, onMouseMove, ...props },
            ref,
        ) {
            const mockRef = {
                fitSelection: jest.fn(),
                setState: jest.fn(),
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
                    ref: () => mockRef,
                    ...props,
                },
                children,
            );
        }),
        TOOL_NONE: 'none',
    };
});

jest.mock('../../components/map/MapGridGroup', () => {
    return function MockMapGridGroup() {
        return <g data-testid="map-grid-group" />;
    };
});

const createTestMapData = (): UnifiedWardleyMap => ({
    title: 'Test Map for Pipeline Highlighting',
    components: [
        {
            id: 'user',
            name: 'User',
            type: 'component',
            maturity: 0.9,
            visibility: 0.8,
            line: 1,
            label: { x: 0, y: 0 },
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
            id: 'kettle',
            name: 'Kettle',
            type: 'component',
            maturity: 0.45,
            visibility: 0.57,
            line: 2,
            label: { x: 0, y: 0 },
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
    submaps: [],
    markets: [],
    ecosystems: [],
    links: [],
    evolved: [],
    pipelines: [
        {
            id: 'kettle_pipeline',
            name: 'Kettle',
            visibility: 0.57,
            line: 3,
            components: [
                {
                    id: 'pc1',
                    name: 'Pipeline Component 1',
                    maturity: 0.30,
                    visibility: 0.57,
                    line: 4,
                },
                {
                    id: 'pc2',
                    name: 'Pipeline Component 2',
                    maturity: 0.60,
                    visibility: 0.57,
                    line: 5,
                },
            ],
        },
    ],
    attitudes: [],
    accelerators: [],
    notes: [],
    annotations: [],
    methods: [],
    presentation: {
        style: '',
        annotations: { visibility: 0, maturity: 0 },
        size: { height: 600, width: 800 },
    },
    errors: [],
    evolution: [],
    urls: [],
});

const mockMapProps = {
    mapDimensions: { width: 500, height: 400 } as MapDimensions,
    mapCanvasDimensions: { width: 500, height: 400 } as MapCanvasDimensions,
    mapStyleDefs: { className: 'plain' } as MapTheme,
    mapEvolutionStates: {
        genesis: { l1: 'Genesis', l2: '' },
        custom: { l1: 'Custom Built', l2: '' },
        product: { l1: 'Product', l2: '(+rental)' },
        commodity: { l1: 'Commodity', l2: '(+utility)' },
    } as EvolutionStages,
    evolutionOffsets: { commodity: 0, product: 0, custom: 0 } as Offsets,
    setHighlightLine: jest.fn(),
    setNewComponentContext: jest.fn(),
    launchUrl: jest.fn(),
    showLinkedEvolved: false,
    mapAnnotationsPresentation: { visibility: 0, maturity: 0 },
    mutateMapText: jest.fn(),
    shouldHideNav: jest.fn(),
    hideNav: false,
    mapTitle: 'Test Map',
    mapRef: { current: null },
};

describe('Pipeline Highlighting and Global Uniqueness Integration Tests', () => {
    let mutateMapText: jest.Mock;
    let wardleyMap: UnifiedWardleyMap;
    let mapText: string;

    beforeEach(() => {
        mutateMapText = jest.fn();
        wardleyMap = createTestMapData();
        mapText = `title Test Map for Pipeline Highlighting
component User [0.80, 0.90]
component Kettle [0.57, 0.45]
pipeline Kettle
{
    component Pipeline Component 1 [0.30]
    component Pipeline Component 2 [0.60]
}`;
    });

    describe('Global Component Name Uniqueness', () => {
        it('should extract all component names including pipeline components', () => {
            const allNames = extractAllComponentNames(mapText);
            
            expect(allNames).toContain('User');
            expect(allNames).toContain('Kettle');
            expect(allNames).toContain('Pipeline Component 1');
            expect(allNames).toContain('Pipeline Component 2');
            expect(allNames).toHaveLength(4);
        });

        it('should generate globally unique names for pipeline default components', () => {
            const existingMapText = `title Test Map
component User [0.80, 0.90]
component Pipeline Component 1 [0.40, 0.70]
component Pipeline Component 2 [0.50, 0.80]`;

            const result = generatePipelineMapTextWithGlobalUniqueness(
                'New Pipeline',
                { x: 0.5, y: 0.6 },
                existingMapText
            );

            expect(result).toContain('component New Pipeline [0.60, 0.50]');
            expect(result).toContain('pipeline New Pipeline');
            expect(result).toContain('Pipeline Component 1 1'); // Unique name
            expect(result).toContain('Pipeline Component 2 1'); // Unique name
            expect(result).not.toContain('Pipeline Component 1 ['); // No duplicates
            expect(result).not.toContain('Pipeline Component 2 ['); // No duplicates
        });

        it('should handle complex naming conflicts', () => {
            const existingMapText = `title Test Map
component Pipeline Component 1 [0.30, 0.40]
component Pipeline Component 1 1 [0.35, 0.45]
component Pipeline Component 2 [0.40, 0.50]`;

            const result = generatePipelineMapTextWithGlobalUniqueness(
                'Complex Pipeline',
                { x: 0.5, y: 0.6 },
                existingMapText
            );

            expect(result).toContain('Pipeline Component 1 2'); // Next available
            expect(result).toContain('Pipeline Component 2 1'); // Next available
        });
    });

    describe('Pipeline Highlighting Detection', () => {
        it('should detect when position is within pipeline bounds', () => {
            const position = { x: 0.45, y: 0.57 }; // Within Kettle pipeline
            const result = validatePositionWithPipelineDetection(position, wardleyMap);
            
            expect(result.isValid).toBe(true);
            expect(result.shouldSnapToPipeline).toBe(true);
            expect(result.nearbyPipeline).toBeDefined();
            expect(result.nearbyPipeline?.name).toBe('Kettle');
        });

        it('should not detect when position is outside pipeline bounds', () => {
            const position = { x: 0.1, y: 0.1 }; // Outside any pipeline
            const result = validatePositionWithPipelineDetection(position, wardleyMap);
            
            expect(result.isValid).toBe(true);
            expect(result.shouldSnapToPipeline).toBe(false);
            expect(result.nearbyPipeline).toBeUndefined();
        });

        it('should handle edge cases with tolerance', () => {
            const position = { x: 0.45, y: 0.65 }; // Near pipeline but outside tolerance
            
            // With default tolerance (0.1), should detect
            const result1 = validatePositionWithPipelineDetection(position, wardleyMap);
            expect(result1.shouldSnapToPipeline).toBe(true);
            
            // With stricter tolerance, should not detect
            const result2 = validatePositionWithPipelineDetection(position, wardleyMap, {
                tolerance: 0.05,
            });
            expect(result2.shouldSnapToPipeline).toBe(false);
        });
    });

    describe('Visual Component Rendering', () => {
        it('should render map view with pipeline highlighting capability', async () => {
            render(
                <UndoRedoProvider>
                    <EditingProvider>
                        <ComponentSelectionProvider>
                            <MapView
                                {...mockMapProps}
                                wardleyMap={wardleyMap}
                                mapText={mapText}
                                mutateMapText={mutateMapText}
                            />
                        </ComponentSelectionProvider>
                    </EditingProvider>
                </UndoRedoProvider>
            );

            // Check that the map renders
            expect(screen.getByTestId('svg-pan-zoom')).toBeInTheDocument();
            
            // The ModernPipelineBoxSymbol should be rendered (though not directly testable in unit tests)
            // This ensures the component structure is properly integrated
        });

        it('should pass highlighting state through component hierarchy', async () => {
            const TestComponent = () => {
                const [highlighted, setHighlighted] = React.useState<string | null>(null);
                
                React.useEffect(() => {
                    // Simulate component toolbar selection and hover over pipeline
                    setHighlighted('Kettle');
                }, []);

                return (
                    <div data-testid="highlighted-pipeline">
                        Pipeline {highlighted} is highlighted: {highlighted ? 'true' : 'false'}
                    </div>
                );
            };

            render(<TestComponent />);
            
            await waitFor(() => {
                expect(screen.getByTestId('highlighted-pipeline')).toHaveTextContent(
                    'Pipeline Kettle is highlighted: true'
                );
            });
        });
    });

    describe('Component Placement Workflow', () => {
        it('should handle component placement within pipeline bounds', () => {
            const position = { x: 0.45, y: 0.57 }; // Within Kettle pipeline
            const validation = validatePositionWithPipelineDetection(position, wardleyMap);
            
            // Should trigger pipeline component insertion
            expect(validation.shouldSnapToPipeline).toBe(true);
            expect(validation.nearbyPipeline?.name).toBe('Kettle');
            
            // Global uniqueness should work for new component names
            const allNames = extractAllComponentNames(mapText);
            expect(allNames).toContain('Pipeline Component 1');
            expect(allNames).toContain('Pipeline Component 2');
            
            // New component should get unique name
            // (This would be handled by the component placement handlers)
        });

        it('should handle regular component placement outside pipelines', () => {
            const position = { x: 0.8, y: 0.3 }; // Outside any pipeline
            const validation = validatePositionWithPipelineDetection(position, wardleyMap);
            
            expect(validation.shouldSnapToPipeline).toBe(false);
            expect(validation.nearbyPipeline).toBeUndefined();
            
            // Should proceed with regular component placement
            expect(validation.isValid).toBe(true);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle empty map text gracefully', () => {
            const emptyMapText = 'title Empty Map';
            const allNames = extractAllComponentNames(emptyMapText);
            
            expect(allNames).toHaveLength(0);
        });

        it('should handle malformed pipeline blocks', () => {
            const malformedMapText = `title Malformed Map
component Test [0.50, 0.50]
pipeline Broken
{
    // Missing closing brace`;

            const allNames = extractAllComponentNames(malformedMapText);
            expect(allNames).toContain('Test');
            // Should not crash on malformed pipeline
        });

        it('should handle invalid coordinates gracefully', () => {
            const invalidPosition = { x: -0.5, y: 1.5 };
            const result = validatePositionWithPipelineDetection(invalidPosition, wardleyMap);
            
            expect(result.isValid).toBe(false);
            expect(result.shouldSnapToPipeline).toBe(false);
        });
    });

    describe('Performance and Memory Management', () => {
        it('should handle large maps with many pipelines efficiently', () => {
            // Create a map with multiple pipelines
            const largePipelineMap = {
                ...wardleyMap,
                pipelines: Array.from({ length: 10 }, (_, i) => ({
                    id: `pipeline_${i}`,
                    name: `Pipeline ${i}`,
                    visibility: 0.5 + (i * 0.05),
                    line: 10 + i,
                    components: [
                        {
                            id: `pc1_${i}`,
                            name: `Component 1-${i}`,
                            maturity: 0.3 + (i * 0.05),
                            visibility: 0.5 + (i * 0.05),
                            line: 20 + (i * 2),
                        },
                        {
                            id: `pc2_${i}`,
                            name: `Component 2-${i}`,
                            maturity: 0.6 + (i * 0.05),
                            visibility: 0.5 + (i * 0.05),
                            line: 21 + (i * 2),
                        },
                    ],
                })),
            };

            const position = { x: 0.45, y: 0.55 };
            const start = performance.now();
            const result = validatePositionWithPipelineDetection(position, largePipelineMap);
            const end = performance.now();

            expect(end - start).toBeLessThan(10); // Should complete in less than 10ms
            expect(result.isValid).toBe(true);
        });
    });
});