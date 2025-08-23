/**
 * SVG positioning utilities for cross-browser compatibility
 * Handles Safari-specific foreignObject positioning issues
 */

import { hasSafariSVGQuirks } from './browserDetection';

export interface SVGPosition {
    x: number;
    y: number;
}

export interface ForeignObjectPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface EditorDimensions {
    width: number;
    height: number;
}

/**
 * Get viewBox offset from the main SVG element
 */
function getViewBoxOffset(): SVGPosition {
    try {
        const svgElement = document.getElementById('svgMap');
        if (svgElement && svgElement instanceof SVGSVGElement) {
            const viewBox = svgElement.viewBox.baseVal;
            return {
                x: viewBox.x,
                y: viewBox.y,
            };
        }
    } catch (error) {
        console.warn('Could not get viewBox offset:', error);
    }

    // Fallback to known values from UnifiedMapCanvas
    return {
        x: -35,
        y: -45,
    };
}

/**
 * Convert SVG coordinates to screen coordinates for Safari compatibility
 */
function convertSVGToScreenCoordinates(svgPosition: SVGPosition): SVGPosition {
    try {
        const svgElement = document.getElementById('svgMap');
        if (svgElement && svgElement instanceof SVGSVGElement) {
            // Create an SVG point and transform it to screen coordinates
            const point = svgElement.createSVGPoint();
            point.x = svgPosition.x;
            point.y = svgPosition.y;

            // Get the transformation matrix from SVG to screen
            const screenCTM = svgElement.getScreenCTM();
            if (screenCTM) {
                const screenPoint = point.matrixTransform(screenCTM);

                // Get SVG element's bounding rect to convert back to SVG-relative coordinates
                const svgRect = svgElement.getBoundingClientRect();

                return {
                    x: screenPoint.x - svgRect.left,
                    y: screenPoint.y - svgRect.top,
                };
            }
        }
    } catch (error) {
        console.warn('Could not convert SVG to screen coordinates:', error);
    }

    // Fallback to original coordinates
    return svgPosition;
}

/**
 * Calculate foreignObject position with browser-specific adjustments
 */
export function calculateForeignObjectPosition(
    svgPosition: SVGPosition,
    editorDimensions: EditorDimensions,
    options: {
        offsetX?: number;
        offsetY?: number;
        centerHorizontally?: boolean;
        centerVertically?: boolean;
    } = {},
): ForeignObjectPosition {
    const {offsetX = 0, offsetY = 0, centerHorizontally = false, centerVertically = false} = options;

    let x = svgPosition.x + offsetX;
    let y = svgPosition.y + offsetY;

    // Apply centering adjustments
    if (centerHorizontally) {
        x -= editorDimensions.width / 2;
    }
    if (centerVertically) {
        y -= editorDimensions.height / 2;
    }

    // Apply Safari-specific adjustments - simplified approach
    if (hasSafariSVGQuirks()) {
        if (process.env.NODE_ENV === 'development') {
            console.log('[Safari Positioning] Using original coordinates without adjustments');
            console.log('[Safari Positioning] Position:', {x, y});
        }
        // For now, just use the calculated position without Safari-specific adjustments
        // This will help us understand if the issue is with our adjustments or fundamental positioning
    }

    return {
        x,
        y,
        width: editorDimensions.width,
        height: editorDimensions.height,
    };
}

/**
 * Get Safari-specific position adjustments
 * These values account for Safari's different handling of SVG viewBox and foreignObject positioning
 */
function getSafariPositionAdjustments(): SVGPosition {
    // Fine-tuning adjustments for Safari after coordinate conversion
    return {
        x: 0, // Horizontal adjustment
        y: 0, // Vertical adjustment
    };
}

/**
 * Calculate position for map title editor
 */
export function calculateTitleEditorPosition(
    titlePosition: SVGPosition,
    editorDimensions: EditorDimensions = {width: 300, height: 40},
): ForeignObjectPosition {
    return calculateForeignObjectPosition(titlePosition, editorDimensions, {
        offsetX: 0,
        offsetY: -35, // Position above the title text
        centerHorizontally: false,
        centerVertically: false,
    });
}

/**
 * Calculate position for component text editor
 */
export function calculateComponentEditorPosition(
    componentPosition: SVGPosition,
    labelOffset: SVGPosition = {x: 0, y: 0},
    editorDimensions: EditorDimensions = {width: 140, height: 120},
): ForeignObjectPosition {
    const adjustedPosition = {
        x: componentPosition.x + labelOffset.x,
        y: componentPosition.y + labelOffset.y,
    };

    return calculateForeignObjectPosition(adjustedPosition, editorDimensions, {
        offsetX: -60, // Center horizontally around the component
        offsetY: -30, // Position above the component
        centerHorizontally: false,
        centerVertically: false,
    });
}

/**
 * Ensure the editor position is within viewport bounds
 */
export function constrainToViewport(
    position: ForeignObjectPosition,
    viewportBounds?: {width: number; height: number},
): ForeignObjectPosition {
    if (!viewportBounds) {
        // Use window dimensions as fallback
        viewportBounds = {
            width: typeof window !== 'undefined' ? window.innerWidth : 1200,
            height: typeof window !== 'undefined' ? window.innerHeight : 800,
        };
    }

    const margin = 10; // Minimum margin from viewport edges

    return {
        x: Math.max(margin, Math.min(position.x, viewportBounds.width - position.width - margin)),
        y: Math.max(margin, Math.min(position.y, viewportBounds.height - position.height - margin)),
        width: position.width,
        height: position.height,
    };
}

/**
 * Debug function to log positioning information
 */
export function debugPosition(label: string, originalPosition: SVGPosition, calculatedPosition: ForeignObjectPosition): void {
    if (process.env.NODE_ENV === 'development') {
        const viewBoxOffset = getViewBoxOffset();
        console.log(`[SVG Positioning Debug] ${label}:`, {
            original: originalPosition,
            calculated: {
                x: calculatedPosition.x,
                y: calculatedPosition.y,
                width: calculatedPosition.width,
                height: calculatedPosition.height,
            },
            viewBoxOffset,
            isSafari: hasSafariSVGQuirks(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        });
    }
}
