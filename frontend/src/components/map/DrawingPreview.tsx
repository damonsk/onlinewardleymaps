import React, {memo} from 'react';
import {MapTheme} from '../../types/map/styles';
import {ToolbarSubItem} from '../../types/toolbar';
import PositionCalculator from './PositionCalculator';

/**
 * Props interface for the DrawingPreview component
 */
export interface DrawingPreviewProps {
    isDrawing: boolean;
    startPosition: {x: number; y: number} | null;
    currentPosition: {x: number; y: number};
    selectedPSTType: ToolbarSubItem | null;
    mapStyleDefs: MapTheme;
    mapDimensions: {width: number; height: number};
}

/**
 * Helper function to convert map coordinates (0-1) back to SVG coordinates
 * This exactly reverses the transformation done in UnifiedMapCanvas:
 * 1. Convert map coordinates back to adjusted coordinates using PositionCalculator
 * 2. Remove the SVG viewBox offset (-35, -45) to get raw SVG coordinates
 */
const mapToSVGCoordinates = (mapCoord: {x: number; y: number}, mapDimensions: {width: number; height: number}) => {
    const positionCalculator = new PositionCalculator();

    // Step 1: Convert map coordinates (0-1) back to adjusted coordinates
    const adjustedX = positionCalculator.maturityToX(mapCoord.x, mapDimensions.width);
    const adjustedY = positionCalculator.visibilityToY(mapCoord.y, mapDimensions.height);

    // Step 2: Remove the SVG viewBox offset to get raw SVG coordinates
    // In UnifiedMapCanvas: adjustedX = svgX + 35, adjustedY = svgY + 45
    // So: svgX = adjustedX - 35, svgY = adjustedY - 45
    const svgX = adjustedX - 35;
    const svgY = adjustedY - 45;

    return {x: svgX, y: svgY};
};

/**
 * Helper function to calculate rectangle dimensions and position from map coordinates
 */
const calculateRectangle = (
    start: {x: number; y: number},
    current: {x: number; y: number},
    mapDimensions: {width: number; height: number},
) => {
    // Convert map coordinates back to SVG coordinates
    const startSVG = mapToSVGCoordinates(start, mapDimensions);
    const currentSVG = mapToSVGCoordinates(current, mapDimensions);

    const x = Math.min(startSVG.x, currentSVG.x);
    const y = Math.min(startSVG.y, currentSVG.y);
    const width = Math.abs(currentSVG.x - startSVG.x);
    const height = Math.abs(currentSVG.y - startSVG.y);

    return {x, y, width, height};
};

/**
 * DrawingPreview component for PST box drawing functionality
 * Shows a real-time preview rectangle during click-and-drag operations
 * with distinct color coding for each PST type
 * Now positioned inside the SVG to work correctly with pan/zoom transformations
 */
export const DrawingPreview: React.FC<DrawingPreviewProps> = memo(
    ({isDrawing, startPosition, currentPosition, selectedPSTType, mapStyleDefs, mapDimensions}) => {
        // Don't render if not drawing or missing required data
        if (!isDrawing || !startPosition || !selectedPSTType) {
            return null;
        }

        // Calculate rectangle dimensions using map coordinates
        const rect = calculateRectangle(startPosition, currentPosition, mapDimensions);

        // Don't render if rectangle is too small (minimum 10px in either dimension)
        if (rect.width < 10 || rect.height < 10) {
            return null;
        }

        // Calculate label position (center of rectangle)
        const labelX = rect.x + rect.width / 2;
        const labelY = rect.y + rect.height / 2;

        return (
            <g data-testid="drawing-preview" role="img" aria-label={`Drawing ${selectedPSTType.label} box`}>
                <rect
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    fill={`${selectedPSTType.color}20`} // 20% opacity
                    stroke={selectedPSTType.color}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    rx="4"
                    ry="4"
                    data-testid="preview-rectangle"
                    style={{
                        animation: 'drawingPulse 1.5s ease-in-out infinite',
                    }}
                />
                <text
                    x={labelX}
                    y={labelY}
                    fill={selectedPSTType.color}
                    fontSize="14"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                    opacity="0.9"
                    data-testid="drawing-label">
                    {selectedPSTType.label}
                </text>
                <style>{`
                    @keyframes drawingPulse {
                        0%, 100% {
                            stroke-opacity: 0.8;
                            fill-opacity: 0.1;
                        }
                        50% {
                            stroke-opacity: 1;
                            fill-opacity: 0.2;
                        }
                    }
                `}</style>
            </g>
        );
    },
);

DrawingPreview.displayName = 'DrawingPreview';

export default DrawingPreview;
