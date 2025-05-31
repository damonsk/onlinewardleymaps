// Unified component type system - Phase 1 of refactoring plan
// This file consolidates multiple overlapping component interfaces into a coherent type hierarchy

import { ComponentDecorator, ComponentLabel } from '../base';

/**
 * Base interface for all map elements that have positional properties
 */
export interface BaseMapElement {
    id: string;
    name: string;
    maturity: number;
    visibility: number;
    line?: number;
}

/**
 * Interface for elements that can have labels
 */
export interface LabelableElement {
    label: ComponentLabel;
    increaseLabelSpacing?: number;
}

/**
 * Interface for elements that can evolve
 */
export interface EvolvableElement {
    evolving?: boolean;
    evolved?: boolean;
    evolveMaturity?: number;
}

/**
 * Interface for elements that can have decorators and special properties
 */
export interface DecoratedElement {
    decorators?: ComponentDecorator;
    inertia?: boolean;
    pseudoComponent?: boolean;
    offsetY?: number;
    override?: string;
}

/**
 * Interface for elements that can have URLs
 */
export interface UrlElement {
    url?: string | { url: string; [key: string]: any };
}

/**
 * Unified component interface that replaces MapElement, Component, MapComponents, etc.
 * This combines all the properties that were scattered across multiple interfaces
 */
export interface UnifiedComponent
    extends BaseMapElement,
        LabelableElement,
        EvolvableElement,
        DecoratedElement,
        UrlElement {
    type: string;
    pipeline?: boolean;
}

/**
 * Specialized interfaces for specific component types
 */
export interface MapComponentData extends UnifiedComponent {
    type: 'component';
}

export interface MapAnchorData extends UnifiedComponent {
    type: 'anchor';
}

export interface MapSubmapData extends UnifiedComponent {
    type: 'submap';
}

export interface MapMarketData extends UnifiedComponent {
    type: 'market';
}

export interface MapEcosystemData extends UnifiedComponent {
    type: 'ecosystem';
}

/**
 * Union type for all component types
 */
export type ComponentData =
    | MapComponentData
    | MapAnchorData
    | MapSubmapData
    | MapMarketData
    | MapEcosystemData;

/**
 * Interface for evolved elements
 */
export interface EvolvedElementData {
    name: string;
    maturity: number;
    label?: ComponentLabel;
    override?: string;
    line?: number;
    decorators?: ComponentDecorator;
    increaseLabelSpacing?: number;
}

/**
 * Interface for pipeline components
 */
export interface PipelineComponentData {
    id: string;
    name: string;
    maturity: number;
    visibility: number;
    line?: number;
    label?: ComponentLabel;
}

/**
 * Interface for pipelines
 */
export interface PipelineData {
    id: string;
    name: string;
    visibility: number;
    line?: number;
    components: PipelineComponentData[];
    inertia?: boolean;
    hidden?: boolean;
    maturity1?: number;
    maturity2?: number;
}

/**
 * Type guards for component types
 */
export const isComponentType = (
    component: UnifiedComponent,
    type: string,
): boolean => {
    return component.type === type;
};

export const isComponent = (
    component: UnifiedComponent,
): component is MapComponentData => {
    return component.type === 'component';
};

export const isAnchor = (
    component: UnifiedComponent,
): component is MapAnchorData => {
    return component.type === 'anchor';
};

export const isSubmap = (
    component: UnifiedComponent,
): component is MapSubmapData => {
    return component.type === 'submap';
};

export const isMarket = (
    component: UnifiedComponent,
): component is MapMarketData => {
    return component.type === 'market';
};

export const isEcosystem = (
    component: UnifiedComponent,
): component is MapEcosystemData => {
    return component.type === 'ecosystem';
};

/**
 * Helper functions for component creation with default values
 */
export const createUnifiedComponent = (
    partial: Partial<UnifiedComponent> &
        Pick<UnifiedComponent, 'id' | 'name' | 'type'>,
): UnifiedComponent => {
    return {
        maturity: 0,
        visibility: 0,
        label: { x: 0, y: 0 },
        evolving: false,
        evolved: false,
        inertia: false,
        pseudoComponent: false,
        offsetY: 0,
        increaseLabelSpacing: 0,
        pipeline: false,
        ...partial,
    };
};

export const createEvolvedElement = (
    partial: Partial<EvolvedElementData> &
        Pick<EvolvedElementData, 'name' | 'maturity'>,
): EvolvedElementData => {
    return {
        label: { x: 0, y: 0 },
        increaseLabelSpacing: 0,
        ...partial,
    };
};

export const createPipeline = (
    partial: Partial<PipelineData> &
        Pick<PipelineData, 'id' | 'name' | 'visibility' | 'components'>,
): PipelineData => {
    return {
        inertia: false,
        hidden: false,
        ...partial,
    };
};
