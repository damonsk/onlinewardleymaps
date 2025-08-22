import {UnifiedComponent} from '../types/unified';

export interface ComponentEvolutionManager {
    evolveComponent(component: UnifiedComponent, mapText: string): EvolutionResult;
    calculateEvolutionPosition(sourceMaturity: number, sourceVisibility: number): {x: number; y: number};
    generateEvolutionSyntax(sourceName: string, targetName: string, position: number): string;
    getNextEvolutionStage(currentMaturity: number): EvolutionStage | null;
}

export interface EvolutionResult {
    updatedMapText: string;
    evolvedComponent: {
        name: string;
        position: {x: number; y: number};
        evolutionLine: string;
    };
    success: boolean;
    error?: string;
}

export interface EvolutionStage {
    name: string;
    range: [number, number];
    nextStage: string | null;
}

const EVOLUTION_STAGES: EvolutionStage[] = [
    {name: 'Genesis', range: [0, 0.25], nextStage: 'Custom'},
    {name: 'Custom', range: [0.25, 0.5], nextStage: 'Product'},
    {name: 'Product', range: [0.5, 0.75], nextStage: 'Commodity'},
    {name: 'Commodity', range: [0.75, 1.0], nextStage: null}, // Lateral evolution only
];

export class DefaultComponentEvolutionManager implements ComponentEvolutionManager {
    evolveComponent(component: UnifiedComponent, mapText: string): EvolutionResult {
        try {
            // Validate input
            if (!component) {
                return {
                    updatedMapText: mapText,
                    evolvedComponent: {name: '', position: {x: 0, y: 0}, evolutionLine: ''},
                    success: false,
                    error: 'Component is required',
                };
            }

            if (component.evolved) {
                return {
                    updatedMapText: mapText,
                    evolvedComponent: {name: '', position: {x: 0, y: 0}, evolutionLine: ''},
                    success: false,
                    error: 'Component is already evolved and cannot be evolved further',
                };
            }

            // Calculate target position for evolution
            const targetPosition = this.calculateEvolutionPosition(component.maturity, component.visibility);

            // Generate evolved component name (default: source name + " Evolved")
            const evolvedName = `${component.name} Evolved`;

            // Generate evolution syntax
            const evolutionSyntax = this.generateEvolutionSyntax(component.name, evolvedName, targetPosition.x);

            // Add evolution line to map text
            const updatedMapText = this.addEvolutionToMapText(mapText, evolutionSyntax);

            return {
                updatedMapText,
                evolvedComponent: {
                    name: evolvedName,
                    position: targetPosition,
                    evolutionLine: evolutionSyntax,
                },
                success: true,
            };
        } catch (error) {
            console.error('Failed to evolve component:', error);
            return {
                updatedMapText: mapText,
                evolvedComponent: {name: '', position: {x: 0, y: 0}, evolutionLine: ''},
                success: false,
                error: error instanceof Error ? error.message : 'Unknown evolution error',
            };
        }
    }

    calculateEvolutionPosition(sourceMaturity: number, sourceVisibility: number): {x: number; y: number} {
        const currentStage = this.getCurrentEvolutionStage(sourceMaturity);

        let targetMaturity: number;

        if (currentStage?.nextStage) {
            // Move to next evolution stage
            const nextStage = EVOLUTION_STAGES.find(stage => stage.name === currentStage.nextStage);
            targetMaturity = nextStage ? nextStage.range[0] + 0.05 : sourceMaturity + 0.1;
        } else {
            // Lateral evolution for commodity stage (slight right movement)
            targetMaturity = Math.min(1.0, sourceMaturity + 0.05);
        }

        return {
            x: targetMaturity,
            y: sourceVisibility, // Keep same visibility level
        };
    }

    generateEvolutionSyntax(sourceName: string, targetName: string, position: number): string {
        // Handle multi-line component names with quotes if necessary
        const sourceNameFormatted = this.formatComponentNameForEvolution(sourceName);
        const targetNameFormatted = this.formatComponentNameForEvolution(targetName);

        // Format: evolve SourceName->EvolvedName maturity
        return `evolve ${sourceNameFormatted}->${targetNameFormatted} ${position.toFixed(2)}`;
    }

    getNextEvolutionStage(currentMaturity: number): EvolutionStage | null {
        const currentStage = this.getCurrentEvolutionStage(currentMaturity);
        if (!currentStage?.nextStage) {
            return null;
        }

        return EVOLUTION_STAGES.find(stage => stage.name === currentStage.nextStage) || null;
    }

    private getCurrentEvolutionStage(maturity: number): EvolutionStage | null {
        return EVOLUTION_STAGES.find(stage => maturity >= stage.range[0] && maturity <= stage.range[1]) || null;
    }

    private formatComponentNameForEvolution(name: string): string {
        // If the name contains spaces, special characters, or spans multiple lines, quote it
        if (name.includes(' ') || name.includes('\n') || /[^a-zA-Z0-9_-]/.test(name)) {
            // Escape any quotes in the name and wrap in quotes
            const escapedName = name.replace(/"/g, '\\"');
            return `"${escapedName}"`;
        }
        return name;
    }

    private addEvolutionToMapText(mapText: string, evolutionSyntax: string): string {
        // Add evolution line at the end of the map text
        // We could be smarter about placement, but for now append to end
        const lines = mapText.split('\n');

        // Find a good place to insert evolution - after components but before notes/other sections
        // For now, just append at the end with a blank line if needed
        const trimmedMapText = mapText.trim();
        const separator = trimmedMapText.endsWith('\n') ? '' : '\n';

        return `${trimmedMapText}${separator}${evolutionSyntax}\n`;
    }
}

// Export a default instance for use throughout the app
export const componentEvolutionManager = new DefaultComponentEvolutionManager();
