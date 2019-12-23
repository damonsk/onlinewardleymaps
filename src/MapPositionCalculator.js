export default class MapPositionCalculator {

    visibilityToY (visibility, mapHeight) {
        return (1 - visibility) * mapHeight;
    }
    
    maturityToX (maturity, mapWidth) {
        return maturity * mapWidth;
    }
}