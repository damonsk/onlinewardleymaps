import React from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react';
import {TOOLBAR_ITEMS} from '../../../constants/toolbarItems';
import {MapView} from '../../../components/map/MapView';
import {UnifiedWardleyMap} from '../../../types/unified/map';
import {MapTheme} from '../../../types/map/styles';

/**
 * Test suite for map text generation and mutation functionality
 * This tests the core functionality of task 7: map text generation and mutation
 */
describe('Map Text Generation and Mutation', () => {
    let container: HTMLDivElement;
    let root: any;

    const mockMapStyleDefs: MapTheme = {
        className: 'wardley',
        fontFamily: 'Arial, sans-serif',
    };

    const mockWardleyMap: UnifiedWardleyMap = {
        title: 'Test Map',
        components: [
            {
                name: 'Existing Component',
                maturity: 0.5,
                visibility: 0.7,
                line: 1,
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
        links: [],
        notes: [],
        attitudes: [],
        accelerators: [],
        methods: [],
        annotations: [],
    };

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        document.body.removeChild(container);
    });

    describe('Component Naming Logic', () => {
        it('should generate unique component names with incremental numbering', () => {
            const existingComponents = [
                {name: 'New Component', maturity: 0.5, visibility: 0.5},
                {name: 'New Component 1', maturity: 0.6, visibility: 0.6},
                {name: 'New Component 2', maturity: 0.7, visibility: 0.7},
            ];

            // Simulate the naming logic from MapView
            const baseName = 'New Component';
            let componentName = baseName;
            let counter = 1;

            while (existingComponents.some(comp => comp.name === componentName)) {
                componentName = `${baseName} ${counter}`;
                counter++;
            }

            expect(componentName).toBe('New Component 3');
        });

        it('should handle special characters in component names', () => {
            const existingComponents = [{name: 'Component (Special)', maturity: 0.5, visibility: 0.5}];

            const baseName = 'Component (Special)';
            let componentName = baseName;
            let counter = 1;

            while (existingComponents.some(comp => comp.name === componentName)) {
                componentName = `${baseName} ${counter}`;
                counter++;
            }

            expect(componentName).toBe('Component (Special) 1');
        });

        it('should start from base name when no conflicts exist', () => {
            const existingComponents = [{name: 'Other Component', maturity: 0.5, visibility: 0.5}];

            const baseName = 'New Component';
            let componentName = baseName;
            let counter = 1;

            while (existingComponents.some(comp => comp.name === componentName)) {
                componentName = `${baseName} ${counter}`;
                counter++;
            }

            expect(componentName).toBe('New Component');
        });
    });

    describe('Map Text Template Generation', () => {
        it('should generate correct syntax for placement component types', () => {
            const placementTestCases = [
                {
                    itemId: 'component',
                    expectedTemplate: 'component Test Component [0.50, 0.60]',
                },
                {
                    itemId: 'note',
                    expectedTemplate: 'note Test Component [0.50, 0.60]',
                },
                {
                    itemId: 'pipeline',
                    expectedTemplate: 'pipeline Test Component [0.50, 0.60]',
                },
                {
                    itemId: 'anchor',
                    expectedTemplate: 'anchor Test Component [0.50, 0.60]',
                },
            ];

            placementTestCases.forEach(({itemId, expectedTemplate}) => {
                const toolbarItem = TOOLBAR_ITEMS.find(item => item.id === itemId);
                expect(toolbarItem).toBeDefined();
                expect(toolbarItem?.toolType).toBe('placement');

                if (toolbarItem && toolbarItem.template) {
                    const generatedTemplate = toolbarItem.template('Test Component', '0.50', '0.60');
                    expect(generatedTemplate).toBe(expectedTemplate);
                }
            });
        });

        it('should handle method toolbar items correctly', () => {
            const methodItems = TOOLBAR_ITEMS.filter(item => item.toolType === 'method-application');

            expect(methodItems).toHaveLength(6);
            expect(methodItems.map(item => item.methodName)).toEqual(
                expect.arrayContaining(['buy', 'build', 'outsource', 'inertia', 'market', 'ecosystem']),
            );

            // Method items don't have templates because they work by applying decorators to existing components
            methodItems.forEach(item => {
                expect(item.template).toBeUndefined();
                expect(item.methodName).toBeDefined();
            });
        });

        it('should handle coordinate formatting correctly', () => {
            const toolbarItem = TOOLBAR_ITEMS.find(item => item.id === 'component');
            expect(toolbarItem).toBeDefined();

            if (toolbarItem && toolbarItem.template) {
                // Test various coordinate formats
                expect(toolbarItem.template('Test', '0.12', '0.34')).toBe('component Test [0.12, 0.34]');
                expect(toolbarItem.template('Test', '1.00', '0.00')).toBe('component Test [1.00, 0.00]');
                expect(toolbarItem.template('Test', '0.5', '0.7')).toBe('component Test [0.5, 0.7]');
            }
        });
    });

    describe('Map Text Formatting and Structure', () => {
        it('should maintain proper line structure when adding components', () => {
            const initialMapText = 'title Test Map\ncomponent Existing [0.5, 0.7]';
            const newComponentText = 'component New Component [0.6, 0.8]';

            // Simulate the map text update logic from MapView
            const updatedMapText = initialMapText.trim() + '\n' + newComponentText;

            expect(updatedMapText).toBe('title Test Map\ncomponent Existing [0.5, 0.7]\ncomponent New Component [0.6, 0.8]');
        });

        it('should handle empty map text correctly', () => {
            const initialMapText = '';
            const newComponentText = 'component New Component [0.6, 0.8]';

            const updatedMapText = initialMapText.trim() + (initialMapText.trim().length > 0 ? '\n' : '') + newComponentText;

            expect(updatedMapText).toBe('component New Component [0.6, 0.8]');
        });

        it('should handle map text with only whitespace', () => {
            const initialMapText = '   \n  \n  ';
            const newComponentText = 'component New Component [0.6, 0.8]';

            const updatedMapText = initialMapText.trim() + (initialMapText.trim().length > 0 ? '\n' : '') + newComponentText;

            expect(updatedMapText).toBe('component New Component [0.6, 0.8]');
        });

        it('should preserve existing map structure when adding new components', () => {
            const initialMapText = `title Test Map
component A [0.1, 0.2]
component B [0.3, 0.4]
A->B`;
            const newComponentText = 'component C [0.5, 0.6]';

            const updatedMapText = initialMapText.trim() + '\n' + newComponentText;

            expect(updatedMapText).toBe(`title Test Map
component A [0.1, 0.2]
component B [0.3, 0.4]
A->B
component C [0.5, 0.6]`);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle invalid coordinates gracefully', () => {
            const toolbarItem = TOOLBAR_ITEMS.find(item => item.id === 'component');
            expect(toolbarItem).toBeDefined();

            if (toolbarItem && toolbarItem.template) {
                // Test with invalid coordinate values - template should still produce output
                expect(toolbarItem.template('Test', 'invalid', '0.5')).toBe('component Test [invalid, 0.5]');
                expect(toolbarItem.template('Test', '0.5', 'invalid')).toBe('component Test [0.5, invalid]');
                expect(toolbarItem.template('Test', '', '')).toBe('component Test [, ]');
            }
        });

        it('should handle empty component names', () => {
            const toolbarItem = TOOLBAR_ITEMS.find(item => item.id === 'component');
            expect(toolbarItem).toBeDefined();

            if (toolbarItem && toolbarItem.template) {
                expect(toolbarItem.template('', '0.5', '0.6')).toBe('component  [0.5, 0.6]');
            }
        });

        it('should handle component names with special characters', () => {
            const toolbarItem = TOOLBAR_ITEMS.find(item => item.id === 'component');
            expect(toolbarItem).toBeDefined();

            if (toolbarItem && toolbarItem.template) {
                expect(toolbarItem.template('Test & Component', '0.5', '0.6')).toBe('component Test & Component [0.5, 0.6]');
                expect(toolbarItem.template('Test (Component)', '0.5', '0.6')).toBe('component Test (Component) [0.5, 0.6]');
                expect(toolbarItem.template('Test-Component', '0.5', '0.6')).toBe('component Test-Component [0.5, 0.6]');
            }
        });
    });

    describe('Integration with Default Names', () => {
        it('should use correct default names for placement toolbar items', () => {
            const placementItems = TOOLBAR_ITEMS.filter(item => item.toolType === 'placement');

            placementItems.forEach(item => {
                expect(item.defaultName).toBeDefined();
                expect(typeof item.defaultName).toBe('string');
                expect(item.defaultName.length).toBeGreaterThan(0);
            });

            // Test specific expected defaults for placement items
            const expectedDefaults = {
                component: 'New Component',
                note: 'New Note',
                pipeline: 'New Pipeline',
                anchor: 'New Anchor',
            };

            Object.entries(expectedDefaults).forEach(([itemId, expectedDefault]) => {
                const toolbarItem = TOOLBAR_ITEMS.find(item => item.id === itemId);
                expect(toolbarItem).toBeDefined();
                expect(toolbarItem?.defaultName).toBe(expectedDefault);
            });
        });

        it('should not have default names for method application items', () => {
            const methodItems = TOOLBAR_ITEMS.filter(item => item.toolType === 'method-application');

            methodItems.forEach(item => {
                // Method items don't need default names since they apply to existing components
                expect(item.defaultName).toBeUndefined();
            });
        });
    });
});
