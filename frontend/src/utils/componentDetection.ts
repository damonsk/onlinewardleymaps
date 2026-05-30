import {UnifiedComponent} from '../types/unified/components';
import {componentNamesMatch, escapeComponentNameForMapText} from './componentNameMatching';

/**
 * Calculate the distance between two points
 */
export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Find the nearest component to a given position
 * Used for magnetic linking effects
 */
export const findNearestComponent = (
    mousePosition: {x: number; y: number},
    components: UnifiedComponent[],
    maxDistance: number = 0.1, // Maximum distance in map coordinates (0-1 scale)
): UnifiedComponent | null => {
    if (!components || components.length === 0) {
        return null;
    }

    let nearestComponent: UnifiedComponent | null = null;
    let minDistance = Infinity;

    for (const component of components) {
        // Skip components without valid coordinates
        if (typeof component.maturity !== 'number' || typeof component.visibility !== 'number') {
            continue;
        }

        const distance = calculateDistance(mousePosition.x, mousePosition.y, component.maturity, component.visibility);

        if (distance < minDistance && distance <= maxDistance) {
            minDistance = distance;
            nearestComponent = component;
        }
    }

    return nearestComponent;
};

/**
 * Find the nearest component to a given position with improved coordinate handling
 * This version accounts for the coordinate transformation used in visual positioning
 */
export const findNearestComponentWithTransform = (
    mousePosition: {x: number; y: number},
    components: UnifiedComponent[],
    mapDimensions: {width: number; height: number},
    maxDistance: number = 0.05, // Reduced default distance for more precision
): UnifiedComponent | null => {
    if (!components || components.length === 0) {
        return null;
    }

    let nearestComponent: UnifiedComponent | null = null;
    let minDistance = Infinity;

    for (const component of components) {
        // Skip components without valid coordinates
        if (typeof component.maturity !== 'number' || typeof component.visibility !== 'number') {
            continue;
        }

        // Calculate distance in normalized coordinates (0-1 scale)
        // This matches how the visual positioning works
        const distance = calculateDistance(mousePosition.x, mousePosition.y, component.maturity, component.visibility);

        if (distance < minDistance && distance <= maxDistance) {
            minDistance = distance;
            nearestComponent = component;
        }
    }

    return nearestComponent;
};

/**
 * Check if a link already exists between two components
 */
export const linkExists = (
    sourceComponent: UnifiedComponent,
    targetComponent: UnifiedComponent,
    existingLinks: Array<{start: string; end: string}>,
): boolean => {
    return existingLinks.some(
        link =>
            (componentNamesMatch(link.start, sourceComponent.name) && componentNamesMatch(link.end, targetComponent.name)) ||
            (componentNamesMatch(link.start, targetComponent.name) && componentNamesMatch(link.end, sourceComponent.name)),
    );
};

/**
 * Generate link syntax for map text
 */
export const generateLinkSyntax = (sourceComponent: UnifiedComponent, targetComponent: UnifiedComponent): string => {
    const escapedSource = escapeComponentNameForMapText(sourceComponent.name);
    const escapedTarget = escapeComponentNameForMapText(targetComponent.name);
    return `${escapedSource}->${escapedTarget}`;
};

/**
 * Add a link to the map text
 */
export const addLinkToMapText = (mapText: string, sourceComponent: UnifiedComponent, targetComponent: UnifiedComponent): string => {
    const linkSyntax = generateLinkSyntax(sourceComponent, targetComponent);

    const lines = mapText.split('\n');
    const insertIndex = findTopLevelLinkInsertIndex(lines);

    // Insert the link at the appropriate position
    lines.splice(insertIndex, 0, linkSyntax);

    return lines.join('\n');
};

const countOccurrences = (value: string, pattern: string): number => {
    return (value.match(new RegExp(`\\${pattern}`, 'g')) || []).length;
};

const findTopLevelLinkInsertIndex = (lines: string[]): number => {
    let insertIndex = lines.length;
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const openingBraces = countOccurrences(line, '{');
        const closingBraces = countOccurrences(line, '}');
        const closesTopLevelBlock = braceDepth > 0 && braceDepth - closingBraces <= 0;

        if (
            braceDepth === 0 &&
            (line.startsWith('component ') || line.startsWith('anchor ') || line.startsWith('note ') || line.startsWith('pipeline '))
        ) {
            insertIndex = i + 1;
        } else if (closesTopLevelBlock) {
            insertIndex = i + 1;
        }

        braceDepth += openingBraces;
        braceDepth -= closingBraces;
        braceDepth = Math.max(0, braceDepth);
    }

    return insertIndex;
};
