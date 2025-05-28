// Unified MapElements - Phase 1 of refactoring plan
// This replaces the complex MapElements class with a cleaner, type-safe version

import {
    EvolvedElementData,
    PipelineData,
    UnifiedComponent,
    UnifiedWardleyMap,
    createUnifiedComponent,
} from '../types/unified';

/**
 * Unified MapElements processor with simplified, type-safe operations
 * This replaces the original MapElements class with cleaner architecture
 */
export class UnifiedMapElements {
    private allComponents: UnifiedComponent[];
    private evolvedElements: EvolvedElementData[];
    private pipelines: PipelineData[];

    constructor(map: UnifiedWardleyMap) {
        this.allComponents = [
            ...map.components,
            ...map.anchors,
            ...map.submaps,
            ...map.markets,
            ...map.ecosystems,
        ];
        this.evolvedElements = map.evolved;
        this.pipelines = map.pipelines;

        // Process pipeline components if needed
        this.processPipelineComponents();
    }

    /**
     * Get all components regardless of type
     */
    getAllComponents(): UnifiedComponent[] {
        return this.allComponents;
    }

    /**
     * Get components by type
     */
    getComponentsByType(type: string): UnifiedComponent[] {
        return this.allComponents.filter((c) => c.type === type);
    }

    /**
     * Get components that are evolving
     */
    getEvolvingComponents(): UnifiedComponent[] {
        return this.allComponents.filter((c) => c.evolving);
    }

    /**
     * Get components that are evolved
     */
    getEvolvedComponents(): UnifiedComponent[] {
        return this.getEvolvingComponents().map((component) => {
            const evolvedData = this.evolvedElements.find(
                (e) => e.name === component.name,
            );
            if (!evolvedData) {
                throw new Error(
                    `Evolved element not found for ${component.name}`,
                );
            }

            return createUnifiedComponent({
                ...component,
                id: component.id + '_evolved',
                maturity: component.evolveMaturity || component.maturity,
                evolving: false,
                evolved: true,
                label: evolvedData.label || component.label,
                override: evolvedData.override || component.override,
                line: evolvedData.line || component.line,
                decorators: evolvedData.decorators || component.decorators,
                increaseLabelSpacing:
                    evolvedData.increaseLabelSpacing ||
                    component.increaseLabelSpacing,
            });
        });
    }

    /**
     * Get components that are not evolving or evolved
     */
    getStaticComponents(): UnifiedComponent[] {
        return this.allComponents.filter((c) => !c.evolving && !c.evolved);
    }

    /**
     * Get components that have inertia
     */
    getInertiaComponents(): UnifiedComponent[] {
        return this.allComponents.filter(
            (c) => c.inertia && !c.evolved && !c.evolving,
        );
    }

    /**
     * Get pipeline data
     */
    getPipelines(): PipelineData[] {
        return this.pipelines;
    }

    /**
     * Find component by name
     */
    findComponentByName(name: string): UnifiedComponent | undefined {
        return this.allComponents.find((c) => c.name === name);
    }

    /**
     * Find components by ID
     */
    findComponentById(id: string): UnifiedComponent | undefined {
        return this.allComponents.find((c) => c.id === id);
    }

    /**
     * Get components that match a predicate
     */
    getComponentsWhere(
        predicate: (component: UnifiedComponent) => boolean,
    ): UnifiedComponent[] {
        return this.allComponents.filter(predicate);
    }

    /**
     * Process pipeline components and add them as pseudo-components
     */
    private processPipelineComponents(): void {
        const pipelineComponents: UnifiedComponent[] = [];

        this.pipelines.forEach((pipeline) => {
            pipeline.components.forEach((pipelineComponent) => {
                const pseudoComponent = createUnifiedComponent({
                    id: `pipeline_${pipeline.name}_${pipelineComponent.name}`,
                    name: pipelineComponent.name,
                    type: 'component',
                    maturity: pipelineComponent.maturity,
                    visibility: pipeline.visibility,
                    pseudoComponent: true,
                    pipeline: true,
                    offsetY: 14,
                    inertia: pipeline.inertia || false,
                });

                pipelineComponents.push(pseudoComponent);
            });
        });

        this.allComponents = [...this.allComponents, ...pipelineComponents];
    }

    /**
     * Get statistics about the map
     */
    getStatistics() {
        return {
            totalComponents: this.allComponents.length,
            componentsByType: {
                component: this.getComponentsByType('component').length,
                anchor: this.getComponentsByType('anchor').length,
                submap: this.getComponentsByType('submap').length,
                market: this.getComponentsByType('market').length,
                ecosystem: this.getComponentsByType('ecosystem').length,
            },
            evolvingComponents: this.getEvolvingComponents().length,
            evolvedComponents: this.getEvolvedComponents().length,
            staticComponents: this.getStaticComponents().length,
            inertiaComponents: this.getInertiaComponents().length,
            pipelines: this.pipelines.length,
        };
    }

    /**
     * Validate the map elements for consistency
     */
    validate(): string[] {
        const errors: string[] = [];

        // Check for duplicate IDs
        const ids = this.allComponents.map((c) => c.id);
        const duplicateIds = ids.filter(
            (id, index) => ids.indexOf(id) !== index,
        );
        if (duplicateIds.length > 0) {
            errors.push(
                `Duplicate component IDs found: ${duplicateIds.join(', ')}`,
            );
        }

        // Check for evolving components without evolved data
        this.getEvolvingComponents().forEach((component) => {
            if (!this.evolvedElements.find((e) => e.name === component.name)) {
                errors.push(
                    `Evolving component "${component.name}" has no evolved element data`,
                );
            }
        });

        // Check for invalid maturity/visibility values
        this.allComponents.forEach((component) => {
            if (component.maturity < 0 || component.maturity > 1) {
                errors.push(
                    `Component "${component.name}" has invalid maturity: ${component.maturity}`,
                );
            }
            if (component.visibility < 0 || component.visibility > 1) {
                errors.push(
                    `Component "${component.name}" has invalid visibility: ${component.visibility}`,
                );
            }
        });

        return errors;
    }
}
