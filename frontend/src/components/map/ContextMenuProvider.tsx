import React, {createContext, useContext, useState, useCallback, ReactNode} from 'react';
import {ContextMenu, ContextMenuItem} from './ContextMenu';
import {useComponentSelection} from '../ComponentSelectionContext';
import {useMapComponentDeletion} from '../../hooks/useMapComponentDeletion';

/**
 * Interface for context menu state
 */
interface ContextMenuState {
    isOpen: boolean;
    position: {x: number; y: number};
    componentId: string | null;
}

/**
 * Interface for context menu context
 */
interface ContextMenuContextType {
    showContextMenu: (position: {x: number; y: number}, componentId: string) => void;
    hideContextMenu: () => void;
    isContextMenuOpen: boolean;
}

/**
 * Props for the ContextMenuProvider
 */
export interface ContextMenuProviderProps {
    children: ReactNode;
    mapText: string;
    onDeleteComponent?: (componentId: string) => void;
}

/**
 * Default context menu state
 */
const defaultContextMenuState: ContextMenuState = {
    isOpen: false,
    position: {x: 0, y: 0},
    componentId: null,
};

/**
 * Context for context menu management
 */
const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

/**
 * Delete icon component for context menu
 */
const DeleteIcon: React.FC<{size?: number}> = ({size = 16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
);

/**
 * ContextMenuProvider component that manages context menu state and provides deletion functionality
 */
export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({children, mapText, onDeleteComponent}) => {
    const [contextMenuState, setContextMenuState] = useState<ContextMenuState>(defaultContextMenuState);
    const {getSelectedComponentId, isSelected, clearSelection} = useComponentSelection();
    const {deleteComponent, canDelete} = useMapComponentDeletion();

    /**
     * Show context menu at the specified position for the given component
     */
    const showContextMenu = useCallback((position: {x: number; y: number}, componentId: string) => {
        console.log('ContextMenuProvider showContextMenu called:', {position, componentId});
        setContextMenuState({
            isOpen: true,
            position,
            componentId,
        });
    }, []);

    /**
     * Hide the context menu
     */
    const hideContextMenu = useCallback(() => {
        setContextMenuState(defaultContextMenuState);
    }, []);

    /**
     * Handle component deletion from context menu
     */
    const handleDeleteComponent = useCallback(() => {
        const selectedComponentId = getSelectedComponentId();
        if (!selectedComponentId || !mapText) {
            console.warn('Cannot delete component: missing componentId or mapText');
            hideContextMenu();
            return;
        }

        if (!canDelete(selectedComponentId)) {
            console.warn('Component cannot be deleted:', selectedComponentId);
            hideContextMenu();
            return;
        }

        try {
            if (onDeleteComponent) {
                // Use the provided deletion handler (matches WysiwygToolbar pattern)
                onDeleteComponent(selectedComponentId);
            } else {
                // Fallback to direct deletion
                deleteComponent({
                    mapText,
                    componentId: selectedComponentId,
                    componentName: selectedComponentId,
                });
            }

            // Clear the selection after successful deletion
            clearSelection();
        } catch (error) {
            console.error('Failed to delete component:', error);
        }

        hideContextMenu();
    }, [getSelectedComponentId, mapText, canDelete, onDeleteComponent, deleteComponent, clearSelection, hideContextMenu]);

    /**
     * Generate context menu items based on the selected component
     */
    const getContextMenuItems = useCallback((): ContextMenuItem[] => {
        const selectedComponentId = getSelectedComponentId();
        const items: ContextMenuItem[] = [];

        console.log('Generating context menu items for:', selectedComponentId);
        console.log('Is selected:', selectedComponentId ? isSelected(selectedComponentId) : false);

        // Only show delete option if a component is selected and can be deleted
        if (selectedComponentId && isSelected(selectedComponentId)) {
            const canDeleteComponent = canDelete(selectedComponentId);
            console.log('Can delete component:', canDeleteComponent);

            items.push({
                id: 'delete',
                label: 'Delete',
                action: handleDeleteComponent,
                disabled: !canDeleteComponent,
                icon: DeleteIcon,
                destructive: true,
            });
        }

        console.log('Generated context menu items:', items);
        return items;
    }, [getSelectedComponentId, isSelected, canDelete, handleDeleteComponent]);

    /**
     * Context value
     */
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

/**
 * Hook to use the context menu
 */
export const useContextMenu = (): ContextMenuContextType => {
    const context = useContext(ContextMenuContext);
    if (context === undefined) {
        throw new Error('useContextMenu must be used within a ContextMenuProvider');
    }
    return context;
};

export default ContextMenuProvider;
