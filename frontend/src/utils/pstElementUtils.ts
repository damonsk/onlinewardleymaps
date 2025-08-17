/**
 * Utility functions for converting attitude data to PST elements
 * and managing PST element operations
 */

import {PSTElement, PSTType, PSTCoordinates} from '../types/map/pst';

/**
 * Convert attitude data structure to PST element
 */
export function convertAttitudeToPSTElement(attitude: any): PSTElement | null {
    // Check if this is a PST attitude type
    const pstTypes: PSTType[] = ['pioneers', 'settlers', 'townplanners'];
    if (!pstTypes.includes(attitude.attitude)) {
        return null;
    }

    // Generate simple numeric ID like regular components
    const id = String(attitude.line);

    // Convert attitude coordinates to PST coordinates
    const coordinates: PSTCoordinates = {
        maturity1: attitude.maturity,
        visibility1: attitude.visibility,
        maturity2: attitude.maturity2,
        visibility2: attitude.visibility2,
    };

    return {
        id,
        type: attitude.attitude as PSTType,
        coordinates,
        line: attitude.line,
        name: attitude.name || undefined,
    };
}

/**
 * Extract PST elements from attitudes array
 */
export function extractPSTElementsFromAttitudes(attitudes: any[]): PSTElement[] {
    if (!Array.isArray(attitudes)) {
        return [];
    }

    return attitudes.map(convertAttitudeToPSTElement).filter((element): element is PSTElement => element !== null);
}

/**
 * Update map text with new PST coordinates after resize
 */
export function updatePSTInMapText(mapText: string, pstElement: PSTElement, newCoordinates: PSTCoordinates): string {
    // Use our working implementation from pstMapTextMutation
    try {
        // Import the working function
        const {updatePSTElementInMapText} = require('./pstMapTextMutation');

        return updatePSTElementInMapText({
            mapText,
            pstElement,
            newCoordinates,
        });
    } catch (error) {
        console.error('Error using pstMapTextMutation, falling back to legacy implementation:', error);

        // Fallback to legacy implementation with fixes
        const lines = mapText.split('\n');

        // Use 0-based line indexing (our working implementation uses 0-based)
        const lineIndex = pstElement.line;

        if (lineIndex < 0 || lineIndex >= lines.length) {
            console.warn(`Invalid line number ${lineIndex} for PST element ${pstElement.id}`);
            return mapText;
        }

        const currentLine = lines[lineIndex];

        // Create the new PST syntax with updated coordinates (using consistent precision)
        const formatCoordinate = (coord: number) => coord.toFixed(2);
        let newPSTSyntax = `${pstElement.type} [${formatCoordinate(newCoordinates.visibility1)}, ${formatCoordinate(newCoordinates.maturity1)}, ${formatCoordinate(newCoordinates.visibility2)}, ${formatCoordinate(newCoordinates.maturity2)}]`;

        // Add name if it exists
        if (pstElement.name) {
            newPSTSyntax += ` ${pstElement.name}`;
        }

        // Replace the PST coordinates in the line using a more robust pattern
        const pstPattern = new RegExp(
            `${pstElement.type}\\s*\\[\\s*[+-]?\\d*\\.?\\d+\\s*,\\s*[+-]?\\d*\\.?\\d+\\s*,\\s*[+-]?\\d*\\.?\\d+\\s*,\\s*[+-]?\\d*\\.?\\d+\\s*\\](?:\\s+.+)?`,
        );

        const updatedLine = currentLine.replace(pstPattern, newPSTSyntax);

        // Update the line in the array
        lines[lineIndex] = updatedLine;

        return lines.join('\n');
    }
}

/**
 * Find PST element by ID in a list
 */
export function findPSTElementById(elements: PSTElement[], id: string): PSTElement | null {
    return elements.find(element => element.id === id) || null;
}

/**
 * Check if two PST elements are the same
 */
export function isPSTElementEqual(element1: PSTElement, element2: PSTElement): boolean {
    return element1.id === element2.id && element1.line === element2.line;
}
