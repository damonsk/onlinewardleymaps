// Unified WardleyMap structure - Phase 1 of refactoring plan
// This replaces the fragmented WardleyMap interface with a clean, consolidated structure

import {
    EvolutionLabel,
    MapAccelerators,
    MapAnnotations,
    MapAttitudes,
    MapEvolution,
    MapMethods,
    MapNotes,
    MapParseError,
    MapPresentationStyle,
    MapUrls,
} from '../base';
import {
    EvolvedElementData,
    PipelineData,
    UnifiedComponent,
} from './components';
import { FlowLink } from './links';

/**
 * Unified WardleyMap structure with consolidated component types
 * This replaces the original WardleyMap interface with proper type organization
 */
export interface UnifiedWardleyMap {
    // Meta information
    title: string;
    presentation: MapPresentationStyle;
    errors: Array<MapParseError>;

    // Core map elements - using unified types
    components: UnifiedComponent[];
    anchors: UnifiedComponent[];
    submaps: UnifiedComponent[];
    markets: UnifiedComponent[];
    ecosystems: UnifiedComponent[];

    // Evolution and pipelines
    evolved: EvolvedElementData[];
    pipelines: PipelineData[];
    evolution: MapEvolution;

    // Connections and relationships
    links: FlowLink[];

    // Annotations and documentation
    annotations: MapAnnotations[];
    notes: MapNotes[];
    methods: MapMethods[];

    // External resources
    urls: MapUrls[];

    // Behavioral elements
    attitudes: MapAttitudes[];
    accelerators: MapAccelerators[];
}

/**
 * Grouped components by type for easier processing
 */
export interface GroupedComponents {
    components: UnifiedComponent[];
    anchors: UnifiedComponent[];
    submaps: UnifiedComponent[];
    markets: UnifiedComponent[];
    ecosystems: UnifiedComponent[];
}

/**
 * Map state for rendering - consolidates the scattered useState hooks
 */
export interface MapRenderState {
    // Core data
    map: UnifiedWardleyMap;

    // Processed data for rendering
    groupedComponents: GroupedComponents;

    // UI state
    highlightedLine: number;
    newComponentContext: any | null;

    // Display preferences
    showLinkedEvolved: boolean;
}

/**
 * Helper functions for map creation and manipulation
 */
export const createEmptyMap = (): UnifiedWardleyMap => {
    return {
        title: '',
        presentation: {} as MapPresentationStyle,
        errors: [],
        components: [],
        anchors: [],
        submaps: [],
        markets: [],
        ecosystems: [],
        evolved: [],
        pipelines: [],
        evolution: [] as EvolutionLabel[],
        links: [],
        annotations: [],
        notes: [],
        methods: [],
        urls: [],
        attitudes: [],
        accelerators: [],
    };
};

export const groupComponentsByType = (
    map: UnifiedWardleyMap,
): GroupedComponents => {
    return {
        components: map.components.filter((c) => c.type === 'component'),
        anchors: map.anchors,
        submaps: map.submaps,
        markets: map.markets,
        ecosystems: map.ecosystems,
    };
};

export const getAllMapElements = (
    map: UnifiedWardleyMap,
): UnifiedComponent[] => {
    return [
        ...map.components,
        ...map.anchors,
        ...map.submaps,
        ...map.markets,
        ...map.ecosystems,
    ];
};

/**
 * Migration helper - converts old WardleyMap to new unified structure
 * This can be used during the transition period
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const migrateToUnifiedMap = (oldMap: any): UnifiedWardleyMap => {
    // This would contain the logic to convert from the old fragmented structure
    // to the new unified structure. For now, returning empty map as placeholder.
    return createEmptyMap();
};
