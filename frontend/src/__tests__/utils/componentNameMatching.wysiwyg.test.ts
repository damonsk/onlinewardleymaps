/**
 * Tests for WYSIWYG toolbar functionality with multi-line component names
 * This specifically tests the component name matching and line modification functions
 * used by the toolbar decorator functionality.
 */

import {
    findComponentLineInMapText,
    parseComponentLine,
    buildComponentLine,
    componentNamesMatch,
    escapeComponentNameForMapText,
} from '../../utils/componentNameMatching';

describe('WYSIWYG Toolbar Multi-line Component Support', () => {
    describe('findComponentLineInMapText', () => {
        it('should find single-line component in map text', () => {
            const mapText = `
title Example Map
component SingleLine [0.5, 0.7]
component AnotherComponent [0.3, 0.4]
            `.trim();

            const result = findComponentLineInMapText(mapText, 'SingleLine');
            expect(result).not.toBeNull();
            expect(result?.lineIndex).toBe(1);
            expect(result?.line).toBe('component SingleLine [0.5, 0.7]');
            expect(result?.parsedName).toBe('SingleLine');
        });

        it('should find multi-line component in map text with quoted format', () => {
            const mapText = `
title Example Map
component "Multi-line\\nComponent\\nName" [0.5, 0.7]
component AnotherComponent [0.3, 0.4]
            `.trim();

            const result = findComponentLineInMapText(mapText, 'Multi-line\nComponent\nName');
            expect(result).not.toBeNull();
            expect(result?.lineIndex).toBe(1);
            expect(result?.line).toBe('component "Multi-line\\nComponent\\nName" [0.5, 0.7]');
            expect(result?.parsedName).toBe('Multi-line\nComponent\nName');
        });

        it('should match component names using normalized matching', () => {
            const mapText = `
title Example Map
component "Database\\nService\\nv2.0" [0.5, 0.7]
            `.trim();

            // Should match even with different spacing/casing
            const result = findComponentLineInMapText(mapText, 'database service v2.0');
            expect(result).not.toBeNull();
            expect(result?.parsedName).toBe('Database\nService\nv2.0');
        });

        it('should return null when component is not found', () => {
            const mapText = `
title Example Map
component ExistingComponent [0.5, 0.7]
            `.trim();

            const result = findComponentLineInMapText(mapText, 'NonExistentComponent');
            expect(result).toBeNull();
        });

        it('should handle components with existing decorators', () => {
            const mapText = `
title Example Map
component "Multi-line\\nService" [0.5, 0.7] (buy) inertia
            `.trim();

            const result = findComponentLineInMapText(mapText, 'Multi-line\nService');
            expect(result).not.toBeNull();
            expect(result?.line).toBe('component "Multi-line\\nService" [0.5, 0.7] (buy) inertia');
        });
    });

    describe('parseComponentLine', () => {
        it('should parse single-line component line', () => {
            const line = 'component SimpleComponent [0.5, 0.7]';
            const result = parseComponentLine(line);

            expect(result).not.toBeNull();
            expect(result?.name).toBe('SimpleComponent');
            expect(result?.coordinates).toBe('[0.5, 0.7]');
            expect(result?.method).toBeUndefined();
            expect(result?.inertia).toBeUndefined();
        });

        it('should parse multi-line component line with quotes', () => {
            const line = 'component "Business\\nProcess\\nAutomation" [0.5, 0.7]';
            const result = parseComponentLine(line);

            expect(result).not.toBeNull();
            expect(result?.name).toBe('Business\nProcess\nAutomation');
            expect(result?.coordinates).toBe('[0.5, 0.7]');
            expect(result?.method).toBeUndefined();
            expect(result?.inertia).toBeUndefined();
        });

        it('should parse component with method decorator', () => {
            const line = 'component "Multi-line\\nComponent" [0.5, 0.7] (buy)';
            const result = parseComponentLine(line);

            expect(result).not.toBeNull();
            expect(result?.name).toBe('Multi-line\nComponent');
            expect(result?.coordinates).toBe('[0.5, 0.7]');
            expect(result?.method).toBe('(buy)');
            expect(result?.inertia).toBeUndefined();
        });

        it('should parse component with inertia', () => {
            const line = 'component "Service\\nLayer" [0.5, 0.7] inertia';
            const result = parseComponentLine(line);

            expect(result).not.toBeNull();
            expect(result?.name).toBe('Service\nLayer');
            expect(result?.coordinates).toBe('[0.5, 0.7]');
            expect(result?.method).toBeUndefined();
            expect(result?.inertia).toBe('inertia');
        });

        it('should parse component with both method and inertia', () => {
            const line = 'component "Complex\\nBusiness\\nService" [0.5, 0.7] (outsource) inertia';
            const result = parseComponentLine(line);

            expect(result).not.toBeNull();
            expect(result?.name).toBe('Complex\nBusiness\nService');
            expect(result?.coordinates).toBe('[0.5, 0.7]');
            expect(result?.method).toBe('(outsource)');
            expect(result?.inertia).toBe('inertia');
        });

        it('should return null for invalid component lines', () => {
            expect(parseComponentLine('invalid line')).toBeNull();
            expect(parseComponentLine('anchor AnchorName [0.5, 0.7]')).toBeNull();
            expect(parseComponentLine('')).toBeNull();
        });
    });

    describe('buildComponentLine', () => {
        it('should build single-line component line without quotes', () => {
            const result = buildComponentLine('SimpleComponent', '[0.5, 0.7]');
            expect(result).toBe('component SimpleComponent [0.5, 0.7]');
        });

        it('should build multi-line component line with proper quoting', () => {
            const result = buildComponentLine('Multi-line\nComponent\nName', '[0.5, 0.7]');
            expect(result).toBe('component "Multi-line\\nComponent\\nName" [0.5, 0.7]');
        });

        it('should build component line with method decorator', () => {
            const result = buildComponentLine('Service\nLayer', '[0.5, 0.7]', '(buy)');
            expect(result).toBe('component "Service\\nLayer" [0.5, 0.7] (buy)');
        });

        it('should build component line with inertia', () => {
            const result = buildComponentLine('Database\nService', '[0.5, 0.7]', undefined, 'inertia');
            expect(result).toBe('component "Database\\nService" [0.5, 0.7] inertia');
        });

        it('should build component line with both method and inertia', () => {
            const result = buildComponentLine('Complex\nBusiness\nProcess', '[0.5, 0.7]', '(outsource)', 'inertia');
            expect(result).toBe('component "Complex\\nBusiness\\nProcess" [0.5, 0.7] (outsource) inertia');
        });

        it('should handle components with special characters that need quoting', () => {
            const result = buildComponentLine('Component [with] brackets', '[0.5, 0.7]', '(build)');
            expect(result).toBe('component "Component \\[with\\] brackets" [0.5, 0.7] (build)');
        });

        it('should preserve additional content in rest parameter', () => {
            const result = buildComponentLine('Service', '[0.5, 0.7]', '(buy)', undefined, 'additional content');
            expect(result).toBe('component Service [0.5, 0.7] (buy) additional content');
        });
    });

    describe('End-to-End WYSIWYG Toolbar Scenarios', () => {
        it('should handle complete workflow: find -> parse -> modify -> rebuild', () => {
            const originalMapText = `
title Test Map
component "Multi-line\\nBusiness\\nService" [0.5, 0.7]
component RegularComponent [0.3, 0.4] (build)
            `.trim();

            // Step 1: Find the multi-line component
            const componentInfo = findComponentLineInMapText(originalMapText, 'Multi-line\nBusiness\nService');
            expect(componentInfo).not.toBeNull();

            // Step 2: Parse the existing line
            const parsedLine = parseComponentLine(componentInfo!.line);
            expect(parsedLine).not.toBeNull();
            expect(parsedLine!.name).toBe('Multi-line\nBusiness\nService');

            // Step 3: Apply a decorator (buy method)
            const newLine = buildComponentLine(
                parsedLine!.name,
                parsedLine!.coordinates,
                '(buy)', // Add buy decorator
                parsedLine!.inertia,
                parsedLine!.rest,
            );

            expect(newLine).toBe('component "Multi-line\\nBusiness\\nService" [0.5, 0.7] (buy)');

            // Step 4: Update the map text
            const lines = originalMapText.split('\n');
            lines[componentInfo!.lineIndex] = newLine;
            const updatedMapText = lines.join('\n');

            expect(updatedMapText).toContain('component "Multi-line\\nBusiness\\nService" [0.5, 0.7] (buy)');
        });

        it('should handle adding inertia to multi-line component', () => {
            const mapText = `component "Service\\nManagement\\nLayer" [0.5, 0.7] (build)`;

            const parsedLine = parseComponentLine(mapText);
            expect(parsedLine).not.toBeNull();

            // Add inertia while preserving existing method
            const newLine = buildComponentLine(
                parsedLine!.name,
                parsedLine!.coordinates,
                parsedLine!.method,
                'inertia', // Add inertia
            );

            expect(newLine).toBe('component "Service\\nManagement\\nLayer" [0.5, 0.7] (build) inertia');
        });

        it('should handle removing decorators from multi-line component', () => {
            const mapText = `component "Database\\nConnection\\nPool" [0.5, 0.7] (outsource) inertia`;

            const parsedLine = parseComponentLine(mapText);
            expect(parsedLine).not.toBeNull();

            // Remove method but keep inertia
            const newLine = buildComponentLine(
                parsedLine!.name,
                parsedLine!.coordinates,
                undefined, // Remove method
                parsedLine!.inertia,
            );

            expect(newLine).toBe('component "Database\\nConnection\\nPool" [0.5, 0.7] inertia');
        });

        it('should handle all decorator types with multi-line components', () => {
            const baseName = 'Enterprise\nResource\nPlanning';
            const coordinates = '[0.5, 0.7]';

            const decoratorTypes = ['buy', 'build', 'outsource', 'market', 'ecosystem'];

            decoratorTypes.forEach(decorator => {
                const line = buildComponentLine(baseName, coordinates, `(${decorator})`);
                expect(line).toBe(`component "Enterprise\\nResource\\nPlanning" [0.5, 0.7] (${decorator})`);

                // Verify it can be parsed back
                const parsed = parseComponentLine(line);
                expect(parsed?.name).toBe(baseName);
                expect(parsed?.method).toBe(`(${decorator})`);
            });
        });
    });

    describe('Error handling and edge cases', () => {
        it('should handle empty map text gracefully', () => {
            const result = findComponentLineInMapText('', 'AnyComponent');
            expect(result).toBeNull();
        });

        it('should handle malformed component lines gracefully', () => {
            const malformedLine = 'component "Unclosed quote [0.5, 0.7]';
            const result = parseComponentLine(malformedLine);
            // Should still parse what it can
            expect(result).not.toBeNull();
        });

        it('should handle component names with edge case characters', () => {
            const edgeCaseName = 'Component -> with "quotes" and \\backslashes\\';
            const line = buildComponentLine(edgeCaseName, '[0.5, 0.7]');

            // Should properly escape all special characters
            expect(line).toContain('"');
            expect(line).toContain('\\\\');
            expect(line).toContain('\\"');

            // Should be parseable back
            const parsed = parseComponentLine(line);
            expect(parsed?.name).toBe(edgeCaseName);
        });
    });
});
