// Unified link type system - Phase 1 of refactoring plan
// This file consolidates multiple overlapping link interfaces

import {UnifiedComponent} from './components';

/**
 * Base link interface
 */
export interface BaseLink {
    start: string;
    end: string;
    line?: number;
}

/**
 * Enhanced link with flow properties
 */
export interface FlowLink extends BaseLink {
    flow?: boolean;
    flowValue?: string;
    future?: boolean;
    past?: boolean;
    context?: string;
}

/**
 * Processed link with resolved element references
 */
export interface ProcessedLink {
    link: FlowLink;
    startElement: UnifiedComponent;
    endElement: UnifiedComponent;
}

/**
 * Group of processed links with metadata
 */
export interface ProcessedLinkGroup {
    name: string;
    links: ProcessedLink[];
}

/**
 * Link extraction result
 */
export interface LinkExtractionResult {
    name: string;
    links: BaseLink[];
    startElements: UnifiedComponent[];
    endElements: UnifiedComponent[];
}

/**
 * Type guards for links
 */
export const isFlowLink = (link: BaseLink): link is FlowLink => {
    return 'flow' in link || 'flowValue' in link;
};

/**
 * Helper functions for link creation
 */
export const createBaseLink = (partial: Partial<BaseLink> & Pick<BaseLink, 'start' | 'end'>): BaseLink => {
    return {
        ...partial,
    };
};

export const createFlowLink = (partial: Partial<FlowLink> & Pick<FlowLink, 'start' | 'end'>): FlowLink => {
    return {
        flow: false,
        future: false,
        past: false,
        ...partial,
    };
};

export const createProcessedLink = (link: FlowLink, startElement: UnifiedComponent, endElement: UnifiedComponent): ProcessedLink => {
    return {
        link,
        startElement,
        endElement,
    };
};
