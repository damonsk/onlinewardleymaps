export default class PositionCalculator {
	visibilityToY(visibility, mapHeight) {
		return (1 - visibility) * mapHeight;
	}

	maturityToX(maturity, mapWidth) {
		return maturity * mapWidth;
	}

	xToMaturity(x, mapWidth) {
		return ((1 / mapWidth) * x).toFixed(2);
	}

	yToVisibility(y, mapHeight) {
		return (1 - (1 / mapHeight) * y).toFixed(2);
	}
}
