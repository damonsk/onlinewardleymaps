import {PSTElement} from '../types/map/pst';
import {findPSTElementLine, parsePSTSyntax} from '../utils/pstMapTextMutation';

const VALID_COMPONENT_TYPES = ['pst', 'component', 'market', 'anchor', 'note', 'pipeline'] as const;

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
    private applyTransformations(text: string, transformations: Array<(text: string) => string>): string {
        return transformations.reduce((currentText, transform) => transform(currentText), text);
    }

    private normalizeComponentId(componentId: string | number): string {
        if (typeof componentId === 'number') {
            return String(componentId);
        }
        return componentId;
    }

    private createDeletionTransformations(identification: ComponentIdentification): Array<(text: string) => string> {
        return [
            text => this.removeComponentLine(text, identification.line),
            text => this.removeComponentLinks(text, identification.name),
            text => this.removeComponentEvolve(text, identification.name),
        ];
    }

    private createDeletionResult(
        updatedMapText: string, 
        componentId: string, 
        identification: ComponentIdentification
    ): ComponentDeletionResult {
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

    public deleteComponent(params: ComponentDeletionParams): ComponentDeletionResult {
        const validation = this.validateDeletionParams(params);
        if (!validation.isValid) {
            throw new Error(`Invalid deletion parameters: ${validation.errors.join(', ')}`);
        }

        const {mapText, componentId, componentType} = params;
        const componentIdStr = this.normalizeComponentId(componentId);
        const identification = this.identifyComponent(mapText, componentIdStr, componentType);
        
        if (!identification.found) {
            throw new Error(`Component with ID "${componentId}" not found in map text`);
        }

        const updatedMapText = this.applyTransformations(mapText, 
            this.createDeletionTransformations(identification)
        );

        return this.createDeletionResult(updatedMapText, componentIdStr, identification);
    }

    private identifyComponent(mapText: string, componentId: string, _expectedType?: string): ComponentIdentification {
        const lines = mapText.split('\n');
        const numericId = parseInt(componentId, 10);

        if (!isNaN(numericId) && numericId >= 0) {
            const lineIndex = numericId - 1;
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

    private generateComponentId(type: string, name: string, lineIndex: number): string {
        const safeName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        return `${type}-${safeName}-${lineIndex}`;
    }

    private matchesComponentId(component: {type: string; name: string; id: string}, targetId: string): boolean {
        if (component.id === targetId) {
            return true;
        }

        const nameBasedId = component.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        return targetId.includes(nameBasedId);
    }

    private removeComponentLinks(mapText: string, removedComponent: string): string {
        const trimmedComponent = removedComponent.trim();
        const linkStart = `${trimmedComponent}->`;
        const linkEnd = `->${trimmedComponent}`;

        return mapText
            .split('\n')
            .filter(line => {
                const trimmedLine = line.trim();
                return !trimmedLine.startsWith(linkStart) && !trimmedLine.endsWith(linkEnd);
            })
            .join('\n');
    }

    private removeComponentEvolve(mapText: string, removedComponent: string): string {
        const trimmedComponent = removedComponent.trim();
        const evolveArrow = `evolve ${trimmedComponent}->`;
        const evolveSpace = `evolve ${trimmedComponent} `;

        return mapText
            .split('\n')
            .filter(line => {
                const trimmedLine = line.trim();
                return !trimmedLine.startsWith(evolveArrow) && !trimmedLine.startsWith(evolveSpace);
            })
            .join('\n');
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

    public validateDeletionParams(params: ComponentDeletionParams): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (!params.mapText || typeof params.mapText !== 'string') {
            errors.push('Map text must be a non-empty string');
        }

        if (typeof params.componentId === 'number') {
            if (isNaN(params.componentId) || params.componentId < 0) {
                errors.push('Component ID must be a non-negative number');
            }
        } else if (typeof params.componentId === 'string') {
            if (!params.componentId || params.componentId.trim() === '') {
                errors.push('Component ID must be a non-empty string');
            }
        } else {
            errors.push('Component ID must be a string or number');
        }

        if (params.componentType && !VALID_COMPONENT_TYPES.includes(params.componentType)) {
            errors.push('Invalid component type specified');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

export const mapComponentDeleter = new MapComponentDeleter();
