/**
 * Tests for PST coordinate utilities with keyboard modifier support
 * Tests aspect ratio maintenance and center resize functionality
 */

import {
    calculateResizedBounds,
} from '../../utils/pstCoordinateUtils';
import {PSTBounds, ResizeModifiers} from '../../types/map/pst';
import {MapDimensions} from '../../constants/defaults';
import {DEFAULT_RESIZE_CONSTRAINTS} from '../../constants/pstConfig';

describe('PST Coordinate Utils - Keyboard Modifiers', () => {
    const mockMapDimensions: MapDimensions = {
        width: 800,
        height: 600,
    };

    const mockBounds: PSTBounds = {
        x: 100,
        y: 100,
        width: 200,
        height: 100,
    };

    describe('calculateResizedBounds with keyboard modifiers', () => {
        it('should resize normally without modifiers', () => {
            const result = calculateResizedBounds(
                mockBounds,
                'bottom-right',
                50,
                30,
                DEFAULT_RESIZE_CONSTRAINTS,
                mockMapDimensions,
                {maintainAspectRatio: false, resizeFromCenter: false}
            );

            expect(result).toEqual({
                x: 100,
                y: 100,
                width: 250,
                height: 130,
            });
        });

        it('should maintain aspect ratio when Shift key is pressed', () => {
            const result = calculateResizedBounds(
                mockBounds,
                'bottom-right',
                50,
                30,
                DEFAULT_RESIZE_CONSTRAINTS,
                mockMapDimensions,
                {maintainAspectRatio: true, resizeFromCenter: false}
            );

            // Original aspect ratio is 200/100 = 2:1
            // With aspect ratio constraint, height should adjust to maintain ratio
            expect(result.width / result.height).toBeCloseTo(2, 1);
        });

        it('should resize from center when Alt key is pressed', () => {
            const result = calculateResizedBounds(
                mockBounds,
                'bottom-right',
                50,
                30,
                DEFAULT_RESIZE_CONSTRAINTS,
                mockMapDimensions,
                {maintainAspectRatio: false, resizeFromCenter: true}
            );

            // Center should remain the same
            const originalCenterX = mockBounds.x + mockBounds.width / 2;
            const originalCenterY = mockBounds.y + mockBounds.height / 2;
            const newCenterX = result.x + result.width / 2;
            const newCenterY = result.y + result.height / 2;

            expect(newCenterX).toBeCloseTo(originalCenterX, 1);
            expect(newCenterY).toBeCloseTo(originalCenterY, 1);
        });

        it('should combine both modifiers when both keys are pressed', () => {
            const result = calculateResizedBounds(
                mockBounds,
                'bottom-right',
                50,
                30,
                DEFAULT_RESIZE_CONSTRAINTS,
                mockMapDimensions,
                {maintainAspectRatio: true, resizeFromCenter: true}
            );

            // Should maintain aspect ratio
            expect(result.width / result.height).toBeCloseTo(2, 1);

            // Should resize from center
            const originalCenterX = mockBounds.x + mockBounds.width / 2;
            const originalCenterY = mockBounds.y + mockBounds.height / 2;
            const newCenterX = result.x + result.width / 2;
            const newCenterY = result.y + result.height / 2;

            expect(newCenterX).toBeCloseTo(originalCenterX, 1);
            expect(newCenterY).toBeCloseTo(originalCenterY, 1);
        });

        it('should handle different resize handles with center resize', () => {
            const handles = ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'];
            
            handles.forEach(handle => {
                const result = calculateResizedBounds(
                    mockBounds,
                    handle as any,
                    20,
                    20,
                    DEFAULT_RESIZE_CONSTRAINTS,
                    mockMapDimensions,
                    {maintainAspectRatio: false, resizeFromCenter: true}
                );

                // Center should remain the same for all handles
                const originalCenterX = mockBounds.x + mockBounds.width / 2;
                const originalCenterY = mockBounds.y + mockBounds.height / 2;
                const newCenterX = result.x + result.width / 2;
                const newCenterY = result.y + result.height / 2;

                expect(newCenterX).toBeCloseTo(originalCenterX, 1);
                expect(newCenterY).toBeCloseTo(originalCenterY, 1);
            });
        });

        it('should not apply aspect ratio to edge handles', () => {
            const edgeHandles = ['top-center', 'bottom-center', 'middle-left', 'middle-right'];
            
            edgeHandles.forEach(handle => {
                const result = calculateResizedBounds(
                    mockBounds,
                    handle as any,
                    50,
                    30,
                    DEFAULT_RESIZE_CONSTRAINTS,
                    mockMapDimensions,
                    {maintainAspectRatio: true, resizeFromCenter: false}
                );

                // Edge handles should not be constrained by aspect ratio
                // The aspect ratio constraint should only apply to corner handles
                if (handle === 'middle-right') {
                    expect(result.width).toBe(250); // Should change width
                    expect(result.height).toBe(100); // Should not change height
                } else if (handle === 'bottom-center') {
                    expect(result.width).toBe(200); // Should not change width
                    expect(result.height).toBe(130); // Should change height
                }
            });
        });

        it('should handle negative deltas correctly', () => {
            const result = calculateResizedBounds(
                mockBounds,
                'bottom-right',
                -50,
                -30,
                DEFAULT_RESIZE_CONSTRAINTS,
                mockMapDimensions,
                {maintainAspectRatio: false, resizeFromCenter: false}
            );

            expect(result.width).toBe(150); // 200 - 50
            expect(result.height).toBe(70);  // 100 - 30
        });

        it('should respect minimum size constraints with modifiers', () => {
            const smallBounds: PSTBounds = {
                x: 100,
                y: 100,
                width: 60,
                height: 40,
            };

            const result = calculateResizedBounds(
                smallBounds,
                'bottom-right',
                -50,
                -30,
                DEFAULT_RESIZE_CONSTRAINTS,
                mockMapDimensions,
                {maintainAspectRatio: false, resizeFromCenter: false}
            );

            // Should not go below minimum constraints
            expect(result.width).toBeGreaterThanOrEqual(DEFAULT_RESIZE_CONSTRAINTS.minWidth);
            expect(result.height).toBeGreaterThanOrEqual(DEFAULT_RESIZE_CONSTRAINTS.minHeight);
        });
    });

    describe('Center resize calculations', () => {
        it('should calculate symmetric resize for diagonal handles', () => {
            const result = calculateResizedBounds(
                mockBounds,
                'bottom-right',
                50,
                30,
                DEFAULT_RESIZE_CONSTRAINTS,
                mockMapDimensions,
                {maintainAspectRatio: false, resizeFromCenter: true}
            );

            // Width should increase by 2 * deltaX (symmetric)
            expect(result.width).toBe(mockBounds.width + 2 * Math.abs(50));
            // Height should increase by 2 * deltaY (symmetric)
            expect(result.height).toBe(mockBounds.height + 2 * Math.abs(30));
        });

        it('should handle edge handles correctly with center resize', () => {
            const result = calculateResizedBounds(
                mockBounds,
                'middle-right',
                50,
                0,
                DEFAULT_RESIZE_CONSTRAINTS,
                mockMapDimensions,
                {maintainAspectRatio: false, resizeFromCenter: true}
            );

            // Only width should change for horizontal edge handles
            expect(result.width).toBe(mockBounds.width + 2 * Math.abs(50));
            expect(result.height).toBe(mockBounds.height); // Should remain the same
        });
    });

    describe('Aspect ratio maintenance', () => {
        it('should maintain aspect ratio for corner handles', () => {
            const cornerHandles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
            
            cornerHandles.forEach(handle => {
                const result = calculateResizedBounds(
                    mockBounds,
                    handle as any,
                    60,
                    20,
                    DEFAULT_RESIZE_CONSTRAINTS,
                    mockMapDimensions,
                    {maintainAspectRatio: true, resizeFromCenter: false}
                );

                // Should maintain original aspect ratio (2:1)
                expect(result.width / result.height).toBeCloseTo(2, 1);
            });
        });

        it('should not constrain edge handles with aspect ratio', () => {
            const result = calculateResizedBounds(
                mockBounds,
                'middle-right',
                50,
                0,
                DEFAULT_RESIZE_CONSTRAINTS,
                mockMapDimensions,
                {maintainAspectRatio: true, resizeFromCenter: false}
            );

            // Edge handles should resize freely even with aspect ratio enabled
            expect(result.width).toBe(250);
            expect(result.height).toBe(100); // Should not change
        });
    });
});