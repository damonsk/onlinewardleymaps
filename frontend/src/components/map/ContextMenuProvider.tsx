import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import {useMapComponentDeletion} from '../../hooks/useMapComponentDeletion';
import {useComponentSelection} from '../ComponentSelectionContext';
import {ContextMenu, ContextMenuItem} from './ContextMenu';
import {UnifiedComponent} from '../../types/unified';
import {useUnifiedMapState} from '../../hooks/useUnifiedMapState';

interface MapElement {
    type: 'component' | 'evolved-component' | 'link';
    id: string;
    name: string;
    properties: ComponentProperties | LinkProperties;
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

interface ContextMenuState {
    isOpen: boolean;
    position: {x: number; y: number};
    element: MapElement | string | number | null;
}

interface ContextMenuContextType {
    showContextMenu: (position: {x: number; y: number}, element: MapElement | string | number) => void;
    hideContextMenu: () => void;
    isContextMenuOpen: boolean;
}

export interface ContextMenuProviderProps {
    children: ReactNode;
    mapText: string;
    onDeleteComponent?: (componentId: string) => void;
    onEditComponent?: (componentId: string) => void;
    onToggleInertia?: (componentId: string) => void;
    onEvolveComponent?: (componentId: string) => void;
    wardleyMap?: any; // For accessing component data
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
    onEditComponent,
    onToggleInertia,
    onEvolveComponent,
    wardleyMap,
}) => {
    const [contextMenuState, setContextMenuState] = useState<ContextMenuState>(defaultContextMenuState);
    const {getSelectedComponentId, isSelected, clearSelection, selectComponent} = useComponentSelection();
    const {deleteComponent} = useMapComponentDeletion();

    // Enhanced component detection from map data
    const detectElementFromComponent = useCallback(
        (componentId: string): MapElement | null => {
            console.log('detectElementFromComponent called with:', componentId);
            console.log('wardleyMap:', wardleyMap);
            
            if (!wardleyMap) {
                console.warn('No wardleyMap provided to ContextMenuProvider');
                return null;
            }

            // Search in all components (regular and evolved)
            const allComponents = [...(wardleyMap.components || []), ...(wardleyMap.anchors || [])];
            console.log('All components:', allComponents.map(c => ({id: c.id, name: c.name, idType: typeof c.id})));
            console.log('Looking for componentId:', componentId, 'type:', typeof componentId);
            
            let component = allComponents.find(c => c.id === componentId);
            console.log('Found component:', component);
            
            // Try with string/number conversion if not found
            if (!component) {
                console.log('Trying with type conversion...');
                component = allComponents.find(c => String(c.id) === String(componentId));
                console.log('Found with string conversion:', component);
            }

            if (!component) {
                console.warn(`Component with id "${componentId}" not found in wardleyMap`);
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

            const mapElement = {
                type: component.evolved ? 'evolved-component' : 'component',
                id: component.id,
                name: component.name,
                properties,
            };

            return mapElement;
        },
        [wardleyMap],
    );

    const showContextMenu = useCallback(
        (position: {x: number; y: number}, element: MapElement | string | number) => {
            console.log('showContextMenu called with:', {position, element});
            
            // Handle backward compatibility with componentId string/number or direct MapElement
            let mapElement: MapElement | null = null;
            
            if (typeof element === 'string' || typeof element === 'number') {
                console.log('Element is string/number, detecting component...');
                mapElement = detectElementFromComponent(String(element));
            } else {
                console.log('Element is MapElement object');
                mapElement = element;
            }

            console.log('Final mapElement:', mapElement);

            if (!mapElement) {
                console.warn('Failed to detect mapElement, using fallback mode');
                // Fallback: store the original element (string/number) for backward compatibility
                setContextMenuState({
                    isOpen: true,
                    position,
                    element: element as any, // Store the original ID for fallback mode
                });
                return;
            }

            // Auto-select the component if not already selected
            if (mapElement.type === 'component' || mapElement.type === 'evolved-component') {
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

    const hideContextMenu = useCallback(() => {
        setContextMenuState(defaultContextMenuState);
    }, []);

    const handleDeleteComponent = useCallback(() => {
        const currentElement = contextMenuState.element;
        if (!currentElement || !mapText || (currentElement.type !== 'component' && currentElement.type !== 'evolved-component')) {
            console.warn('Cannot delete component: missing element or mapText');
            hideContextMenu();
            return;
        }

        try {
            if (onDeleteComponent) {
                onDeleteComponent(currentElement.id);
            } else {
                deleteComponent({
                    mapText,
                    componentId: currentElement.id,
                    componentName: currentElement.name,
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
        if (!currentElement || (currentElement.type !== 'component' && currentElement.type !== 'evolved-component')) {
            console.warn('Cannot edit: invalid element type');
            hideContextMenu();
            return;
        }

        try {
            if (onEditComponent) {
                onEditComponent(currentElement.id);
            }
        } catch (error) {
            console.error('Failed to start editing component:', error);
        }

        hideContextMenu();
    }, [contextMenuState.element, onEditComponent, hideContextMenu]);

    const handleToggleInertia = useCallback(() => {
        const currentElement = contextMenuState.element;
        if (!currentElement || (currentElement.type !== 'component' && currentElement.type !== 'evolved-component')) {
            console.warn('Cannot toggle inertia: invalid element type');
            hideContextMenu();
            return;
        }

        try {
            if (onToggleInertia) {
                onToggleInertia(currentElement.id);
            }
        } catch (error) {
            console.error('Failed to toggle component inertia:', error);
        }

        hideContextMenu();
    }, [contextMenuState.element, onToggleInertia, hideContextMenu]);

    const handleEvolveComponent = useCallback(() => {
        const currentElement = contextMenuState.element;
        if (!currentElement || currentElement.type !== 'component') {
            console.warn('Cannot evolve: invalid element type or already evolved');
            hideContextMenu();
            return;
        }

        try {
            if (onEvolveComponent) {
                onEvolveComponent(currentElement.id);
            }
        } catch (error) {
            console.error('Failed to evolve component:', error);
        }

        hideContextMenu();
    }, [contextMenuState.element, onEvolveComponent, hideContextMenu]);

    const getContextMenuItems = useCallback((): ContextMenuItem[] => {
        const currentElement = contextMenuState.element;
        if (!currentElement) return [];

        const items: ContextMenuItem[] = [];


        // Check if we have enhanced element data (MapElement object) or just an ID (string/number)
        if (typeof currentElement === 'object' && currentElement.type) {
            // Enhanced mode with full MapElement data
            if (currentElement.type === 'component' || currentElement.type === 'evolved-component') {
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
        handleEditComponent,
        handleToggleInertia,
        handleEvolveComponent,
        onEditComponent,
        onToggleInertia,
        onEvolveComponent,
        getSelectedComponentId,
    ]);

    const contextValue: ContextMenuContextType = {
        showContextMenu,
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
