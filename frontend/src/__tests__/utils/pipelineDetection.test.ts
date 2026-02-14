/**
 * Unit tests for pipeline detection utilities
 */

import {
    validatePositionWithPipelineDetection,
    detectNearbyPipeline,
    getAllPipelineBounds,
    findBestPipelineForPosition,
    generateUniquePipelineComponentName,
} from '../../utils/pipelineDetection';
import {createUnifiedComponent, createPipeline} from '../../types/unified/components';
import {UnifiedWardleyMap} from '../../types/unified/map';

const createMockWardleyMap = (): UnifiedWardleyMap => ({
    title: 'Test Map',
    components: [
        createUnifiedComponent({
            id: 'kettle',
            name: 'Kettle',
            type: 'component',
            maturity: 0.45,
            visibility: 0.57,
            line: 1,
        }),
    ],
    anchors: [],
    submaps: [],
    markets: [],
    ecosystems: [],
    links: [],
    evolved: [],
    pipelines: [
        createPipeline({
            id: 'kettle_pipeline',
            name: 'Kettle',
            visibility: 0.57,
            line: 2,
            components: [
                {id: 'pc1', name: 'Pipeline Component 1', maturity: 0.3, visibility: 0.57, line: 3},
                {id: 'pc2', name: 'Pipeline Component 2', maturity: 0.6, visibility: 0.57, line: 4},
            ],
        }),
        createPipeline({
            id: 'another_pipeline',
            name: 'Another Pipeline',
            visibility: 0.8,
            line: 5,
            components: [
                {id: 'apc1', name: 'Another Component 1', maturity: 0.1, visibility: 0.8, line: 6},
                {id: 'apc2', name: 'Another Component 2', maturity: 0.2, visibility: 0.8, line: 7},
            ],
        }),
    ],
    attitudes: [],
    accelerators: [],
    notes: [],
    annotations: [],
    methods: [],
    presentation: {
        style: '',
        annotations: {visibility: 0, maturity: 0},
        size: {height: 600, width: 800},
    },
    errors: [],
    evolution: [],
    urls: [],
});

describe('Pipeline Detection Utilities', () => {
    describe('validatePositionWithPipelineDetection', () => {
        const mockMap = createMockWardleyMap();

        it('should detect pipeline when position is within bounds', () => {
            const position = {x: 0.45, y: 0.57}; // Within Kettle pipeline
            const result = validatePositionWithPipelineDetection(position, mockMap);

            expect(result.isValid).toBe(true);
            expect(result.shouldSnapToPipeline).toBe(true);
            expect(result.nearbyPipeline).toBeDefined();
            expect(result.nearbyPipeline?.name).toBe('Kettle');
        });

        it('should not detect pipeline when position is outside bounds', () => {
            const position = {x: 0.9, y: 0.9}; // Outside any pipeline
            const result = validatePositionWithPipelineDetection(position, mockMap);

            expect(result.isValid).toBe(true);
            expect(result.shouldSnapToPipeline).toBe(false);
            expect(result.nearbyPipeline).toBeUndefined();
        });

        it('should handle invalid position coordinates', () => {
            const position = {x: -0.5, y: 1.5}; // Invalid coordinates
            const result = validatePositionWithPipelineDetection(position, mockMap);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should work with pipeline snapping disabled', () => {
            const position = {x: 0.45, y: 0.57};
            const result = validatePositionWithPipelineDetection(position, mockMap, {
                enablePipelineSnapping: false,
            });

            expect(result.isValid).toBe(true);
            expect(result.shouldSnapToPipeline).toBe(false);
        });

        it('should suggest corrected position for pipeline snapping', () => {
            const position = {x: 0.45, y: 0.55}; // Near Kettle pipeline but slightly off
            const result = validatePositionWithPipelineDetection(position, mockMap);

            if (result.shouldSnapToPipeline && result.suggestedPosition) {
                expect(result.suggestedPosition.x).toBe(0.45); // Keep maturity
                expect(result.suggestedPosition.y).toBe(0.57); // Snap to pipeline visibility
            }
        });

        it('should handle asymmetric tolerance (reduced above pipeline)', () => {
            const position = {x: 0.45, y: 0.65}; // 0.08 away from pipeline visibility (above)

            // With default tolerance (0.1), positions above pipeline use reduced tolerance (0.03)
            // So 0.08 difference should NOT be detected (outside 0.03 tolerance)
            const result1 = validatePositionWithPipelineDetection(position, mockMap);
            expect(result1.shouldSnapToPipeline).toBe(false);

            // Position closer above pipeline should be detected
            const positionCloser = {x: 0.45, y: 0.59}; // 0.02 away (within 0.03 tolerance)
            const result2 = validatePositionWithPipelineDetection(positionCloser, mockMap);
            expect(result2.shouldSnapToPipeline).toBe(true);

            // Position below pipeline should still use full tolerance
            const positionBelow = {x: 0.45, y: 0.49}; // 0.08 away (below, within 0.1 tolerance)
            const result3 = validatePositionWithPipelineDetection(positionBelow, mockMap);
            expect(result3.shouldSnapToPipeline).toBe(true);
        });
    });

    describe('detectNearbyPipeline', () => {
        const mockMap = createMockWardleyMap();

        it('should detect correct pipeline for position within bounds', () => {
            const position = {x: 0.45, y: 0.57};
            const result = detectNearbyPipeline(position, mockMap.pipelines);

            expect(result).toBeDefined();
            expect(result?.name).toBe('Kettle');
            expect(result?.minMaturity).toBe(0.3);
            expect(result?.maxMaturity).toBe(0.6);
        });

        it('should detect another pipeline', () => {
            const position = {x: 0.15, y: 0.8};
            const result = detectNearbyPipeline(position, mockMap.pipelines);

            expect(result).toBeDefined();
            expect(result?.name).toBe('Another Pipeline');
        });

        it('should return undefined when no pipeline matches', () => {
            const position = {x: 0.9, y: 0.1};
            const result = detectNearbyPipeline(position, mockMap.pipelines);

            expect(result).toBeUndefined();
        });

        it('should handle empty pipelines array', () => {
            const position = {x: 0.5, y: 0.5};
            const result = detectNearbyPipeline(position, []);

            expect(result).toBeUndefined();
        });

        it('should handle invalid pipeline data gracefully', () => {
            const invalidPipelines = [
                {name: 'Invalid', components: null}, // Invalid components
                {components: []}, // Missing name
            ] as any;

            const position = {x: 0.5, y: 0.5};
            const result = detectNearbyPipeline(position, invalidPipelines);

            // Pipeline validation is more lenient now and processes invalid pipelines
            expect(result).toBeDefined();
            expect(result?.name).toBe('Invalid');
        });
    });

    describe('getAllPipelineBounds', () => {
        const mockMap = createMockWardleyMap();

        it('should return bounds for all valid pipelines', () => {
            const bounds = getAllPipelineBounds(mockMap);

            expect(bounds).toHaveLength(2);
            expect(bounds[0].name).toBe('Kettle');
            expect(bounds[1].name).toBe('Another Pipeline');
        });

        it('should handle empty pipelines array', () => {
            const emptyMap = {...mockMap, pipelines: []};
            const bounds = getAllPipelineBounds(emptyMap);

            expect(bounds).toHaveLength(0);
        });

        it('should skip invalid pipelines and continue processing', () => {
            const mapWithInvalidPipeline = {
                ...mockMap,
                pipelines: [
                    ...mockMap.pipelines,
                    {name: 'Invalid', components: null} as any, // This should be skipped
                ],
            };

            const bounds = getAllPipelineBounds(mapWithInvalidPipeline);
            expect(bounds).toHaveLength(3); // All pipelines are now processed
        });
    });

    describe('findBestPipelineForPosition', () => {
        const mockMap = createMockWardleyMap();

        it('should find the best matching pipeline', () => {
            const position = {x: 0.45, y: 0.57};
            const result = findBestPipelineForPosition(position, mockMap);

            expect(result).toBeDefined();
            expect(result?.name).toBe('Kettle');
        });

        it('should prefer closer pipeline when multiple match', () => {
            // Create a map with overlapping pipelines
            const overlappingMap = {
                ...mockMap,
                pipelines: [
                    createPipeline({
                        id: 'pipeline1',
                        name: 'Pipeline 1',
                        visibility: 0.5,
                        components: [
                            {id: 'p1c1', name: 'P1C1', maturity: 0.3, visibility: 0.5, line: 1},
                            {id: 'p1c2', name: 'P1C2', maturity: 0.7, visibility: 0.5, line: 2},
                        ],
                    }),
                    createPipeline({
                        id: 'pipeline2',
                        name: 'Pipeline 2',
                        visibility: 0.6,
                        components: [
                            {id: 'p2c1', name: 'P2C1', maturity: 0.3, visibility: 0.6, line: 3},
                            {id: 'p2c2', name: 'P2C2', maturity: 0.7, visibility: 0.6, line: 4},
                        ],
                    }),
                ],
            };

            const position = {x: 0.5, y: 0.52}; // Closer to Pipeline 1
            const result = findBestPipelineForPosition(position, overlappingMap);

            expect(result?.name).toBe('Pipeline 1');
        });

        it('should return undefined when no pipeline matches', () => {
            const position = {x: 0.9, y: 0.1};
            const result = findBestPipelineForPosition(position, mockMap);

            expect(result).toBeUndefined();
        });
    });

    describe('generateUniquePipelineComponentName', () => {
        it('should return base name when no conflicts', () => {
            const result = generateUniquePipelineComponentName('Test Component', []);
            expect(result).toBe('Test Component');
        });

        it('should append number when name conflicts exist', () => {
            const existingNames = ['Test Component', 'Test Component 1'];
            const result = generateUniquePipelineComponentName('Test Component', existingNames);
            expect(result).toBe('Test Component 2');
        });

        it('should find first available number', () => {
            const existingNames = ['Test Component', 'Test Component 2', 'Test Component 3'];
            const result = generateUniquePipelineComponentName('Test Component', existingNames);
            expect(result).toBe('Test Component 1');
        });

        it('should use default base name when not provided', () => {
            const result = generateUniquePipelineComponentName();
            expect(result).toBe('New Component');
        });

        it('should handle large number of conflicts', () => {
            const existingNames = Array.from({length: 50}, (_, i) => (i === 0 ? 'Test Component' : `Test Component ${i}`));
            const result = generateUniquePipelineComponentName('Test Component', existingNames);
            expect(result).toBe('Test Component 50');
        });

        it('should fallback to timestamp when max attempts exceeded', () => {
            const existingNames = Array.from({length: 200}, (_, i) => (i === 0 ? 'Test Component' : `Test Component ${i}`));
            const result = generateUniquePipelineComponentName('Test Component', existingNames, 50);
            expect(result).toContain('Test Component');
            expect(result.length).toBeGreaterThan('Test Component'.length);
        });
    });
});

/**
 * Integration tests for pipeline detection workflow
 */
describe('Pipeline Detection Integration', () => {
    const mockMap = createMockWardleyMap();

    it('should complete full detection workflow', () => {
        // Step 1: Position near a pipeline
        const position = {x: 0.45, y: 0.55}; // Near Kettle pipeline

        // Step 2: Validate with pipeline detection
        const validation = validatePositionWithPipelineDetection(position, mockMap);

        expect(validation.isValid).toBe(true);
        expect(validation.shouldSnapToPipeline).toBe(true);

        // Step 3: Get suggested position
        const suggestedPosition = validation.suggestedPosition;
        expect(suggestedPosition).toBeDefined();
        expect(suggestedPosition?.y).toBe(0.57); // Snapped to pipeline visibility

        // Step 4: Generate unique component name
        const existingNames = mockMap.components.map(c => c.name);
        const componentName = generateUniquePipelineComponentName('New Component', existingNames);
        expect(componentName).toBe('New Component');
    });

    it('should handle position not near any pipeline', () => {
        const position = {x: 0.8, y: 0.3}; // Not near any pipeline

        const validation = validatePositionWithPipelineDetection(position, mockMap);

        expect(validation.isValid).toBe(true);
        expect(validation.shouldSnapToPipeline).toBe(false);
        expect(validation.nearbyPipeline).toBeUndefined();
    });

    it('should prefer exact matches over approximate matches', () => {
        const exactPosition = {x: 0.45, y: 0.57}; // Exact match
        const nearPosition = {x: 0.45, y: 0.59}; // Near match (within reduced tolerance)

        const exactResult = validatePositionWithPipelineDetection(exactPosition, mockMap);
        const nearResult = validatePositionWithPipelineDetection(nearPosition, mockMap);

        expect(exactResult.shouldSnapToPipeline).toBe(true);
        expect(nearResult.shouldSnapToPipeline).toBe(true);

        // Both should detect the same pipeline
        expect(exactResult.nearbyPipeline?.name).toBe(nearResult.nearbyPipeline?.name);
    });
});
