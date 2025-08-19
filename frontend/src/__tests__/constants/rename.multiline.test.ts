import {rename} from '../../constants/rename';

describe('rename function with multi-line component names', () => {
    const mockMutateMapMethod = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('quoted multi-line component name handling', () => {
        it('should handle simple quoted multi-line component names', () => {
            const mapText = 'component "Multi-line\\nComponent" [0.5, 0.7]';
            const toFind = 'Multi-line\nComponent';
            const replaceWith = '"Updated\\nMulti-line\\nComponent"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            expect(mockMutateMapMethod).toHaveBeenCalledWith('component "Updated\\nMulti-line\\nComponent" [0.5, 0.7]');
        });

        it('should handle quoted names with escaped quotes', () => {
            const mapText = 'component "Component with \\"quotes\\"" [0.5, 0.7]';
            const toFind = 'Component with "quotes"';
            const replaceWith = '"Updated \\"Component\\" with quotes"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            expect(mockMutateMapMethod).toHaveBeenCalledWith('component "Updated \\"Component\\" with quotes" [0.5, 0.7]');
        });

        it('should handle quoted names with escaped backslashes', () => {
            const mapText = 'component "Component\\\\with\\\\backslashes" [0.5, 0.7]';
            const toFind = 'Component\\with\\backslashes';
            const replaceWith = '"Updated\\\\Component\\\\Path"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            expect(mockMutateMapMethod).toHaveBeenCalledWith('component "Updated\\\\Component\\\\Path" [0.5, 0.7]');
        });

        it('should handle complex quoted names with multiple escape sequences', () => {
            const mapText = 'component "Line 1\\nLine 2 \\"quoted\\"\\nLine 3\\\\path" [0.5, 0.7]';
            const toFind = 'Line 1\nLine 2 "quoted"\nLine 3\\path';
            const replaceWith = '"Updated\\nLine 1\\nLine 2 \\"new quotes\\"\\nLine 3\\\\newpath"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            expect(mockMutateMapMethod).toHaveBeenCalledWith(
                'component "Updated\\nLine 1\\nLine 2 \\"new quotes\\"\\nLine 3\\\\newpath" [0.5, 0.7]',
            );
        });

        it('should handle quoted names with decorators', () => {
            const mapText = 'component "Multi-line\\nComponent" (buy) [0.5, 0.7]';
            const toFind = 'Multi-line\nComponent';
            const replaceWith = '"Updated\\nComponent"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            expect(mockMutateMapMethod).toHaveBeenCalledWith('component "Updated\\nComponent" (buy) [0.5, 0.7]');
        });

        it('should maintain backward compatibility with unquoted names', () => {
            const mapText = 'component SimpleComponent [0.5, 0.7]';
            const toFind = 'SimpleComponent';
            const replaceWith = 'UpdatedComponent';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            expect(mockMutateMapMethod).toHaveBeenCalledWith('component UpdatedComponent [0.5, 0.7]');
        });

        it('should convert single-line to quoted multi-line', () => {
            const mapText = 'component SimpleComponent [0.5, 0.7]';
            const toFind = 'SimpleComponent';
            const replaceWith = '"Multi-line\\nComponent"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            expect(mockMutateMapMethod).toHaveBeenCalledWith('component "Multi-line\\nComponent" [0.5, 0.7]');
        });
    });

    describe('validation for quoted names', () => {
        it('should reject quoted names with unescaped quotes', () => {
            const mapText = 'component "Test" [0.5, 0.7]';
            const toFind = 'Test';
            const replaceWith = '"Component with "unescaped" quotes"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(false);
            expect(result.error).toContain('unescaped quotes');
            expect(mockMutateMapMethod).not.toHaveBeenCalled();
        });

        it('should reject empty quoted names', () => {
            const mapText = 'component "Test" [0.5, 0.7]';
            const toFind = 'Test';
            const replaceWith = '""';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(false);
            expect(result.error).toContain('cannot be empty');
            expect(mockMutateMapMethod).not.toHaveBeenCalled();
        });

        it('should reject quoted names with only whitespace', () => {
            const mapText = 'component "Test" [0.5, 0.7]';
            const toFind = 'Test';
            const replaceWith = '"   \\n   "';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(false);
            expect(result.error).toContain('cannot be empty');
            expect(mockMutateMapMethod).not.toHaveBeenCalled();
        });

        it('should allow properly escaped quotes in quoted names', () => {
            const mapText = 'component "Test" [0.5, 0.7]';
            const toFind = 'Test';
            const replaceWith = '"Component with \\"escaped\\" quotes"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            expect(mockMutateMapMethod).toHaveBeenCalledWith('component "Component with \\"escaped\\" quotes" [0.5, 0.7]');
        });
    });

    describe('reference updating with quoted names', () => {
        it('should update link references with multi-line component names', () => {
            const mapText = `component "Multi-line\\nComponent A" [0.5, 0.7]
component "Component B" [0.6, 0.8]
Multi-line
Component A -> Component B`;

            const toFind = 'Multi-line\nComponent A';
            const replaceWith = '"Updated\\nComponent A"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);

            const expectedMapText = `component "Updated\\nComponent A" [0.5, 0.7]
component "Component B" [0.6, 0.8]
Updated
Component A -> Component B`;

            expect(mockMutateMapMethod).toHaveBeenCalledWith(expectedMapText);
        });

        it('should update evolution references with multi-line component names', () => {
            const mapText = `component "Multi-line\\nComponent" [0.5, 0.7]
evolve Multi-line
Component 0.8`;

            const toFind = 'Multi-line\nComponent';
            const replaceWith = '"Updated\\nComponent"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);

            const expectedMapText = `component "Updated\\nComponent" [0.5, 0.7]
evolve Updated
Component 0.8`;

            expect(mockMutateMapMethod).toHaveBeenCalledWith(expectedMapText);
        });

        it('should update pipeline references with multi-line component names', () => {
            const mapText = `component "Multi-line\\nComponent" [0.5, 0.7]
pipeline Multi-line
Component`;

            const toFind = 'Multi-line\nComponent';
            const replaceWith = '"Updated\\nPipeline\\nComponent"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);

            const expectedMapText = `component "Updated\\nPipeline\\nComponent" [0.5, 0.7]
pipeline Updated
Pipeline
Component`;

            expect(mockMutateMapMethod).toHaveBeenCalledWith(expectedMapText);
        });

        it('should handle mixed quoted and unquoted references', () => {
            const mapText = `component "Multi-line\\nComponent" [0.5, 0.7]
component SimpleComponent [0.6, 0.8]
Multi-line
Component -> SimpleComponent`;

            const toFind = 'Multi-line\nComponent';
            const replaceWith = '"Updated\\nComponent"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);

            const expectedMapText = `component "Updated\\nComponent" [0.5, 0.7]
component SimpleComponent [0.6, 0.8]
Updated
Component -> SimpleComponent`;

            expect(mockMutateMapMethod).toHaveBeenCalledWith(expectedMapText);
        });
    });

    describe('error handling', () => {
        it('should handle malformed quoted strings gracefully', () => {
            const mapText = 'component "Malformed quote [0.5, 0.7]'; // Missing closing quote
            const toFind = 'Malformed quote';
            const replaceWith = '"Fixed\\nQuote"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            // Should still work by falling back to simple replacement
            expect(result.success).toBe(true);
        });

        it('should handle concurrent edits detection', () => {
            const mapText = 'component "Different\\nComponent" [0.5, 0.7]';
            const toFind = 'Original\nComponent'; // Component was changed by another operation
            const replaceWith = '"Updated\\nComponent"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(false);
            expect(result.error).toContain('modified by another operation');
            expect(mockMutateMapMethod).not.toHaveBeenCalled();
        });

        it('should handle invalid line numbers', () => {
            const mapText = 'component "Test" [0.5, 0.7]';
            const toFind = 'Test';
            const replaceWith = '"Updated"';

            const result = rename(5, toFind, replaceWith, mapText, mockMutateMapMethod); // Line 5 doesn't exist

            expect(result.success).toBe(false);
            expect(result.error).toContain('out of bounds');
            expect(mockMutateMapMethod).not.toHaveBeenCalled();
        });

        it('should handle empty map text', () => {
            const mapText = '';
            const toFind = 'Test';
            const replaceWith = '"Updated"';

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid map text');
            expect(mockMutateMapMethod).not.toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        it('should handle components with same unescaped content but different escaping', () => {
            const mapText = 'component "Line 1\\nLine 2" [0.5, 0.7]';
            const toFind = 'Line 1\nLine 2';
            const replaceWith = '"Line 1\\nLine 2\\nLine 3"'; // Adding a line

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            expect(mockMutateMapMethod).toHaveBeenCalledWith('component "Line 1\\nLine 2\\nLine 3" [0.5, 0.7]');
        });

        it('should handle no-change scenarios', () => {
            const mapText = 'component "Test\\nComponent" [0.5, 0.7]';
            const toFind = 'Test\nComponent';
            const replaceWith = 'Test\nComponent'; // Same content

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            expect(mockMutateMapMethod).not.toHaveBeenCalled(); // No change needed
        });

        it('should handle very long multi-line component names', () => {
            const longName = Array(10).fill('Very Long Line').join('\n');
            const escapedLongName = Array(10).fill('Very Long Line').join('\\n');

            const mapText = `component "Old\\nComponent" [0.5, 0.7]`;
            const toFind = 'Old\nComponent';
            const replaceWith = `"${escapedLongName}"`;

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            expect(mockMutateMapMethod).toHaveBeenCalledWith(`component "${escapedLongName}" [0.5, 0.7]`);
        });

        it('should handle components with only line breaks', () => {
            const mapText = 'component "Test" [0.5, 0.7]';
            const toFind = 'Test';
            const replaceWith = '"\\n\\n\\n"'; // Only line breaks

            const result = rename(1, toFind, replaceWith, mapText, mockMutateMapMethod);

            expect(result.success).toBe(false);
            expect(result.error).toContain('cannot be empty');
        });
    });
});
