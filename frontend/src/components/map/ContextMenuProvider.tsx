import React, {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import {useMapComponentDeletion} from '../../hooks/useMapComponentDeletion';
import {findEvolvedComponentInfo} from '../../utils/evolvedComponentUtils';
import {useComponentSelection} from '../ComponentSelectionContext';
import {ContextMenu, ContextMenuItem} from './ContextMenu';

interface MapElement {
    type: 'component' | 'evolved-component' | 'link' | 'pst-element';
    id: string;
    name: string;
    properties: ComponentProperties | LinkProperties | PSTProperties;
    componentData?: any; // Store the original component data for evolved components
    linkData?: {start: string; end: string; flow?: boolean; flowValue?: string; line: number}; // Store link data for deletion
    pstData?: {type: string; id: string}; // Store PST element data for deletion
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

interface ContextMenuContextType {
    showContextMenu: (position: {x: number; y: number}, element: MapElement | string | number) => void;
    showLinkContextMenu: (
        position: {x: number; y: number},
        linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number},
    ) => void;
    hideContextMenu: () => void;
    isContextMenuOpen: boolean;
}

export interface ContextMenuProviderProps {
    children: ReactNode;
    mapText: string;
    onDeleteComponent?: (
        componentId: string,
        componentType?: 'component' | 'evolved-component' | 'pst-element',
        componentData?: any,
    ) => void;
    onDeleteLink?: (linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number}) => void;
    onEditComponent?: (componentId: string) => void;
    onToggleInertia?: (componentId: string) => void;
    onEvolveComponent?: (componentId: string) => void;
    wardleyMap?: any; // For accessing component data
    selectionManager?: {getSelectedElement: () => any; getSelectedLink: () => any}; // For accessing link selections
    onContextMenuReady?: (contextMenuActions: {
        showLinkContextMenu: (
            position: {x: number; y: number},
            linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number},
        ) => void;
    }) => void;
}

const defaultContextMenuState: ContextMenuState = {
    isOpen: false,
    position: {x: 0, y: 0},
    element: null,
};

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

const DeleteIcon: React.FC<{size?: number}> = ({size = 16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
);

const EditIcon: React.FC<{size?: number}> = ({size = 16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
);

const InertiaIcon: React.FC<{size?: number}> = ({size = 16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
    </svg>
);

const EvolveIcon: React.FC<{size?: number}> = ({size = 16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L9 8.5v6h2v-2.1l.9 3.9z" />
    </svg>
);

export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({
    children,
    mapText,
    onDeleteComponent,
    onDeleteLink,
    onEditComponent,
    onToggleInertia,
    onEvolveComponent,
    wardleyMap,
    selectionManager,
    onContextMenuReady,
}) => {
    const [contextMenuState, setContextMenuState] = useState<ContextMenuState>(defaultContextMenuState);
    const {getSelectedComponentId, isSelected, clearSelection, selectComponent} = useComponentSelection();
    const {deleteComponent} = useMapComponentDeletion();

    // Use provided wardleyMap or default to null if not provided
    const computedWardleyMap = wardleyMap;

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

            if (computedWardleyMap && Array.isArray(computedWardleyMap.attitudes)) {
                // Find PST attitude that matches the componentId
                const pstAttitude = computedWardleyMap.attitudes.find((attitude: any) => {
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
            if (!computedWardleyMap) {
                return null;
            }

            const allComponents = [...(computedWardleyMap.components || []), ...(computedWardleyMap.anchors || [])];
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
        [computedWardleyMap, mapText],
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

    const hideContextMenu = useCallback(() => {
        setContextMenuState(defaultContextMenuState);
    }, []);

    // Expose context menu functions to parent component
    useEffect(() => {
        if (onContextMenuReady) {
            onContextMenuReady({
                showLinkContextMenu,
            });
        }
    }, [onContextMenuReady, showLinkContextMenu]);

    const handleDeleteComponent = useCallback(() => {
        const currentElement = contextMenuState.element;
        if (
            !currentElement ||
            !mapText ||
            (typeof currentElement === 'object' &&
                currentElement.type !== 'component' &&
                currentElement.type !== 'evolved-component' &&
                currentElement.type !== 'pst-element')
        ) {
            console.warn('Cannot delete component: missing element or mapText');
            hideContextMenu();
            return;
        }

        try {
            if (onDeleteComponent) {
                const componentId = typeof currentElement === 'object' ? currentElement.id : currentElement;
                const componentType =
                    typeof currentElement === 'object' &&
                    (currentElement.type === 'component' ||
                        currentElement.type === 'evolved-component' ||
                        currentElement.type === 'pst-element')
                        ? currentElement.type
                        : undefined;
                const componentData = typeof currentElement === 'object' ? currentElement.componentData : undefined;
                onDeleteComponent(String(componentId), componentType, componentData);
            } else {
                const componentId = typeof currentElement === 'object' ? currentElement.id : currentElement;
                const componentName = typeof currentElement === 'object' ? currentElement.name : String(currentElement);
                const componentType = typeof currentElement === 'object' ? currentElement.type : undefined;
                deleteComponent({
                    mapText,
                    componentId: String(componentId),
                    componentName,
                    componentType:
                        componentType === 'evolved-component' ? 'evolved-component' : componentType === 'pst-element' ? 'pst' : 'component',
                });
            }

            clearSelection();
        } catch (error) {
            console.error('Failed to delete component:', error);
        }

        hideContextMenu();
    }, [contextMenuState.element, mapText, onDeleteComponent, deleteComponent, clearSelection, hideContextMenu]);

    const handleEditComponent = useCallback(() => {
        const currentElement = contextMenuState.element;
        if (!currentElement) {
            console.warn('Cannot edit: no element selected');
            hideContextMenu();
            return;
        }

        // For backward compatibility, allow string/number IDs
        // Only check type restriction if we have a MapElement object
        if (typeof currentElement === 'object' && currentElement.type !== 'component' && currentElement.type !== 'evolved-component') {
            console.warn('Cannot edit: invalid element type');
            hideContextMenu();
            return;
        }

        try {
            if (onEditComponent) {
                let componentId = typeof currentElement === 'object' ? currentElement.id : currentElement;

                // For evolved components, use the evolved component ID directly
                // The useComponentOperations.handleEditComponent now handles evolved components properly
                // by detecting the _evolved suffix and calling startEditing with the full evolved ID

                onEditComponent(String(componentId));
            }
        } catch (error) {
            console.error('Failed to start editing component:', error);
        }

        hideContextMenu();
    }, [contextMenuState.element, onEditComponent, hideContextMenu, mapText]);

    const handleToggleInertia = useCallback(() => {
        const currentElement = contextMenuState.element;
        if (!currentElement) {
            console.warn('Cannot toggle inertia: no element selected');
            hideContextMenu();
            return;
        }

        // For backward compatibility, allow string/number IDs
        // Only check type restriction if we have a MapElement object
        if (typeof currentElement === 'object' && currentElement.type !== 'component' && currentElement.type !== 'evolved-component') {
            console.warn('Cannot toggle inertia: invalid element type');
            hideContextMenu();
            return;
        }

        try {
            if (onToggleInertia) {
                const componentId = typeof currentElement === 'object' ? currentElement.id : currentElement;
                onToggleInertia(String(componentId));
            }
        } catch (error) {
            console.error('Failed to toggle component inertia:', error);
        }

        hideContextMenu();
    }, [contextMenuState.element, onToggleInertia, hideContextMenu]);

    const handleEvolveComponent = useCallback(() => {
        const currentElement = contextMenuState.element;
        if (!currentElement) {
            console.warn('Cannot evolve: no element selected');
            hideContextMenu();
            return;
        }

        // For backward compatibility, allow string/number IDs (they get converted to MapElement later)
        // Only check type restriction if we have a MapElement object
        if (typeof currentElement === 'object' && currentElement.type !== 'component') {
            console.warn('Cannot evolve: invalid element type or already evolved');
            hideContextMenu();
            return;
        }

        try {
            if (onEvolveComponent) {
                const componentId = typeof currentElement === 'object' ? currentElement.id : currentElement;
                onEvolveComponent(String(componentId));
            }
        } catch (error) {
            console.error('Failed to evolve component:', error);
        }

        hideContextMenu();
    }, [contextMenuState.element, onEvolveComponent, hideContextMenu]);

    const handleDeleteLink = useCallback(() => {
        const currentElement = contextMenuState.element;
        console.log('ContextMenuProvider: handleDeleteLink called', {
            currentElement,
            elementType: typeof currentElement,
            isValidElement: currentElement && typeof currentElement === 'object' && currentElement.type === 'link',
            hasOnDeleteLink: !!onDeleteLink,
            linkData: currentElement && typeof currentElement === 'object' ? currentElement.linkData : null,
        });

        if (!currentElement || typeof currentElement !== 'object' || currentElement.type !== 'link') {
            console.warn('Cannot delete link: invalid element type');
            hideContextMenu();
            return;
        }

        try {
            if (onDeleteLink && currentElement.linkData) {
                console.log('ContextMenuProvider: calling onDeleteLink with:', currentElement.linkData);
                onDeleteLink(currentElement.linkData);
                console.log('ContextMenuProvider: onDeleteLink completed');
            } else {
                console.warn('ContextMenuProvider: onDeleteLink or linkData missing', {
                    hasOnDeleteLink: !!onDeleteLink,
                    hasLinkData: !!currentElement.linkData,
                });
            }
        } catch (error) {
            console.error('Failed to delete link:', error);
        }

        hideContextMenu();
    }, [contextMenuState.element, onDeleteLink, hideContextMenu]);

    const getContextMenuItems = useCallback((): ContextMenuItem[] => {
        const currentElement = contextMenuState.element;
        if (!currentElement) return [];

        const items: ContextMenuItem[] = [];

        // Check if we have enhanced element data (MapElement object) or just an ID (string/number)
        if (typeof currentElement === 'object' && currentElement.type) {
            // Enhanced mode with full MapElement data
            if (currentElement.type === 'pst-element') {
                // PST elements only show Delete option
                items.push({
                    id: 'delete',
                    label: 'Delete',
                    action: handleDeleteComponent,
                    disabled: false,
                    icon: DeleteIcon,
                    destructive: true,
                });
            } else if (currentElement.type === 'component' || currentElement.type === 'evolved-component') {
                const properties = currentElement.properties as ComponentProperties;

                // Edit Component - available for all components
                if (onEditComponent) {
                    items.push({
                        id: 'edit',
                        label: 'Edit Component',
                        action: handleEditComponent,
                        disabled: false,
                        icon: EditIcon,
                    });
                }

                // Toggle Inertia - only for regular components (not evolved)
                if (onToggleInertia && currentElement.type === 'component') {
                    const hasInertia = properties.inertia;
                    items.push({
                        id: 'toggle-inertia',
                        label: hasInertia ? 'Remove Inertia' : 'Add Inertia',
                        action: handleToggleInertia,
                        disabled: false,
                        icon: InertiaIcon,
                    });
                }

                // Evolve Component - only for regular (non-evolved) components
                if (onEvolveComponent && currentElement.type === 'component' && !properties.evolved) {
                    items.push({
                        id: 'evolve',
                        label: 'Evolve Component',
                        action: handleEvolveComponent,
                        disabled: false,
                        icon: EvolveIcon,
                    });
                }

                // Delete Component - always available for components
                items.push({
                    id: 'delete',
                    label: 'Delete Component',
                    action: handleDeleteComponent,
                    disabled: false,
                    icon: DeleteIcon,
                    destructive: true,
                });
            } else if (currentElement.type === 'link') {
                // Delete Link - available for all links
                if (onDeleteLink) {
                    items.push({
                        id: 'delete-link',
                        label: 'Delete Link',
                        action: handleDeleteLink,
                        disabled: false,
                        icon: DeleteIcon,
                        destructive: true,
                    });
                }
            }
        } else {
            // Fallback mode - basic delete functionality only (for backward compatibility)
            const selectedComponentId = getSelectedComponentId();
            if (selectedComponentId !== null && selectedComponentId !== undefined) {
                items.push({
                    id: 'delete',
                    label: 'Delete',
                    action: handleDeleteComponent,
                    disabled: false,
                    icon: DeleteIcon,
                    destructive: true,
                });
            }
        }
        return items;
    }, [
        contextMenuState.element,
        handleDeleteComponent,
        handleDeleteLink,
        handleEditComponent,
        handleToggleInertia,
        handleEvolveComponent,
        onEditComponent,
        onToggleInertia,
        onEvolveComponent,
        onDeleteLink,
        getSelectedComponentId,
    ]);

    const contextValue: ContextMenuContextType = {
        showContextMenu,
        showLinkContextMenu,
        hideContextMenu,
        isContextMenuOpen: contextMenuState.isOpen,
    };

    return (
        <ContextMenuContext.Provider value={contextValue}>
            {children}
            <ContextMenu
                items={getContextMenuItems()}
                isOpen={contextMenuState.isOpen}
                onClose={hideContextMenu}
                position={contextMenuState.position}
            />
        </ContextMenuContext.Provider>
    );
};

export const useContextMenu = (): ContextMenuContextType => {
    const context = useContext(ContextMenuContext);
    if (context === undefined) {
        throw new Error('useContextMenu must be used within a ContextMenuProvider');
    }
    return context;
};

export default ContextMenuProvider;
