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
            setMap: (map: UnifiedWardleyMap) =>
                setState((prev) => ({ ...prev, map })),
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

    return {
        state,
        actions,
        renderState,
        groupedComponents,
        getAllComponents,
        getComponentsByType,
        findComponentByName,
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

const convertToLegacyLinks = (flowLinks: FlowLink[]): any[] =>
    flowLinks.map((link) => ({
        ...link,
        flow: link.flow ?? false,
        future: link.future ?? false,
        past: link.past ?? false,
        context: link.context ?? '',
        flowValue: link.flowValue ?? '',
    }));

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
