export default class PositionCalculator {
    visibilityToY(visibility: number, mapHeight: number): number {
        return (1 - visibility) * mapHeight;
    }

    maturityToX(maturity: number, mapWidth: number): number {
        return maturity * mapWidth;
    }

    xToMaturity(x: number, mapWidth: number): string {
        return ((1 / mapWidth) * x).toFixed(2);
    }

    yToVisibility(y: number, mapHeight: number): string {
        return (1 - (1 / mapHeight) * y).toFixed(2);
    }
}
