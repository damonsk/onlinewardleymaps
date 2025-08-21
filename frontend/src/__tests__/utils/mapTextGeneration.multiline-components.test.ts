import {generateComponentMapText} from '../../utils/mapTextGeneration';
import {ToolbarItem} from '../../types/toolbar';

describe('Map Text Generation - Multi-line Component Names', () => {
    const mockComponentItem: ToolbarItem = {
        id: 'component',
        label: 'Component',
        category: 'component',
        defaultName: 'New Component',
        toolType: 'placement',
        template: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}]`,
    };

    describe('generateComponentMapText with multi-line component names', () => {
        it('should handle single-line component names normally', () => {
            const result = generateComponentMapText(mockComponentItem, 'Simple Component', {x: 0.7, y: 0.5});
            expect(result).toBe('component Simple Component [0.50, 0.70]');
        });

        it('should properly quote and escape multi-line component names', () => {
            const multilineName = 'Multi-line\nComponent\nName';
            const result = generateComponentMapText(mockComponentItem, multilineName, {x: 0.7, y: 0.5});

            // Fixed behavior - properly quoted and escaped
            expect(result).toBe('component "Multi-line\\nComponent\\nName" [0.50, 0.70]');
        });

        it('should properly escape multi-line component names for map text syntax', () => {
            const multilineName = 'Database\nService\nAPI';
            const result = generateComponentMapText(mockComponentItem, multilineName, {x: 0.3, y: 0.8});

            // Fixed behavior - properly quoted and escaped
            expect(result).toBe('component "Database\\nService\\nAPI" [0.80, 0.30]');
        });

        it('should handle component names with quotes and line breaks', () => {
            const complexName = 'Auth\nService\n"v2.0"';
            const result = generateComponentMapText(mockComponentItem, complexName, {x: 0.6, y: 0.4});

            // Fixed behavior - properly escaped quotes and line breaks
            expect(result).toBe('component "Auth\\nService\\n\\"v2.0\\"" [0.40, 0.60]');
        });
    });

    describe('template execution with multi-line names', () => {
        it('should pass properly escaped component names to templates', () => {
            // Simple template that expects already-escaped names
            const simpleTemplate = (name: string, y: string, x: string) => {
                return `component ${name} [${y}, ${x}]`;
            };

            const itemWithSimpleTemplate: ToolbarItem = {
                ...mockComponentItem,
                template: simpleTemplate,
            };

            const multilineName = 'Multi-line\nComponent';

            // With the fix, generateComponentMapText should escape the name first
            const result = generateComponentMapText(itemWithSimpleTemplate, multilineName, {x: 0.7, y: 0.5});

            // Fixed behavior - name is escaped before being passed to template
            expect(result).toBe('component "Multi-line\\nComponent" [0.50, 0.70]');
        });
    });
});
