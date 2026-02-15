/**
 * Utility functions for converting attitude data to PST elements
 * and managing PST element operations
 */

import {PSTElement, PSTType, PSTCoordinates} from '../types/map/pst';
import {updatePSTElementInMapText} from './pstMapTextMutation';

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
    return updatePSTElementInMapText({
        mapText,
        pstElement,
        newCoordinates,
    });
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
