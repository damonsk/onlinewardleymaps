/**
 * Unit tests for pipeline text generation utilities
 */

import {
    calculatePipelineComponentPositions,
    generatePipelineBlock,
    generatePipelineMapText,
    insertPipelineComponent,
    calculatePipelineBounds,
    isPositionWithinPipelineBounds,
    PipelineBounds,
} from '../../utils/mapTextGeneration';

describe('Pipeline Text Generation Utilities', () => {
    describe('calculatePipelineComponentPositions', () => {
        it('should calculate positions with default spacing', () => {
            const result = calculatePipelineComponentPositions(0.5);
            expect(result.component1).toBe(0.35);
            expect(result.component2).toBe(0.65);
        });

        it('should handle edge case when component1 would be below 0', () => {
            const result = calculatePipelineComponentPositions(0.1);
            expect(result.component1).toBeGreaterThanOrEqual(0);
            expect(result.component2).toBeLessThanOrEqual(1);
            expect(result.component2 - result.component1).toBeGreaterThan(0.1);
        });

        it('should handle edge case when component2 would be above 1', () => {
            const result = calculatePipelineComponentPositions(0.9);
            expect(result.component1).toBeGreaterThanOrEqual(0);
            expect(result.component2).toBeLessThanOrEqual(1);
            expect(result.component2 - result.component1).toBeGreaterThan(0.1);
        });

        it('should use custom spacing', () => {
            const result = calculatePipelineComponentPositions(0.5, 0.2);
            expect(result.component1).toBe(0.4);
            expect(result.component2).toBe(0.6);
        });

        it('should throw error for invalid base maturity', () => {
            expect(() => calculatePipelineComponentPositions(NaN)).toThrow('Base maturity must be a valid number');
            expect(() => calculatePipelineComponentPositions('invalid' as any)).toThrow('Base maturity must be a valid number');
        });

        it('should throw error for invalid spacing', () => {
            expect(() => calculatePipelineComponentPositions(0.5, 0)).toThrow('Spacing must be a positive number');
            expect(() => calculatePipelineComponentPositions(0.5, -0.1)).toThrow('Spacing must be a positive number');
        });
    });

    describe('generatePipelineBlock', () => {
        it('should generate a properly formatted pipeline block', () => {
            const result = generatePipelineBlock('Test Pipeline', 0.5);
            expect(result).toContain('pipeline Test Pipeline');
            expect(result).toContain('{');
            expect(result).toContain('component Pipeline Component 1');
            expect(result).toContain('component Pipeline Component 2');
            expect(result).toContain('}');
        });

        it('should include correct maturity positions', () => {
            const result = generatePipelineBlock('Test Pipeline', 0.6);
            expect(result).toContain('[0.45]'); // 0.6 - 0.15
            expect(result).toContain('[0.75]'); // 0.6 + 0.15
        });

        it('should throw error for invalid pipeline name', () => {
            expect(() => generatePipelineBlock('', 0.5)).toThrow('Pipeline name must be a non-empty string');
            expect(() => generatePipelineBlock(null as any, 0.5)).toThrow('Pipeline name must be a non-empty string');
        });
    });

    describe('generatePipelineMapText', () => {
        it('should generate complete pipeline structure', () => {
            const result = generatePipelineMapText('Kettle', {x: 0.45, y: 0.57});
            expect(result).toContain('component Kettle [0.57, 0.45]');
            expect(result).toContain('pipeline Kettle');
            expect(result).toContain('component Pipeline Component 1');
            expect(result).toContain('component Pipeline Component 2');
        });

        it('should format coordinates correctly', () => {
            const result = generatePipelineMapText('Test', {x: 0.123456, y: 0.789123});
            expect(result).toContain('[0.79, 0.12]'); // Formatted to 2 decimal places
        });

        it('should throw error for invalid inputs', () => {
            expect(() => generatePipelineMapText('', {x: 0.5, y: 0.5})).toThrow();
            expect(() => generatePipelineMapText('Test', {x: NaN, y: 0.5})).toThrow();
            expect(() => generatePipelineMapText('Test', {x: 0.5, y: NaN})).toThrow();
        });
    });

    describe('insertPipelineComponent', () => {
        const mockMapText = `title Test Map
component Kettle [0.45, 0.57]
pipeline Kettle
{
    component Pipeline Component 1 [0.30]
    component Pipeline Component 2 [0.60]
}`;

        it('should insert component at beginning of pipeline block', () => {
            const result = insertPipelineComponent(mockMapText, 'Kettle', 'foobar', 0.5);
            expect(result).toContain('component foobar [0.50]');
            expect(result.indexOf('component foobar')).toBeLessThan(result.indexOf('component Pipeline Component 1'));
        });

        it('should preserve existing components', () => {
            const result = insertPipelineComponent(mockMapText, 'Kettle', 'foobar', 0.5);
            expect(result).toContain('component Pipeline Component 1');
            expect(result).toContain('component Pipeline Component 2');
        });

        it('should add label offset when provided', () => {
            const result = insertPipelineComponent(mockMapText, 'Kettle', 'foobar', 0.5, {x: -10, y: -10});
            expect(result).toContain('component foobar [0.50] label [-10, -10]');
        });

        it('should throw error for non-existent pipeline', () => {
            expect(() => insertPipelineComponent(mockMapText, 'NonExistent', 'foobar', 0.5)).toThrow(
                'Pipeline \"NonExistent\" not found in map text',
            );
        });

        it('should throw error for invalid inputs', () => {
            expect(() => insertPipelineComponent('', 'Kettle', 'foobar', 0.5)).toThrow();
            expect(() => insertPipelineComponent(mockMapText, '', 'foobar', 0.5)).toThrow();
            expect(() => insertPipelineComponent(mockMapText, 'Kettle', '', 0.5)).toThrow();
            expect(() => insertPipelineComponent(mockMapText, 'Kettle', 'foobar', 1.5)).toThrow();
        });
    });

    describe('calculatePipelineBounds', () => {
        const mockPipeline = {
            name: 'Test Pipeline',
            visibility: 0.7,
            components: [
                {maturity: 0.2, name: 'Component 1'},
                {maturity: 0.8, name: 'Component 2'},
                {maturity: 0.5, name: 'Component 3'},
            ],
        };

        it('should calculate bounds from component maturities', () => {
            const result = calculatePipelineBounds(mockPipeline);
            expect(result.name).toBe('Test Pipeline');
            expect(result.minMaturity).toBe(0.2);
            expect(result.maxMaturity).toBe(0.8);
            expect(result.visibility).toBe(0.7);
        });

        it('should handle pipeline with no components', () => {
            const emptyPipeline = {
                name: 'Empty Pipeline',
                visibility: 0.5,
                components: [],
                maturity1: 0.3,
                maturity2: 0.7,
            };
            const result = calculatePipelineBounds(emptyPipeline);
            expect(result.minMaturity).toBeCloseTo(0.2); // 0.3 - 0.1
            expect(result.maxMaturity).toBeCloseTo(0.8); // 0.7 + 0.1
        });

        it('should throw error for pipeline without name', () => {
            expect(() => calculatePipelineBounds({components: []})).toThrow();
            expect(() => calculatePipelineBounds({})).toThrow();
        });
    });

    describe('isPositionWithinPipelineBounds', () => {
        const bounds: PipelineBounds = {
            name: 'Test Pipeline',
            minMaturity: 0.2,
            maxMaturity: 0.8,
            visibility: 0.7,
        };

        it('should return true for position within bounds', () => {
            const result = isPositionWithinPipelineBounds({x: 0.5, y: 0.7}, bounds);
            expect(result).toBe(true);
        });

        it('should handle asymmetric tolerance (reduced above pipeline)', () => {
            // Position above pipeline but close (within reduced tolerance)
            const resultClose = isPositionWithinPipelineBounds({x: 0.5, y: 0.72}, bounds, 0.1); // 0.02 above
            expect(resultClose).toBe(true);

            // Position above pipeline but far (outside reduced tolerance)
            const resultFar = isPositionWithinPipelineBounds({x: 0.5, y: 0.75}, bounds, 0.1); // 0.05 above (outside 0.03 reduced tolerance)
            expect(resultFar).toBe(false);

            // Position below pipeline should still use full tolerance
            const resultBelow = isPositionWithinPipelineBounds({x: 0.5, y: 0.65}, bounds, 0.1); // 0.05 below (within 0.1 tolerance)
            expect(resultBelow).toBe(true);
        });

        it('should return false for position outside maturity range', () => {
            const result = isPositionWithinPipelineBounds({x: 0.1, y: 0.7}, bounds);
            expect(result).toBe(false);
        });

        it('should return false for position outside visibility tolerance', () => {
            const result = isPositionWithinPipelineBounds({x: 0.5, y: 0.9}, bounds, 0.1);
            expect(result).toBe(false);
        });

        it('should use default tolerance', () => {
            const result = isPositionWithinPipelineBounds({x: 0.5, y: 0.75}, bounds);
            expect(result).toBe(true); // Within default 0.1 tolerance
        });
    });
});

/**
 * Integration tests for pipeline workflow
 */
describe('Pipeline Workflow Integration', () => {
    it('should create pipeline with proper spacing', () => {
        const pipelineText = generatePipelineMapText('Electric Kettle', {x: 0.5, y: 0.6});

        // Verify component line
        expect(pipelineText).toContain('component Electric Kettle [0.60, 0.50]');

        // Verify pipeline block structure
        expect(pipelineText).toContain('pipeline Electric Kettle');
        expect(pipelineText).toContain('{');
        expect(pipelineText).toContain('}');

        // Verify default components with proper spacing
        const lines = pipelineText.split('\n');
        const component1Line = lines.find(line => line.includes('Pipeline Component 1'));
        const component2Line = lines.find(line => line.includes('Pipeline Component 2'));

        expect(component1Line).toBeDefined();
        expect(component2Line).toBeDefined();

        // Extract maturity values
        const match1 = component1Line?.match(/\\[(\\d+\\.\\d+)\\]/);
        const match2 = component2Line?.match(/\\[(\\d+\\.\\d+)\\]/);

        expect(match1).toBeDefined();
        expect(match2).toBeDefined();

        const maturity1 = parseFloat(match1![1]);
        const maturity2 = parseFloat(match2![1]);

        // Verify spacing
        expect(Math.abs(maturity2 - maturity1)).toBeCloseTo(0.3, 1);
    });

    it('should handle component insertion workflow', () => {
        // Start with a pipeline
        const initialText = generatePipelineMapText('Kettle', {x: 0.45, y: 0.57});

        // Insert a component
        const updatedText = insertPipelineComponent(initialText, 'Kettle', 'Electric Kettle', 0.4);

        // Verify the component was inserted
        expect(updatedText).toContain('component Electric Kettle [0.40]');
        expect(updatedText).toContain('component Kettle [0.57, 0.45]');
        expect(updatedText).toContain('component Pipeline Component 1');
        expect(updatedText).toContain('component Pipeline Component 2');

        // Verify order (new component should be first in pipeline block)
        const electricKettleIndex = updatedText.indexOf('component Electric Kettle');
        const pipelineComp1Index = updatedText.indexOf('component Pipeline Component 1');
        expect(electricKettleIndex).toBeLessThan(pipelineComp1Index);
    });

    it('should handle edge cases gracefully', () => {
        // Test extreme positions
        const edgePositions = [
            {x: 0.05, y: 0.5}, // Near left edge
            {x: 0.95, y: 0.5}, // Near right edge
            {x: 0.5, y: 0.05}, // Near top edge
            {x: 0.5, y: 0.95}, // Near bottom edge
        ];

        edgePositions.forEach(position => {
            const result = generatePipelineMapText('Edge Pipeline', position);
            expect(result).toContain('component Edge Pipeline');
            expect(result).toContain('pipeline Edge Pipeline');
            expect(result).toContain('Pipeline Component 1');
            expect(result).toContain('Pipeline Component 2');
        });
    });
});
