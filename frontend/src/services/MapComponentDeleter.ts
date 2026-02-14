import {PSTElement} from '../types/map/pst';
import {findPSTElementLine, parsePSTSyntax} from '../utils/pstMapTextMutation';

const VALID_COMPONENT_TYPES = ['pst', 'component', 'market', 'anchor', 'note', 'pipeline', 'evolved-component'] as const;

export interface ComponentDeletionParams {
    mapText: string;
    componentId: string | number;
    componentType?: 'pst' | 'component' | 'market' | 'anchor' | 'note' | 'pipeline' | 'evolved-component';
}

export interface ComponentDeletionResult {
    updatedMapText: string;
    deletedComponent: {
        id: string;
        type: string;
        line: number;
        originalText: string;
        name: string;
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
        identification: ComponentIdentification,
    ): ComponentDeletionResult {
        return {
            updatedMapText,
            deletedComponent: {
                id: componentId,
                type: identification.type,
                line: identification.line,
                originalText: identification.originalText,
                name: identification.name,
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

        if (componentType === 'evolved-component') {
            return this.deleteEvolvedComponent(mapText, componentIdStr);
        }

        const identification = this.identifyComponent(mapText, componentIdStr, componentType);

        if (!identification.found) {
            throw new Error(`Component with ID "${componentId}" not found in map text`);
        }

        const updatedMapText = this.applyTransformations(mapText, this.createDeletionTransformations(identification));

        return this.createDeletionResult(updatedMapText, componentIdStr, identification);
    }

    public deleteEvolvedComponent(mapText: string, evolvedComponentName: string): ComponentDeletionResult {
        const evolveLineIndex = this.findEvolveLineForEvolvedComponent(mapText, evolvedComponentName);

        if (evolveLineIndex === -1) {
            throw new Error(`Evolved component "${evolvedComponentName}" not found in map text`);
        }

        const lines = mapText.split('\n');
        const evolveLine = lines[evolveLineIndex];

        const updatedMapText = this.removeComponentLine(mapText, evolveLineIndex);

        return {
            updatedMapText,
            deletedComponent: {
                id: evolvedComponentName,
                type: 'evolved-component',
                line: evolveLineIndex,
                originalText: evolveLine,
                name: evolvedComponentName,
            },
        };
    }

    private findEvolveLineForEvolvedComponent(mapText: string, evolvedComponentName: string): number {
        const lines = mapText.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line.startsWith('evolve ')) continue;

            const evolveContent = line.substring(7).trim();
            const arrowIndex = evolveContent.indexOf('->');

            if (arrowIndex === -1) continue;

            const targetPart = evolveContent.substring(arrowIndex + 2).trim();
            let evolvedName: string;

            if (targetPart.startsWith('"')) {
                // Extract quoted evolved name
                const quotedMatch = targetPart.match(/^"((?:[^"\\]|\\.)*)"/);
                if (quotedMatch) {
                    evolvedName = quotedMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
                } else {
                    continue; // Malformed quoted name
                }
            } else {
                // For unquoted evolved names, we need to handle multi-word names properly
                // The evolved name continues until we hit a numeric value (maturity) or end of line
                // Pattern: "ComponentName 0.62 label [16, 5]" -> ComponentName ends before the number
                const unquotedMatch = targetPart.match(/^([^0-9]+?)(?:\s+[0-9]|\s*$)/);
                if (unquotedMatch) {
                    evolvedName = unquotedMatch[1].trim();
                } else {
                    // Fallback: just take everything up to first number or end
                    const fallbackMatch = targetPart.match(/^(.*?)(?:\s+[0-9]|$)/);
                    if (fallbackMatch) {
                        evolvedName = fallbackMatch[1].trim();
                    } else {
                        continue; // No name found
                    }
                }
            }

            if (evolvedName === evolvedComponentName) {
                return i;
            }
        }

        return -1;
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

        // Updated pattern to handle quoted multi-line component names
        const componentPattern = /^(component|anchor|market|ecosystem|note|pipeline)\s+(.+?)\s*\[([0-9.]+)\s*,\s*([0-9.]+)\]/i;
        const match = trimmedLine.match(componentPattern);

        if (match) {
            const [, type, nameRaw, visibility, maturity] = match;
            let name = nameRaw.trim();

            // Handle quoted multi-line component names
            if (name.startsWith('"') && name.endsWith('"')) {
                // Extract content from quotes and unescape
                const innerContent = name.slice(1, -1);
                name = innerContent.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
            }

            return {
                type: type.toLowerCase(),
                name: name,
                id: this.generateComponentId(type.toLowerCase(), name, lineIndex),
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

        return mapText
            .split('\n')
            .filter(line => {
                const trimmedLine = line.trim();

                // Check if this line is a link
                const arrowIndex = trimmedLine.indexOf('->');
                if (arrowIndex === -1) return true; // Not a link, keep the line

                const sourceComponent = trimmedLine.substring(0, arrowIndex).trim();
                const targetComponent = trimmedLine.substring(arrowIndex + 2).trim();

                // Extract component names from potential quotes
                const extractComponentName = (component: string): string => {
                    if (component.startsWith('"') && component.endsWith('"')) {
                        // Unescape quoted component name for comparison
                        const innerContent = component.slice(1, -1);
                        return innerContent.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
                    }
                    return component;
                };

                const sourceNameUnescaped = extractComponentName(sourceComponent);
                const targetNameUnescaped = extractComponentName(targetComponent);

                // Use exact matching to check if this link references the removed component
                const isSourceMatch = sourceNameUnescaped === trimmedComponent;
                const isTargetMatch = targetNameUnescaped === trimmedComponent;

                // Filter out (return false) if either source or target matches the removed component
                return !isSourceMatch && !isTargetMatch;
            })
            .join('\n');
    }

    private removeComponentEvolve(mapText: string, removedComponent: string): string {
        const trimmedComponent = removedComponent.trim();

        return mapText
            .split('\n')
            .filter(line => {
                const trimmedLine = line.trim();

                // Check if this line is an evolve statement
                if (!trimmedLine.startsWith('evolve ')) return true; // Not an evolve statement, keep the line

                const evolveContent = trimmedLine.substring(7).trim(); // Remove 'evolve '

                // Extract component name from evolve statement
                let componentNameInEvolve = '';
                if (evolveContent.startsWith('"')) {
                    // Extract quoted component name
                    const quotedMatch = evolveContent.match(/^"((?:[^"\\]|\\.)*)"/);
                    if (quotedMatch) {
                        componentNameInEvolve = quotedMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
                    }
                } else {
                    // Extract unquoted component name (up to first space, arrow, or number)
                    const unquotedMatch = evolveContent.match(/^([^->\s\d]+(?:\s+[^->\s\d]+)*)/);
                    if (unquotedMatch) {
                        componentNameInEvolve = unquotedMatch[1].trim();
                    }
                }

                // Use exact matching to check if this evolve statement references the removed component
                const isMatch = componentNameInEvolve === trimmedComponent;

                // Filter out (return false) if this evolve statement matches the removed component
                return !isMatch;
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
