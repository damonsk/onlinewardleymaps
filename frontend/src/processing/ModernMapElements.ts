// ModernMapElements.ts - Modern implementation of map element processing
// Part of Phase 4C: Component Interface Modernization
//
// This class replaces UnifiedMapElements with a fully modern implementation
// that works directly with unified types and doesn't convert to legacy MapElement types.
// It provides a clean, type-safe interface for modern components.

import {
    EvolvedElementData,
    PipelineData,
    UnifiedComponent,
    UnifiedWardleyMap,
    createUnifiedComponent,
} from '../types/unified';

/**
 * Modern MapElements processor with clean, type-safe operations
 *
 * This class provides methods for accessing and manipulating map elements,
 * working directly with UnifiedComponent types without conversion to legacy types.
 */
export class ModernMapElements {
    private allComponents: UnifiedComponent[];
    private evolvedElements: EvolvedElementData[];
    private pipelines: PipelineData[];

    /**
     * Creates an instance of ModernMapElements.
     * Initializes the components, marks evolving components, and processes pipelines.
     *
     * @param map The UnifiedWardleyMap containing all map data
     */
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

        this.markEvolvingComponents();
        this.markPipelineComponents();
    }

    /**
     * Marks components as evolving based on the evolvedElements collection
     * Also applies label positioning rules for evolving components
     */
    private markEvolvingComponents(): void {
        // First create a set of components referenced in methods
        const methodComponents = new Set<string>();
        if (this.allComponents.some((c) => c.decorators?.method)) {
            this.allComponents.forEach((component) => {
                if (component.decorators?.method && component.name) {
                    methodComponents.add(component.name);
                }
            });
        }

        this.allComponents = this.allComponents.map((component) => {
            // Handle evolving components
            if (this.evolvedElements.length > 0) {
                const hasEvolvedElement = this.evolvedElements.some(
                    (evolved) => evolved.name === component.name,
                );
                const evolved = this.evolvedElements.find(
                    (x) => x.name === component.name,
                );

                if (hasEvolvedElement) {
                    // Apply consistent label spacing for evolving components
                    const increaseLabelSpacing = Math.max(
                        component.increaseLabelSpacing || 0,
                        evolved?.increaseLabelSpacing || 0,
                        2,
                    );

                    // Calculate appropriate label position
                    let label = component.label || { x: 0, y: 0 };

                    // For labels with the default value or no meaningful vertical position,
                    // place the label below the component
                    if (!label.y || Math.abs(label.y) <= 10) {
                        label = {
                            ...label,
                            // Position label below the component for better readability
                            y: increaseLabelSpacing * 10,
                        };
                    }

                    // Apply consistent horizontal position if not already specified
                    if (!label.x || Math.abs(label.x) <= 10) {
                        // Calculate horizontal offset - slight offset to the right
                        const xOffset = evolved?.override ? 16 : 5;

                        label = {
                            ...label,
                            x: xOffset,
                        };
                    }

                    return {
                        ...component,
                        evolving: true,
                        evolveMaturity: evolved?.maturity,
                        override: evolved?.override,
                        increaseLabelSpacing: increaseLabelSpacing,
                        label: label,
                    };
                }
            }

            // Handle method components
            if (methodComponents.has(component.name)) {
                // Apply consistent label spacing for method components
                const increaseLabelSpacing = Math.max(
                    component.increaseLabelSpacing || 0,
                    2,
                );

                // Calculate appropriate label position
                let label = component.label || { x: 0, y: 0 };

                // If no y offset is specified or it's within the default range,
                // place the label below the component
                if (!label.y || Math.abs(label.y) <= 10) {
                    label = {
                        ...label,
                        // Position label below the component for better readability
                        y: increaseLabelSpacing * 10,
                    };
                }

                // Apply consistent horizontal position if not already specified
                if (!label.x || Math.abs(label.x) <= 10) {
                    label = {
                        ...label,
                        // Position label with slight offset to the right
                        x: 5,
                    };
                }

                return {
                    ...component,
                    increaseLabelSpacing: increaseLabelSpacing,
                    label: label,
                };
            }

            return component;
        });
    }

    /**
     * Marks components as pipeline components based on the pipelines collection
     * Sets the pipeline property to true for components that are pipelines
     */
    private markPipelineComponents(): void {
        this.allComponents = this.allComponents.map((component) => {
            const isPipelineComponent = this.pipelines.some(
                (pipeline) => pipeline.name === component.name,
            );
            if (isPipelineComponent) {
                return {
                    ...component,
                    pipeline: true,
                };
            }
            return component;
        });
    }

    /**
     * Gets all components in the map
     */
    getAllComponents(): UnifiedComponent[] {
        return this.allComponents;
    }

    /**
     * Gets components of a specific type
     *
     * @param type Component type ('component', 'anchor', 'submap', etc)
     */
    getComponentsByType(type: string): UnifiedComponent[] {
        return this.allComponents.filter((c) => c.type === type);
    }

    /**
     * Gets components that are evolving (have an evolve declaration)
     * These are the source components that are evolving into another position
     */
    getEvolvingComponents(): UnifiedComponent[] {
        return this.allComponents.filter((c) => c.evolving);
    }

    /**
     * Gets the evolved versions of components
     * Creates evolved components based on evolving components and evolved data
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

            // Calculate appropriate label spacing
            const increaseLabelSpacing = Math.max(
                evolvedData.increaseLabelSpacing || 0,
                component.increaseLabelSpacing || 0,
                2,
            );

            // Calculate appropriate label position
            let label = evolvedData.label || component.label || { x: 0, y: 0 };

            // If no y offset is specified, calculate appropriate vertical position for evolved component
            if (!label.y || Math.abs(label.y) <= 10) {
                label = {
                    ...label,
                    // Position label below the component
                    y: increaseLabelSpacing * 10,
                };
            }

            // If no x offset is specified and there's an override, adjust horizontal position
            if ((!label.x || Math.abs(label.x) <= 10) && evolvedData.override) {
                label = {
                    ...label,
                    // Position label with slight offset to accommodate override text
                    x: 16,
                };
            }

            return createUnifiedComponent({
                ...component,
                id: component.id + '_evolved',
                maturity: evolvedData.maturity,
                evolving: false,
                evolved: true,
                label: label,
                override: evolvedData.override || component.override,
                line: evolvedData.line || component.line,
                decorators:
                    evolvedData.decorators &&
                    Object.keys(evolvedData.decorators).length > 0
                        ? evolvedData.decorators
                        : component.decorators,
                increaseLabelSpacing: increaseLabelSpacing,
            });
        });
    }

    /**
     * Gets components that are not evolved
     * These include regular components and evolving components
     */
    getStaticComponents(): UnifiedComponent[] {
        return this.allComponents.filter((c) => !c.evolved);
    }

    /**
     * Gets components with inertia but not evolved
     */
    getInertiaComponents(): UnifiedComponent[] {
        return this.allComponents.filter((c) => c.inertia && !c.evolved);
    }

    /**
     * Gets components that are neither evolved nor evolving
     */
    getNeitherEvolvedNorEvolvingComponents(): UnifiedComponent[] {
        return this.allComponents.filter((c) => !c.evolving && !c.evolved);
    }

    /**
     * Gets components that are not evolving
     * These include static components and evolved components
     */
    getNonEvolvingComponents(): UnifiedComponent[] {
        return this.allComponents.filter((c) => !c.evolving);
    }

    /**
     * Gets components that are not evolved
     * These include static components and evolving components
     */
    getNonEvolvedComponents(): UnifiedComponent[] {
        return this.allComponents.filter((c) => !c.evolved);
    }

    /**
     * Gets components that are either evolved or evolving
     */
    getEitherEvolvedOrEvolvingComponents(): UnifiedComponent[] {
        return this.allComponents.filter((c) => c.evolving || c.evolved);
    }

    /**
     * Gets all components merged with their evolved versions
     * This provides a complete set of components for rendering
     */
    getMergedComponents(): UnifiedComponent[] {
        const staticComponents = this.getStaticComponents();
        const evolvedComponents = this.getEvolvedComponents();
        return [...staticComponents, ...evolvedComponents];
    }

    /**
     * Gets pipeline components
     */
    getPipelineComponents(): PipelineData[] {
        return this.pipelines;
    }

    /**
     * TEMPORARY: Creates a legacy UnifiedMapElements-compatible adapter
     * This is for backward compatibility during the transition period.
     * It will be removed once all components are updated to use ModernMapElements directly.
     *
     * @deprecated Use ModernMapElements methods directly instead
     */
    getLegacyAdapter(): any {
        // Create an adapter object with methods that match UnifiedMapElements API
        return {
            getAllComponents: () => this.getAllComponents(),
            getComponentsByType: (type: string) =>
                this.getComponentsByType(type),
            getEvolvingComponents: () => this.getEvolvingComponents(),
            getEvolvedComponents: () => this.getEvolvedComponents(),
            getMergedComponents: () => this.getMergedComponents(),
            getPipelineComponents: () => this.getPipelineComponents(),

            // Legacy method names mapped to modern methods
            getEvolveElements: () => this.getEvolvingComponents(),
            getEvolvedElements: () => this.getEvolvedComponents(),
            getMergedElements: () => this.getMergedComponents(),
            getMapPipelines: () => this.getPipelineComponents(),
            getNoneEvolvedOrEvolvingElements: () =>
                this.getNeitherEvolvedNorEvolvingComponents(),
            getNoneEvolvingElements: () => this.getNonEvolvingComponents(),
            getNeitherEvolvedNorEvolvingComponents: () =>
                this.getNeitherEvolvedNorEvolvingComponents(),

            // Legacy adapter methods
            convertToMapElement: (component: UnifiedComponent) => component,
            convertToMapElements: (components: UnifiedComponent[]) =>
                components,
            getEvolvedUnifiedComponents: () => this.getEvolvedComponents(),
        };
    }
}
