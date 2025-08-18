import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import {useMapComponentDeletion} from '../../hooks/useMapComponentDeletion';
import {useComponentSelection} from '../ComponentSelectionContext';
import {ContextMenu, ContextMenuItem} from './ContextMenu';

interface ContextMenuState {
    isOpen: boolean;
    position: {x: number; y: number};
    componentId: string | null;
}

interface ContextMenuContextType {
    showContextMenu: (position: {x: number; y: number}, componentId: string) => void;
    hideContextMenu: () => void;
    isContextMenuOpen: boolean;
}

export interface ContextMenuProviderProps {
    children: ReactNode;
    mapText: string;
    onDeleteComponent?: (componentId: string) => void;
}

const defaultContextMenuState: ContextMenuState = {
    isOpen: false,
    position: {x: 0, y: 0},
    componentId: null,
};

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

const DeleteIcon: React.FC<{size?: number}> = ({size = 16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
);

export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({children, mapText, onDeleteComponent}) => {
    const [contextMenuState, setContextMenuState] = useState<ContextMenuState>(defaultContextMenuState);
    const {getSelectedComponentId, isSelected, clearSelection} = useComponentSelection();
    const {deleteComponent} = useMapComponentDeletion();

    const showContextMenu = useCallback((position: {x: number; y: number}, componentId: string) => {
        console.log('ContextMenuProvider showContextMenu called:', {position, componentId});
        setContextMenuState({
            isOpen: true,
            position,
            componentId,
        });
    }, []);

    const hideContextMenu = useCallback(() => {
        setContextMenuState(defaultContextMenuState);
    }, []);

    const handleDeleteComponent = useCallback(() => {
        const selectedComponentId = getSelectedComponentId();
        if (!selectedComponentId || !mapText) {
            console.warn('Cannot delete component: missing componentId or mapText');
            hideContextMenu();
            return;
        }

        try {
            if (onDeleteComponent) {
                onDeleteComponent(selectedComponentId);
            } else {
                deleteComponent({
                    mapText,
                    componentId: selectedComponentId,
                    componentName: selectedComponentId,
                });
            }

            clearSelection();
        } catch (error) {
            console.error('Failed to delete component:', error);
        }

        hideContextMenu();
    }, [getSelectedComponentId, mapText, onDeleteComponent, deleteComponent, clearSelection, hideContextMenu]);

    const getContextMenuItems = useCallback((): ContextMenuItem[] => {
        const selectedComponentId = getSelectedComponentId();
        const items: ContextMenuItem[] = [];

        console.log('Generating context menu items for:', selectedComponentId);
        console.log('Is selected:', selectedComponentId ? isSelected(selectedComponentId) : false);

        if (selectedComponentId && isSelected(selectedComponentId)) {
            items.push({
                id: 'delete',
                label: 'Delete',
                action: handleDeleteComponent,
                disabled: false,
                icon: DeleteIcon,
                destructive: true,
            });
        }

        console.log('Generated context menu items:', items);
        return items;
    }, [getSelectedComponentId, isSelected, handleDeleteComponent]);

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
