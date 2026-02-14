import {useCallback} from 'react';
import {MapPropertiesManager} from '../../../services/MapPropertiesManager';
import {useComponentSelection} from '../../ComponentSelectionContext';
import {ContextMenuItem} from '../ContextMenu';
import {MapElement} from '../hooks/useContextMenuState';
import {MenuActions} from '../services/MenuActions';

// Icon components
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

interface UseMenuItemsProps {
    currentElement: MapElement | string | number | null;
    mapText: string;
    menuActions: MenuActions;
    hideContextMenu: () => void;
    availableHandlers: {
        onEditComponent?: boolean;
        onToggleInertia?: boolean;
        onEvolveComponent?: boolean;
        onDeleteLink?: boolean;
        onChangeMapStyle?: boolean;
        onSetMapSize?: boolean;
        onEditEvolutionStages?: boolean;
    };
}

interface ComponentProperties {
    name: string;
    inertia: boolean;
    evolved: boolean;
    maturity: number;
    visibility: number;
    method?: string;
}

export const useMenuItems = ({
    currentElement,
    mapText,
    menuActions,
    hideContextMenu,
    availableHandlers,
}: UseMenuItemsProps): ContextMenuItem[] => {
    const {getSelectedComponentId} = useComponentSelection();

    return useCallback((): ContextMenuItem[] => {
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
                    action: () => menuActions.handleDeleteComponent(currentElement, hideContextMenu),
                    disabled: false,
                    icon: DeleteIcon,
                    destructive: true,
                });
            } else if (currentElement.type === 'component' || currentElement.type === 'evolved-component') {
                const properties = currentElement.properties as ComponentProperties;

                // Edit Component - available for all components
                if (availableHandlers.onEditComponent) {
                    items.push({
                        id: 'edit',
                        label: 'Edit Component',
                        action: () => menuActions.handleEditComponent(currentElement, hideContextMenu),
                        disabled: false,
                        icon: EditIcon,
                    });
                }

                // Toggle Inertia - only for regular components (not evolved)
                if (availableHandlers.onToggleInertia && currentElement.type === 'component') {
                    const hasInertia = properties.inertia;
                    items.push({
                        id: 'toggle-inertia',
                        label: hasInertia ? 'Remove Inertia' : 'Add Inertia',
                        action: () => menuActions.handleToggleInertia(currentElement, hideContextMenu),
                        disabled: false,
                        icon: InertiaIcon,
                    });
                }

                // Evolve Component - only for regular (non-evolved) components
                if (availableHandlers.onEvolveComponent && currentElement.type === 'component' && !properties.evolved) {
                    items.push({
                        id: 'evolve',
                        label: 'Evolve Component',
                        action: () => menuActions.handleEvolveComponent(currentElement, hideContextMenu),
                        disabled: false,
                        icon: EvolveIcon,
                    });
                }

                // Delete Component - always available for components
                items.push({
                    id: 'delete',
                    label: 'Delete Component',
                    action: () => menuActions.handleDeleteComponent(currentElement, hideContextMenu),
                    disabled: false,
                    icon: DeleteIcon,
                    destructive: true,
                });
            } else if (currentElement.type === 'anchor') {
                // Anchor operations - Edit and Delete
                if (availableHandlers.onEditComponent) {
                    items.push({
                        id: 'edit',
                        label: 'Edit Anchor',
                        action: () => menuActions.handleEditComponent(currentElement, hideContextMenu),
                        disabled: false,
                        icon: EditIcon,
                    });
                }

                // Delete Anchor - always available for anchors
                items.push({
                    id: 'delete',
                    label: 'Delete Anchor',
                    action: () => menuActions.handleDeleteComponent(currentElement, hideContextMenu),
                    disabled: false,
                    icon: DeleteIcon,
                    destructive: true,
                });
            } else if (currentElement.type === 'link') {
                // Delete Link - available for all links
                if (availableHandlers.onDeleteLink) {
                    items.push({
                        id: 'delete-link',
                        label: 'Delete Link',
                        action: () => menuActions.handleDeleteLink(currentElement, hideContextMenu),
                        disabled: false,
                        icon: DeleteIcon,
                        destructive: true,
                    });
                }
            } else if (currentElement.type === 'canvas') {
                // Canvas context menu items
                const currentStyle = MapPropertiesManager.getCurrentStyle(mapText);

                // Style submenu items
                items.push({
                    id: 'style-plain',
                    label: `${currentStyle === 'plain' ? '✓ ' : ''}Plain`,
                    action: () => menuActions.handleChangeMapStyle('plain', hideContextMenu),
                    disabled: false,
                });

                items.push({
                    id: 'style-wardley',
                    label: `${currentStyle === 'wardley' ? '✓ ' : ''}Wardley`,
                    action: () => menuActions.handleChangeMapStyle('wardley', hideContextMenu),
                    disabled: false,
                });

                items.push({
                    id: 'style-colour',
                    label: `${currentStyle === 'colour' ? '✓ ' : ''}Colour`,
                    action: () => menuActions.handleChangeMapStyle('colour', hideContextMenu),
                    disabled: false,
                });

                // Separator (visual only)
                items.push({
                    id: 'separator-1',
                    label: '─────────────',
                    action: () => {},
                    disabled: true,
                });

                if (availableHandlers.onSetMapSize) {
                    items.push({
                        id: 'set-size',
                        label: 'Set Map Size',
                        action: () => menuActions.handleSetMapSize(hideContextMenu),
                        disabled: false,
                    });
                }

                if (availableHandlers.onEditEvolutionStages) {
                    items.push({
                        id: 'edit-evolution',
                        label: 'Edit Evolution Stages',
                        action: () => menuActions.handleEditEvolutionStages(hideContextMenu),
                        disabled: false,
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
                    action: () => menuActions.handleDeleteComponent(currentElement, hideContextMenu),
                    disabled: false,
                    icon: DeleteIcon,
                    destructive: true,
                });
            }
        }
        return items;
    }, [currentElement, mapText, menuActions, hideContextMenu, availableHandlers, getSelectedComponentId])();
};
