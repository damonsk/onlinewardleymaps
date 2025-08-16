/**
 * MapComponentDeleter Service
 * Handles deletion of map components from mapText with support for different component types
 */

import {PSTElement} from '../types/map/pst';
import {UnifiedComponent} from '../types/unified/components';
import {findPSTElementLine, parsePSTSyntax} from '../utils/pstMapTextMutation';

/**
 * Interface for component deletion parameters
 */
export interface ComponentDeletionParams {
    mapText: string;
    componentId: string;
    componentType?: 'pst' | 'component' | 'market' | 'anchor' | 'note' | 'pipeline';
}

/**
 * Interface for component deletion result
 */
export interface ComponentDeletionResult {
    updatedMapText: string;
    deletedComponent: {
        id: string;
        type: string;
        line: number;
        originalText: string;
    };
}

/**
 * Interface for component identification result
 */
export interface ComponentIdentification {
    found: boolean;
    line: number;
    type: string;
    originalText: string;
}

/**
 * MapComponentDeleter service for removing components from map text
 */
export class MapComponentDeleter {
    /**
     * Deletes a component from map text
     */
    public deleteComponent(params: ComponentDeletionParams): ComponentDeletionResult {
        const {mapText, componentId, componentType} = params;

        if (!mapText || typeof mapText !== 'string') {
            throw new Error('Map text must be a non-empty string');
        }

        if (!componentId || typeof componentId !== 'string') {
            throw new Error('Component ID must be a non-empty string');
        }

        // Identify the component in the map text
        const identification = this.identifyComponent(mapText, componentId, componentType);

        if (!identification.found) {
            throw new Error(`Component with ID "${componentId}" not found in map text`);
        }

        // Validate that the component can be deleted
        if (!this.canDelete(componentId, identification.type)) {
            throw new Error(`Component "${componentId}" cannot be deleted`);
        }

        // Remove the component line from map text
        const updatedMapText = this.removeComponentLine(mapText, identification.line);

        return {
            updatedMapText,
            deletedComponent: {
                id: componentId,
                type: identification.type,
                line: identification.line,
                originalText: identification.originalText,
            },
        };
    }

    /**
     * Checks if a component can be deleted
     */
    public canDelete(componentId: string, componentType?: string): boolean {
        if (!componentId || typeof componentId !== 'string') {
            return false;
        }

        // For now, allow deletion of all component types
        // This can be extended with more sophisticated validation logic
        return true;
    }

    /**
     * Identifies a component in map text and returns its location and type
     */
    private identifyComponent(mapText: string, componentId: string, expectedType?: string): ComponentIdentification {
        const lines = mapText.split('\n');

        // Try PST component identification first if expected type is PST
        if (expectedType === 'pst') {
            const pstResult = this.identifyPSTComponent(mapText, componentId);
            if (pstResult.found) {
                return pstResult;
            }
        }

        // Try regular component identification
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const componentMatch = this.parseComponentLine(line, i);
            if (componentMatch && this.matchesComponentId(componentMatch, componentId)) {
                return {
                    found: true,
                    line: i,
                    type: componentMatch.type,
                    originalText: line,
                };
            }
        }

        return {
            found: false,
            line: -1,
            type: 'unknown',
            originalText: '',
        };
    }

    /**
     * Identifies PST components using existing PST utilities
     */
    private identifyPSTComponent(mapText: string, componentId: string): ComponentIdentification {
        const lines = mapText.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parsed = parsePSTSyntax(line);
            if (parsed.isValid && parsed.type) {
                // Generate PST component ID similar to how it's done in extractPSTElementsFromMapText
                const pstId = `pst-${parsed.type}-${i}`;
                if (pstId === componentId) {
                    return {
                        found: true,
                        line: i,
                        type: 'pst',
                        originalText: line,
                    };
                }
            }
        }

        return {
            found: false,
            line: -1,
            type: 'unknown',
            originalText: '',
        };
    }

    /**
     * Parses a component line to extract component information
     */
    private parseComponentLine(
        line: string,
        lineIndex: number,
    ): {
        type: string;
        name: string;
        id: string;
        coordinates?: {visibility: number; maturity: number};
    } | null {
        const trimmedLine = line.trim();

        // Component pattern: component Name [visibility, maturity] optional_decorators
        const componentPattern = /^(component|anchor|market|ecosystem|note|pipeline)\s+([^[]+)\s*\[([0-9.]+)\s*,\s*([0-9.]+)\]/i;
        const match = trimmedLine.match(componentPattern);

        if (match) {
            const [, type, name, visibility, maturity] = match;
            return {
                type: type.toLowerCase(),
                name: name.trim(),
                id: this.generateComponentId(type.toLowerCase(), name.trim(), lineIndex),
                coordinates: {
                    visibility: parseFloat(visibility),
                    maturity: parseFloat(maturity),
                },
            };
        }

        return null;
    }

    /**
     * Generates a component ID based on type, name, and line index
     */
    private generateComponentId(type: string, name: string, lineIndex: number): string {
        // This should match the ID generation logic used elsewhere in the application
        // For now, using a simple pattern that combines type, name, and line
        const safeName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        return `${type}-${safeName}-${lineIndex}`;
    }

    /**
     * Checks if a parsed component matches the given component ID
     */
    private matchesComponentId(component: {type: string; name: string; id: string}, targetId: string): boolean {
        // Try exact ID match first
        if (component.id === targetId) {
            return true;
        }

        // Try name-based matching as fallback
        const nameBasedId = component.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        if (targetId.includes(nameBasedId)) {
            return true;
        }

        return false;
    }

    /**
     * Removes a component line from map text
     */
    private removeComponentLine(mapText: string, lineIndex: number): string {
        if (lineIndex < 0) {
            throw new Error('Invalid line index for component deletion');
        }

        const lines = mapText.split('\n');

        if (lineIndex >= lines.length) {
            throw new Error('Line index exceeds map text length');
        }

        // Remove the line at the specified index
        lines.splice(lineIndex, 1);

        // Return the updated map text
        return lines.join('\n');
    }

    /**
     * Deletes a PST component using existing PST utilities
     */
    public deletePSTComponent(mapText: string, pstElement: PSTElement): string {
        const lineIndex = findPSTElementLine(mapText, pstElement);

        if (lineIndex === -1) {
            throw new Error('PST element not found in map text');
        }

        return this.removeComponentLine(mapText, lineIndex);
    }

    /**
     * Validates component deletion parameters
     */
    public validateDeletionParams(params: ComponentDeletionParams): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (!params.mapText || typeof params.mapText !== 'string') {
            errors.push('Map text must be a non-empty string');
        }

        if (!params.componentId || typeof params.componentId !== 'string') {
            errors.push('Component ID must be a non-empty string');
        }

        if (params.componentType && !['pst', 'component', 'market', 'anchor', 'note', 'pipeline'].includes(params.componentType)) {
            errors.push('Invalid component type specified');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

/**
 * Default instance of MapComponentDeleter for use throughout the application
 */
export const mapComponentDeleter = new MapComponentDeleter();
