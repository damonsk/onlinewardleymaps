/**
 * Component Link Highlighting Context
 *
 * This context manages the hover state for component link highlighting.
 * It tracks which component is being hovered and provides information
 * about which links should be highlighted.
 */

import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {ComponentDependencyGraph, createDependencyGraph} from '../../utils/dependencyGraph';
import {ProcessedLinkGroup} from '../../utils/mapProcessing';

export interface LinkHighlightState {
    hoveredComponent: string | null;
    highlightedLinks: Set<string>;
    highlightedComponents: Set<string>;
}

export interface ComponentLinkHighlightContextValue {
    linkHighlightState: LinkHighlightState;
    setHoveredComponent: (componentName: string | null) => void;
    isLinkHighlighted: (linkId: string) => boolean;
    isComponentHighlighted: (componentName: string) => boolean;
    updateDependencyGraph: (processedLinks: ProcessedLinkGroup[]) => void;
}

const ComponentLinkHighlightContext = createContext<ComponentLinkHighlightContextValue | null>(null);

export interface ComponentLinkHighlightProviderProps {
    children: React.ReactNode;
    processedLinks?: ProcessedLinkGroup[];
}

export const ComponentLinkHighlightProvider: React.FC<ComponentLinkHighlightProviderProps> = ({children, processedLinks = []}) => {
    const [hoveredComponent, setHoveredComponentState] = useState<string | null>(null);
    const [dependencyGraph, setDependencyGraph] = useState<ComponentDependencyGraph | null>(null);

    // Create dependency graph when links change
    const currentDependencyGraph = useMemo(() => {
        if (processedLinks.length > 0) {
            return createDependencyGraph(processedLinks);
        }
        return null;
    }, [processedLinks]);

    // Update internal state when dependency graph changes
    React.useEffect(() => {
        setDependencyGraph(currentDependencyGraph);
    }, [currentDependencyGraph]);

    // Calculate highlighted links and components based on hovered component
    const linkHighlightState = useMemo((): LinkHighlightState => {
        if (!hoveredComponent || !dependencyGraph) {
            return {
                hoveredComponent: null,
                highlightedLinks: new Set(),
                highlightedComponents: new Set(),
            };
        }

        const highlightedLinks = new Set<string>(dependencyGraph.getDescendantLinks(hoveredComponent));
        const highlightedComponents = new Set<string>([hoveredComponent, ...dependencyGraph.getDescendants(hoveredComponent)]);

        return {
            hoveredComponent,
            highlightedLinks,
            highlightedComponents,
        };
    }, [hoveredComponent, dependencyGraph]);

    const setHoveredComponent = useCallback((componentName: string | null) => {
        setHoveredComponentState(componentName);
    }, []);

    const isLinkHighlighted = useCallback(
        (linkId: string): boolean => {
            return linkHighlightState.highlightedLinks.has(linkId);
        },
        [linkHighlightState.highlightedLinks],
    );

    const isComponentHighlighted = useCallback(
        (componentName: string): boolean => {
            return linkHighlightState.highlightedComponents.has(componentName);
        },
        [linkHighlightState.highlightedComponents],
    );

    const updateDependencyGraph = useCallback((newProcessedLinks: ProcessedLinkGroup[]) => {
        const newGraph = createDependencyGraph(newProcessedLinks);
        setDependencyGraph(newGraph);
    }, []);

    const contextValue: ComponentLinkHighlightContextValue = {
        linkHighlightState,
        setHoveredComponent,
        isLinkHighlighted,
        isComponentHighlighted,
        updateDependencyGraph,
    };

    return <ComponentLinkHighlightContext.Provider value={contextValue}>{children}</ComponentLinkHighlightContext.Provider>;
};

export const useComponentLinkHighlight = (): ComponentLinkHighlightContextValue => {
    const context = useContext(ComponentLinkHighlightContext);
    if (!context) {
        throw new Error('useComponentLinkHighlight must be used within a ComponentLinkHighlightProvider');
    }
    return context;
};

export default ComponentLinkHighlightContext;
