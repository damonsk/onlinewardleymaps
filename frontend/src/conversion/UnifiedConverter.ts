/**
 * UnifiedConverter - Phase 1 of refactoring plan
 *
 * This converter acts as an adapter between the legacy conversion system and the
 * new unified types structure. It transforms the output from the legacy Converter
 * into the cleaner, more consistent UnifiedWardleyMap format.
 *
 * The code is organized according to the Single Responsibility Principle:
 * - Each method has a focused purpose
 * - Helper methods extract common logic
 * - Type transformations are handled systematically
 *
 * Flow:
 * 1. Legacy text is parsed by the legacy Converter
 * 2. Legacy WardleyMap structure is transformed to UnifiedWardleyMap
 * 3. Component types, links, pipelines, etc. are converted with proper typing
 */

import { IProvideFeatureSwitches, WardleyMap } from '../types/base';
import {
    EvolvedElementData,
    FlowLink,
    PipelineData,
    UnifiedComponent,
    UnifiedWardleyMap,
    createEmptyMap,
    createUnifiedComponent,
} from '../types/unified';
// Import existing extraction strategies (will be refactored in Phase 2)
import Converter from './Converter';

/**
 * Interface for label offset coordinates
 */
interface LabelOffset {
    x: number;
    y: number;
}

/**
 * Unified Converter that produces clean, consolidated types
 * This acts as an adapter during the transition from old to new types
 */
export class UnifiedConverter {
    private legacyConverter: Converter;

    constructor(featureSwitches: IProvideFeatureSwitches) {
        this.legacyConverter = new Converter(featureSwitches);
    }

    /**
     * Main parsing method that returns unified types
     */
    parse(mapText: string): UnifiedWardleyMap {
        // Use legacy converter for now, then transform to unified types
        const legacyMap = this.legacyConverter.parse(mapText);
        return this.transformToUnifiedMap(legacyMap);
    }

    /**
     * Transform legacy WardleyMap to unified structure
     */
    private transformToUnifiedMap(legacyMap: WardleyMap): UnifiedWardleyMap {
        const unifiedMap = createEmptyMap();

        // Set basic properties
        this.copyBasicProperties(legacyMap, unifiedMap);

        // Extract method components for label handling
        const methodComponents = this.extractMethodComponents(legacyMap);

        // Transform components to unified format, passing along method component info
        this.transformAllComponentTypes(
            legacyMap,
            unifiedMap,
            methodComponents,
        );

        // Transform evolved elements
        unifiedMap.evolved = this.transformEvolvedElements(
            legacyMap.evolved || [],
        );

        // Transform pipelines (must be done after components for visibility processing)
        unifiedMap.pipelines = this.transformPipelines(
            legacyMap.pipelines || [],
            this.getAllComponents(unifiedMap),
        );

        // Transform links
        unifiedMap.links = this.transformLinks(legacyMap.links || []);

        // Copy other properties as-is for now
        this.copyAdditionalProperties(legacyMap, unifiedMap);

        return unifiedMap;
    }

    /**
     * Copy basic map properties
     */
    private copyBasicProperties(
        source: WardleyMap,
        target: UnifiedWardleyMap,
    ): void {
        target.title = source.title || '';
        target.presentation = source.presentation;
        target.errors = source.errors || [];
        target.evolution = source.evolution || [];
    }

    /**
     * Copy additional map properties
     */
    private copyAdditionalProperties(
        source: WardleyMap,
        target: UnifiedWardleyMap,
    ): void {
        target.annotations = source.annotations || [];
        target.notes = source.notes || [];
        target.methods = source.methods || [];
        target.urls = source.urls || [];
        target.attitudes = source.attitudes || [];
        target.accelerators = source.accelerators || [];
    }

    /**
     * Extract component names referenced in methods
     */
    private extractMethodComponents(map: WardleyMap): Set<string> {
        const methodComponents = new Set<string>();
        if (map.methods && map.methods.length > 0) {
            map.methods.forEach((method) => {
                if (method.name) {
                    methodComponents.add(method.name);
                }
            });
        }
        return methodComponents;
    }

    /**
     * Transform all component types
     */
    private transformAllComponentTypes(
        legacyMap: WardleyMap,
        unifiedMap: UnifiedWardleyMap,
        methodComponents: Set<string>,
    ): void {
        unifiedMap.components = this.transformComponents(
            legacyMap.elements || [],
            'component',
            methodComponents,
        );
        unifiedMap.anchors = this.transformComponents(
            legacyMap.anchors || [],
            'anchor',
            methodComponents,
        );
        unifiedMap.submaps = this.transformComponents(
            legacyMap.submaps || [],
            'submap',
            methodComponents,
        );
        unifiedMap.markets = this.transformComponents(
            legacyMap.markets || [],
            'market',
            methodComponents,
        );
        unifiedMap.ecosystems = this.transformComponents(
            legacyMap.ecosystems || [],
            'ecosystem',
            methodComponents,
        );
    }

    /**
     * Transform legacy components to unified components
     * @param legacyComponents The legacy components to transform
     * @param type The component type
     * @param methodComponents Optional set of component names that are referenced in methods
     */
    private transformComponents(
        legacyComponents: any[],
        type: string,
        methodComponents?: Set<string>,
    ): UnifiedComponent[] {
        return legacyComponents.map((component) => {
            return createUnifiedComponent({
                id: component.id || this.generateId(component.name, type),
                name: component.name || '',
                type: type,
                maturity: component.maturity || 0,
                visibility: component.visibility || 0,
                line: component.line,
                label: component.label,
                evolving: component.evolving || false,
                evolved: component.evolved || false,
                evolveMaturity: component.evolveMaturity,
                inertia: component.inertia || false,
                pseudoComponent: component.pseudoComponent || false,
                offsetY: component.offsetY || 0,
                decorators: component.decorators,
                override: component.override,
                url: component.url,
                pipeline: component.pipeline || false,
                increaseLabelSpacing: component.increaseLabelSpacing,
            });
        });
    }

    /**
     * Transform legacy evolved elements
     */
    private transformEvolvedElements(
        legacyEvolved: any[],
    ): EvolvedElementData[] {
        return legacyEvolved.map((evolved) => {
            return {
                name: evolved.name || '',
                maturity: evolved.maturity || 0,
                label: evolved.label,
                override: evolved.override,
                line: evolved.line,
                decorators: evolved.decorators,
                increaseLabelSpacing: evolved.increaseLabelSpacing,
            };
        });
    }

    /**
     * Transform legacy pipelines with visibility processing
     */
    private transformPipelines(
        legacyPipelines: any[],
        allComponents?: UnifiedComponent[],
    ): PipelineData[] {
        return legacyPipelines.map((pipeline) => {
            const transformedPipeline: PipelineData = {
                id: pipeline.id || this.generateId(pipeline.name, 'pipeline'),
                name: pipeline.name || '',
                visibility: pipeline.visibility || 0,
                line: pipeline.line,
                components: this.transformPipelineComponents(
                    pipeline.components || [],
                ),
                inertia: pipeline.inertia || false,
                hidden: pipeline.hidden || false,
                maturity1: pipeline.maturity1,
                maturity2: pipeline.maturity2,
            };

            // Apply visibility processing from parent component
            this.processPipelineVisibility(transformedPipeline, allComponents);

            return transformedPipeline;
        });
    }

    /**
     * Transform pipeline components
     */
    private transformPipelineComponents(components: any[]): {
        id: string;
        name: string;
        maturity: number;
        visibility: number;
        line: number;
        label: LabelOffset;
    }[] {
        return components.map((comp) => ({
            id: comp.id || this.generateId(comp.name, 'pipelinecomponent'),
            name: comp.name || '',
            maturity: comp.maturity || 0,
            visibility: comp.visibility || 0,
            line: comp.line,
            label: comp.label || { x: 0, y: 0 },
        }));
    }

    /**
     * Process visibility for a pipeline based on its parent component
     */
    private processPipelineVisibility(
        pipeline: PipelineData,
        allComponents?: UnifiedComponent[],
    ): void {
        if (!allComponents) return;

        const matchingComponent = allComponents.find(
            (component) => component.name === pipeline.name,
        );

        if (matchingComponent) {
            pipeline.visibility = matchingComponent.visibility;
        } else {
            pipeline.hidden = true;
        }
    }

    /**
     * Transform legacy links to unified flow links
     */
    private transformLinks(legacyLinks: any[]): FlowLink[] {
        return legacyLinks.map((link) => ({
            start: link.start || '',
            end: link.end || '',
            line: link.line,
            flow: link.flow !== false, // Default to true if not explicitly false
            flowValue: link.flowValue,
            future: link.future || false,
            past: link.past || false,
            context: link.context,
        }));
    }

    /**
     * Generate a consistent ID for components
     */
    private generateId(name: string, type: string): string {
        return `${type}_${name.replace(/\s+/g, '_').toLowerCase()}`;
    }

    /**
     * Get all components from the map regardless of type
     */
    getAllComponents(map: UnifiedWardleyMap): UnifiedComponent[] {
        return [
            ...map.components,
            ...map.anchors,
            ...map.submaps,
            ...map.markets,
            ...map.ecosystems,
        ];
    }

    /**
     * Strip comments from map text (same as legacy converter)
     */
    stripComments(data: string): string {
        return this.legacyConverter.stripComments(data);
    }
}
