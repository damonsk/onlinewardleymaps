// Unified MapElements - Phase 1 of refactoring plan
// This replaces the complex MapElements class with a cleaner, type-safe version

import { IProvideMapElements, MapElement } from '../types/map/elements';
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
export class UnifiedMapElements implements IProvideMapElements {
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

        // Mark components as evolving based on evolvedElements array
        this.markEvolvingComponents();

        // Process pipeline components if needed
        this.processPipelineComponents();
    }

    /**
     * Mark components as evolving based on the evolvedElements array
     * This is necessary because the parser creates components without the evolving flag,
     * and evolving status is determined by presence in the evolvedElements array
     */
    private markEvolvingComponents(): void {
        this.allComponents = this.allComponents.map((component) => {
            if (this.evolvedElements.length === 0) {
                return component;
            }

            const hasEvolvedElement = this.evolvedElements.some(
                (evolved) => evolved.name === component.name,
            );

            const evolved = this.evolvedElements.find(
                (x) => x.name === component.name,
            );

            if (hasEvolvedElement) {
                return {
                    ...component,
                    evolving: true,
                    override: evolved?.override,
                };
            }

            return component;
        });
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
                maturity: evolvedData.maturity, // Use maturity from evolved data
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
     * Convert UnifiedComponent to legacy MapElement format
     */
    private convertToMapElement(component: UnifiedComponent): MapElement {
        return {
            name: component.name,
            label: component.label,
            line: component.line ?? 0, // Provide default value for required field
            id: component.id,
            evolved: component.evolved,
            evolving: component.evolving,
            inertia: component.inertia,
            type: component.type,
            maturity: component.maturity,
            visibility: component.visibility,
            pipeline: component.pipeline, // Include pipeline property
            override: component.override,
        };
    }

    /**
     * Convert UnifiedComponent array to legacy MapElement array
     */
    private convertToMapElements(components: UnifiedComponent[]): MapElement[] {
        return components.map((c) => this.convertToMapElement(c));
    }

    // Backward compatibility methods for legacy code - implementing IProvideMapElements interface
    /**
     * Get components that are neither evolved nor evolving (legacy compatibility)
     * This method maintains compatibility with the legacy MapElements interface
     */
    getNoneEvolvedOrEvolvingElements(): MapElement[] {
        return this.convertToMapElements(
            this.allComponents.filter((c) => !c.evolving && !c.evolved),
        );
    }

    /**
     * Get components that are not evolving (legacy compatibility)
     */
    getNoneEvolvingElements(): MapElement[] {
        return this.convertToMapElements(
            this.allComponents.filter((c) => !c.evolving),
        );
    }

    /**
     * Get components that are either evolved or evolving (legacy compatibility)
     */
    geEvolvedOrEvolvingElements(): MapElement[] {
        return this.convertToMapElements(
            this.allComponents.filter((c) => c.evolving || c.evolved),
        );
    }

    /**
     * Get non-evolved elements (legacy compatibility)
     */
    getNonEvolvedElements(): MapElement[] {
        const noneEvolvingElements = this.allComponents.filter(
            (c) => !c.evolving,
        );
        const evolvedComponents = this.getEvolvedComponents();
        return this.convertToMapElements(
            noneEvolvingElements.concat(evolvedComponents),
        );
    }

    /**
     * Get merged elements including evolved versions (legacy compatibility)
     */
    getMergedElements(): MapElement[] {
        const evolvingComponents = this.getEvolvingComponents();
        const noneEvolvingComponents = this.allComponents.filter(
            (c) => !c.evolving,
        );
        const evolvedComponents = this.getEvolvedComponents();

        // Match legacy behavior: static components + evolved components + original evolving components
        // Filter out pseudo-components like in legacy implementation
        const collection = [
            ...noneEvolvingComponents,
            ...evolvedComponents,
            ...evolvingComponents,
        ].filter((c) => !c.pseudoComponent);

        // Add pipeline information like in legacy implementation
        if (this.pipelines === undefined || this.pipelines.length === 0) {
            return this.convertToMapElements(collection);
        }

        const collectionWithPipelines = collection.map((e) => ({
            ...e,
            pipeline: this.pipelines.some(
                (pipeline) => pipeline.name === e.name,
            ),
        }));

        return this.convertToMapElements(collectionWithPipelines);
    }

    /**
     * Get evolving elements (legacy compatibility)
     * Returns components that are marked as evolving
     */
    getEvolveElements(): MapElement[] {
        return this.convertToMapElements(this.getEvolvingComponents());
    }

    /**
     * Get evolved elements (legacy compatibility)
     * Returns the actual evolved versions of components
     */
    getEvolvedElements(): MapElement[] {
        return this.convertToMapElements(this.getEvolvedComponents());
    }

    /**
     * Get map pipelines (legacy compatibility)
     */
    getMapPipelines(): any[] {
        return this.pipelines;
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

    /**
     * Create a legacy MapElements adapter for link strategies compatibility
     * Returns an object that implements the exact interface expected by legacy link strategies
     */
    createLegacyMapElementsAdapter(): any {
        // Convert UnifiedComponent to legacy MapElement format
        const convertToLegacy = (
            component: UnifiedComponent,
        ): import('../types/base').MapElement => {
            const defaultDecorators: import('../types/base').ComponentDecorator = {
                ecosystem: component.type === 'ecosystem',
                market: component.type === 'market',
                method: component.decorators?.method || 'build',
            };

            return {
                inertia: component.inertia ?? false,
                name: component.name,
                id: component.id,
                visibility: component.visibility ?? 0,
                type: component.type ?? 'component',
                evolveMaturity: component.evolveMaturity,
                maturity: component.maturity ?? 0,
                evolving: component.evolving ?? false,
                evolved: component.evolved ?? false,
                pseudoComponent: component.pseudoComponent ?? false,
                offsetY: component.offsetY ?? 0,
                label: component.label,
                override: component.override,
                line: component.line ?? 0,
                decorators: component.decorators || defaultDecorators,
                increaseLabelSpacing: component.increaseLabelSpacing ?? 0,
            };
        };

        return {
            getMergedElements: (): import('../types/base').MapElement[] => {
                return this.getMergedElements().map(convertToLegacy);
            },
            getEvolvedElements: (): import('../types/base').MapElement[] => {
                return this.getEvolvedComponents().map(convertToLegacy);
            },
            getEvolveElements: (): import('../types/base').MapElement[] => {
                return this.getEvolvingComponents().map(convertToLegacy);
            },
            getNoneEvolvingElements: (): import('../types/base').MapElement[] => {
                return this.allComponents
                    .filter((c) => !c.evolving)
                    .map(convertToLegacy);
            },
            getNoneEvolvedOrEvolvingElements: (): import('../types/base').MapElement[] => {
                return this.allComponents
                    .filter((c) => !c.evolving && !c.evolved)
                    .map(convertToLegacy);
            },
            geEvolvedOrEvolvingElements: (): import('../types/base').MapElement[] => {
                return this.allComponents
                    .filter((c) => c.evolving || c.evolved)
                    .map(convertToLegacy);
            },
            getNonEvolvedElements: (): import('../types/base').MapElement[] => {
                const noneEvolvingElements = this.allComponents.filter(
                    (c) => !c.evolving,
                );
                const evolvedComponents = this.getEvolvedComponents();
                return [...noneEvolvingElements, ...evolvedComponents].map(
                    convertToLegacy,
                );
            },
            getMapPipelines: (): any[] => {
                return this.pipelines;
            },
        };
    }
}
