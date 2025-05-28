// Unified Converter - Phase 1 of refactoring plan
// This creates a cleaner conversion interface using unified types

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
        unifiedMap.title = legacyMap.title || '';
        unifiedMap.presentation = legacyMap.presentation;
        unifiedMap.errors = legacyMap.errors || [];
        unifiedMap.evolution = legacyMap.evolution || [];

        // Transform components to unified format
        unifiedMap.components = this.transformComponents(
            legacyMap.elements || [],
            'component',
        );
        unifiedMap.anchors = this.transformComponents(
            legacyMap.anchors || [],
            'anchor',
        );
        unifiedMap.submaps = this.transformComponents(
            legacyMap.submaps || [],
            'submap',
        );
        unifiedMap.markets = this.transformComponents(
            legacyMap.markets || [],
            'market',
        );
        unifiedMap.ecosystems = this.transformComponents(
            legacyMap.ecosystems || [],
            'ecosystem',
        );

        // Transform evolved elements
        unifiedMap.evolved = this.transformEvolvedElements(
            legacyMap.evolved || [],
        );

        // Transform pipelines
        unifiedMap.pipelines = this.transformPipelines(
            legacyMap.pipelines || [],
        );

        // Transform links
        unifiedMap.links = this.transformLinks(legacyMap.links || []);

        // Copy other properties as-is for now
        unifiedMap.annotations = legacyMap.annotations || [];
        unifiedMap.notes = legacyMap.notes || [];
        unifiedMap.methods = legacyMap.methods || [];
        unifiedMap.urls = legacyMap.urls || [];
        unifiedMap.attitudes = legacyMap.attitudes || [];
        unifiedMap.accelerators = legacyMap.accelerators || [];

        return unifiedMap;
    }

    /**
     * Transform legacy components to unified components
     */
    private transformComponents(
        legacyComponents: any[],
        type: string,
    ): UnifiedComponent[] {
        return legacyComponents.map((component) => {
            return createUnifiedComponent({
                id: component.id || this.generateId(component.name, type),
                name: component.name || '',
                type: type,
                maturity: component.maturity || 0,
                visibility: component.visibility || 0,
                line: component.line,
                label: component.label || { x: 0, y: 0 },
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
                increaseLabelSpacing: component.increaseLabelSpacing || 0,
            });
        });
    }

    /**
     * Transform legacy evolved elements
     */
    private transformEvolvedElements(
        legacyEvolved: any[],
    ): EvolvedElementData[] {
        return legacyEvolved.map((evolved) => ({
            name: evolved.name || '',
            maturity: evolved.maturity || 0,
            label: evolved.label || { x: 0, y: 0 },
            override: evolved.override,
            line: evolved.line,
            decorators: evolved.decorators,
            increaseLabelSpacing: evolved.increaseLabelSpacing || 0,
        }));
    }

    /**
     * Transform legacy pipelines
     */
    private transformPipelines(legacyPipelines: any[]): PipelineData[] {
        return legacyPipelines.map((pipeline) => ({
            name: pipeline.name || '',
            visibility: pipeline.visibility || 0,
            components: (pipeline.components || []).map((comp: any) => ({
                name: comp.name || '',
                maturity: comp.maturity || 0,
                visibility: comp.visibility || 0,
            })),
            inertia: pipeline.inertia || false,
            hidden: pipeline.hidden || false,
        }));
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
