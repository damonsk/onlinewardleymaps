import {PSTElement} from '../types/map/pst';
import {findPSTElementLine, parsePSTSyntax} from '../utils/pstMapTextMutation';

export interface ComponentDeletionParams {
    mapText: string;
    componentId: string | number;
    componentType?: 'pst' | 'component' | 'market' | 'anchor' | 'note' | 'pipeline';
}

export interface ComponentDeletionResult {
    updatedMapText: string;
    deletedComponent: {
        id: string;
        type: string;
        line: number;
        originalText: string;
    };
}

export interface ComponentIdentification {
    found: boolean;
    line: number;
    type: string;
    originalText: string;
    name: string;
}

export class MapComponentDeleter {
    public deleteComponent(params: ComponentDeletionParams): ComponentDeletionResult {
        const {mapText, componentId, componentType} = params;

        if (!mapText || typeof mapText !== 'string') {
            throw new Error('Map text must be a non-empty string');
        }

        let componentIdStr: string;

        if (typeof componentId === 'number') {
            if (isNaN(componentId) || componentId < 0) {
                throw new Error('Component ID must be a non-negative number');
            }
            componentIdStr = String(componentId);
        } else if (typeof componentId === 'string') {
            if (!componentId || componentId.trim() === '') {
                throw new Error('Component ID must be a non-empty string');
            }
            componentIdStr = componentId;
        } else {
            throw new Error('Component ID must be a string or number');
        }

        // Identify the component in the map text
        const identification = this.identifyComponent(mapText, componentIdStr, componentType);
        console.log('identification', identification);
        if (!identification.found) {
            throw new Error(`Component with ID "${componentId}" not found in map text`);
        }

        let updatedMapText = this.removeComponentLine(mapText, identification.line);
        updatedMapText = this.removeComponentLinks(updatedMapText, identification.name);

        return {
            updatedMapText,
            deletedComponent: {
                id: componentIdStr,
                type: identification.type,
                line: identification.line,
                originalText: identification.originalText,
            },
        };
    }

    private identifyComponent(mapText: string, componentId: string, _expectedType?: string): ComponentIdentification {
        const lines = mapText.split('\n');
        const numericId = parseInt(componentId, 10);
        if (!isNaN(numericId) && numericId >= 0) {
            const lineIndicesToTry = [numericId - 1];
            for (const lineIndex of lineIndicesToTry) {
                if (lineIndex >= 0 && lineIndex < lines.length) {
                    const line = lines[lineIndex].trim();
                    if (line) {
                        const pstParsed = parsePSTSyntax(line);
                        if (pstParsed.isValid && pstParsed.type) {
                            return {
                                found: true,
                                line: lineIndex,
                                type: 'pst',
                                originalText: line,
                                name: '',
                            };
                        }

                        const componentMatch = this.parseComponentLine(line, lineIndex);
                        if (componentMatch) {
                            return {
                                found: true,
                                line: lineIndex,
                                type: componentMatch.type,
                                originalText: line,
                                name: componentMatch.name,
                            };
                        }
                    }
                }
            }
        }

        // Try regular component identification by generated ID and name matching
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
                    name: componentMatch.name,
                };
            }
        }

        return {
            found: false,
            line: -1,
            type: 'unknown',
            originalText: '',
            name: '',
        };
    }

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

    private removeComponentLinks(mapText: string, removedComponent: string): string {
        const lines = mapText.split('\n');
        let okLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim().indexOf(removedComponent.trim() + '->') == -1 && line.trim().indexOf('->' + removedComponent.trim()) == -1) {
                okLines.push(line);
            }
        }
        return okLines.join('\n');
    }

    private removeComponentLine(mapText: string, lineIndex: number): string {
        if (lineIndex < 0) {
            throw new Error('Invalid line index for component deletion');
        }
        const lines = mapText.split('\n');
        if (lineIndex >= lines.length) {
            throw new Error('Line index exceeds map text length');
        }
        lines.splice(lineIndex, 1);
        return lines.join('\n');
    }

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
        console.log('MapComponentDeleter: validateDeletionParams called with:', params);
        const errors: string[] = [];

        if (!params.mapText || typeof params.mapText !== 'string') {
            console.log('MapComponentDeleter: validation failed - invalid mapText');
            errors.push('Map text must be a non-empty string');
        }

        // Validate componentId - handle both string and number types
        if (typeof params.componentId === 'number') {
            if (isNaN(params.componentId) || params.componentId < 0) {
                console.log('MapComponentDeleter: validation failed - invalid numeric componentId:', {
                    componentId: params.componentId,
                    type: typeof params.componentId,
                    isNaN: isNaN(params.componentId),
                    isNonNegative: params.componentId >= 0,
                });
                errors.push('Component ID must be a non-negative number');
            }
        } else if (typeof params.componentId === 'string') {
            if (!params.componentId || params.componentId.trim() === '') {
                console.log('MapComponentDeleter: validation failed - invalid string componentId:', {
                    componentId: params.componentId,
                    type: typeof params.componentId,
                    truthy: !!params.componentId,
                });
                errors.push('Component ID must be a non-empty string');
            }
        } else {
            console.log('MapComponentDeleter: validation failed - componentId is neither string nor number:', {
                componentId: params.componentId,
                type: typeof params.componentId,
            });
            errors.push('Component ID must be a string or number');
        }

        if (params.componentType && !['pst', 'component', 'market', 'anchor', 'note', 'pipeline'].includes(params.componentType)) {
            console.log('MapComponentDeleter: validation failed - invalid componentType');
            errors.push('Invalid component type specified');
        }

        const result = {
            isValid: errors.length === 0,
            errors,
        };

        console.log('MapComponentDeleter: validation result:', result);
        return result;
    }
}

/**
 * Default instance of MapComponentDeleter for use throughout the application
 */
export const mapComponentDeleter = new MapComponentDeleter();
