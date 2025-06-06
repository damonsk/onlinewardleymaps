// Unified Map State Hook - Phase 1 of refactoring plan
// This consolidates the 15+ useState hooks from MapEnvironment into a cleaner state management system

import { useCallback, useMemo, useState } from 'react';
import {
    EvolutionStages,
    MapCanvasDimensions,
    MapDimensions,
    Offsets,
} from '../constants/defaults';
import { MapTheme } from '../types/map/styles';
import {
    MapRenderState,
    UnifiedComponent,
    UnifiedWardleyMap,
    createEmptyMap,
    groupComponentsByType,
} from '../types/unified';
import { FlowLink } from '../types/unified/links';

/**
 * Ensures that components involved in evolution or methods have consistent label spacing and positioning
 */
const applyConsistentLabelSpacingForEvolution = (
    map: UnifiedWardleyMap,
): UnifiedWardleyMap => {
    // Create a set of component names that are referenced in methods
    const methodComponents = new Set<string>();
    if (map.methods && map.methods.length > 0) {
        map.methods.forEach((method) => {
            if (method.name) {
                methodComponents.add(method.name);
            }
        });
    }

    // Early return if no evolution or methods to process
    if (
        (map.evolved?.length === 0 || !map.evolved) &&
        methodComponents.size === 0
    ) {
        return map;
    }

    // Create a map of evolved components with their evolved data
    const evolvedComponents = map.evolved
        ? new Map(map.evolved.map((e) => [e.name, e]))
        : new Map();

    // Process all component types to ensure consistent label spacing and positioning
    const processComponents = (
        components: UnifiedComponent[],
    ): UnifiedComponent[] => {
        return components.map((component) => {
            // Determine if this component needs special label handling
            const isEvolved = evolvedComponents.has(component.name);
            const isMethodComponent = methodComponents.has(component.name);

            // If this component requires special handling
            if (isEvolved || isMethodComponent) {
                // Ensure appropriate label spacing
                const increaseLabelSpacing = Math.max(
                    component.increaseLabelSpacing || 0,
                    2,
                );

                // Calculate appropriate label position
                let label = component.label || { x: 0, y: 0 };

                // Apply consistent vertical position if not already specified
                if (!label.y || Math.abs(label.y) <= 10) {
                    label = {
                        ...label,
                        // Position label below the component
                        y: increaseLabelSpacing * 10,
                    };
                }

                // Apply consistent horizontal position if not already specified
                // and apply appropriate positioning based on component type
                const evolvedData = isEvolved
                    ? evolvedComponents.get(component.name)
                    : null;
                if (!label.x || Math.abs(label.x) <= 10) {
                    // Calculate appropriate horizontal position
                    let xOffset = 5; // Default slight offset to the right

                    // If this is an evolved component with override, increase offset
                    if (evolvedData && evolvedData.override) {
                        xOffset = 16;
                    }

                    label = {
                        ...label,
                        x: xOffset,
                    };
                }

                return {
                    ...component,
                    increaseLabelSpacing,
                    label,
                };
            }
            return component;
        });
    };

    // Process evolved elements to ensure consistent label positioning
    const processedEvolved = map.evolved.map((evolvedElement) => {
        const increaseLabelSpacing = Math.max(
            evolvedElement.increaseLabelSpacing || 0,
            2,
        );

        // Calculate appropriate label position
        let label = evolvedElement.label || { x: 0, y: 0 };

        // Apply consistent vertical position if not already specified
        if (!label.y || Math.abs(label.y) <= 10) {
            label = {
                ...label,
                // Position label below the component
                y: increaseLabelSpacing * 10,
            };
        }

        // Apply consistent horizontal position if not already specified
        if (!label.x || Math.abs(label.x) <= 10) {
            // Calculate horizontal offset - default slight offset to the right
            const xOffset = evolvedElement.override ? 16 : 5;

            label = {
                ...label,
                x: xOffset,
            };
        }

        return {
            ...evolvedElement,
            increaseLabelSpacing,
            label,
        };
    });

    // Return a new map with processed components and evolved elements
    return {
        ...map,
        components: processComponents(map.components),
        anchors: processComponents(map.anchors),
        submaps: processComponents(map.submaps),
        markets: processComponents(map.markets),
        ecosystems: processComponents(map.ecosystems),
        evolved: processedEvolved,
    };
};

/**
 * Consolidated map state that replaces multiple useState hooks
 */
interface ConsolidatedMapState {
    // Core map data
    mapText: string;
    map: UnifiedWardleyMap;

    // UI state
    highlightedLine: number;
    newComponentContext: any | null;
    showLinkedEvolved: boolean;

    // Display dimensions and styling
    mapDimensions: MapDimensions;
    mapCanvasDimensions: MapCanvasDimensions;
    mapStyleDefs: MapTheme;
    evolutionOffsets: Offsets;
    mapEvolutionStates: EvolutionStages;

    // Loading and error states
    isLoading: boolean;
    errors: string[];

    // Feature flags and UI preferences
    showUsage: boolean;
    actionInProgress: boolean;
}

/**
 * Actions for updating map state
 */
interface MapStateActions {
    setMapText: (text: string) => void;
    setMap: (map: UnifiedWardleyMap) => void;
    setHighlightedLine: (line: number) => void;
    setNewComponentContext: (context: any | null) => void;
    setShowLinkedEvolved: (show: boolean) => void;
    setMapDimensions: (dimensions: MapDimensions) => void;
    setMapCanvasDimensions: (dimensions: MapCanvasDimensions) => void;
    setMapStyleDefs: (style: MapTheme) => void;
    setEvolutionOffsets: (offsets: Offsets) => void;
    setMapEvolutionStates: (states: EvolutionStages) => void;
    setIsLoading: (loading: boolean) => void;
    setErrors: (errors: string[]) => void;
    addError: (error: string) => void;
    clearErrors: () => void;
    setShowUsage: (show: boolean) => void;
    setActionInProgress: (inProgress: boolean) => void;
}

/**
 * Complete map state and actions
 */
export interface UseMapStateResult {
    state: ConsolidatedMapState;
    actions: MapStateActions;

    // Computed values
    renderState: MapRenderState;
    groupedComponents: {
        components: UnifiedComponent[];
        anchors: UnifiedComponent[];
        submaps: UnifiedComponent[];
        markets: UnifiedComponent[];
        ecosystems: UnifiedComponent[];
    };

    // Utility functions
    getAllComponents: () => UnifiedComponent[];
    getComponentsByType: (type: string) => UnifiedComponent[];
    findComponentByName: (name: string) => UnifiedComponent | undefined;
    getUnifiedMap: () => UnifiedWardleyMap;
    resetToDefaults: () => void;
}

/**
 * Default state values
 */
const createDefaultState = (): ConsolidatedMapState => ({
    mapText: '',
    map: createEmptyMap(),
    highlightedLine: -1,
    newComponentContext: null,
    showLinkedEvolved: false,
    mapDimensions: { width: 500, height: 400 },
    mapCanvasDimensions: { width: 500, height: 400 },
    mapStyleDefs: {} as MapTheme,
    evolutionOffsets: { commodity: 0, product: 0, custom: 0 },
    mapEvolutionStates: {} as EvolutionStages,
    isLoading: false,
    errors: [],
    showUsage: false,
    actionInProgress: false,
});

/**
 * Unified map state hook that consolidates all map-related state
 */
export const useUnifiedMapState = (
    initialState?: Partial<ConsolidatedMapState>,
): UseMapStateResult => {
    const [state, setState] = useState<ConsolidatedMapState>(() => ({
        ...createDefaultState(),
        ...initialState,
    }));

    // Actions for updating state
    const actions = useMemo<MapStateActions>(
        () => ({
            setMapText: (text: string) =>
                setState((prev) => ({ ...prev, mapText: text })),
            setMap: (map: UnifiedWardleyMap) => {
                // Process the map to ensure consistent label spacing for evolution components
                const processedMap =
                    applyConsistentLabelSpacingForEvolution(map);
                setState((prev) => ({ ...prev, map: processedMap }));
            },
            setHighlightedLine: (line: number) =>
                setState((prev) => ({ ...prev, highlightedLine: line })),
            setNewComponentContext: (context: any | null) =>
                setState((prev) => ({ ...prev, newComponentContext: context })),
            setShowLinkedEvolved: (show: boolean) =>
                setState((prev) => ({ ...prev, showLinkedEvolved: show })),
            setMapDimensions: (dimensions: MapDimensions) =>
                setState((prev) => ({ ...prev, mapDimensions: dimensions })),
            setMapCanvasDimensions: (dimensions: MapCanvasDimensions) =>
                setState((prev) => ({
                    ...prev,
                    mapCanvasDimensions: dimensions,
                })),
            setMapStyleDefs: (style: MapTheme) =>
                setState((prev) => ({ ...prev, mapStyleDefs: style })),
            setEvolutionOffsets: (offsets: Offsets) =>
                setState((prev) => ({ ...prev, evolutionOffsets: offsets })),
            setMapEvolutionStates: (states: EvolutionStages) =>
                setState((prev) => ({ ...prev, mapEvolutionStates: states })),
            setIsLoading: (loading: boolean) =>
                setState((prev) => ({ ...prev, isLoading: loading })),
            setErrors: (errors: string[]) =>
                setState((prev) => ({ ...prev, errors })),
            addError: (error: string) =>
                setState((prev) => ({
                    ...prev,
                    errors: [...prev.errors, error],
                })),
            clearErrors: () => setState((prev) => ({ ...prev, errors: [] })),
            setShowUsage: (show: boolean) =>
                setState((prev) => ({ ...prev, showUsage: show })),
            setActionInProgress: (inProgress: boolean) =>
                setState((prev) => ({ ...prev, actionInProgress: inProgress })),
        }),
        [],
    );

    // Computed values
    const groupedComponents = useMemo(
        () => groupComponentsByType(state.map),
        [state.map],
    );

    const renderState = useMemo<MapRenderState>(
        () => ({
            map: state.map,
            groupedComponents,
            highlightedLine: state.highlightedLine,
            newComponentContext: state.newComponentContext,
            showLinkedEvolved: state.showLinkedEvolved,
        }),
        [
            state.map,
            groupedComponents,
            state.highlightedLine,
            state.newComponentContext,
            state.showLinkedEvolved,
        ],
    );

    // Utility functions
    const getAllComponents = useCallback(
        () => [
            ...state.map.components,
            ...state.map.anchors,
            ...state.map.submaps,
            ...state.map.markets,
            ...state.map.ecosystems,
        ],
        [state.map],
    );

    const getComponentsByType = useCallback(
        (type: string) => getAllComponents().filter((c) => c.type === type),
        [getAllComponents],
    );

    const findComponentByName = useCallback(
        (name: string) => getAllComponents().find((c) => c.name === name),
        [getAllComponents],
    );

    const resetToDefaults = useCallback(() => {
        setState(createDefaultState());
    }, []);

    const getUnifiedMap = useCallback(() => {
        return state.map;
    }, [state.map]);

    return {
        state,
        actions,
        renderState,
        groupedComponents,
        getAllComponents,
        getComponentsByType,
        findComponentByName,
        getUnifiedMap,
        resetToDefaults,
    };
};

// Type adapters for backward compatibility
const convertToLegacyComponent = (unified: UnifiedComponent): any => ({
    ...unified,
    line: unified.line ?? 0,
    evolved: unified.evolved ?? false,
    evolving: unified.evolving ?? false,
    inertia: unified.inertia ?? false,
    pseudoComponent: unified.pseudoComponent ?? false,
    offsetY: unified.offsetY ?? 0,
    increaseLabelSpacing: unified.increaseLabelSpacing ?? 0,
    decorators: unified.decorators ?? {},
});

const convertToLegacyLinks = (flowLinks: FlowLink[]): any[] => {
    return flowLinks.map((link) => ({
        ...link,
        flow: link.flow ?? false,
        future: link.future ?? false,
        past: link.past ?? false,
        context: link.context ?? '',
        flowValue: link.flowValue ?? '',
    }));
};

// React-style setter adapters
const createReactSetter = <T>(
    setter: (value: T) => void,
): React.Dispatch<React.SetStateAction<T>> => {
    return (value: React.SetStateAction<T>) => {
        if (typeof value === 'function') {
            // For functional updates, we can't easily support this without state access
            // For now, warn and use the current value
            console.warn(
                'Functional state updates not fully supported in legacy adapter',
            );
            return;
        }
        setter(value);
    };
};

/**
 * Hook for backward compatibility during migration
 * This provides the individual state values that the old components expect
 */
export const useLegacyMapState = (unifiedState: UseMapStateResult) => {
    const { state, actions, groupedComponents } = unifiedState;

    // Convert unified types to legacy-compatible types
    const legacyComponents = groupedComponents.components.map(
        convertToLegacyComponent,
    );
    const legacyAnchors = groupedComponents.anchors.map(
        convertToLegacyComponent,
    );
    const legacySubMaps = groupedComponents.submaps.map(
        convertToLegacyComponent,
    );
    const legacyMarkets = groupedComponents.markets.map(
        convertToLegacyComponent,
    );
    const legacyEcosystems = groupedComponents.ecosystems.map(
        convertToLegacyComponent,
    );
    const legacyLinks = convertToLegacyLinks(state.map.links);

    return {
        // Legacy individual state values
        mapText: state.mapText,
        mapTitle: state.map.title,
        mapComponents: legacyComponents,
        mapAnchors: legacyAnchors,
        mapSubMaps: legacySubMaps,
        mapMarkets: legacyMarkets,
        mapEcosystems: legacyEcosystems,
        mapEvolved: state.map.evolved,
        mapPipelines: state.map.pipelines,
        mapLinks: legacyLinks,
        mapAnnotations: state.map.annotations,
        mapNotes: state.map.notes,
        mapMethods: state.map.methods,
        mapUrls: state.map.urls,
        mapAttitudes: state.map.attitudes,
        mapAccelerators: state.map.accelerators,
        highlightedLine: state.highlightedLine,
        newComponentContext: state.newComponentContext,
        showLinkedEvolved: state.showLinkedEvolved,
        mapDimensions: state.mapDimensions,
        mapCanvasDimensions: state.mapCanvasDimensions,
        mapStyleDefs: state.mapStyleDefs,
        evolutionOffsets: state.evolutionOffsets,
        mapEvolutionStates: state.mapEvolutionStates,

        // Legacy individual setters with React-compatible signatures
        mutateMapText: createReactSetter(actions.setMapText),
        setHighlightLine: createReactSetter(actions.setHighlightedLine),
        setNewComponentContext: createReactSetter(
            actions.setNewComponentContext,
        ),
        setShowLinkedEvolved: createReactSetter(actions.setShowLinkedEvolved),
    };
};
