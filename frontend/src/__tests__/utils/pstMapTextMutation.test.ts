/**
 * Tests for PST Map Text Mutation utilities
 */

import {
    generatePSTSyntax,
    parsePSTSyntax,
    validatePSTSyntax,
    findPSTElementLine,
    updatePSTElementInMapText,
    batchUpdatePSTElements,
    validateMapTextPSTSyntax,
    extractPSTElementsFromMapText,
} from '../../utils/pstMapTextMutation';
import {PSTElement, PSTCoordinates, PSTType} from '../../types/map/pst';

describe('PST Map Text Mutation', () => {
    const mockCoordinates: PSTCoordinates = {
        maturity1: 0.1,
        visibility1: 0.8,
        maturity2: 0.3,
        visibility2: 0.6,
    };

    const mockPSTElement: PSTElement = {
        id: 'test-pst-1',
        type: 'pioneers',
        coordinates: mockCoordinates,
        line: 0,
        name: 'Test PST',
    };

    describe('generatePSTSyntax', () => {
        it('should generate correct syntax for pioneers without name', () => {
            const result = generatePSTSyntax('pioneers', mockCoordinates);
            expect(result).toBe('pioneers [0.80, 0.10, 0.60, 0.30]');
        });

        it('should generate correct syntax for settlers with name', () => {
            const result = generatePSTSyntax('settlers', mockCoordinates, 'Test Settlers');
            expect(result).toBe('settlers [0.80, 0.10, 0.60, 0.30] Test Settlers');
        });

        it('should generate correct syntax for townplanners', () => {
            const result = generatePSTSyntax('townplanners', mockCoordinates, 'Town Planners');
            expect(result).toBe('townplanners [0.80, 0.10, 0.60, 0.30] Town Planners');
        });

        it('should handle edge coordinates correctly', () => {
            const edgeCoords: PSTCoordinates = {
                maturity1: 0,
                visibility1: 1,
                maturity2: 1,
                visibility2: 0,
            };
            const result = generatePSTSyntax('pioneers', edgeCoords);
            expect(result).toBe('pioneers [1.00, 0.00, 0.00, 1.00]');
        });

        it('should trim whitespace from names', () => {
            const result = generatePSTSyntax('pioneers', mockCoordinates, '  Test Name  ');
            expect(result).toBe('pioneers [0.80, 0.10, 0.60, 0.30] Test Name');
        });
    });

    describe('parsePSTSyntax', () => {
        it('should parse valid pioneers syntax without name', () => {
            const result = parsePSTSyntax('pioneers [0.80, 0.10, 0.60, 0.30]');
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('pioneers');
            expect(result.coordinates).toEqual(mockCoordinates);
            expect(result.name).toBeNull();
        });

        it('should parse valid settlers syntax with name', () => {
            const result = parsePSTSyntax('settlers [0.80, 0.10, 0.60, 0.30] Test Settlers');
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('settlers');
            expect(result.coordinates).toEqual(mockCoordinates);
            expect(result.name).toBe('Test Settlers');
        });

        it('should parse townplanners syntax case-insensitively', () => {
            const result = parsePSTSyntax('TOWNPLANNERS [0.80, 0.10, 0.60, 0.30]');
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('townplanners');
        });

        it('should handle extra whitespace', () => {
            const result = parsePSTSyntax('  pioneers  [  0.80  ,  0.10  ,  0.60  ,  0.30  ]  Test Name  ');
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('pioneers');
            expect(result.coordinates).toEqual(mockCoordinates);
            expect(result.name).toBe('Test Name');
        });

        it('should reject invalid syntax', () => {
            const result = parsePSTSyntax('invalid syntax');
            expect(result.isValid).toBe(false);
            expect(result.type).toBeNull();
            expect(result.coordinates).toBeNull();
        });

        it('should reject coordinates out of range', () => {
            const result = parsePSTSyntax('pioneers [1.5, 0.10, 0.60, 0.30]');
            expect(result.isValid).toBe(false);
            expect(result.coordinates).toBeNull();
        });

        it('should reject non-numeric coordinates', () => {
            const result = parsePSTSyntax('pioneers [abc, 0.10, 0.60, 0.30]');
            expect(result.isValid).toBe(false);
        });
    });

    describe('validatePSTSyntax', () => {
        it('should validate correct PST syntax', () => {
            const result = validatePSTSyntax('pioneers [0.80, 0.10, 0.60, 0.30]');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect inverted maturity coordinates', () => {
            const result = validatePSTSyntax('pioneers [0.80, 0.30, 0.60, 0.10]');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Right maturity must be greater than left maturity');
        });

        it('should detect inverted visibility coordinates', () => {
            const result = validatePSTSyntax('pioneers [0.60, 0.10, 0.80, 0.30]');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Top visibility must be greater than bottom visibility');
        });

        it('should warn about very small dimensions', () => {
            const result = validatePSTSyntax('pioneers [0.805, 0.10, 0.80, 0.105]');
            expect(result.isValid).toBe(true);
            expect(result.warnings).toContain('PST box width is very small (less than 1% of map width)');
            expect(result.warnings).toContain('PST box height is very small (less than 1% of map height)');
        });

        it('should reject empty or invalid input', () => {
            const result = validatePSTSyntax('');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('PST syntax must be a non-empty string');
        });
    });

    describe('findPSTElementLine', () => {
        const mapText = `title Test Map
pioneers [0.80, 0.10, 0.60, 0.30] Test PST
settlers [0.70, 0.20, 0.50, 0.40]
component Test [0.50, 0.50]
townplanners [0.60, 0.30, 0.40, 0.50] Town Planners`;

        it('should find PST element by line number', () => {
            const element: PSTElement = {
                id: 'test-1',
                type: 'pioneers',
                coordinates: mockCoordinates,
                line: 1,
            };
            const result = findPSTElementLine(mapText, element);
            expect(result).toBe(1);
        });

        it('should find PST element by coordinates when line number is wrong', () => {
            const element: PSTElement = {
                id: 'test-1',
                type: 'pioneers',
                coordinates: mockCoordinates,
                line: 99, // Wrong line number
            };
            const result = findPSTElementLine(mapText, element);
            expect(result).toBe(1);
        });

        it('should return -1 when element not found', () => {
            const element: PSTElement = {
                id: 'test-1',
                type: 'pioneers',
                coordinates: {
                    maturity1: 0.9,
                    visibility1: 0.9,
                    maturity2: 1.0,
                    visibility2: 0.8,
                },
                line: 99, // Wrong line number
            };
            const result = findPSTElementLine(mapText, element);
            expect(result).toBe(-1);
        });
    });

    describe('updatePSTElementInMapText', () => {
        const mapText = `title Test Map
pioneers [0.80, 0.10, 0.60, 0.30] Test PST
settlers [0.70, 0.20, 0.50, 0.40]
component Test [0.50, 0.50]`;

        it('should update PST element coordinates', () => {
            const newCoordinates: PSTCoordinates = {
                maturity1: 0.15,
                visibility1: 0.85,
                maturity2: 0.35,
                visibility2: 0.65,
            };

            const result = updatePSTElementInMapText({
                mapText,
                pstElement: mockPSTElement,
                newCoordinates,
            });

            const lines = result.split('\n');
            expect(lines[1]).toBe('pioneers [0.85, 0.15, 0.65, 0.35] Test PST');
            expect(lines[0]).toBe('title Test Map'); // Other lines unchanged
            expect(lines[2]).toBe('settlers [0.70, 0.20, 0.50, 0.40]');
        });

        it('should throw error for invalid coordinates', () => {
            const invalidCoordinates: PSTCoordinates = {
                maturity1: 0.5,
                visibility1: 0.3, // Invalid: visibility1 < visibility2
                maturity2: 0.7,
                visibility2: 0.5,
            };

            expect(() => {
                updatePSTElementInMapText({
                    mapText,
                    pstElement: mockPSTElement,
                    newCoordinates: invalidCoordinates,
                });
            }).toThrow('Invalid PST coordinates');
        });

        it('should throw error when element not found', () => {
            const notFoundElement: PSTElement = {
                id: 'not-found',
                type: 'pioneers',
                coordinates: {
                    maturity1: 0.9,
                    visibility1: 0.9,
                    maturity2: 1.0,
                    visibility2: 0.8,
                },
                line: 99, // Wrong line number
            };

            expect(() => {
                updatePSTElementInMapText({
                    mapText,
                    pstElement: notFoundElement,
                    newCoordinates: mockCoordinates,
                });
            }).toThrow('PST element not found in map text');
        });
    });

    describe('batchUpdatePSTElements', () => {
        const mapText = `title Test Map
pioneers [0.80, 0.10, 0.60, 0.30] Test PST
settlers [0.70, 0.20, 0.50, 0.40]
townplanners [0.60, 0.30, 0.40, 0.50]`;

        it('should update multiple PST elements', () => {
            const updates = [
                {
                    element: {
                        id: 'pioneers-1',
                        type: 'pioneers' as PSTType,
                        coordinates: mockCoordinates,
                        line: 1,
                        name: 'Test PST',
                    },
                    newCoordinates: {
                        maturity1: 0.15,
                        visibility1: 0.85,
                        maturity2: 0.35,
                        visibility2: 0.65,
                    },
                },
                {
                    element: {
                        id: 'settlers-1',
                        type: 'settlers' as PSTType,
                        coordinates: {
                            maturity1: 0.2,
                            visibility1: 0.7,
                            maturity2: 0.4,
                            visibility2: 0.5,
                        },
                        line: 2,
                    },
                    newCoordinates: {
                        maturity1: 0.25,
                        visibility1: 0.75,
                        maturity2: 0.45,
                        visibility2: 0.55,
                    },
                },
            ];

            const result = batchUpdatePSTElements(mapText, updates);
            const lines = result.split('\n');

            expect(lines[1]).toBe('pioneers [0.85, 0.15, 0.65, 0.35] Test PST');
            expect(lines[2]).toBe('settlers [0.75, 0.25, 0.55, 0.45]');
            expect(lines[0]).toBe('title Test Map'); // Unchanged
            expect(lines[3]).toBe('townplanners [0.60, 0.30, 0.40, 0.50]'); // Unchanged
        });

        it('should handle empty updates array', () => {
            const result = batchUpdatePSTElements(mapText, []);
            expect(result).toBe(mapText);
        });

        it('should continue with other updates if one fails', () => {
            const updates = [
                {
                    element: {
                        id: 'not-found',
                        type: 'pioneers' as PSTType,
                        coordinates: {
                            maturity1: 0.9,
                            visibility1: 0.9,
                            maturity2: 1.0,
                            visibility2: 0.8,
                        },
                        line: 99,
                    },
                    newCoordinates: mockCoordinates,
                },
                {
                    element: {
                        id: 'settlers-1',
                        type: 'settlers' as PSTType,
                        coordinates: {
                            maturity1: 0.2,
                            visibility1: 0.7,
                            maturity2: 0.4,
                            visibility2: 0.5,
                        },
                        line: 2,
                    },
                    newCoordinates: {
                        maturity1: 0.25,
                        visibility1: 0.75,
                        maturity2: 0.45,
                        visibility2: 0.55,
                    },
                },
            ];

            const result = batchUpdatePSTElements(mapText, updates);
            const lines = result.split('\n');

            // First update should fail, second should succeed
            expect(lines[1]).toBe('pioneers [0.80, 0.10, 0.60, 0.30] Test PST'); // Unchanged
            expect(lines[2]).toBe('settlers [0.75, 0.25, 0.55, 0.45]'); // Updated
        });
    });

    describe('validateMapTextPSTSyntax', () => {
        it('should validate correct map text', () => {
            const mapText = `title Test Map
pioneers [0.80, 0.10, 0.60, 0.30]
settlers [0.70, 0.20, 0.50, 0.40]
component Test [0.50, 0.50]`;

            const result = validateMapTextPSTSyntax(mapText);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect errors in PST syntax', () => {
            const mapText = `title Test Map
pioneers [0.80, 0.30, 0.60, 0.10]
settlers [invalid, syntax]
component Test [0.50, 0.50]`;

            const result = validateMapTextPSTSyntax(mapText);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(2);
            expect(result.errors[0].line).toBe(1);
            expect(result.errors[1].line).toBe(2);
        });

        it('should collect warnings for small dimensions', () => {
            const mapText = `pioneers [0.805, 0.10, 0.80, 0.105]`;

            const result = validateMapTextPSTSyntax(mapText);
            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(2); // Both width and height warnings
        });

        it('should handle empty map text', () => {
            const result = validateMapTextPSTSyntax('');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('extractPSTElementsFromMapText', () => {
        it('should extract all PST elements from map text', () => {
            const mapText = `title Test Map
pioneers [0.80, 0.10, 0.60, 0.30] Test Pioneers
settlers [0.70, 0.20, 0.50, 0.40]
component Test [0.50, 0.50]
townplanners [0.60, 0.30, 0.40, 0.50] Town Planners`;

            const result = extractPSTElementsFromMapText(mapText);

            expect(result).toHaveLength(3);
            
            expect(result[0].type).toBe('pioneers');
            expect(result[0].name).toBe('Test Pioneers');
            expect(result[0].line).toBe(1);
            
            expect(result[1].type).toBe('settlers');
            expect(result[1].name).toBeUndefined();
            expect(result[1].line).toBe(2);
            
            expect(result[2].type).toBe('townplanners');
            expect(result[2].name).toBe('Town Planners');
            expect(result[2].line).toBe(4);
        });

        it('should handle empty map text', () => {
            const result = extractPSTElementsFromMapText('');
            expect(result).toHaveLength(0);
        });

        it('should skip invalid PST syntax', () => {
            const mapText = `pioneers [0.80, 0.10, 0.60, 0.30]
pioneers [invalid, syntax]
settlers [0.70, 0.20, 0.50, 0.40]`;

            const result = extractPSTElementsFromMapText(mapText);
            expect(result).toHaveLength(2); // Only valid ones
            expect(result[0].type).toBe('pioneers');
            expect(result[1].type).toBe('settlers');
        });
    });
});