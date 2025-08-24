import React, {createContext, ReactNode, useCallback, useContext, useMemo} from 'react';
import {useMapComponentDeletion} from '../../hooks/useMapComponentDeletion';
import {useComponentSelection} from '../ComponentSelectionContext';
import {ContextMenu} from './ContextMenu';
import {useMenuItems} from './components/MenuItems';
import {MapElement, useContextMenuState} from './hooks/useContextMenuState';
import {MenuActions} from './services/MenuActions';



interface ContextMenuContextType {
    showContextMenu: (position: {x: number; y: number}, element: MapElement | string | number) => void;
    showLinkContextMenu: (
        position: {x: number; y: number},
        linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number},
    ) => void;
    showCanvasContextMenu: (position: {x: number; y: number}) => void;
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
    onChangeMapStyle?: (style: 'plain' | 'wardley' | 'colour') => void;
    onSetMapSize?: () => void;
    onEditEvolutionStages?: () => void;
    wardleyMap?: any; // For accessing component data
    selectionManager?: {getSelectedElement: () => any; getSelectedLink: () => any}; // For accessing link selections
    onContextMenuReady?: (contextMenuActions: {
        showLinkContextMenu: (
            position: {x: number; y: number},
            linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number},
        ) => void;
        showCanvasContextMenu: (position: {x: number; y: number}) => void;
    }) => void;
}



const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({
    children,
    mapText,
    onDeleteComponent,
    onDeleteLink,
    onEditComponent,
    onToggleInertia,
    onEvolveComponent,
    onChangeMapStyle,
    onSetMapSize,
    onEditEvolutionStages,
    wardleyMap,
    selectionManager,
    onContextMenuReady,
}) => {
    const {clearSelection} = useComponentSelection();
    const {deleteComponent} = useMapComponentDeletion();

    // Context menu state management
    const {
        contextMenuState,
        showContextMenu,
        showLinkContextMenu,
        showCanvasContextMenu,
        hideContextMenu,
    } = useContextMenuState({
        mapText,
        wardleyMap,
        onContextMenuReady,
    });

    // Menu actions service
    const menuActions = useMemo(() => {
        const config = {
            mapText,
            onDeleteComponent,
            onDeleteLink,
            onEditComponent,
            onToggleInertia,
            onEvolveComponent,
            onChangeMapStyle,
            onSetMapSize,
            onEditEvolutionStages,
        };
        return new MenuActions(config, deleteComponent, clearSelection);
    }, [
        mapText,
        onDeleteComponent,
        onDeleteLink,
        onEditComponent,
        onToggleInertia,
        onEvolveComponent,
        onChangeMapStyle,
        onSetMapSize,
        onEditEvolutionStages,
        deleteComponent,
        clearSelection,
    ]);

    // Available handlers for menu item generation
    const availableHandlers = {
        onEditComponent: !!onEditComponent,
        onToggleInertia: !!onToggleInertia,
        onEvolveComponent: !!onEvolveComponent,
        onDeleteLink: !!onDeleteLink,
        onChangeMapStyle: !!onChangeMapStyle,
        onSetMapSize: !!onSetMapSize,
        onEditEvolutionStages: !!onEditEvolutionStages,
    };

    // Generate menu items
    const menuItems = useMenuItems({
        currentElement: contextMenuState.element,
        mapText,
        menuActions,
        hideContextMenu,
        availableHandlers,
    });

    const contextValue: ContextMenuContextType = {
        showContextMenu,
        showLinkContextMenu,
        showCanvasContextMenu,
        hideContextMenu,
        isContextMenuOpen: contextMenuState.isOpen,
    };

    return (
        <ContextMenuContext.Provider value={contextValue}>
            {children}
            <ContextMenu
                items={menuItems}
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
