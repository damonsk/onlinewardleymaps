/**
 * Comprehensive validation test for pipeline toolbar requirements
 * This test validates that all user requirements from the specification are met
 */

import { TOOLBAR_TEMPLATES } from '../../constants/toolbarItems';
import { insertPipelineComponent } from '../../utils/mapTextGeneration';
import { validatePositionWithPipelineDetection } from '../../utils/pipelineDetection';
import { createUnifiedComponent, createPipeline } from '../../types/unified/components';
import { UnifiedWardleyMap } from '../../types/unified/map';

describe('Pipeline Requirements Validation', () => {
    describe('Requirement 1: Pipeline toolbar generates both component and pipeline lines', () => {
        it('should generate the exact structure specified in requirements', () => {
            const result = TOOLBAR_TEMPLATES.pipeline('Kettle', '0.45', '0.57');
            
            // Must contain component line
            expect(result).toMatch(/^component Kettle \[0\.45, 0\.57\]/m);
            
            // Must contain pipeline block
            expect(result).toMatch(/^pipeline Kettle$/m);
            expect(result).toMatch(/^\{$/m);
            expect(result).toMatch(/^\}$/m);
            
            // Must contain default components
            expect(result).toMatch(/component Pipeline Component 1 \[/);
            expect(result).toMatch(/component Pipeline Component 2 \[/);
            
            console.log('Generated pipeline structure:');
            console.log(result);
        });

        it('should match the exact format from user requirements', () => {
            const result = TOOLBAR_TEMPLATES.pipeline('Kettle', '0.45', '0.57');
            
            // The format should be:
            // component Kettle [0.45, 0.57]
            // pipeline Kettle
            // {
            //     component Pipeline Component 1 [...]
            //     component Pipeline Component 2 [...]
            // }
            
            const lines = result.split('\n');
            expect(lines[0]).toBe('component Kettle [0.45, 0.57]');
            expect(lines[1]).toBe('pipeline Kettle');
            expect(lines[2]).toBe('{');
            expect(lines[3]).toMatch(/^\s+component Pipeline Component 1 \[/);
            expect(lines[4]).toMatch(/^\s+component Pipeline Component 2 \[/);
            expect(lines[5]).toBe('}');
        });
    });

    describe('Requirement 2: 0.3 spacing between default components', () => {
        it('should space components 0.3 apart relative to pipeline position', () => {
            const testCases = [
                { x: '0.5', expectedSpacing: 0.3 },
                { x: '0.3', expectedSpacing: 0.3 }, // Should adjust for boundaries
                { x: '0.7', expectedSpacing: 0.3 }, // Should adjust for boundaries
            ];
            
            testCases.forEach(testCase => {
                const result = TOOLBAR_TEMPLATES.pipeline('Test', '0.5', testCase.x);
                
                const component1Match = result.match(/Pipeline Component 1 \[(\d+\.\d+)\]/);
                const component2Match = result.match(/Pipeline Component 2 \[(\d+\.\d+)\]/);
                
                expect(component1Match).toBeTruthy();
                expect(component2Match).toBeTruthy();
                
                const maturity1 = parseFloat(component1Match![1]);
                const maturity2 = parseFloat(component2Match![1]);
                const actualSpacing = Math.abs(maturity2 - maturity1);
                
                // Should be close to 0.3 or adjusted for boundaries
                expect(actualSpacing).toBeGreaterThan(0.25);
                expect(actualSpacing).toBeLessThanOrEqual(0.35);
                
                console.log(`X: ${testCase.x}, Spacing: ${actualSpacing.toFixed(2)}, Components: [${maturity1.toFixed(2)}, ${maturity2.toFixed(2)}]`);
            });
        });

        it('should keep components within valid range [0, 1]', () => {
            const edgeCases = ['0.05', '0.95']; // Near boundaries
            
            edgeCases.forEach(x => {
                const result = TOOLBAR_TEMPLATES.pipeline('Edge', '0.5', x);
                
                const component1Match = result.match(/Pipeline Component 1 \[(\d+\.\d+)\]/);
                const component2Match = result.match(/Pipeline Component 2 \[(\d+\.\d+)\]/);
                
                const maturity1 = parseFloat(component1Match![1]);
                const maturity2 = parseFloat(component2Match![1]);
                
                expect(maturity1).toBeGreaterThanOrEqual(0);
                expect(maturity1).toBeLessThanOrEqual(1);
                expect(maturity2).toBeGreaterThanOrEqual(0);
                expect(maturity2).toBeLessThanOrEqual(1);
                
                console.log(`Edge case X: ${x}, Components: [${maturity1.toFixed(2)}, ${maturity2.toFixed(2)}]`);
            });
        });
    });

    describe('Requirement 3: Component insertion into existing pipelines', () => {
        const mockMapText = `title Test Map
component Kettle [0.45, 0.57]
pipeline Kettle
{
    component Pipeline Component 1 [0.30]
    component Pipeline Component 2 [0.60]
}`;
        
        it('should insert component with only maturity coordinate', () => {
            const result = insertPipelineComponent(mockMapText, 'Kettle', 'foobar', 0.50);
            
            // Should contain the new component with only maturity
            expect(result).toMatch(/component foobar \[0\.50\]/);
            
            // Should not have visibility coordinate for pipeline component
            expect(result).not.toMatch(/component foobar \[0\.50, /);
            
            console.log('Map with inserted component:');
            console.log(result);
        });

        it('should support optional label offset', () => {
            const result = insertPipelineComponent(mockMapText, 'Kettle', 'foobar', 0.50, { x: -10, y: -10 });
            
            // Should contain the component with label offset
            expect(result).toMatch(/component foobar \[0\.50\] label \[-10, -10\]/);
            
            console.log('Component with label offset:');
            console.log(result);
        });

        it('should insert at beginning of pipeline block', () => {
            const result = insertPipelineComponent(mockMapText, 'Kettle', 'foobar', 0.50);
            
            // Find the positions of components in the result
            const foobarIndex = result.indexOf('component foobar');
            const component1Index = result.indexOf('component Pipeline Component 1');
            
            expect(foobarIndex).toBeLessThan(component1Index);
            expect(foobarIndex).toBeGreaterThan(result.indexOf('{'));
        });

        it('should preserve existing pipeline components', () => {
            const result = insertPipelineComponent(mockMapText, 'Kettle', 'foobar', 0.50);
            
            expect(result).toContain('component Pipeline Component 1 [0.30]');
            expect(result).toContain('component Pipeline Component 2 [0.60]');
        });

        it('should match the exact format from user requirements', () => {
            const result = insertPipelineComponent(mockMapText, 'Kettle', 'foobar', 0.50, { x: -10, y: -10 });
            
            // Should match:
            // component Kettle [0.45, 0.57]
            // pipeline Kettle
            // {
            //     component foobar [0.50] label [-10, -10]
            //     component Pipeline Component 1 [...]
            //     component Pipeline Component 2 [...]
            // }
            
            const lines = result.split('\n');
            expect(lines.find(line => line.includes('component foobar'))).toMatch(
                /^\s+component foobar \[0\.50\] label \[-10, -10\]$/
            );
        });
    });

    describe('Requirement 4: Automatic component snapping to pipelines', () => {
        const createTestMap = (): UnifiedWardleyMap => ({
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
                        { id: 'pc1', name: 'Pipeline Component 1', maturity: 0.10, visibility: 0.57, line: 3 },
                        { id: 'pc2', name: 'Pipeline Component 2', maturity: 0.90, visibility: 0.57, line: 4 },
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
                annotations: { visibility: 0, maturity: 0 },
                size: { height: 600, width: 800 },
            },
            errors: [],
            evolution: [],
            urls: [],
        });

        it('should detect when component is within pipeline maturity bounds', () => {
            const mockMap = createTestMap();
            
            // Test positions within the pipeline bounds (0.1 to 0.9)
            const withinBounds = [
                { x: 0.1, y: 0.57 }, // At left boundary
                { x: 0.5, y: 0.57 }, // In middle
                { x: 0.9, y: 0.57 }, // At right boundary
                { x: 0.4, y: 0.57 }, // Between components
            ];
            
            withinBounds.forEach(position => {
                const validation = validatePositionWithPipelineDetection(position, mockMap);
                
                expect(validation.shouldSnapToPipeline).toBe(true);
                expect(validation.nearbyPipeline?.name).toBe('Kettle');
                
                console.log(`Position [${position.x}, ${position.y}] detected pipeline: ${validation.nearbyPipeline?.name}`);
            });
        });

        it('should not detect when component is outside pipeline bounds', () => {
            const mockMap = createTestMap();
            
            // Test positions outside the pipeline bounds
            const outsideBounds = [
                { x: 0.05, y: 0.57 }, // Left of pipeline
                { x: 0.95, y: 0.57 }, // Right of pipeline
                { x: 0.5, y: 0.3 },   // Wrong visibility
                { x: 0.5, y: 0.8 },   // Wrong visibility
            ];
            
            outsideBounds.forEach(position => {
                const validation = validatePositionWithPipelineDetection(position, mockMap);
                
                expect(validation.shouldSnapToPipeline).toBe(false);
                
                console.log(`Position [${position.x}, ${position.y}] correctly NOT detected`);
            });
        });

        it('should work with intermediate components in pipeline', () => {
            const mockMap = createTestMap();
            
            // Position between existing components (0.1 and 0.9) but closer to 0.4
            const position = { x: 0.4, y: 0.57 };
            
            const validation = validatePositionWithPipelineDetection(position, mockMap);
            
            expect(validation.shouldSnapToPipeline).toBe(true);
            expect(validation.nearbyPipeline?.name).toBe('Kettle');
            expect(validation.nearbyPipeline?.minMaturity).toBe(0.1);
            expect(validation.nearbyPipeline?.maxMaturity).toBe(0.9);
        });
    });

    describe('Requirement 5: Complete workflow validation', () => {
        it('should handle the complete user scenario end-to-end', () => {
            // Step 1: Create initial pipeline
            const initialPipeline = TOOLBAR_TEMPLATES.pipeline('Kettle', '0.45', '0.57');
            
            console.log('Step 1 - Initial pipeline:');
            console.log(initialPipeline);
            
            // Step 2: Add foobar component to the pipeline
            const withFoobar = insertPipelineComponent(initialPipeline, 'Kettle', 'foobar', 0.50, { x: -10, y: -10 });
            
            console.log('\nStep 2 - After adding foobar:');
            console.log(withFoobar);
            
            // Validate final structure
            expect(withFoobar).toContain('component Kettle [0.45, 0.57]');
            expect(withFoobar).toContain('pipeline Kettle');
            expect(withFoobar).toContain('component foobar [0.50] label [-10, -10]');
            expect(withFoobar).toContain('component Pipeline Component 1');
            expect(withFoobar).toContain('component Pipeline Component 2');
            
            // Verify order: foobar should be first in pipeline block
            const foobarIndex = withFoobar.indexOf('component foobar');
            const component1Index = withFoobar.indexOf('component Pipeline Component 1');
            expect(foobarIndex).toBeLessThan(component1Index);
        });

        it('should demonstrate the choice aspect of pipelines', () => {
            // Create Electric Kettle OR Campfire Kettle scenario
            const kettlePipeline = TOOLBAR_TEMPLATES.pipeline('Kettle', '0.45', '0.57');
            
            // Add Electric Kettle option
            const withElectric = insertPipelineComponent(kettlePipeline, 'Kettle', 'Electric Kettle', 0.7);
            
            // Add Campfire Kettle option
            const withBothOptions = insertPipelineComponent(withElectric, 'Kettle', 'Campfire Kettle', 0.3);
            
            console.log('\nPipeline with choice options:');
            console.log(withBothOptions);
            
            // Should contain both options as choices in the pipeline
            expect(withBothOptions).toContain('component Electric Kettle [0.70]');
            expect(withBothOptions).toContain('component Campfire Kettle [0.30]');
            expect(withBothOptions).toContain('component Pipeline Component 1');
            expect(withBothOptions).toContain('component Pipeline Component 2');
        });
    });

    describe('Requirement 6: Performance and reliability', () => {
        it('should handle multiple pipeline operations efficiently', () => {
            const startTime = Date.now();
            
            // Create multiple pipelines
            for (let i = 0; i < 10; i++) {
                const pipeline = TOOLBAR_TEMPLATES.pipeline(`Pipeline${i}`, '0.5', (0.1 + i * 0.08).toFixed(2));
                expect(pipeline).toContain(`component Pipeline${i}`);
                expect(pipeline).toContain(`pipeline Pipeline${i}`);
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log(`Created 10 pipelines in ${duration}ms`);
            expect(duration).toBeLessThan(100); // Should be fast
        });

        it('should handle edge cases gracefully', () => {
            // Test various edge cases that shouldn't crash
            const edgeCases = [
                () => TOOLBAR_TEMPLATES.pipeline('', '0.5', '0.5'),
                () => TOOLBAR_TEMPLATES.pipeline('Test', '0', '0'),
                () => TOOLBAR_TEMPLATES.pipeline('Test', '1', '1'),
                () => TOOLBAR_TEMPLATES.pipeline('Test', '-0.1', '1.1'),
            ];
            
            edgeCases.forEach((testCase, index) => {
                expect(() => {
                    const result = testCase();
                    console.log(`Edge case ${index + 1} result: ${result.substring(0, 50)}...`);
                }).not.toThrow();
            });
        });
    });
});