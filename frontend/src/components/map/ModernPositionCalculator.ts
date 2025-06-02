/**
 * ModernPositionCalculator - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This class provides utility functions for converting between logical map coordinates
 * (visibility/maturity) and screen coordinates (x/y)
 */
export default class ModernPositionCalculator {
    /**
     * Convert visibility value (0-1) to screen Y coordinate
     */
    visibilityToY(visibility: number, mapHeight: number): number {
        return (1 - visibility) * mapHeight;
    }

    /**
     * Convert maturity value (0-1) to screen X coordinate
     */
    maturityToX(maturity: number, mapWidth: number): number {
        return maturity * mapWidth;
    }

    /**
     * Convert screen X coordinate to maturity value (0-1)
     */
    xToMaturity(x: number, mapWidth: number): string {
        return ((1 / mapWidth) * x).toFixed(2);
    }

    /**
     * Convert screen Y coordinate to visibility value (0-1)
     */
    yToVisibility(y: number, mapHeight: number): string {
        return (1 - (1 / mapHeight) * y).toFixed(2);
    }
}
