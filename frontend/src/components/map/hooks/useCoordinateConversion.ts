import {useCallback, useMemo} from 'react';
import {MapDimensions} from '../../../constants/defaults';
import PositionCalculator from '../PositionCalculator';

interface CoordinateConversionResult {
    svgX: number;
    svgY: number;
    maturity: string;
    visibility: string;
    isFallback: boolean;
}

interface UseCoordinateConversionProps {
    mapDimensions: MapDimensions;
    panZoomValue: any;
}

export function useCoordinateConversion({mapDimensions, panZoomValue}: UseCoordinateConversionProps) {
    const positionCalculator = useMemo(() => new PositionCalculator(), []);

    const convertScreenToMapCoordinates = useCallback(
        (screenX: number, screenY: number): CoordinateConversionResult | null => {
            try {
                if (typeof screenX !== 'number' || typeof screenY !== 'number' || isNaN(screenX) || isNaN(screenY)) {
                    console.warn('Invalid screen coordinates provided:', {screenX, screenY});
                    return null;
                }

                const svgElement = document.getElementById('svgMap');
                if (!svgElement) {
                    console.warn('SVG element not found for coordinate conversion');
                    return createFallbackCoordinates();
                }

                const svgRect = svgElement.getBoundingClientRect();
                if (svgRect.width === 0 || svgRect.height === 0) {
                    console.warn('SVG element has invalid dimensions:', svgRect);
                    return null;
                }

                const relativeX = screenX - svgRect.left;
                const relativeY = screenY - svgRect.top;

                if (relativeX < 0 || relativeX > svgRect.width || relativeY < 0 || relativeY > svgRect.height) {
                    return null;
                }

                const transform = panZoomValue;
                if (transform.a === 0 || transform.d === 0) {
                    console.warn('Invalid transform scale factors:', transform);
                    return null;
                }

                const svgX = (relativeX - transform.e) / transform.a;
                const svgY = (relativeY - transform.f) / transform.d;
                const adjustedX = svgX + 35;
                const adjustedY = svgY + 45;

                if (
                    adjustedX < -100 ||
                    adjustedX > mapDimensions.width + 100 ||
                    adjustedY < -100 ||
                    adjustedY > mapDimensions.height + 100
                ) {
                    return null;
                }

                const maturity = calculateMaturity(adjustedX);
                const visibility = calculateVisibility(adjustedY);

                return {
                    svgX: adjustedX,
                    svgY: adjustedY,
                    maturity: maturity.toFixed(2),
                    visibility: visibility.toFixed(2),
                    isFallback: false,
                };
            } catch (error) {
                console.error('Error converting screen coordinates to map coordinates:', error);
                return createFallbackCoordinates();
            }
        },
        [mapDimensions.width, mapDimensions.height, positionCalculator, panZoomValue],
    );

    const convertSvgToMapCoordinates = useCallback(
        (svgX: number, svgY: number, offsetCorrection = {x: 0, y: 0}) => {
            const adjustedX = svgX + 35 + offsetCorrection.x;
            const adjustedY = svgY + 45 + offsetCorrection.y;

            const maturity = calculateMaturity(adjustedX);
            const visibility = calculateVisibility(adjustedY);

            return {
                x: Math.max(0, Math.min(1, maturity)),
                y: Math.max(0, Math.min(1, visibility)),
            };
        },
        [mapDimensions.width, mapDimensions.height, positionCalculator],
    );

    const calculateMaturity = useCallback(
        (adjustedX: number) => {
            try {
                return parseFloat(positionCalculator.xToMaturity(adjustedX, mapDimensions.width));
            } catch (calcError) {
                console.error('Error in maturity calculation:', calcError);
                return Math.max(0, Math.min(1, adjustedX / mapDimensions.width));
            }
        },
        [positionCalculator, mapDimensions.width],
    );

    const calculateVisibility = useCallback(
        (adjustedY: number) => {
            try {
                return parseFloat(positionCalculator.yToVisibility(adjustedY, mapDimensions.height));
            } catch (calcError) {
                console.error('Error in visibility calculation:', calcError);
                return Math.max(0, Math.min(1, 1 - adjustedY / mapDimensions.height));
            }
        },
        [positionCalculator, mapDimensions.height],
    );

    const createFallbackCoordinates = useCallback((): CoordinateConversionResult => {
        const fallbackMaturity = 0.5 + (Math.random() - 0.5) * 0.2;
        const fallbackVisibility = 0.5 + (Math.random() - 0.5) * 0.2;

        return {
            svgX: mapDimensions.width * fallbackMaturity,
            svgY: mapDimensions.height * (1 - fallbackVisibility),
            maturity: fallbackMaturity.toFixed(2),
            visibility: fallbackVisibility.toFixed(2),
            isFallback: true,
        };
    }, [mapDimensions.width, mapDimensions.height]);

    const isValidDropZone = useCallback(
        (svgX: number, svgY: number) => {
            try {
                if (typeof svgX !== 'number' || typeof svgY !== 'number' || isNaN(svgX) || isNaN(svgY)) {
                    return false;
                }

                const adjustedX = svgX + 35;
                const adjustedY = svgY + 45;

                return adjustedX >= 0 && adjustedX <= mapDimensions.width && adjustedY >= 0 && adjustedY <= mapDimensions.height;
            } catch (error) {
                console.error('Error validating drop zone:', error);
                return false;
            }
        },
        [mapDimensions.width, mapDimensions.height],
    );

    return {
        convertScreenToMapCoordinates,
        convertSvgToMapCoordinates,
        isValidDropZone,
    };
}
