import {useCallback, useEffect, useState} from 'react';
import {findEvolvedComponentInfo} from '../../../utils/evolvedComponentUtils';
import {useComponentSelection} from '../../ComponentSelectionContext';

export interface MapElement {
    type: 'component' | 'evolved-component' | 'link' | 'pst-element' | 'canvas';
    id: string;
    name: string;
    properties: ComponentProperties | LinkProperties | PSTProperties | CanvasProperties;
    componentData?: any;
    linkData?: {start: string; end: string; flow?: boolean; flowValue?: string; line: number};
    pstData?: {type: string; id: string};
}

interface CanvasProperties {
    // Canvas-specific properties can be added here if needed
}

interface ComponentProperties {
    name: string;
    inertia: boolean;
    evolved: boolean;
    maturity: number;
    visibility: number;
    method?: string;
}

interface LinkProperties {
    source: string;
    target: string;
    type: string;
}

interface PSTProperties {
    type: 'pioneers' | 'settlers' | 'townplanners';
    name?: string;
}

interface ContextMenuState {
    isOpen: boolean;
    position: {x: number; y: number};
    element: MapElement | string | number | null;
}

interface UseContextMenuStateProps {
    mapText: string;
    wardleyMap?: any;
    onContextMenuReady?: (contextMenuActions: {
        showLinkContextMenu: (
            position: {x: number; y: number},
            linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number},
        ) => void;
        showCanvasContextMenu: (position: {x: number; y: number}) => void;
    }) => void;
}

interface UseContextMenuStateReturn {
    contextMenuState: ContextMenuState;
    showContextMenu: (position: {x: number; y: number}, element: MapElement | string | number) => void;
    showLinkContextMenu: (
        position: {x: number; y: number},
        linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number},
    ) => void;
    showCanvasContextMenu: (position: {x: number; y: number}) => void;
    hideContextMenu: () => void;
    detectElementFromComponent: (componentId: string) => MapElement | null;
}

const defaultContextMenuState: ContextMenuState = {
    isOpen: false,
    position: {x: 0, y: 0},
    element: null,
};

export const useContextMenuState = ({mapText, wardleyMap, onContextMenuReady}: UseContextMenuStateProps): UseContextMenuStateReturn => {
    const [contextMenuState, setContextMenuState] = useState<ContextMenuState>(defaultContextMenuState);
    const {isSelected, selectComponent} = useComponentSelection();

    // Enhanced component detection from map data
    const detectElementFromComponent = useCallback(
        (componentId: string): MapElement | null => {
            // For PST elements (starting with pst-), create PST element
            if (componentId.startsWith('pst-')) {
                const pstTypeMatch = componentId.match(/^pst-(pioneers|settlers|townplanners)-/);
                const pstType = pstTypeMatch ? (pstTypeMatch[1] as 'pioneers' | 'settlers' | 'townplanners') : 'pioneers';

                const mapElement: MapElement = {
                    type: 'pst-element',
                    id: componentId,
                    name: pstType.charAt(0).toUpperCase() + pstType.slice(1),
                    properties: {
                        type: pstType,
                        name: pstType,
                    } as PSTProperties,
                    pstData: {
                        type: pstType,
                        id: componentId,
                    },
                };

                return mapElement;
            }

            // Check if numeric ID corresponds to a PST element
            if (wardleyMap && Array.isArray(wardleyMap.attitudes)) {
                // Find PST attitude that matches the componentId
                const pstAttitude = wardleyMap.attitudes.find((attitude: any) => {
                    // PST attitudes have specific attitude types
                    const isPSTType = ['pioneers', 'settlers', 'townplanners'].includes(attitude.attitude);
                    // Check if the line number matches the componentId (PST IDs are line numbers)
                    const lineMatches = String(attitude.line) === String(componentId);
                    return isPSTType && lineMatches;
                });

                if (pstAttitude) {
                    const mapElement: MapElement = {
                        type: 'pst-element',
                        id: componentId,
                        name: pstAttitude.name || pstAttitude.attitude.charAt(0).toUpperCase() + pstAttitude.attitude.slice(1),
                        properties: {
                            type: pstAttitude.attitude,
                            name: pstAttitude.name || pstAttitude.attitude,
                        } as PSTProperties,
                        pstData: {
                            type: pstAttitude.attitude,
                            id: componentId,
                        },
                    };

                    return mapElement;
                }
            }

            // For evolved components (ending with _evolved), parse from map text
            if (componentId.endsWith('_evolved')) {
                const evolvedInfo = findEvolvedComponentInfo(mapText, componentId);

                if (!evolvedInfo.found) return null;

                // Create a MapElement for the evolved component
                const mapElement: MapElement = {
                    type: 'evolved-component',
                    id: componentId,
                    name: evolvedInfo.evolvedName,
                    properties: {
                        name: evolvedInfo.evolvedName,
                        inertia: false,
                        evolved: true,
                        maturity: 0,
                        visibility: 0,
                    },
                    componentData: {
                        id: componentId,
                        name: evolvedInfo.sourceName, // Keep source name
                        evolved: true,
                        override: evolvedInfo.evolvedName, // This is what gets deleted
                    },
                };

                return mapElement;
            }

            // For regular components, search in wardley map
            if (!wardleyMap) {
                return null;
            }

            const allComponents = [...(wardleyMap.components || []), ...(wardleyMap.anchors || [])];
            let component = allComponents.find(c => c.id === componentId);

            // Try with string/number conversion if not found
            if (!component) {
                component = allComponents.find(c => String(c.id) === String(componentId));
            }

            if (!component) {
                return null;
            }

            const properties: ComponentProperties = {
                name: component.name,
                inertia: component.inertia || false,
                evolved: component.evolved || false,
                maturity: component.maturity,
                visibility: component.visibility,
                method: component.method,
            };

            const mapElement: MapElement = {
                type: component.evolved ? 'evolved-component' : 'component',
                id: component.id,
                name: component.name,
                properties,
                componentData: component,
            };

            return mapElement;
        },
        [wardleyMap, mapText],
    );

    const showContextMenu = useCallback(
        (position: {x: number; y: number}, element: MapElement | string | number) => {
            // Handle backward compatibility with componentId string/number or direct MapElement
            let mapElement: MapElement | null = null;

            if (typeof element === 'string' || typeof element === 'number') {
                mapElement = detectElementFromComponent(String(element));
            } else {
                mapElement = element;
            }

            if (!mapElement) {
                // Fallback: create a minimal MapElement from the component ID
                const fallbackElement: MapElement = {
                    type: 'component',
                    id: String(element),
                    name: String(element),
                    properties: {
                        name: String(element),
                        inertia: false,
                        evolved: false,
                        maturity: 0,
                        visibility: 0,
                        method: undefined,
                    },
                };
                setContextMenuState({
                    isOpen: true,
                    position,
                    element: fallbackElement,
                });
                return;
            }

            // Auto-select the component if not already selected
            if (mapElement.type === 'component' || mapElement.type === 'evolved-component' || mapElement.type === 'pst-element') {
                if (!isSelected(mapElement.id)) {
                    selectComponent(mapElement.id);
                }
            }

            setContextMenuState({
                isOpen: true,
                position,
                element: mapElement,
            });
        },
        [detectElementFromComponent, isSelected, selectComponent],
    );

    const showLinkContextMenu = useCallback(
        (position: {x: number; y: number}, linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number}) => {
            // Create a MapElement for the link
            const linkElement: MapElement = {
                type: 'link',
                id: `${linkInfo.start}->${linkInfo.end}`,
                name: `${linkInfo.start} → ${linkInfo.end}`,
                properties: {
                    source: linkInfo.start,
                    target: linkInfo.end,
                    type: linkInfo.flow ? 'flow' : 'link',
                },
                linkData: linkInfo,
            };

            setContextMenuState({
                isOpen: true,
                position,
                element: linkElement,
            });
        },
        [],
    );

    const showCanvasContextMenu = useCallback((position: {x: number; y: number}) => {
        // Create a MapElement for the canvas
        const canvasElement: MapElement = {
            type: 'canvas',
            id: 'canvas',
            name: 'Map Canvas',
            properties: {} as CanvasProperties,
        };

        setContextMenuState({
            isOpen: true,
            position,
            element: canvasElement,
        });
    }, []);

    const hideContextMenu = useCallback(() => {
        setContextMenuState(defaultContextMenuState);
    }, []);

    // Expose context menu functions to parent component
    useEffect(() => {
        if (onContextMenuReady) {
            onContextMenuReady({
                showLinkContextMenu,
                showCanvasContextMenu,
            });
        }
    }, [onContextMenuReady, showLinkContextMenu, showCanvasContextMenu]);

    return {
        contextMenuState,
        showContextMenu,
        showLinkContextMenu,
        showCanvasContextMenu,
        hideContextMenu,
        detectElementFromComponent,
    };
};
