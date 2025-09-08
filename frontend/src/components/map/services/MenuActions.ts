import {useMapComponentDeletion} from '../../../hooks/useMapComponentDeletion';
import {useComponentSelection} from '../../ComponentSelectionContext';
import {MapElement} from '../hooks/useContextMenuState';

interface MenuActionsConfig {
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
    onChangeMapStyle?: (style: 'plain' | 'wardley' | 'colour') => void;
    onSetMapSize?: () => void;
    onEditEvolutionStages?: () => void;
}

export class MenuActions {
    private config: MenuActionsConfig;
    private deleteComponent: ReturnType<typeof useMapComponentDeletion>['deleteComponent'];
    private clearSelection: ReturnType<typeof useComponentSelection>['clearSelection'];

    constructor(
        config: MenuActionsConfig,
        deleteComponent: ReturnType<typeof useMapComponentDeletion>['deleteComponent'],
        clearSelection: ReturnType<typeof useComponentSelection>['clearSelection'],
    ) {
        this.config = config;
        this.deleteComponent = deleteComponent;
        this.clearSelection = clearSelection;
    }

    handleDeleteComponent = (currentElement: MapElement | string | number | null, hideContextMenu: () => void) => {
        if (
            !currentElement ||
            !this.config.mapText ||
            (typeof currentElement === 'object' &&
                currentElement.type !== 'component' &&
                currentElement.type !== 'evolved-component' &&
                currentElement.type !== 'pst-element' &&
                currentElement.type !== 'anchor')
        ) {
            console.warn('Cannot delete component: missing element or mapText');
            hideContextMenu();
            return;
        }

        try {
            if (this.config.onDeleteComponent) {
                const componentId = typeof currentElement === 'object' ? currentElement.id : currentElement;
                const componentType =
                    typeof currentElement === 'object' &&
                    (currentElement.type === 'component' ||
                        currentElement.type === 'evolved-component' ||
                        currentElement.type === 'pst-element' ||
                        currentElement.type === 'anchor')
                        ? currentElement.type
                        : undefined;
                const componentData = typeof currentElement === 'object' ? currentElement.componentData : undefined;
                this.config.onDeleteComponent(String(componentId), componentType, componentData);
            } else {
                const componentId = typeof currentElement === 'object' ? currentElement.id : currentElement;
                const componentName = typeof currentElement === 'object' ? currentElement.name : String(currentElement);
                const componentType = typeof currentElement === 'object' ? currentElement.type : undefined;
                this.deleteComponent({
                    mapText: this.config.mapText,
                    componentId: String(componentId),
                    componentName,
                    componentType:
                        componentType === 'evolved-component' ? 'evolved-component' : 
                        componentType === 'pst-element' ? 'pst' : 
                        componentType === 'anchor' ? 'anchor' : 'component',
                });
            }

            this.clearSelection();
        } catch (error) {
            console.error('Failed to delete component:', error);
        }

        hideContextMenu();
    };

    handleEditComponent = (currentElement: MapElement | string | number | null, hideContextMenu: () => void) => {
        if (!currentElement) {
            console.warn('Cannot edit: no element selected');
            hideContextMenu();
            return;
        }

        // For backward compatibility, allow string/number IDs
        // Only check type restriction if we have a MapElement object
        if (typeof currentElement === 'object' && 
            currentElement.type !== 'component' && 
            currentElement.type !== 'evolved-component' &&
            currentElement.type !== 'anchor') {
            console.warn('Cannot edit: invalid element type');
            hideContextMenu();
            return;
        }

        try {
            if (this.config.onEditComponent) {
                let componentId = typeof currentElement === 'object' ? currentElement.id : currentElement;

                // For evolved components, use the evolved component ID directly
                // The useComponentOperations.handleEditComponent now handles evolved components properly
                // by detecting the _evolved suffix and calling startEditing with the full evolved ID

                this.config.onEditComponent(String(componentId));
            }
        } catch (error) {
            console.error('Failed to start editing component:', error);
        }

        hideContextMenu();
    };

    handleToggleInertia = (currentElement: MapElement | string | number | null, hideContextMenu: () => void) => {
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
            if (this.config.onToggleInertia) {
                const componentId = typeof currentElement === 'object' ? currentElement.id : currentElement;
                this.config.onToggleInertia(String(componentId));
            }
        } catch (error) {
            console.error('Failed to toggle component inertia:', error);
        }

        hideContextMenu();
    };

    handleEvolveComponent = (currentElement: MapElement | string | number | null, hideContextMenu: () => void) => {
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
            if (this.config.onEvolveComponent) {
                const componentId = typeof currentElement === 'object' ? currentElement.id : currentElement;
                this.config.onEvolveComponent(String(componentId));
            }
        } catch (error) {
            console.error('Failed to evolve component:', error);
        }

        hideContextMenu();
    };

    handleDeleteLink = (currentElement: MapElement | string | number | null, hideContextMenu: () => void) => {
        console.log('MenuActions: handleDeleteLink called', {
            currentElement,
            elementType: typeof currentElement,
            isValidElement: currentElement && typeof currentElement === 'object' && currentElement.type === 'link',
            hasOnDeleteLink: !!this.config.onDeleteLink,
            linkData: currentElement && typeof currentElement === 'object' ? currentElement.linkData : null,
        });

        if (!currentElement || typeof currentElement !== 'object' || currentElement.type !== 'link') {
            console.warn('Cannot delete link: invalid element type');
            hideContextMenu();
            return;
        }

        try {
            if (this.config.onDeleteLink && currentElement.linkData) {
                console.log('MenuActions: calling onDeleteLink with:', currentElement.linkData);
                this.config.onDeleteLink(currentElement.linkData);
                console.log('MenuActions: onDeleteLink completed');
            } else {
                console.warn('MenuActions: onDeleteLink or linkData missing', {
                    hasOnDeleteLink: !!this.config.onDeleteLink,
                    hasLinkData: !!currentElement.linkData,
                });
            }
        } catch (error) {
            console.error('Failed to delete link:', error);
        }

        hideContextMenu();
    };

    handleChangeMapStyle = (style: 'plain' | 'wardley' | 'colour', hideContextMenu: () => void) => {
        if (!this.config.onChangeMapStyle) {
            console.warn('onChangeMapStyle handler not provided');
            hideContextMenu();
            return;
        }

        try {
            this.config.onChangeMapStyle(style);
        } catch (error) {
            console.error('Failed to change map style:', error);
        }

        hideContextMenu();
    };

    handleSetMapSize = (hideContextMenu: () => void) => {
        if (!this.config.onSetMapSize) {
            console.warn('onSetMapSize handler not provided');
            hideContextMenu();
            return;
        }

        try {
            this.config.onSetMapSize();
        } catch (error) {
            console.error('Failed to open map size dialog:', error);
        }

        hideContextMenu();
    };

    handleEditEvolutionStages = (hideContextMenu: () => void) => {
        if (!this.config.onEditEvolutionStages) {
            console.warn('onEditEvolutionStages handler not provided');
            hideContextMenu();
            return;
        }

        try {
            this.config.onEditEvolutionStages();
        } catch (error) {
            console.error('Failed to open evolution stages dialog:', error);
        }

        hideContextMenu();
    };

    // Update configuration (useful when props change)
    updateConfig = (newConfig: MenuActionsConfig) => {
        this.config = newConfig;
    };
}
