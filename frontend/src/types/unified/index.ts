// Unified Types Index - Phase 1 of refactoring plan
// Central export point for all unified types

// Component types
export type {
    BaseMapElement,
    ComponentData,
    DecoratedElement,
    EvolvableElement,
    EvolvedElementData,
    LabelableElement,
    MapAnchorData,
    MapComponentData,
    MapEcosystemData,
    MapMarketData,
    MapSubmapData,
    PipelineComponentData,
    PipelineData,
    UnifiedComponent,
    UrlElement,
} from './components';

// Component functions
export {
    createEvolvedElement,
    createPipeline,
    createUnifiedComponent,
    isAnchor,
    isComponent,
    isComponentType,
    isEcosystem,
    isMarket,
    isSubmap,
} from './components';

// Link types
export type {
    BaseLink,
    FlowLink,
    LinkExtractionResult,
    ProcessedLink,
    ProcessedLinkGroup,
} from './links';

// Link functions
export {
    createBaseLink,
    createFlowLink,
    createProcessedLink,
    isFlowLink,
} from './links';

// Map types
export type {
    GroupedComponents,
    MapRenderState,
    UnifiedWardleyMap,
} from './map';

// Map functions
export {
    createEmptyMap,
    getAllMapElements,
    groupComponentsByType,
    migrateToUnifiedMap,
} from './map';
