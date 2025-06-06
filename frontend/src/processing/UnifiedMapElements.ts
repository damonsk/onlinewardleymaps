// Unified MapElements - Phase 1 of refactoring plan
// This replaces the complex MapElements class with a cleaner, type-safe version

import { MapElement } from '../types/base'; // Use MapElement and ComponentDecorator from base.ts. Removed ComponentLabel.
import { IProvideMapElements } from '../types/map/elements';
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

        this.markEvolvingComponents();
        this.markPipelineComponents();
    }

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
                    // place the label below the componen
                    if (!label.y || Math.abs(label.y) <= 10) {
                        label = {
                            ...label,
                            // Position label below the component for better readability
                            y: increaseLabelSpacing * 10,
                        };
                    }

                    // Apply consistent horizontal position if not already specified
                    if (!label.x || Math.abs(label.x) <= 10) {
                        // Calculate horizontal offset - slight offset to the righ
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
                // place the label below the componen
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
                        // Position label with slight offset to the righ
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

    getAllComponents(): UnifiedComponent[] {
        return this.allComponents;
    }

    getComponentsByType(type: string): UnifiedComponent[] {
        return this.allComponents.filter((c) => c.type === type);
    }

    getEvolvingComponents(): UnifiedComponent[] {
        return this.allComponents.filter((c) => c.evolving);
    }

    private getEvolvedUnifiedComponents(): UnifiedComponent[] {
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

            // If no y offset is specified, calculate appropriate vertical position for evolved componen
            if (!label.y || Math.abs(label.y) <= 10) {
                label = {
                    ...label,
                    // Position label below the componen
                    y: increaseLabelSpacing * 10,
                };
            }

            // If no x offset is specified and there's an override, adjust horizontal position
            if ((!label.x || Math.abs(label.x) <= 10) && evolvedData.override) {
                label = {
                    ...label,
                    // Position label with slight offset to accommodate override tex
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

    getStaticComponents(): UnifiedComponent[] {
        return this.allComponents.filter((c) => !c.evolved);
    }

    getInertiaComponents(): UnifiedComponent[] {
        return this.allComponents.filter((c) => c.inertia && !c.evolved);
    }

    private convertToMapElement(component: UnifiedComponent): MapElement {
        // Create result object with properties in the exact order expected by golden master
        const result: any = {
            maturity: component.maturity ?? 0,
            visibility: component.visibility ?? 0,
            label: component.label ?? { x: 0, y: 0 },
            evolving: component.evolving ?? false,
            evolved: component.evolved ?? false,
            inertia: component.inertia ?? false,
            pseudoComponent: component.pseudoComponent ?? false,
            offsetY: component.offsetY ?? 0,
            pipeline: component.pipeline ?? false,
            id: component.id,
            name: component.name,
            type: component.type ?? '',
            line: component.line,
        };

        // Only include evolveMaturity if component is actually evolving
        if (
            component.evolving &&
            component.evolveMaturity !== null &&
            component.evolveMaturity !== undefined
        ) {
            result.evolveMaturity = component.evolveMaturity;
        }

        // Set decorators based on parsed decorators from DSL, not component type
        result.decorators = {
            ecosystem:
                component.decorators?.ecosystem ||
                component.type === 'ecosystem',
            market: component.decorators?.market || component.type === 'market',
            method: component.decorators?.method, // Only set method if explicitly defined
        };

        // Always set increaseLabelSpacing to 0 for legacy forma
        result.increaseLabelSpacing = 0;

        // Always include URL object for legacy forma
        result.url = { name: '', url: '' };

        return result as MapElement;
    }

    private convertToMapElements(components: UnifiedComponent[]): MapElement[] {
        return components.map((c) => this.convertToMapElement(c));
    }

    getNoneEvolvedOrEvolvingElements(): MapElement[] {
        return this.convertToMapElements(
            this.allComponents.filter((c) => !c.evolving && !c.evolved),
        );
    }

    getNoneEvolvingElements(): MapElement[] {
        return this.convertToMapElements(
            this.allComponents.filter((c) => !c.evolving),
        );
    }

    getEvolvedOrEvolvingElements(): MapElement[] {
        return this.convertToMapElements(
            this.allComponents.filter((c) => c.evolving || c.evolved),
        );
    }

    getNonEvolvedElements(): MapElement[] {
        // Legacy behavior: non-evolved includes non-evolving + evolving (but not evolved)
        return this.convertToMapElements(
            this.allComponents.filter((c) => !c.evolved),
        );
    }

    getEvolvedElements(): MapElement[] {
        return this.convertToMapElements(this.getEvolvedUnifiedComponents());
    }

    getEvolveElements(): MapElement[] {
        return this.convertToMapElements(this.getEvolvingComponents());
    }

    getMergedElements(): MapElement[] {
        const staticElements = this.getStaticComponents();
        const evolvedElements = this.getEvolvedUnifiedComponents();
        return this.convertToMapElements([
            ...staticElements,
            ...evolvedElements,
        ]);
    }

    getMapPipelines(): any[] {
        return this.pipelines.map((pipeline) => ({
            ...pipeline,
            // components: this.convertToMapElements(pipeline.components as UnifiedComponent[]),
        }));
    }

    /**
     * Create legacy MapElements adapter for backward compatibility
     * This method provides the legacy interface expected by existing code
     */
    createLegacyMapElementsAdapter() {
        return {
            getMergedElements: () => this.getMergedElements(),
            getMapPipelines: () => this.getMapPipelines(),
            getEvolveElements: () => this.getEvolveElements(),
            getEvolvedElements: () => this.getEvolvedElements(),
            getNonEvolvedElements: () => this.getNonEvolvedElements(),
            getNoneEvolvedOrEvolvingElements: () =>
                this.getNoneEvolvedOrEvolvingElements(),
            getNoneEvolvingElements: () => this.getNoneEvolvingElements(),
            geEvolvedOrEvolvingElements: () =>
                this.getEvolvedOrEvolvingElements(),
        };
    }
}
