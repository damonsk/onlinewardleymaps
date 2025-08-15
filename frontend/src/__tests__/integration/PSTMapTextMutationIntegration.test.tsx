/**
 * Integration tests for PST Map Text Mutation with resize functionality
 */

import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    updatePSTElementInMapText,
    generatePSTSyntax,
    extractPSTElementsFromMapText,
    batchUpdatePSTElements,
} from '../../utils/pstMapTextMutation';
import {PSTElement, PSTCoordinates} from '../../types/map/pst';

describe('PST Map Text Mutation Integration', () => {
    const sampleMapText = `title Test Map
pioneers [0.80, 0.10, 0.60, 0.30] Test Pioneers
settlers [0.70, 0.20, 0.50, 0.40] Test Settlers
component Test Component [0.50, 0.50]
townplanners [0.60, 0.30, 0.40, 0.50] Test Town Planners
note Test Note [0.40, 0.60]`;

    describe('End-to-end PST resize workflow', () => {
        it('should extract PST elements, update coordinates, and regenerate map text', () => {
            // Step 1: Extract PST elements from map text
            const pstElements = extractPSTElementsFromMapText(sampleMapText);

            expect(pstElements).toHaveLength(3);
            expect(pstElements[0].type).toBe('pioneers');
            expect(pstElements[1].type).toBe('settlers');
            expect(pstElements[2].type).toBe('townplanners');

            // Step 2: Simulate resize operation on pioneers element
            const pioneersElement = pstElements[0];
            const newCoordinates: PSTCoordinates = {
                maturity1: 0.15, // Moved right
                visibility1: 0.85, // Moved up
                maturity2: 0.35, // Expanded right
                visibility2: 0.65, // Expanded down
            };

            // Step 3: Update map text with new coordinates
            const updatedMapText = updatePSTElementInMapText({
                mapText: sampleMapText,
                pstElement: pioneersElement,
                newCoordinates,
            });

            // Step 4: Verify the update
            const lines = updatedMapText.split('\n');
            expect(lines[1]).toBe('pioneers [0.85, 0.15, 0.65, 0.35] Test Pioneers');

            // Other lines should remain unchanged
            expect(lines[0]).toBe('title Test Map');
            expect(lines[2]).toBe('settlers [0.70, 0.20, 0.50, 0.40] Test Settlers');
            expect(lines[3]).toBe('component Test Component [0.50, 0.50]');
            expect(lines[4]).toBe('townplanners [0.60, 0.30, 0.40, 0.50] Test Town Planners');
            expect(lines[5]).toBe('note Test Note [0.40, 0.60]');
        });

        it('should handle multiple PST element updates in batch', () => {
            const pstElements = extractPSTElementsFromMapText(sampleMapText);

            // Prepare batch updates
            const updates = [
                {
                    element: pstElements[0], // pioneers
                    newCoordinates: {
                        maturity1: 0.15,
                        visibility1: 0.85,
                        maturity2: 0.35,
                        visibility2: 0.65,
                    },
                },
                {
                    element: pstElements[1], // settlers
                    newCoordinates: {
                        maturity1: 0.25,
                        visibility1: 0.75,
                        maturity2: 0.45,
                        visibility2: 0.55,
                    },
                },
                {
                    element: pstElements[2], // townplanners
                    newCoordinates: {
                        maturity1: 0.35,
                        visibility1: 0.65,
                        maturity2: 0.55,
                        visibility2: 0.45,
                    },
                },
            ];

            // Apply batch updates
            const updatedMapText = batchUpdatePSTElements(sampleMapText, updates);
            const lines = updatedMapText.split('\n');

            // Verify all PST elements were updated
            expect(lines[1]).toBe('pioneers [0.85, 0.15, 0.65, 0.35] Test Pioneers');
            expect(lines[2]).toBe('settlers [0.75, 0.25, 0.55, 0.45] Test Settlers');
            expect(lines[4]).toBe('townplanners [0.65, 0.35, 0.45, 0.55] Test Town Planners');

            // Non-PST lines should remain unchanged
            expect(lines[0]).toBe('title Test Map');
            expect(lines[3]).toBe('component Test Component [0.50, 0.50]');
            expect(lines[5]).toBe('note Test Note [0.40, 0.60]');
        });

        it('should preserve PST element names during resize', () => {
            const pstElements = extractPSTElementsFromMapText(sampleMapText);
            const pioneersElement = pstElements[0];

            expect(pioneersElement.name).toBe('Test Pioneers');

            const newCoordinates: PSTCoordinates = {
                maturity1: 0.2,
                visibility1: 0.9,
                maturity2: 0.4,
                visibility2: 0.7,
            };

            const updatedMapText = updatePSTElementInMapText({
                mapText: sampleMapText,
                pstElement: pioneersElement,
                newCoordinates,
            });

            const lines = updatedMapText.split('\n');
            expect(lines[1]).toBe('pioneers [0.90, 0.20, 0.70, 0.40] Test Pioneers');
        });

        it('should handle PST elements without names', () => {
            const mapTextWithoutNames = `title Test Map
pioneers [0.80, 0.10, 0.60, 0.30]
settlers [0.70, 0.20, 0.50, 0.40]`;

            const pstElements = extractPSTElementsFromMapText(mapTextWithoutNames);
            expect(pstElements[0].name).toBeUndefined();

            const newCoordinates: PSTCoordinates = {
                maturity1: 0.15,
                visibility1: 0.85,
                maturity2: 0.35,
                visibility2: 0.65,
            };

            const updatedMapText = updatePSTElementInMapText({
                mapText: mapTextWithoutNames,
                pstElement: pstElements[0],
                newCoordinates,
            });

            const lines = updatedMapText.split('\n');
            expect(lines[1]).toBe('pioneers [0.85, 0.15, 0.65, 0.35]');
        });
    });

    describe('Coordinate precision and formatting', () => {
        it('should maintain consistent coordinate precision', () => {
            const coordinates: PSTCoordinates = {
                maturity1: 0.123456789,
                visibility1: 0.987654321,
                maturity2: 0.555555555,
                visibility2: 0.333333333,
            };

            const syntax = generatePSTSyntax('pioneers', coordinates, 'Test');
            expect(syntax).toBe('pioneers [0.99, 0.12, 0.33, 0.56] Test');
        });

        it('should handle edge case coordinates', () => {
            const edgeCoordinates: PSTCoordinates = {
                maturity1: 0,
                visibility1: 1,
                maturity2: 1,
                visibility2: 0,
            };

            const syntax = generatePSTSyntax('settlers', edgeCoordinates);
            expect(syntax).toBe('settlers [1.00, 0.00, 0.00, 1.00]');
        });
    });

    describe('Error handling and validation', () => {
        it('should handle malformed map text gracefully', () => {
            const malformedMapText = `title Test Map
pioneers [invalid, coordinates]
settlers [0.70, 0.20, 0.50, 0.40]
broken line without proper format`;

            const pstElements = extractPSTElementsFromMapText(malformedMapText);

            // Should only extract valid PST elements
            expect(pstElements).toHaveLength(1);
            expect(pstElements[0].type).toBe('settlers');
        });

        it('should validate coordinates before updating map text', () => {
            const pstElements = extractPSTElementsFromMapText(sampleMapText);
            const pioneersElement = pstElements[0];

            // Invalid coordinates (inverted)
            const invalidCoordinates: PSTCoordinates = {
                maturity1: 0.5,
                visibility1: 0.3, // Lower than visibility2
                maturity2: 0.7,
                visibility2: 0.5,
            };

            expect(() => {
                updatePSTElementInMapText({
                    mapText: sampleMapText,
                    pstElement: pioneersElement,
                    newCoordinates: invalidCoordinates,
                });
            }).toThrow('Invalid PST coordinates');
        });

        it('should handle empty map text', () => {
            const pstElements = extractPSTElementsFromMapText('');
            expect(pstElements).toHaveLength(0);

            const emptyBatchResult = batchUpdatePSTElements('', []);
            expect(emptyBatchResult).toBe('');
        });
    });

    describe('Performance with large maps', () => {
        it('should handle maps with many PST elements efficiently', () => {
            // Generate a large map with many PST elements
            const largePSTCount = 50;
            let largeMapText = 'title Large Test Map\n';

            for (let i = 0; i < largePSTCount; i++) {
                const type = ['pioneers', 'settlers', 'townplanners'][i % 3];
                const y1 = (0.9 - i * 0.01).toFixed(2);
                const x1 = (0.1 + i * 0.01).toFixed(2);
                const y2 = (0.8 - i * 0.01).toFixed(2);
                const x2 = (0.2 + i * 0.01).toFixed(2);
                largeMapText += `${type} [${y1}, ${x1}, ${y2}, ${x2}] PST ${i}\n`;
            }

            const startTime = performance.now();
            const pstElements = extractPSTElementsFromMapText(largeMapText);
            const extractionTime = performance.now() - startTime;

            expect(pstElements).toHaveLength(largePSTCount);
            expect(extractionTime).toBeLessThan(100); // Should complete in under 100ms

            // Test batch update performance
            const updates = pstElements.slice(0, 10).map((element, index) => ({
                element,
                newCoordinates: {
                    maturity1: 0.1 + index * 0.02,
                    visibility1: 0.9 - index * 0.02,
                    maturity2: 0.2 + index * 0.02,
                    visibility2: 0.8 - index * 0.02,
                },
            }));

            const batchStartTime = performance.now();
            const updatedMapText = batchUpdatePSTElements(largeMapText, updates);
            const batchTime = performance.now() - batchStartTime;

            expect(batchTime).toBeLessThan(50); // Should complete in under 50ms
            expect(updatedMapText).toContain('PST 0');
            expect(updatedMapText).toContain('PST 49');
        });
    });

    describe('Integration with existing map functionality', () => {
        it('should preserve non-PST map elements during updates', () => {
            const mixedMapText = `title Mixed Map
component Component A [0.90, 0.10]
pioneers [0.80, 0.10, 0.60, 0.30] Test Pioneers
anchor Anchor Point [0.70, 0.20]
settlers [0.70, 0.20, 0.50, 0.40]
note Important Note [0.60, 0.30]
pipeline Pipeline A [0.50, 0.40]
townplanners [0.60, 0.30, 0.40, 0.50]
evolve Component A 0.8`;

            const pstElements = extractPSTElementsFromMapText(mixedMapText);
            expect(pstElements).toHaveLength(3);

            // Update all PST elements
            const updates = pstElements.map((element, index) => ({
                element,
                newCoordinates: {
                    maturity1: 0.1 + index * 0.1,
                    visibility1: 0.9 - index * 0.1,
                    maturity2: 0.2 + index * 0.1,
                    visibility2: 0.8 - index * 0.1,
                },
            }));

            const updatedMapText = batchUpdatePSTElements(mixedMapText, updates);
            const lines = updatedMapText.split('\n');

            // Verify PST elements were updated
            expect(lines[2]).toContain('pioneers [0.90, 0.10, 0.80, 0.20]');
            expect(lines[4]).toContain('settlers [0.80, 0.20, 0.70, 0.30]');
            expect(lines[7]).toContain('townplanners [0.70, 0.30, 0.60, 0.40]');

            // Verify non-PST elements were preserved
            expect(lines[0]).toBe('title Mixed Map');
            expect(lines[1]).toBe('component Component A [0.90, 0.10]');
            expect(lines[3]).toBe('anchor Anchor Point [0.70, 0.20]');
            expect(lines[5]).toBe('note Important Note [0.60, 0.30]');
            expect(lines[6]).toBe('pipeline Pipeline A [0.50, 0.40]');
            expect(lines[8]).toBe('evolve Component A 0.8');
        });
    });
});
