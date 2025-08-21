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

    // Find the best place to insert the link
    // Links should typically go after component definitions
    const lines = mapText.split('\n');
    let insertIndex = lines.length;

    // Find the last component definition line
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('component ') || line.startsWith('anchor ') || line.startsWith('note ') || line.startsWith('pipeline ')) {
            insertIndex = i + 1;
            break;
        }
    }

    // Insert the link at the appropriate position
    lines.splice(insertIndex, 0, linkSyntax);

    return lines.join('\n');
};
