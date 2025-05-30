// Unified MapElements - Phase 1 of refactoring plan
// This replaces the complex MapElements class with a cleaner, type-safe version

import { ComponentDecorator, MapElement } from '../types/base'; // Use MapElement and ComponentDecorator from base.ts. Removed ComponentLabel.
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
            return createUnifiedComponent({
                ...component,
                id: component.id + '_evolved',
                maturity: evolvedData.maturity,
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

    getStaticComponents(): UnifiedComponent[] {
        return this.allComponents.filter((c) => !c.evolved);
    }

    getInertiaComponents(): UnifiedComponent[] {
        return this.allComponents.filter((c) => c.inertia && !c.evolved);
    }

    private convertToMapElement(component: UnifiedComponent): MapElement {
        let resolvedMethod: string | undefined = undefined;
        let resolvedEcosystem: boolean = component.type === 'ecosystem';
        let resolvedMarket: boolean = component.type === 'market';

        if (component.decorators !== undefined) {
            // Inside this block, component.decorators is narrowed to type ComponentDecorator.
            resolvedMethod = component.decorators.method;
            resolvedEcosystem =
                component.decorators.ecosystem ?? resolvedEcosystem;
            resolvedMarket = component.decorators.market ?? resolvedMarket;
        }

        const finalDecorators: ComponentDecorator = {
            ecosystem: resolvedEcosystem,
            market: resolvedMarket,
            method: resolvedMethod,
        };

        return {
            name: component.name,
            label: component.label ?? { x: 0, y: 0 },
            line: component.line,
            id: component.id,
            evolved: component.evolved ?? false,
            evolving: component.evolving ?? false,
            inertia: component.inertia ?? false,
            type: component.type ?? '',
            maturity: component.maturity ?? 0,
            visibility: component.visibility ?? 0,
            decorators: finalDecorators,
            pseudoComponent: component.pseudoComponent ?? false,
            offsetY: component.offsetY ?? 0,
            increaseLabelSpacing: component.increaseLabelSpacing ?? 0,
            evolveMaturity: component.evolveMaturity,
            override: component.override,
            pipeline: component.pipeline ?? false,
        };
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

    geEvolvedOrEvolvingElements(): MapElement[] {
        return this.convertToMapElements(
            this.allComponents.filter((c) => c.evolving || c.evolved),
        );
    }

    getNonEvolvedElements(): MapElement[] {
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
                this.geEvolvedOrEvolvingElements(),
        };
    }
}
