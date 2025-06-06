// MapElements.ts - Central class for managing map elements
// This is the main interface for accessing and manipulating map elements
// As specified in the instructions, this class uses the original WardleyMap object
// It provides a consistent interface for working with map elements

import { UnifiedMapElements } from './processing/UnifiedMapElements';
import { MapElement, WardleyMap } from './types/base';
import {
    EvolvedElementData,
    PipelineData,
    UnifiedComponent,
    UnifiedWardleyMap,
} from './types/unified';

/**
 * MapElements class provides a unified interface for accessing and manipulating map elements
 * It's a wrapper around UnifiedMapElements that ensures backward compatibility
 */
export class MapElements {
    private unifiedMapElements: UnifiedMapElements;

    constructor(map: WardleyMap | UnifiedWardleyMap) {
        // Determine if this is a legacy WardleyMap or a UnifiedWardleyMap
        const isUnified = 'components' in map && Array.isArray(map.components);

        if (isUnified) {
            // If it's already a UnifiedWardleyMap, use it directly
            this.unifiedMapElements = new UnifiedMapElements(
                map as UnifiedWardleyMap,
            );
        } else {
            // If it's a legacy WardleyMap, convert it to UnifiedWardleyMap format
            const legacyMap = map as WardleyMap;
            const unifiedMap: UnifiedWardleyMap = {
                title: legacyMap.title || '',
                components: this.convertComponents(
                    legacyMap.elements || [],
                    'component',
                ),
                anchors: this.convertComponents(
                    legacyMap.anchors || [],
                    'anchor',
                ),
                submaps: this.convertComponents(
                    legacyMap.submaps || [],
                    'submap',
                ),
                markets: this.convertComponents(
                    legacyMap.markets || [],
                    'market',
                ),
                ecosystems: this.convertComponents(
                    legacyMap.ecosystems || [],
                    'ecosystem',
                ),
                evolved: this.convertEvolvedElements(legacyMap.evolved || []),
                pipelines: this.convertPipelines(legacyMap.pipelines || []),
                links: legacyMap.links || [],
                notes: legacyMap.notes || [],
                annotations: legacyMap.annotations || [],
                presentation: legacyMap.presentation || {
                    style: '',
                    annotations: { visibility: 0, maturity: 0 },
                    size: { width: 0, height: 0 },
                },
                evolution: legacyMap.evolution || [],
                methods: legacyMap.methods || [],
                urls: legacyMap.urls || [],
                attitudes: legacyMap.attitudes || [],
                accelerators: legacyMap.accelerators || [],
                errors: legacyMap.errors || [],
            };
            this.unifiedMapElements = new UnifiedMapElements(unifiedMap);
        }
    }

    /**
     * Convert legacy components to unified components
     */
    private convertComponents(
        components: any[],
        type: string,
    ): UnifiedComponent[] {
        return components.map((component) => ({
            id:
                component.id ||
                `${type}_${component.name.replace(/\s+/g, '_').toLowerCase()}`,
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
            url: component.url,
            pipeline: component.pipeline || false,
            increaseLabelSpacing: component.increaseLabelSpacing || 0,
        }));
    }

    /**
     * Convert legacy evolved elements to unified format
     */
    private convertEvolvedElements(evolved: any[]): EvolvedElementData[] {
        return evolved.map((e) => ({
            name: e.name || '',
            maturity: e.maturity || 0,
            label: e.label || { x: 0, y: 0 },
            override: e.override,
            line: e.line,
            decorators: e.decorators,
            increaseLabelSpacing: e.increaseLabelSpacing || 0,
        }));
    }

    /**
     * Convert legacy pipelines to unified format
     */
    private convertPipelines(pipelines: any[]): PipelineData[] {
        return pipelines.map((p) => ({
            id:
                p.id ||
                `pipeline_${(p.name || '').replace(/\s+/g, '_').toLowerCase()}`,
            name: p.name || '',
            visibility: p.visibility || 0,
            line: p.line,
            components: (p.components || []).map((comp: any) => ({
                id:
                    comp.id ||
                    `pipelinecomponent_${(comp.name || '').replace(/\s+/g, '_').toLowerCase()}`,
                name: comp.name || '',
                maturity: comp.maturity || 0,
                visibility: comp.visibility || 0,
                line: comp.line,
                label: comp.label || { x: 0, y: 0 },
            })),
            inertia: p.inertia || false,
            hidden: p.hidden || false,
            maturity1: p.maturity1,
            maturity2: p.maturity2,
        }));
    }

    /**
     * Get all map elements, including components, anchors, markets, etc.
     */
    getMergedElements(): MapElement[] {
        return this.unifiedMapElements.getMergedElements();
    }

    /**
     * Get pipeline elements
     */
    getMapPipelines(): any[] {
        return this.unifiedMapElements.getMapPipelines();
    }

    /**
     * Get elements that are evolving (have an evolve declaration)
     * These are the source components that are evolving into another position
     */
    getEvolveElements(): MapElement[] {
        return this.unifiedMapElements.getEvolveElements();
    }

    /**
     * Get evolved elements (the target position of an evolve declaration)
     * These are the destination components that evolved components move to
     */
    getEvolvedElements(): MapElement[] {
        return this.unifiedMapElements.getEvolvedElements();
    }

    /**
     * Get elements that are not evolved (includes non-evolving and evolving components)
     */
    getNonEvolvedElements(): MapElement[] {
        return this.unifiedMapElements.getNonEvolvedElements();
    }

    /**
     * Get elements that are neither evolved nor evolving
     */
    getNoneEvolvedOrEvolvingElements(): MapElement[] {
        return this.unifiedMapElements.getNoneEvolvedOrEvolvingElements();
    }

    /**
     * Get elements that are not evolving (includes static and evolved components)
     */
    getNoneEvolvingElements(): MapElement[] {
        return this.unifiedMapElements.getNoneEvolvingElements();
    }

    /**
     * Get elements that are either evolved or evolving
     */
    getEvolvedOrEvolvingElements(): MapElement[] {
        return this.unifiedMapElements.getEvolvedOrEvolvingElements();
    }

    /**
     * Create a legacy adapter for backward compatibility
     */
    createLegacyAdapter() {
        return this.unifiedMapElements.createLegacyMapElementsAdapter();
    }
}

export default MapElements;
