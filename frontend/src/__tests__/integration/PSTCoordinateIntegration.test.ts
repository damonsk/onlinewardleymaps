/**
 * Integration tests for PST coordinate utilities with existing configuration
 */

import {
    convertPSTCoordinatesToBounds,
    convertBoundsToPSTCoordinates,
    validatePSTBounds,
    constrainPSTBounds,
} from '../../utils/pstCoordinateUtils';
import {PST_CONFIG, DEFAULT_RESIZE_CONSTRAINTS} from '../../constants/pstConfig';
import {PSTCoordinates, PSTType} from '../../types/map/pst';
import {MapDimensions} from '../../constants/defaults';

describe('PST Coordinate Integration', () => {
    const mockMapDimensions: MapDimensions = {
        width: 800,
        height: 600,
    };

    describe('Integration with PST_CONFIG', () => {
        it('should work with all PST types from configuration', () => {
            const pstTypes: PSTType[] = ['pioneers', 'settlers', 'townplanners'];

            pstTypes.forEach(type => {
                const config = PST_CONFIG[type];
                expect(config).toBeDefined();
                expect(config.color).toBeDefined();
                expect(config.label).toBeDefined();
                expect(config.minWidth).toBe(50);
                expect(config.minHeight).toBe(30);
            });
        });

        it('should validate bounds against PST configuration constraints', () => {
            const validBounds = {
                x: 100,
                y: 100,
                width: PST_CONFIG.pioneers.minWidth,
                height: PST_CONFIG.pioneers.minHeight,
            };

            expect(validatePSTBounds(validBounds, DEFAULT_RESIZE_CONSTRAINTS)).toBe(true);

            const tooSmallBounds = {
                x: 100,
                y: 100,
                width: PST_CONFIG.pioneers.minWidth - 10,
                height: PST_CONFIG.pioneers.minHeight - 10,
            };

            expect(validatePSTBounds(tooSmallBounds, DEFAULT_RESIZE_CONSTRAINTS)).toBe(false);
        });

        it('should constrain bounds to meet PST configuration requirements', () => {
            const tooSmallBounds = {
                x: 100,
                y: 100,
                width: 20,
                height: 15,
            };

            const constrained = constrainPSTBounds(tooSmallBounds, mockMapDimensions, DEFAULT_RESIZE_CONSTRAINTS);

            expect(constrained.width).toBe(PST_CONFIG.pioneers.minWidth);
            expect(constrained.height).toBe(PST_CONFIG.pioneers.minHeight);
        });
    });

    describe('Integration with DEFAULT_RESIZE_CONSTRAINTS', () => {
        it('should respect default resize constraints', () => {
            const constraints = DEFAULT_RESIZE_CONSTRAINTS;

            expect(constraints.minWidth).toBe(50);
            expect(constraints.minHeight).toBe(30);
            expect(constraints.maxWidth).toBe(800);
            expect(constraints.maxHeight).toBe(600);
            expect(constraints.snapToGrid).toBe(false);
            expect(constraints.maintainAspectRatio).toBe(false);
        });

        it('should constrain bounds within default limits', () => {
            const oversizedBounds = {
                x: 100,
                y: 100,
                width: 1000,
                height: 800,
            };

            const constrained = constrainPSTBounds(oversizedBounds, mockMapDimensions, DEFAULT_RESIZE_CONSTRAINTS);

            expect(constrained.width).toBe(DEFAULT_RESIZE_CONSTRAINTS.maxWidth);
            expect(constrained.height).toBe(DEFAULT_RESIZE_CONSTRAINTS.maxHeight);
        });
    });

    describe('Real-world coordinate scenarios', () => {
        it('should handle typical PST box coordinates', () => {
            // Typical pioneers box in early maturity, high visibility
            const pioneersCoords: PSTCoordinates = {
                maturity1: 0.1,
                visibility1: 0.9,
                maturity2: 0.3,
                visibility2: 0.7,
            };

            const bounds = convertPSTCoordinatesToBounds(pioneersCoords, mockMapDimensions);
            const convertedBack = convertBoundsToPSTCoordinates(bounds, mockMapDimensions);

            expect(convertedBack.maturity1).toBeCloseTo(pioneersCoords.maturity1, 2);
            expect(convertedBack.visibility1).toBeCloseTo(pioneersCoords.visibility1, 2);
            expect(convertedBack.maturity2).toBeCloseTo(pioneersCoords.maturity2, 2);
            expect(convertedBack.visibility2).toBeCloseTo(pioneersCoords.visibility2, 2);
        });

        it('should handle settlers box in middle maturity', () => {
            const settlersCoords: PSTCoordinates = {
                maturity1: 0.4,
                visibility1: 0.8,
                maturity2: 0.6,
                visibility2: 0.5,
            };

            const bounds = convertPSTCoordinatesToBounds(settlersCoords, mockMapDimensions);

            expect(bounds.width).toBeGreaterThanOrEqual(PST_CONFIG.settlers.minWidth);
            expect(bounds.height).toBeGreaterThanOrEqual(PST_CONFIG.settlers.minHeight);
            expect(validatePSTBounds(bounds, DEFAULT_RESIZE_CONSTRAINTS)).toBe(true);
        });

        it('should handle town planners box in high maturity', () => {
            const townplannersCoords: PSTCoordinates = {
                maturity1: 0.7,
                visibility1: 0.7,
                maturity2: 0.9,
                visibility2: 0.4,
            };

            const bounds = convertPSTCoordinatesToBounds(townplannersCoords, mockMapDimensions);

            expect(bounds.width).toBeGreaterThanOrEqual(PST_CONFIG.townplanners.minWidth);
            expect(bounds.height).toBeGreaterThanOrEqual(PST_CONFIG.townplanners.minHeight);
            expect(validatePSTBounds(bounds, DEFAULT_RESIZE_CONSTRAINTS)).toBe(true);
        });
    });

    describe('Edge case handling', () => {
        it('should handle minimum size PST boxes', () => {
            const minSizeCoords: PSTCoordinates = {
                maturity1: 0.5,
                visibility1: 0.55,
                maturity2: 0.5625, // Creates 50px width at 800px map width
                visibility2: 0.5, // Creates 30px height at 600px map height
            };

            const bounds = convertPSTCoordinatesToBounds(minSizeCoords, mockMapDimensions);

            expect(bounds.width).toBeCloseTo(50, 0);
            expect(bounds.height).toBeCloseTo(30, 0);
            expect(validatePSTBounds(bounds, DEFAULT_RESIZE_CONSTRAINTS)).toBe(true);
        });

        it('should handle PST boxes at map boundaries', () => {
            const boundaryCoords: PSTCoordinates = {
                maturity1: 0.9,
                visibility1: 0.95,
                maturity2: 1.0,
                visibility2: 0.9,
            };

            const bounds = convertPSTCoordinatesToBounds(boundaryCoords, mockMapDimensions);
            const constrained = constrainPSTBounds(bounds, mockMapDimensions, DEFAULT_RESIZE_CONSTRAINTS);

            expect(constrained.x + constrained.width).toBeLessThanOrEqual(mockMapDimensions.width);
            expect(constrained.y + constrained.height).toBeLessThanOrEqual(mockMapDimensions.height);
        });

        it('should handle different map dimensions', () => {
            const smallMapDimensions: MapDimensions = {
                width: 400,
                height: 300,
            };

            const coords: PSTCoordinates = {
                maturity1: 0.2,
                visibility1: 0.8,
                maturity2: 0.6,
                visibility2: 0.4,
            };

            const bounds = convertPSTCoordinatesToBounds(coords, smallMapDimensions);
            const convertedBack = convertBoundsToPSTCoordinates(bounds, smallMapDimensions);

            expect(convertedBack.maturity1).toBeCloseTo(coords.maturity1, 2);
            expect(convertedBack.visibility1).toBeCloseTo(coords.visibility1, 2);
            expect(convertedBack.maturity2).toBeCloseTo(coords.maturity2, 2);
            expect(convertedBack.visibility2).toBeCloseTo(coords.visibility2, 2);
        });
    });

    describe('Performance considerations', () => {
        it('should handle multiple coordinate conversions efficiently', () => {
            const startTime = performance.now();

            // Perform 1000 coordinate conversions
            for (let i = 0; i < 1000; i++) {
                const coords: PSTCoordinates = {
                    maturity1: Math.random() * 0.5,
                    visibility1: 0.5 + Math.random() * 0.5,
                    maturity2: 0.5 + Math.random() * 0.5,
                    visibility2: Math.random() * 0.5,
                };

                const bounds = convertPSTCoordinatesToBounds(coords, mockMapDimensions);
                convertBoundsToPSTCoordinates(bounds, mockMapDimensions);
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Should complete 1000 conversions in reasonable time (less than 100ms)
            expect(duration).toBeLessThan(100);
        });

        it('should handle constraint validation efficiently', () => {
            const startTime = performance.now();

            // Perform 1000 constraint validations
            for (let i = 0; i < 1000; i++) {
                const bounds = {
                    x: Math.random() * 800,
                    y: Math.random() * 600,
                    width: 50 + Math.random() * 200,
                    height: 30 + Math.random() * 150,
                };

                validatePSTBounds(bounds, DEFAULT_RESIZE_CONSTRAINTS);
                constrainPSTBounds(bounds, mockMapDimensions, DEFAULT_RESIZE_CONSTRAINTS);
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Should complete 1000 validations in reasonable time (less than 50ms)
            expect(duration).toBeLessThan(50);
        });
    });
});
