/**
 * Tests for MapComponentDeleter service with multi-line component names
 */

import {MapComponentDeleter} from '../../services/MapComponentDeleter';

describe('MapComponentDeleter - Multi-line Component Support', () => {
    let deleter: MapComponentDeleter;

    beforeEach(() => {
        deleter = new MapComponentDeleter();
    });

    describe('multi-line component deletion', () => {
        it('should delete a multi-line component and its links', () => {
            const mapText = `title Test Map
component "Multi-line\\nComponent" [0.5, 0.5]
component "Target\\nComponent" [0.8, 0.3]
"Multi-line\\nComponent"->"Target\\nComponent"
"Target\\nComponent"->"Multi-line\\nComponent"`;

            const result = deleter.deleteComponent({
                mapText,
                componentId: 2, // Line-based ID for the multi-line component (1-based indexing)
            });

            const expectedResult = `title Test Map
component "Target\\nComponent" [0.8, 0.3]`;

            expect(result.updatedMapText).toBe(expectedResult);
            expect(result.deletedComponent.type).toBe('component');
            expect(result.deletedComponent.line).toBe(1);
            expect(result.deletedComponent.name).toBe('Multi-line\nComponent'); // Should be unescaped
        });

        it('should delete a multi-line component and its evolve statements', () => {
            const mapText = `title Test Map
component "Database\\nService" [0.2, 0.8]
component "API\\nGateway" [0.7, 0.6]
evolve "Database\\nService" 0.5
"Database\\nService"->"API\\nGateway"`;

            const result = deleter.deleteComponent({
                mapText,
                componentId: 2, // Line-based ID for the database service
            });

            const expectedResult = `title Test Map
component "API\\nGateway" [0.7, 0.6]`;

            expect(result.updatedMapText).toBe(expectedResult);
            expect(result.deletedComponent.name).toBe('Database\nService'); // Should be unescaped
        });

        it('should handle mixed single-line and multi-line component references', () => {
            const mapText = `title Test Map
component "Multi-line\\nComponent" [0.5, 0.5]
component SimpleComponent [0.8, 0.3]
component AnotherComponent [0.2, 0.7]
"Multi-line\\nComponent"->SimpleComponent
SimpleComponent->AnotherComponent
AnotherComponent->"Multi-line\\nComponent"`;

            const result = deleter.deleteComponent({
                mapText,
                componentId: 2, // Line-based ID for the multi-line component (1-based indexing)
            });

            const expectedResult = `title Test Map
component SimpleComponent [0.8, 0.3]
component AnotherComponent [0.2, 0.7]
SimpleComponent->AnotherComponent`;

            expect(result.updatedMapText).toBe(expectedResult);
        });

        it('should handle complex multi-line component names with quotes and backslashes', () => {
            const mapText = `title Test Map
component "Complex \\"Component\\"\\nWith Special \\\\Characters" [0.5, 0.5]
component Target [0.8, 0.3]
"Complex \\"Component\\"\\nWith Special \\\\Characters"->Target`;

            const result = deleter.deleteComponent({
                mapText,
                componentId: 2, // Line-based ID for the complex component
            });

            const expectedResult = `title Test Map
component Target [0.8, 0.3]`;

            expect(result.updatedMapText).toBe(expectedResult);
            expect(result.deletedComponent.name).toBe('Complex "Component"\nWith Special \\Characters'); // Should be unescaped
        });

        it('should handle multi-line components in evolve statements with arrows', () => {
            const mapText = `title Test Map
component "Source\\nComponent" [0.3, 0.7]
component "Target\\nComponent" [0.8, 0.4]
evolve "Source\\nComponent"->0.6
"Source\\nComponent"->"Target\\nComponent"`;

            const result = deleter.deleteComponent({
                mapText,
                componentId: 2, // Line-based ID for the source component
            });

            const expectedResult = `title Test Map
component "Target\\nComponent" [0.8, 0.4]`;

            expect(result.updatedMapText).toBe(expectedResult);
        });

        it('should not delete links for components with similar but different names', () => {
            const mapText = `title Test Map
component "Multi-line\\nComponent" [0.5, 0.5]
component "Multi-line Component" [0.8, 0.3]
component "Multi-lineComponent" [0.2, 0.7]
"Multi-line\\nComponent"->"Multi-line Component"
"Multi-line Component"->"Multi-lineComponent"`;

            const result = deleter.deleteComponent({
                mapText,
                componentId: 2, // Line-based ID for the multi-line component (1-based indexing)
            });

            const expectedResult = `title Test Map
component "Multi-line Component" [0.8, 0.3]
component "Multi-lineComponent" [0.2, 0.7]
"Multi-line Component"->"Multi-lineComponent"`;

            expect(result.updatedMapText).toBe(expectedResult);
            expect(result.deletedComponent.name).toBe('Multi-line\nComponent'); // Should be unescaped
        });

        it('should handle single-line component deletion with multi-line components present', () => {
            const mapText = `title Test Map
component "Multi-line\\nComponent" [0.5, 0.5]
component SingleLine [0.8, 0.3]
component "Another\\nMultiline" [0.2, 0.7]
"Multi-line\\nComponent"->SingleLine
SingleLine->"Another\\nMultiline"`;

            const result = deleter.deleteComponent({
                mapText,
                componentId: 3, // Line-based ID for SingleLine component
            });

            const expectedResult = `title Test Map
component "Multi-line\\nComponent" [0.5, 0.5]
component "Another\\nMultiline" [0.2, 0.7]`;

            expect(result.updatedMapText).toBe(expectedResult);
            expect(result.deletedComponent.name).toBe('SingleLine'); // Single-line name
        });

        it('should handle deletion with no links or evolve statements', () => {
            const mapText = `title Test Map
component "Isolated\\nComponent" [0.5, 0.5]
component AnotherComponent [0.8, 0.3]`;

            const result = deleter.deleteComponent({
                mapText,
                componentId: 2, // Line-based ID for the isolated multi-line component
            });

            const expectedResult = `title Test Map
component AnotherComponent [0.8, 0.3]`;

            expect(result.updatedMapText).toBe(expectedResult);
            expect(result.deletedComponent.name).toBe('Isolated\nComponent'); // Should be unescaped
        });
    });

    describe('error handling', () => {
        it('should throw error for non-existent multi-line component', () => {
            const mapText = `title Test Map
component "Multi-line\\nComponent" [0.5, 0.5]`;

            expect(() => {
                deleter.deleteComponent({
                    mapText,
                    componentId: 5, // Non-existent line
                });
            }).toThrow('Component with ID "5" not found in map text');
        });

        it('should handle malformed quoted component names gracefully', () => {
            const mapText = `title Test Map
component "Unclosed quote component [0.5, 0.5]
component NormalComponent [0.8, 0.3]`;

            const result = deleter.deleteComponent({
                mapText,
                componentId: 3, // Delete the normal component
            });

            const expectedResult = `title Test Map
component "Unclosed quote component [0.5, 0.5]`;

            expect(result.updatedMapText).toBe(expectedResult);
        });
    });

    describe('component name parsing', () => {
        it('should correctly parse quoted multi-line component names', () => {
            const mapText = 'component "Test\\nComponent" [0.5, 0.5]';

            const result = deleter.deleteComponent({
                mapText,
                componentId: 1,
            });

            expect(result.deletedComponent.name).toBe('Test\nComponent');
        });

        it('should correctly parse unquoted single-line component names', () => {
            const mapText = 'component TestComponent [0.5, 0.5]';

            const result = deleter.deleteComponent({
                mapText,
                componentId: 1,
            });

            expect(result.deletedComponent.name).toBe('TestComponent');
        });

        it('should handle component names with spaces', () => {
            const mapText = 'component Test Component With Spaces [0.5, 0.5]';

            const result = deleter.deleteComponent({
                mapText,
                componentId: 1,
            });

            expect(result.deletedComponent.name).toBe('Test Component With Spaces');
        });
    });
});
