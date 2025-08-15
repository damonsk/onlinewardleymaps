/**
 * PST Map Text Mutation Utilities
 * Handles updating map text when PST elements are resized
 */

import {PSTElement, PSTCoordinates, PSTType} from '../types/map/pst';
import {formatCoordinate} from './mapTextGeneration';

/**
 * Interface for PST map text update parameters
 */
export interface PSTMapTextUpdateParams {
    mapText: string;
    pstElement: PSTElement;
    newCoordinates: PSTCoordinates;
}

/**
 * Interface for PST syntax validation result
 */
export interface PSTSyntaxValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Generates PST syntax string from coordinates
 */
export function generatePSTSyntax(type: PSTType, coordinates: PSTCoordinates, name?: string): string {
    const {maturity1, visibility1, maturity2, visibility2} = coordinates;

    // Format coordinates with consistent precision
    const y1 = formatCoordinate(visibility1);
    const x1 = formatCoordinate(maturity1);
    const y2 = formatCoordinate(visibility2);
    const x2 = formatCoordinate(maturity2);

    // Generate syntax based on type
    const baseText = `${type} [${y1}, ${x1}, ${y2}, ${x2}]`;

    // Add name if provided
    if (name && name.trim()) {
        return `${baseText} ${name.trim()}`;
    }

    return baseText;
}

/**
 * Parses PST syntax line to extract coordinates and metadata
 */
export function parsePSTSyntax(line: string): {
    type: PSTType | null;
    coordinates: PSTCoordinates | null;
    name: string | null;
    isValid: boolean;
} {
    const trimmedLine = line.trim();

    // PST syntax pattern: type [y1, x1, y2, x2] optional_name
    const pstPattern =
        /^(pioneers|settlers|townplanners)\s*\[\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\](?:\s+(.+))?$/i;

    const match = trimmedLine.match(pstPattern);

    if (!match) {
        return {
            type: null,
            coordinates: null,
            name: null,
            isValid: false,
        };
    }

    const [, type, y1Str, x1Str, y2Str, x2Str, name] = match;

    // Parse coordinates
    const y1 = parseFloat(y1Str);
    const x1 = parseFloat(x1Str);
    const y2 = parseFloat(y2Str);
    const x2 = parseFloat(x2Str);

    // Validate coordinate values
    if ([y1, x1, y2, x2].some(coord => isNaN(coord) || coord < 0 || coord > 1)) {
        return {
            type: type.toLowerCase() as PSTType,
            coordinates: null,
            name: name?.trim() || null,
            isValid: false,
        };
    }

    return {
        type: type.toLowerCase() as PSTType,
        coordinates: {
            maturity1: x1,
            visibility1: y1,
            maturity2: x2,
            visibility2: y2,
        },
        name: name?.trim() || null,
        isValid: true,
    };
}

/**
 * Validates PST syntax for correctness
 */
export function validatePSTSyntax(syntax: string): PSTSyntaxValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!syntax || typeof syntax !== 'string') {
        errors.push('PST syntax must be a non-empty string');
        return {isValid: false, errors, warnings};
    }

    const parsed = parsePSTSyntax(syntax);

    if (!parsed.isValid) {
        errors.push('Invalid PST syntax format');
        return {isValid: false, errors, warnings};
    }

    if (!parsed.coordinates) {
        errors.push('Invalid coordinates in PST syntax');
        return {isValid: false, errors, warnings};
    }

    const {maturity1, visibility1, maturity2, visibility2} = parsed.coordinates;

    // Check for inverted coordinates
    if (maturity2 <= maturity1) {
        errors.push('Right maturity must be greater than left maturity');
    }

    if (visibility1 <= visibility2) {
        errors.push('Top visibility must be greater than bottom visibility');
    }

    // Check for very small dimensions
    const width = maturity2 - maturity1;
    const height = visibility1 - visibility2;

    if (width < 0.01) {
        warnings.push('PST box width is very small (less than 1% of map width)');
    }

    if (height < 0.01) {
        warnings.push('PST box height is very small (less than 1% of map height)');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Finds PST element line in map text
 */
export function findPSTElementLine(mapText: string, pstElement: PSTElement): number {
    if (!mapText || !pstElement) {
        return -1;
    }

    const lines = mapText.split('\n');

    // First try to find by line number if available
    if (pstElement.line >= 0 && pstElement.line < lines.length) {
        const lineContent = lines[pstElement.line];
        const parsed = parsePSTSyntax(lineContent);

        if (parsed.isValid && parsed.type === pstElement.type) {
            return pstElement.line;
        }
    }

    // Fallback: search for matching PST element
    for (let i = 0; i < lines.length; i++) {
        const parsed = parsePSTSyntax(lines[i]);

        if (
            parsed.isValid &&
            parsed.type === pstElement.type &&
            parsed.coordinates &&
            coordinatesMatch(parsed.coordinates, pstElement.coordinates, 0.001)
        ) {
            return i;
        }
    }

    return -1;
}

/**
 * Checks if two coordinate sets match within tolerance
 */
function coordinatesMatch(coords1: PSTCoordinates, coords2: PSTCoordinates, tolerance: number = 0.001): boolean {
    return (
        Math.abs(coords1.maturity1 - coords2.maturity1) < tolerance &&
        Math.abs(coords1.visibility1 - coords2.visibility1) < tolerance &&
        Math.abs(coords1.maturity2 - coords2.maturity2) < tolerance &&
        Math.abs(coords1.visibility2 - coords2.visibility2) < tolerance
    );
}

/**
 * Updates PST element coordinates in map text
 */
export function updatePSTElementInMapText(params: PSTMapTextUpdateParams): string {
    const {mapText, pstElement, newCoordinates} = params;

    if (!mapText || typeof mapText !== 'string') {
        throw new Error('Map text must be a non-empty string');
    }

    if (!pstElement) {
        throw new Error('PST element is required');
    }

    if (!newCoordinates) {
        throw new Error('New coordinates are required');
    }

    // Validate new coordinates
    const newSyntax = generatePSTSyntax(pstElement.type, newCoordinates, pstElement.name);
    const validation = validatePSTSyntax(newSyntax);

    if (!validation.isValid) {
        throw new Error(`Invalid PST coordinates: ${validation.errors.join(', ')}`);
    }

    // Find the line to update
    const lineIndex = findPSTElementLine(mapText, pstElement);

    if (lineIndex === -1) {
        throw new Error('PST element not found in map text');
    }

    // Split map text into lines
    const lines = mapText.split('\n');

    // Replace the specific line with updated syntax
    lines[lineIndex] = newSyntax;

    // Rejoin lines and return
    return lines.join('\n');
}

/**
 * Batch update multiple PST elements in map text
 */
export function batchUpdatePSTElements(mapText: string, updates: Array<{element: PSTElement; newCoordinates: PSTCoordinates}>): string {
    if (typeof mapText !== 'string') {
        throw new Error('Map text must be a string');
    }

    if (!Array.isArray(updates) || updates.length === 0) {
        return mapText;
    }

    // Handle empty map text
    if (!mapText.trim()) {
        return mapText;
    }

    let updatedMapText = mapText;

    // Process updates in reverse line order to maintain line indices
    const sortedUpdates = updates
        .map(update => ({
            ...update,
            lineIndex: findPSTElementLine(updatedMapText, update.element),
        }))
        .filter(update => update.lineIndex !== -1)
        .sort((a, b) => b.lineIndex - a.lineIndex);

    // Apply updates
    for (const update of sortedUpdates) {
        try {
            updatedMapText = updatePSTElementInMapText({
                mapText: updatedMapText,
                pstElement: update.element,
                newCoordinates: update.newCoordinates,
            });
        } catch (error) {
            console.error(`Failed to update PST element ${update.element.id}:`, error);
            // Continue with other updates
        }
    }

    return updatedMapText;
}

/**
 * Validates entire map text for PST syntax errors
 */
export function validateMapTextPSTSyntax(mapText: string): {
    isValid: boolean;
    errors: Array<{line: number; error: string}>;
    warnings: Array<{line: number; warning: string}>;
} {
    const errors: Array<{line: number; error: string}> = [];
    const warnings: Array<{line: number; warning: string}> = [];

    if (!mapText || typeof mapText !== 'string') {
        return {isValid: true, errors, warnings};
    }

    const lines = mapText.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines and non-PST lines
        if (!line || !line.match(/^(pioneers|settlers|townplanners)/i)) {
            continue;
        }

        const validation = validatePSTSyntax(line);

        if (!validation.isValid) {
            validation.errors.forEach(error => {
                errors.push({line: i, error});
            });
        }

        validation.warnings.forEach(warning => {
            warnings.push({line: i, warning});
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Extracts all PST elements from map text
 */
export function extractPSTElementsFromMapText(mapText: string): PSTElement[] {
    if (!mapText || typeof mapText !== 'string') {
        return [];
    }

    const elements: PSTElement[] = [];
    const lines = mapText.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) continue;

        const parsed = parsePSTSyntax(line);

        if (parsed.isValid && parsed.type && parsed.coordinates) {
            elements.push({
                id: `pst-${parsed.type}-${i}`,
                type: parsed.type,
                coordinates: parsed.coordinates,
                line: i,
                name: parsed.name || undefined,
            });
        }
    }

    return elements;
}
