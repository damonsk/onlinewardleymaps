/**
 * Test for the specific multi-line component linking bug
 * When linking an existing multi-line component to a newly created component,
 * ensure the link syntax is correctly generated with proper escaping
 */

import {UnifiedComponent} from '../../types/unified/components';
import {generateLinkSyntax, addLinkToMapText} from '../../utils/componentDetection';
import {generateComponentMapText} from '../../utils/mapTextGeneration';
import {ToolbarItem} from '../../types/toolbar';

describe('Multi-line Component Linking Bug Fix', () => {
    // Mock toolbar item for creating new components during linking
    const mockComponentToolbarItem: ToolbarItem = {
        id: 'component',
        label: 'Component',
        icon: jest.fn() as any,
        template: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}]`,
        category: 'component',
        defaultName: 'New Component',
    };

    describe('linking from multi-line source to new component', () => {
        it('should generate correct link syntax when source component has multi-line name', () => {
            // Source component with multi-line name (like user's example)
            const sourceComponent: UnifiedComponent = {
                id: 'source',
                name: 'New Component\ndsdsd\n',
                type: 'component',
                maturity: 0.77,
                visibility: 0.37,
                line: 1,
                label: {x: 5.0, y: -10.0},
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
            };

            // Target component with normalized name (created during linking)
            const targetComponent: UnifiedComponent = {
                id: 'target',
                name: 'New Component',
                type: 'component',
                maturity: 0.47,
                visibility: 0.46,
                line: 2,
                label: {x: 0, y: 0},
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
            };

            // Generate link syntax
            const linkSyntax = generateLinkSyntax(sourceComponent, targetComponent);

            // Should properly escape the multi-line source name and use the target name as-is
            expect(linkSyntax).toBe('"New Component\\ndsdsd\\n"->New Component');
        });

        it('should create proper new component name from multi-line source during linking workflow', () => {
            // When creating a new component during linking, the name should be normalized
            const multilineSourceName = 'New Component\ndsdsd\n';

            // Generate component map text for the new component (simulating the linking workflow)
            const newComponentText = generateComponentMapText(
                mockComponentToolbarItem,
                'New Component', // This would typically be the default name
                {x: 0.47, y: 0.46},
            );

            // Should generate normalized single-line component
            expect(newComponentText).toBe('component New Component [0.46, 0.47]');
        });

        it('should generate complete correct map text for linking scenario', () => {
            // Starting map text with multi-line component
            const initialMapText = 'component "New Component\\ndsdsd\\n" [0.77, 0.37] label [5.00, -10.00]';

            const sourceComponent: UnifiedComponent = {
                name: 'New Component\ndsdsd\n',
            } as UnifiedComponent;

            const targetComponent: UnifiedComponent = {
                name: 'New Component',
            } as UnifiedComponent;

            // Add new component
            const newComponentText = 'component New Component [0.47, 0.46]';
            const mapWithNewComponent = initialMapText + '\n' + newComponentText;

            // Add link
            const finalMapText = addLinkToMapText(mapWithNewComponent, sourceComponent, targetComponent);

            const expected = [
                'component "New Component\\ndsdsd\\n" [0.77, 0.37] label [5.00, -10.00]',
                'component New Component [0.47, 0.46]',
                '"New Component\\ndsdsd\\n"->New Component',
            ].join('\n');

            expect(finalMapText).toBe(expected);

            // Verify the link syntax is not broken across multiple lines
            expect(finalMapText).not.toContain('New Component\ndsdsd\n->New Component');
            expect(finalMapText).toContain('"New Component\\ndsdsd\\n"->New Component');
        });
    });

    describe('edge cases for multi-line linking', () => {
        it('should handle linking between two multi-line components', () => {
            const source: UnifiedComponent = {
                name: 'Multi-line\nSource\nComponent',
            } as UnifiedComponent;

            const target: UnifiedComponent = {
                name: 'Multi-line\nTarget\nComponent',
            } as UnifiedComponent;

            const linkSyntax = generateLinkSyntax(source, target);

            expect(linkSyntax).toBe('"Multi-line\\nSource\\nComponent"->"Multi-line\\nTarget\\nComponent"');
        });

        it('should handle component names with various line ending types', () => {
            const source: UnifiedComponent = {
                name: 'Component\r\nWith\nMixed\rLineEndings',
            } as UnifiedComponent;

            const target: UnifiedComponent = {
                name: 'Simple Target',
            } as UnifiedComponent;

            const linkSyntax = generateLinkSyntax(source, target);

            expect(linkSyntax).toBe('"Component\\r\\nWith\\nMixed\\rLineEndings"->Simple Target');
        });
    });
});
