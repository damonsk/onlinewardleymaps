/**
 * Unit tests for PST coordinate conversion utilities
 */

import { MapDimensions } from '../../constants/defaults';
import { PSTBounds, PSTCoordinates, ResizeConstraints } from '../../types/map/pst';
import {
    calculateDistance,
    calculateResizedBounds,
    constrainPSTBounds,
    convertBoundsToPSTCoordinates,
    convertPSTCoordinatesToBounds,
    getPSTBoundsCenter,
    isPointInPSTBounds,
    snapToGrid,
    validatePSTBounds,
    validatePSTCoordinates,
} from '../../utils/pstCoordinateUtils';

describe('PST Coordinate Utilities', () => {
    const mockMapDimensions: MapDimensions = {
        width: 800,
        height: 600,
    };

    const mockConstraints: ResizeConstraints = {
        minWidth: 50,
        minHeight: 30,
        maxWidth: 400,
        maxHeight: 300,
        snapToGrid: false,
        maintainAspectRatio: false,
    };

    describe('convertPSTCoordinatesToBounds', () => {
        it('should convert valid PST coordinates to SVG bounds', () => {
            const coordinates: PSTCoordinates = {
                maturity1: 0.2,
                visibility1: 0.8,
                maturity2: 0.6,
                visibility2: 0.4,
            };

            const bounds = convertPSTCoordinatesToBounds(coordinates, mockMapDimensions);

            // Expected values now include viewBox offset (-35, -45)
            expect(bounds.x).toBeCloseTo(125, 1); // (0.2 * 800) + (-35) = 160 - 35 = 125
            expect(bounds.y).toBeCloseTo(75, 1); // ((1 - 0.8) * 600) + (-45) = 120 - 45 = 75
            expect(bounds.width).toBeCloseTo(320, 1); // (0.6 - 0.2) * 800
            expect(bounds.height).toBeCloseTo(240, 1); // (0.8 - 0.4) * 600
        });

        it('should handle edge coordinates (0,0) to (1,1)', () => {
            const coordinates: PSTCoordinates = {
                maturity1: 0,
                visibility1: 1,
                maturity2: 1,
                visibility2: 0,
            };

            const bounds = convertPSTCoordinatesToBounds(coordinates, mockMapDimensions);

            // Expected values now include viewBox offset (-35, -45)
            expect(bounds.x).toBe(-35); // 0 + (-35)
            expect(bounds.y).toBe(-45); // 0 + (-45)
            expect(bounds.width).toBe(800);
            expect(bounds.height).toBe(600);
        });

        it('should handle inverted coordinates correctly', () => {
            const coordinates: PSTCoordinates = {
                maturity1: 0.6,
                visibility1: 0.4,
                maturity2: 0.2,
                visibility2: 0.8,
            };

            const bounds = convertPSTCoordinatesToBounds(coordinates, mockMapDimensions);

            // Should use minimum values for x,y and absolute differences for width,height
            // Expected values now include viewBox offset (-35, -45)
            expect(bounds.x).toBeCloseTo(125, 1); // min(0.6*800, 0.2*800) + (-35) = 160 - 35 = 125
            expect(bounds.y).toBeCloseTo(75, 1); // min((1-0.4)*600, (1-0.8)*600) + (-45) = 120 - 45 = 75
            expect(bounds.width).toBeCloseTo(320, 1); // abs(0.6*800 - 0.2*800)
            expect(bounds.height).toBeCloseTo(240, 1); // abs((1-0.4)*600 - (1-0.8)*600)
        });
    });

    describe('convertBoundsToPSTCoordinates', () => {
        it('should convert SVG bounds back to PST coordinates', () => {
            const bounds: PSTBounds = {
                x: 125, // 160 - 35 (viewBox offset)
                y: 75,  // 120 - 45 (viewBox offset)
                width: 320,
                height: 240,
            };

            const coordinates = convertBoundsToPSTCoordinates(bounds, mockMapDimensions);

            expect(coordinates.maturity1).toBeCloseTo(0.2, 2);
            expect(coordinates.visibility1).toBeCloseTo(0.8, 2);
            expect(coordinates.maturity2).toBeCloseTo(0.6, 2);
            expect(coordinates.visibility2).toBeCloseTo(0.4, 2);
        });

        it('should clamp coordinates to valid range (0-1)', () => {
            const bounds: PSTBounds = {
                x: -100,
                y: -50,
                width: 1000,
                height: 700,
            };

            const coordinates = convertBoundsToPSTCoordinates(bounds, mockMapDimensions);

            expect(coordinates.maturity1).toBe(0);
            expect(coordinates.visibility1).toBe(1);
            expect(coordinates.maturity2).toBe(1);
            expect(coordinates.visibility2).toBe(0);
        });

        it('should handle zero-sized bounds', () => {
            const bounds: PSTBounds = {
                x: 365, // 400 - 35 (viewBox offset)
                y: 255, // 300 - 45 (viewBox offset)
                width: 0,
                height: 0,
            };

            const coordinates = convertBoundsToPSTCoordinates(bounds, mockMapDimensions);

            expect(coordinates.maturity1).toBe(0.5);
            expect(coordinates.visibility1).toBe(0.5);
            expect(coordinates.maturity2).toBe(0.5);
            expect(coordinates.visibility2).toBe(0.5);
        });
    });

    describe('validatePSTCoordinates', () => {
        it('should validate correct PST coordinates', () => {
            const validCoordinates: PSTCoordinates = {
                maturity1: 0.2,
                visibility1: 0.8,
                maturity2: 0.6,
                visibility2: 0.4,
            };

            expect(validatePSTCoordinates(validCoordinates)).toBe(true);
        });

        it('should reject coordinates outside 0-1 range', () => {
            const invalidCoordinates: PSTCoordinates = {
                maturity1: -0.1,
                visibility1: 0.8,
                maturity2: 1.2,
                visibility2: 0.4,
            };

            expect(validatePSTCoordinates(invalidCoordinates)).toBe(false);
        });

        it('should reject inverted coordinates', () => {
            const invertedCoordinates: PSTCoordinates = {
                maturity1: 0.6,
                visibility1: 0.4,
                maturity2: 0.2,
                visibility2: 0.8,
            };

            expect(validatePSTCoordinates(invertedCoordinates)).toBe(false);
        });

        it('should reject NaN coordinates', () => {
            const nanCoordinates: PSTCoordinates = {
                maturity1: NaN,
                visibility1: 0.8,
                maturity2: 0.6,
                visibility2: 0.4,
            };

            expect(validatePSTCoordinates(nanCoordinates)).toBe(false);
        });
    });

    describe('validatePSTBounds', () => {
        it('should validate bounds within constraints', () => {
            const validBounds: PSTBounds = {
                x: 100,
                y: 100,
                width: 200,
                height: 150,
            };

            expect(validatePSTBounds(validBounds, mockConstraints)).toBe(true);
        });

        it('should reject bounds below minimum size', () => {
            const tooSmallBounds: PSTBounds = {
                x: 100,
                y: 100,
                width: 30,
                height: 20,
            };

            expect(validatePSTBounds(tooSmallBounds, mockConstraints)).toBe(false);
        });

        it('should reject bounds above maximum size', () => {
            const tooLargeBounds: PSTBounds = {
                x: 100,
                y: 100,
                width: 500,
                height: 400,
            };

            expect(validatePSTBounds(tooLargeBounds, mockConstraints)).toBe(false);
        });

        it('should reject bounds with NaN values', () => {
            const nanBounds: PSTBounds = {
                x: NaN,
                y: 100,
                width: 200,
                height: 150,
            };

            expect(validatePSTBounds(nanBounds, mockConstraints)).toBe(false);
        });
    });

    describe('constrainPSTBounds', () => {
        it('should constrain bounds to minimum size', () => {
            const tooSmallBounds: PSTBounds = {
                x: 100,
                y: 100,
                width: 30,
                height: 20,
            };

            const constrained = constrainPSTBounds(tooSmallBounds, mockMapDimensions, mockConstraints);

            expect(constrained.width).toBe(50);
            expect(constrained.height).toBe(30);
        });

        it('should constrain bounds to maximum size', () => {
            const tooLargeBounds: PSTBounds = {
                x: 100,
                y: 100,
                width: 500,
                height: 400,
            };

            const constrained = constrainPSTBounds(tooLargeBounds, mockMapDimensions, mockConstraints);

            expect(constrained.width).toBe(400);
            expect(constrained.height).toBe(300);
        });

        it('should constrain bounds to map boundaries', () => {
            const outOfBoundsBounds: PSTBounds = {
                x: 700,
                y: 500,
                width: 200,
                height: 150,
            };

            const constrained = constrainPSTBounds(outOfBoundsBounds, mockMapDimensions, mockConstraints);

            expect(constrained.x).toBe(600); // 800 - 200
            expect(constrained.y).toBe(450); // 600 - 150
        });

        it('should handle negative coordinates', () => {
            const negativeBounds: PSTBounds = {
                x: -50,
                y: -30,
                width: 200,
                height: 150,
            };

            const constrained = constrainPSTBounds(negativeBounds, mockMapDimensions, mockConstraints);

            expect(constrained.x).toBe(0);
            expect(constrained.y).toBe(0);
        });
    });

    describe('getPSTBoundsCenter', () => {
        it('should calculate center point correctly', () => {
            const bounds: PSTBounds = {
                x: 100,
                y: 200,
                width: 300,
                height: 100,
            };

            const center = getPSTBoundsCenter(bounds);

            expect(center.x).toBe(250); // 100 + 300/2
            expect(center.y).toBe(250); // 200 + 100/2
        });

        it('should handle zero-sized bounds', () => {
            const bounds: PSTBounds = {
                x: 100,
                y: 200,
                width: 0,
                height: 0,
            };

            const center = getPSTBoundsCenter(bounds);

            expect(center.x).toBe(100);
            expect(center.y).toBe(200);
        });
    });

    describe('isPointInPSTBounds', () => {
        const bounds: PSTBounds = {
            x: 100,
            y: 100,
            width: 200,
            height: 150,
        };

        it('should detect point inside bounds', () => {
            const insidePoint = {x: 200, y: 175};
            expect(isPointInPSTBounds(insidePoint, bounds)).toBe(true);
        });

        it('should detect point outside bounds', () => {
            const outsidePoint = {x: 50, y: 50};
            expect(isPointInPSTBounds(outsidePoint, bounds)).toBe(false);
        });

        it('should handle edge points correctly', () => {
            const edgePoint = {x: 100, y: 100};
            expect(isPointInPSTBounds(edgePoint, bounds)).toBe(true);

            const cornerPoint = {x: 300, y: 250};
            expect(isPointInPSTBounds(cornerPoint, bounds)).toBe(true);
        });
    });

    describe('calculateDistance', () => {
        it('should calculate distance between two points', () => {
            const point1 = {x: 0, y: 0};
            const point2 = {x: 3, y: 4};

            const distance = calculateDistance(point1, point2);

            expect(distance).toBe(5); // 3-4-5 triangle
        });

        it('should handle same points', () => {
            const point = {x: 100, y: 200};

            const distance = calculateDistance(point, point);

            expect(distance).toBe(0);
        });

        it('should handle negative coordinates', () => {
            const point1 = {x: -3, y: -4};
            const point2 = {x: 0, y: 0};

            const distance = calculateDistance(point1, point2);

            expect(distance).toBe(5);
        });
    });

    describe('snapToGrid', () => {
        it('should snap to grid when enabled', () => {
            expect(snapToGrid(23, 10, true)).toBe(20);
            expect(snapToGrid(27, 10, true)).toBe(30);
            expect(snapToGrid(25, 10, true)).toBe(30);
        });

        it('should not snap when disabled', () => {
            expect(snapToGrid(23, 10, false)).toBe(23);
            expect(snapToGrid(27, 10, false)).toBe(27);
        });

        it('should handle different grid sizes', () => {
            expect(snapToGrid(23, 5, true)).toBe(25);
            expect(snapToGrid(23, 20, true)).toBe(20);
        });
    });

    describe('calculateResizedBounds', () => {
        const originalBounds: PSTBounds = {
            x: 100,
            y: 100,
            width: 200,
            height: 150,
        };

        it('should resize from top-left handle', () => {
            const resized = calculateResizedBounds(originalBounds, 'top-left', 10, 20, mockConstraints, mockMapDimensions);

            expect(resized.x).toBe(110);
            expect(resized.y).toBe(120);
            expect(resized.width).toBe(190);
            expect(resized.height).toBe(130);
        });

        it('should resize from bottom-right handle', () => {
            const resized = calculateResizedBounds(originalBounds, 'bottom-right', 50, 30, mockConstraints, mockMapDimensions);

            expect(resized.x).toBe(100);
            expect(resized.y).toBe(100);
            expect(resized.width).toBe(250);
            expect(resized.height).toBe(180);
        });

        it('should resize from middle-right handle', () => {
            const resized = calculateResizedBounds(originalBounds, 'middle-right', 50, 0, mockConstraints, mockMapDimensions);

            expect(resized.x).toBe(100);
            expect(resized.y).toBe(100);
            expect(resized.width).toBe(250);
            expect(resized.height).toBe(150);
        });

        it('should apply constraints during resize', () => {
            const resized = calculateResizedBounds(
                originalBounds,
                'bottom-right',
                -180, // Would make width 20, below minimum
                -130, // Would make height 20, below minimum
                mockConstraints,
                mockMapDimensions,
            );

            expect(resized.width).toBe(50); // Constrained to minimum
            expect(resized.height).toBe(30); // Constrained to minimum
        });

        it('should handle all resize handle positions', () => {
            const handles = [
                'top-left',
                'top-center',
                'top-right',
                'middle-left',
                'middle-right',
                'bottom-left',
                'bottom-center',
                'bottom-right',
            ];

            handles.forEach(handle => {
                const resized = calculateResizedBounds(originalBounds, handle, 10, 10, mockConstraints, mockMapDimensions);

                expect(resized).toBeDefined();
                expect(resized.width).toBeGreaterThanOrEqual(mockConstraints.minWidth);
                expect(resized.height).toBeGreaterThanOrEqual(mockConstraints.minHeight);
            });
        });
    });

    describe('Round-trip conversion accuracy', () => {
        it('should maintain accuracy through coordinate conversion round-trips', () => {
            const originalCoordinates: PSTCoordinates = {
                maturity1: 0.25,
                visibility1: 0.75,
                maturity2: 0.65,
                visibility2: 0.35,
            };

            const bounds = convertPSTCoordinatesToBounds(originalCoordinates, mockMapDimensions);
            const convertedBack = convertBoundsToPSTCoordinates(bounds, mockMapDimensions);

            expect(convertedBack.maturity1).toBeCloseTo(originalCoordinates.maturity1, 3);
            expect(convertedBack.visibility1).toBeCloseTo(originalCoordinates.visibility1, 3);
            expect(convertedBack.maturity2).toBeCloseTo(originalCoordinates.maturity2, 3);
            expect(convertedBack.visibility2).toBeCloseTo(originalCoordinates.visibility2, 3);
        });

        it('should handle edge cases in round-trip conversion', () => {
            const edgeCases: PSTCoordinates[] = [
                {maturity1: 0, visibility1: 1, maturity2: 1, visibility2: 0},
                {maturity1: 0.1, visibility1: 0.9, maturity2: 0.9, visibility2: 0.1},
                {maturity1: 0.5, visibility1: 0.6, maturity2: 0.6, visibility2: 0.4},
            ];

            edgeCases.forEach(coordinates => {
                const bounds = convertPSTCoordinatesToBounds(coordinates, mockMapDimensions);
                const convertedBack = convertBoundsToPSTCoordinates(bounds, mockMapDimensions);

                expect(convertedBack.maturity1).toBeCloseTo(coordinates.maturity1, 2);
                expect(convertedBack.visibility1).toBeCloseTo(coordinates.visibility1, 2);
                expect(convertedBack.maturity2).toBeCloseTo(coordinates.maturity2, 2);
                expect(convertedBack.visibility2).toBeCloseTo(coordinates.visibility2, 2);
            });
        });
    });
});
