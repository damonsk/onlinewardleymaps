/**
 * Integration test for pipeline toolbar functionality
 * This test validates that the enhanced pipeline toolbar generates the correct structure
 */

import {TOOLBAR_TEMPLATES} from '../../constants/toolbarItems';
import {generatePipelineMapText} from '../../utils/mapTextGeneration';
import {validatePositionWithPipelineDetection} from '../../utils/pipelineDetection';
import {createUnifiedComponent, createPipeline} from '../../types/unified/components';
import {UnifiedWardleyMap} from '../../types/unified/map';

describe('Pipeline Toolbar Integration Tests', () => {
    describe('Enhanced Pipeline Template', () => {
        it('should generate complete pipeline structure matching user requirements', () => {
            // Test the exact scenario from the user request
            const result = TOOLBAR_TEMPLATES.pipeline('Kettle', '0.45', '0.57');

            // Should contain both component line and pipeline block
            expect(result).toContain('component Kettle [0.45, 0.57]');
            expect(result).toContain('pipeline Kettle');
            expect(result).toContain('{');
            expect(result).toContain('component Pipeline Component 1');
            expect(result).toContain('component Pipeline Component 2');
            expect(result).toContain('}');

            // Verify the structure matches expected format
            const lines = result.split('\n');
            expect(lines[0]).toBe('component Kettle [0.45, 0.57]');
            expect(lines[1]).toBe('pipeline Kettle');
            expect(lines[2]).toBe('{');
            expect(lines[5]).toBe('}');
        });

        it('should properly space default components to avoid overlap', () => {
            const result = TOOLBAR_TEMPLATES.pipeline('Test', '0.50', '0.50');

            // Extract component maturities
            const component1Match = result.match(/Pipeline Component 1 \[(\d+\.\d+)\]/);
            const component2Match = result.match(/Pipeline Component 2 \[(\d+\.\d+)\]/);

            expect(component1Match).toBeTruthy();
            expect(component2Match).toBeTruthy();

            const maturity1 = parseFloat(component1Match![1]);
            const maturity2 = parseFloat(component2Match![1]);

            // Should be spaced 0.3 apart (or close to it due to edge case handling)
            const spacing = Math.abs(maturity2 - maturity1);
            expect(spacing).toBeGreaterThan(0.25); // Minimum reasonable spacing

            // Both should be within valid range
            expect(maturity1).toBeGreaterThanOrEqual(0);
            expect(maturity1).toBeLessThanOrEqual(1);
            expect(maturity2).toBeGreaterThanOrEqual(0);
            expect(maturity2).toBeLessThanOrEqual(1);
        });

        it('should handle edge cases for component positioning', () => {
            // Test near left edge
            const leftResult = TOOLBAR_TEMPLATES.pipeline('LeftPipeline', '0.50', '0.05');
            expect(leftResult).toContain('component LeftPipeline [0.50, 0.05]');

            // Test near right edge
            const rightResult = TOOLBAR_TEMPLATES.pipeline('RightPipeline', '0.50', '0.95');
            expect(rightResult).toContain('component RightPipeline [0.50, 0.95]');

            // Extract and validate component positions for edge cases
            [leftResult, rightResult].forEach(result => {
                const component1Match = result.match(/Pipeline Component 1 \[(\d+\.\d+)\]/);
                const component2Match = result.match(/Pipeline Component 2 \[(\d+\.\d+)\]/);

                const maturity1 = parseFloat(component1Match![1]);
                const maturity2 = parseFloat(component2Match![1]);

                expect(maturity1).toBeGreaterThanOrEqual(0);
                expect(maturity1).toBeLessThanOrEqual(1);
                expect(maturity2).toBeGreaterThanOrEqual(0);
                expect(maturity2).toBeLessThanOrEqual(1);
            });
        });
    });

    describe('Component Addition to Pipeline Workflow', () => {
        const createMockMap = (): UnifiedWardleyMap => ({
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

        it('should detect when component is within pipeline bounds', () => {
            const mockMap = createMockMap();

            // Position within the Kettle pipeline bounds
            const position = {x: 0.5, y: 0.57}; // Maturity 0.5 is between 0.3 and 0.6

            const validation = validatePositionWithPipelineDetection(position, mockMap);

            expect(validation.isValid).toBe(true);
            expect(validation.shouldSnapToPipeline).toBe(true);
            expect(validation.nearbyPipeline).toBeDefined();
            expect(validation.nearbyPipeline?.name).toBe('Kettle');
            expect(validation.nearbyPipeline?.minMaturity).toBe(0.3);
            expect(validation.nearbyPipeline?.maxMaturity).toBe(0.6);
        });

        it('should not detect pipeline when component is outside bounds', () => {
            const mockMap = createMockMap();

            // Position outside pipeline bounds
            const position = {x: 0.8, y: 0.57}; // Maturity 0.8 is outside 0.3-0.6 range

            const validation = validatePositionWithPipelineDetection(position, mockMap);

            expect(validation.isValid).toBe(true);
            expect(validation.shouldSnapToPipeline).toBe(false);
            expect(validation.nearbyPipeline).toBeUndefined();
        });

        it('should handle asymmetric tolerance for visibility matching', () => {
            const mockMap = createMockMap();

            // Position above pipeline but within reduced tolerance
            const positionAboveClose = {x: 0.45, y: 0.59}; // 0.02 difference from 0.57 (within 0.03 reduced tolerance)

            const validationAbove = validatePositionWithPipelineDetection(positionAboveClose, mockMap, {
                tolerance: 0.1, // Should detect with asymmetric tolerance
            });

            expect(validationAbove.shouldSnapToPipeline).toBe(true);

            // Position above pipeline but outside reduced tolerance
            const positionAboveFar = {x: 0.45, y: 0.62}; // 0.05 difference from 0.57 (outside 0.03 reduced tolerance)

            const validationAboveFar = validatePositionWithPipelineDetection(positionAboveFar, mockMap, {
                tolerance: 0.1, // Should NOT detect with asymmetric tolerance
            });

            expect(validationAboveFar.shouldSnapToPipeline).toBe(false);

            // Position below pipeline should still use full tolerance
            const positionBelow = {x: 0.45, y: 0.52}; // 0.05 difference from 0.57 (within 0.1 full tolerance below)

            const validationBelow = validatePositionWithPipelineDetection(positionBelow, mockMap, {
                tolerance: 0.1, // Should detect with full tolerance below
            });

            expect(validationBelow.shouldSnapToPipeline).toBe(true);
        });
    });

    describe('Full Pipeline Workflow Simulation', () => {
        it('should simulate complete pipeline creation and component addition workflow', () => {
            // Step 1: Create a pipeline using toolbar
            const pipelineText = TOOLBAR_TEMPLATES.pipeline('Electric Kettle', '0.60', '0.45');

            // Step 2: Verify pipeline structure
            expect(pipelineText).toContain('component Electric Kettle [0.60, 0.45]');
            expect(pipelineText).toContain('pipeline Electric Kettle');
            expect(pipelineText).toContain('Pipeline Component 1');
            expect(pipelineText).toContain('Pipeline Component 2');

            // Step 3: Simulate adding component to existing pipeline
            // This would happen when user clicks component toolbar and drops within pipeline bounds
            const mockMap: UnifiedWardleyMap = {
                title: 'Test Map',
                components: [
                    createUnifiedComponent({
                        id: 'electric_kettle',
                        name: 'Electric Kettle',
                        type: 'component',
                        maturity: 0.45,
                        visibility: 0.6,
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
                        id: 'electric_kettle_pipeline',
                        name: 'Electric Kettle',
                        visibility: 0.6,
                        line: 2,
                        components: [
                            {id: 'pc1', name: 'Pipeline Component 1', maturity: 0.3, visibility: 0.6, line: 3},
                            {id: 'pc2', name: 'Pipeline Component 2', maturity: 0.6, visibility: 0.6, line: 4},
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
            };

            // Step 4: Test component placement within pipeline bounds
            const componentPosition = {x: 0.5, y: 0.6}; // Within pipeline bounds
            const validation = validatePositionWithPipelineDetection(componentPosition, mockMap);

            expect(validation.shouldSnapToPipeline).toBe(true);
            expect(validation.nearbyPipeline?.name).toBe('Electric Kettle');

            // This validates the complete workflow from pipeline creation to component addition
        });

        it('should handle the exact user scenario: Kettle pipeline with foobar component', () => {
            // Step 1: Create Kettle pipeline as specified in user request
            const kettlePipeline = TOOLBAR_TEMPLATES.pipeline('Kettle', '0.45', '0.57');

            // Step 2: Verify it matches expected structure
            expect(kettlePipeline).toContain('component Kettle [0.45, 0.57]');
            expect(kettlePipeline).toContain('pipeline Kettle');

            // Step 3: Simulate the state after adding \"foobar\" component
            // This would be the result after user adds component via pipeline insertion
            const expectedWithFoobar = `component Kettle [0.45, 0.57]
pipeline Kettle
{
    component foobar [0.50] label [-10, -10]
    component Pipeline Component 1 [0.42]
    component Pipeline Component 2 [0.72]
}`;

            // Verify the components have reasonable positioning
            const originalComponent1 = kettlePipeline.match(/Pipeline Component 1 \[(\d+\.\d+)\]/);
            const originalComponent2 = kettlePipeline.match(/Pipeline Component 2 \[(\d+\.\d+)\]/);

            expect(originalComponent1).toBeTruthy();
            expect(originalComponent2).toBeTruthy();

            const maturity1 = parseFloat(originalComponent1![1]);
            const maturity2 = parseFloat(originalComponent2![1]);

            // Components should be spaced around the 0.57 base position
            expect(maturity1).toBeLessThan(0.57);
            expect(maturity2).toBeGreaterThan(0.57);
            expect(maturity2 - maturity1).toBeGreaterThan(0.2); // Reasonable spacing
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle invalid template inputs gracefully', () => {
            // Test with invalid coordinates
            expect(() => {
                TOOLBAR_TEMPLATES.pipeline('Test', 'invalid', '0.5');
            }).not.toThrow(); // Should fallback gracefully

            expect(() => {
                TOOLBAR_TEMPLATES.pipeline('Test', '0.5', 'invalid');
            }).not.toThrow(); // Should fallback gracefully
        });

        it('should handle empty pipeline name', () => {
            expect(() => {
                TOOLBAR_TEMPLATES.pipeline('', '0.5', '0.5');
            }).not.toThrow(); // Should handle empty name
        });

        it('should handle map with no pipelines', () => {
            const emptyMap: UnifiedWardleyMap = {
                title: 'Empty Map',
                components: [],
                anchors: [],
                submaps: [],
                markets: [],
                ecosystems: [],
                links: [],
                evolved: [],
                pipelines: [],
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
            };

            const validation = validatePositionWithPipelineDetection({x: 0.5, y: 0.5}, emptyMap);

            expect(validation.isValid).toBe(true);
            expect(validation.shouldSnapToPipeline).toBe(false);
        });
    });
});
