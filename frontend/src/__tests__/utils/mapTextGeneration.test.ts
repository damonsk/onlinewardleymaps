import {
    generateUniqueComponentName,
    formatCoordinate,
    generateComponentMapText,
    formatMapText,
    addComponentToMapText,
    placeComponent,
    validateComponentPlacement,
    validateTemplate,
    createFallbackTemplate,
    ComponentPlacementParams,
    ComponentNamingOptions,
    MapTextFormattingOptions,
} from '../../utils/mapTextGeneration';
import {ToolbarItem} from '../../types/toolbar';
import {UnifiedComponent} from '../../types/unified/components';

/**
 * Test suite for map text generation utilities
 * Tests the enhanced functionality for task 7: map text generation and mutation
 */
describe('Map Text Generation Utilities', () => {
    // Mock toolbar item for testing
    const mockToolbarItem: ToolbarItem = {
        id: 'component',
        label: 'Component',
        icon: jest.fn() as any,
        template: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}]`,
        category: 'component',
        defaultName: 'New Component',
    };

    // Mock existing components for testing
    const mockExistingComponents: UnifiedComponent[] = [
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
    ];

    describe('generateUniqueComponentName', () => {
        it('should return base name when no conflicts exist', () => {
            const options: ComponentNamingOptions = {
                baseName: 'Test Component',
                existingNames: ['Other Component'],
            };

            const result = generateUniqueComponentName(options);
            expect(result).toBe('Test Component');
        });

        it('should append numbers when conflicts exist', () => {
            const options: ComponentNamingOptions = {
                baseName: 'Test Component',
                existingNames: ['Test Component', 'Test Component 1', 'Test Component 2'],
            };

            const result = generateUniqueComponentName(options);
            expect(result).toBe('Test Component 3');
        });

        it('should handle special characters in base name', () => {
            const options: ComponentNamingOptions = {
                baseName: 'Test (Component)',
                existingNames: ['Test (Component)'],
            };

            const result = generateUniqueComponentName(options);
            expect(result).toBe('Test (Component) 1');
        });

        it('should trim whitespace from base name', () => {
            const options: ComponentNamingOptions = {
                baseName: '  Test Component  ',
                existingNames: [],
            };

            const result = generateUniqueComponentName(options);
            expect(result).toBe('Test Component');
        });

        it('should throw error for invalid base name', () => {
            const options: ComponentNamingOptions = {
                baseName: '',
                existingNames: [],
            };

            expect(() => generateUniqueComponentName(options)).toThrow('Base name must be a non-empty string');
        });

        it('should throw error for invalid existing names', () => {
            const options: ComponentNamingOptions = {
                baseName: 'Test',
                existingNames: 'invalid' as any,
            };

            expect(() => generateUniqueComponentName(options)).toThrow('Existing names must be an array');
        });

        it('should respect maxAttempts limit', () => {
            const existingNames = Array.from({length: 10}, (_, i) => (i === 0 ? 'Test' : `Test ${i}`));

            const options: ComponentNamingOptions = {
                baseName: 'Test',
                existingNames,
                maxAttempts: 5,
            };

            expect(() => generateUniqueComponentName(options)).toThrow('Could not generate unique name after 5 attempts');
        });
    });

    describe('formatCoordinate', () => {
        it('should format coordinates with default precision', () => {
            expect(formatCoordinate(0.12345)).toBe('0.12');
            expect(formatCoordinate(0.5)).toBe('0.50');
            expect(formatCoordinate(1.0)).toBe('1.00');
        });

        it('should format coordinates with custom precision', () => {
            expect(formatCoordinate(0.12345, 3)).toBe('0.123');
            expect(formatCoordinate(0.5, 1)).toBe('0.5');
        });

        it('should clamp coordinates to valid range', () => {
            expect(formatCoordinate(-0.5)).toBe('0.00');
            expect(formatCoordinate(1.5)).toBe('1.00');
        });

        it('should throw error for invalid coordinates', () => {
            expect(() => formatCoordinate(NaN)).toThrow('Coordinate must be a valid number');
            expect(() => formatCoordinate('invalid' as any)).toThrow('Coordinate must be a valid number');
        });
    });

    describe('generateComponentMapText', () => {
        it('should generate correct map text using template', () => {
            const result = generateComponentMapText(mockToolbarItem, 'Test Component', {x: 0.6, y: 0.8});
            expect(result).toBe('component Test Component [0.80, 0.60]');
        });

        it('should handle special characters in component name', () => {
            const result = generateComponentMapText(mockToolbarItem, 'Test & Component', {x: 0.5, y: 0.7});
            expect(result).toBe('component Test & Component [0.70, 0.50]');
        });

        it('should trim component name', () => {
            const result = generateComponentMapText(mockToolbarItem, '  Test Component  ', {x: 0.5, y: 0.7});
            expect(result).toBe('component Test Component [0.70, 0.50]');
        });

        it('should throw error for invalid toolbar item', () => {
            expect(() => generateComponentMapText(null as any, 'Test', {x: 0.5, y: 0.7})).toThrow('Toolbar item is required');
        });

        it('should throw error for invalid component name', () => {
            expect(() => generateComponentMapText(mockToolbarItem, '', {x: 0.5, y: 0.7})).toThrow(
                'Component name must be a non-empty string',
            );
        });

        it('should throw error for invalid position', () => {
            expect(() => generateComponentMapText(mockToolbarItem, 'Test', {x: NaN, y: 0.7})).toThrow('Coordinate must be a valid number');
        });
    });

    describe('formatMapText', () => {
        it('should trim whitespace by default', () => {
            const result = formatMapText('  \n  test content  \n  ');
            expect(result).toBe('test content');
        });

        it('should preserve whitespace when requested', () => {
            const options: MapTextFormattingOptions = {preserveWhitespace: true};
            const result = formatMapText('  \n  test content  \n  ', options);
            expect(result).toBe('  \n  test content  \n  ');
        });

        it('should normalize line endings', () => {
            const result = formatMapText('line1\r\nline2\rline3\n');
            expect(result).toBe('line1\nline2\nline3');
        });

        it('should add newline at end when requested', () => {
            const options: MapTextFormattingOptions = {ensureNewlineAtEnd: true};
            const result = formatMapText('test content', options);
            expect(result).toBe('test content\n');
        });

        it('should handle empty string', () => {
            const result = formatMapText('');
            expect(result).toBe('');
        });

        it('should handle non-string input', () => {
            const result = formatMapText(null as any);
            expect(result).toBe('');
        });
    });

    describe('addComponentToMapText', () => {
        it('should add component to existing map text', () => {
            const currentText = 'title Test Map\ncomponent A [0.5, 0.7]';
            const newText = 'component B [0.6, 0.8]';

            const result = addComponentToMapText(currentText, newText);
            expect(result).toBe('title Test Map\ncomponent A [0.5, 0.7]\ncomponent B [0.6, 0.8]');
        });

        it('should handle empty current text', () => {
            const result = addComponentToMapText('', 'component A [0.5, 0.7]');
            expect(result).toBe('component A [0.5, 0.7]');
        });

        it('should handle null current text', () => {
            const result = addComponentToMapText(null as any, 'component A [0.5, 0.7]');
            expect(result).toBe('component A [0.5, 0.7]');
        });

        it('should throw error for empty new component text', () => {
            expect(() => addComponentToMapText('existing', '')).toThrow('New component text must be a non-empty string');
        });

        it('should throw error for whitespace-only new component text', () => {
            expect(() => addComponentToMapText('existing', '   \n  ')).toThrow('New component text must be a non-empty string');
        });
    });

    describe('placeComponent', () => {
        const mockParams: ComponentPlacementParams = {
            item: mockToolbarItem,
            position: {x: 0.6, y: 0.8},
            existingComponents: mockExistingComponents,
            currentMapText: 'title Test Map',
        };

        it('should place component successfully', () => {
            const result = placeComponent(mockParams);

            expect(result.componentName).toBe('New Component');
            expect(result.updatedMapText).toBe('title Test Map\ncomponent New Component [0.80, 0.60]');
        });

        it('should generate unique name when conflicts exist', () => {
            const paramsWithConflict: ComponentPlacementParams = {
                ...mockParams,
                existingComponents: [
                    ...mockExistingComponents,
                    {
                        ...mockExistingComponents[0],
                        name: 'New Component',
                    },
                ],
            };

            const result = placeComponent(paramsWithConflict);
            expect(result.componentName).toBe('New Component 1');
        });

        it('should handle empty map text', () => {
            const paramsWithEmptyText: ComponentPlacementParams = {
                ...mockParams,
                currentMapText: '',
            };

            const result = placeComponent(paramsWithEmptyText);
            expect(result.updatedMapText).toBe('component New Component [0.80, 0.60]');
        });

        it('should throw error for invalid toolbar item', () => {
            const invalidParams: ComponentPlacementParams = {
                ...mockParams,
                item: null as any,
            };

            expect(() => placeComponent(invalidParams)).toThrow('Invalid toolbar item: missing defaultName or template');
        });

        it('should throw error for invalid position', () => {
            const invalidParams: ComponentPlacementParams = {
                ...mockParams,
                position: {x: NaN, y: 0.5},
            };

            expect(() => placeComponent(invalidParams)).toThrow('Failed to place component: Coordinate must be a valid number');
        });

        it('should throw error for invalid existing components', () => {
            const invalidParams: ComponentPlacementParams = {
                ...mockParams,
                existingComponents: 'invalid' as any,
            };

            expect(() => placeComponent(invalidParams)).toThrow('Existing components must be an array');
        });
    });

    describe('validateComponentPlacement', () => {
        const validParams: ComponentPlacementParams = {
            item: mockToolbarItem,
            position: {x: 0.6, y: 0.8},
            existingComponents: mockExistingComponents,
            currentMapText: 'title Test Map',
        };

        it('should validate correct parameters', () => {
            const result = validateComponentPlacement(validParams);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect missing toolbar item', () => {
            const invalidParams: ComponentPlacementParams = {
                ...validParams,
                item: null as any,
            };

            const result = validateComponentPlacement(invalidParams);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Toolbar item is required');
        });

        it('should detect missing default name', () => {
            const invalidParams: ComponentPlacementParams = {
                ...validParams,
                item: {...mockToolbarItem, defaultName: ''},
            };

            const result = validateComponentPlacement(invalidParams);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Toolbar item must have a default name');
        });

        it('should detect missing template', () => {
            const invalidParams: ComponentPlacementParams = {
                ...validParams,
                item: {...mockToolbarItem, template: null as any},
            };

            const result = validateComponentPlacement(invalidParams);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Toolbar item must have a template function');
        });

        it('should detect invalid position coordinates', () => {
            const invalidParams: ComponentPlacementParams = {
                ...validParams,
                position: {x: -0.5, y: 1.5},
            };

            const result = validateComponentPlacement(invalidParams);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Position x must be between 0 and 1');
            expect(result.errors).toContain('Position y must be between 0 and 1');
        });

        it('should detect invalid existing components', () => {
            const invalidParams: ComponentPlacementParams = {
                ...validParams,
                existingComponents: 'invalid' as any,
            };

            const result = validateComponentPlacement(invalidParams);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Existing components must be an array');
        });

        it('should detect invalid map text type', () => {
            const invalidParams: ComponentPlacementParams = {
                ...validParams,
                currentMapText: 123 as any,
            };

            const result = validateComponentPlacement(invalidParams);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Current map text must be a string');
        });
    });

    describe('validateTemplate', () => {
        it('should validate a working template function', () => {
            const template = (name: string, y: string, x: string) => `component ${name} [${y}, ${x}]`;
            const result = validateTemplate(template, 'test-item');

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect missing template', () => {
            const result = validateTemplate(null, 'test-item');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Template is missing for item test-item');
        });

        it('should detect non-function template', () => {
            const result = validateTemplate('not a function', 'test-item');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Template must be a function for item test-item');
        });

        it('should detect template that returns non-string', () => {
            const template = () => 123;
            const result = validateTemplate(template, 'test-item');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Template must return a string for item test-item');
        });

        it('should detect template that returns empty string', () => {
            const template = () => '';
            const result = validateTemplate(template, 'test-item');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Template returns empty string for item test-item');
        });

        it('should detect template that throws error', () => {
            const template = () => {
                throw new Error('Template error');
            };
            const result = validateTemplate(template, 'test-item');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Template throws error for item test-item: Template error');
        });

        it('should detect template that returns excessively long string', () => {
            const template = () => 'x'.repeat(1001);
            const result = validateTemplate(template, 'test-item');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Template returns excessively long string for item test-item');
        });
    });

    describe('createFallbackTemplate', () => {
        it('should create basic component template', () => {
            const template = createFallbackTemplate('component', 'component');
            const result = template('Test Component', '0.70', '0.50');

            expect(result).toBe('component Test Component [0.70, 0.50]');
        });

        it('should create inertia component template', () => {
            const template = createFallbackTemplate('component-inertia', 'component');
            const result = template('Test Component', '0.70', '0.50');

            expect(result).toBe('component Test Component [0.70, 0.50] inertia');
        });

        it('should create market component template', () => {
            const template = createFallbackTemplate('market', 'component');
            const result = template('Test Component', '0.70', '0.50');

            expect(result).toBe('component Test Component [0.70, 0.50] (market)');
        });

        it('should create ecosystem component template', () => {
            const template = createFallbackTemplate('ecosystem', 'component');
            const result = template('Test Component', '0.70', '0.50');

            expect(result).toBe('component Test Component [0.70, 0.50] (ecosystem)');
        });

        it('should create buy method template', () => {
            const template = createFallbackTemplate('buy', 'method');
            const result = template('Test Component', '0.70', '0.50');

            expect(result).toBe('component Test Component [0.70, 0.50] (buy)');
        });

        it('should create build method template', () => {
            const template = createFallbackTemplate('build', 'method');
            const result = template('Test Component', '0.70', '0.50');

            expect(result).toBe('component Test Component [0.70, 0.50] (build)');
        });

        it('should create outsource method template', () => {
            const template = createFallbackTemplate('outsource', 'method');
            const result = template('Test Component', '0.70', '0.50');

            expect(result).toBe('component Test Component [0.70, 0.50] (outsource)');
        });

        it('should create note template', () => {
            const template = createFallbackTemplate('note', 'note');
            const result = template('Test Note', '0.70', '0.50');

            expect(result).toBe('note Test Note [0.70, 0.50]');
        });

        it('should create pipeline template', () => {
            const template = createFallbackTemplate('pipeline', 'pipeline');
            const result = template('Test Pipeline', '0.70', '0.50');

            expect(result).toBe('pipeline Test Pipeline [0.70, 0.50]');
        });

        it('should create anchor template', () => {
            const template = createFallbackTemplate('anchor', 'other');
            const result = template('Test Anchor', '0.70', '0.50');

            expect(result).toBe('anchor Test Anchor [0.70, 0.50]');
        });

        it('should sanitize component name with newlines', () => {
            const template = createFallbackTemplate('component', 'component');
            const result = template('Test\nComponent\r\nName', '0.70', '0.50');

            expect(result).toBe('component Test Component Name [0.70, 0.50]');
        });

        it('should handle invalid coordinates with fallback', () => {
            const template = createFallbackTemplate('component', 'component');
            const result = template('Test Component', 'invalid', 'also-invalid');

            expect(result).toBe('component Test Component [0.50, 0.50]');
        });

        it('should handle empty component name', () => {
            const template = createFallbackTemplate('component', 'component');
            const result = template('', '0.70', '0.50');

            expect(result).toBe('component New Component [0.70, 0.50]');
        });

        it('should default to component template for unknown category', () => {
            const template = createFallbackTemplate('unknown', 'unknown');
            const result = template('Test Component', '0.70', '0.50');

            expect(result).toBe('component Test Component [0.70, 0.50]');
        });
    });

    describe('generateComponentMapText with error handling', () => {
        it('should use fallback template when original template fails validation', () => {
            const itemWithBadTemplate: ToolbarItem = {
                ...mockToolbarItem,
                id: 'bad-template',
                template: () => {
                    throw new Error('Template error');
                },
            };

            const result = generateComponentMapText(itemWithBadTemplate, 'Test Component', {x: 0.6, y: 0.8});
            expect(result).toBe('component Test Component [0.80, 0.60]');
        });

        it('should use basic fallback when all templates fail', () => {
            const itemWithBadTemplate: ToolbarItem = {
                ...mockToolbarItem,
                id: 'bad-template',
                template: null as any,
            };

            const result = generateComponentMapText(itemWithBadTemplate, 'Test Component', {x: 0.6, y: 0.8});
            expect(result).toBe('component Test Component [0.80, 0.60]');
        });

        it('should sanitize component name with newlines', () => {
            const result = generateComponentMapText(mockToolbarItem, 'Test\nComponent\r\nName', {x: 0.6, y: 0.8});
            expect(result).toBe('component Test Component Name [0.80, 0.60]');
        });

        it('should throw error for empty component name after sanitization', () => {
            expect(() => generateComponentMapText(mockToolbarItem, '   \n\r   ', {x: 0.6, y: 0.8})).toThrow(
                'Component name cannot be empty after sanitization',
            );
        });

        it('should handle template that returns invalid result', () => {
            const itemWithBadTemplate: ToolbarItem = {
                ...mockToolbarItem,
                template: () => null as any,
            };

            const result = generateComponentMapText(itemWithBadTemplate, 'Test Component', {x: 0.6, y: 0.8});
            expect(result).toBe('component Test Component [0.80, 0.60]');
        });

        it('should handle template that returns invalid result', () => {
            const itemWithBadTemplate: ToolbarItem = {
                ...mockToolbarItem,
                template: () => null as any,
            };

            const result = generateComponentMapText(itemWithBadTemplate, 'Test Component', {x: 0.6, y: 0.8});
            expect(result).toBe('component Test Component [0.80, 0.60]');
        });
    });
});
