import React, {createContext, useContext, useState, ReactNode, useCallback} from 'react';
import {UnifiedComponent} from '../types/unified/components';

interface SelectionState {
    selectedComponentId: string | null;
}

interface ComponentSelectionContextType {
    selectionState: SelectionState;
    selectComponent: (componentId: string) => void;
    clearSelection: () => void;
    isSelected: (componentId: string) => boolean;
    getSelectedComponentId: () => string | null;
}

const defaultSelectionState: SelectionState = {
    selectedComponentId: null,
};

const ComponentSelectionContext = createContext<ComponentSelectionContextType | undefined>(undefined);

export interface ComponentSelectionProviderProps {
    children: ReactNode;
}

export const ComponentSelectionProvider: React.FC<ComponentSelectionProviderProps> = ({children}) => {
    const [selectionState, setSelectionState] = useState<SelectionState>(defaultSelectionState);

    const selectComponent = useCallback((componentId: string) => {
        setSelectionState({
            selectedComponentId: componentId,
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectionState(defaultSelectionState);
    }, []);

    const isSelected = useCallback(
        (componentId: string) => {
            return selectionState.selectedComponentId === componentId;
        },
        [selectionState.selectedComponentId],
    );

    const getSelectedComponentId = useCallback(() => {
        return selectionState.selectedComponentId;
    }, [selectionState.selectedComponentId]);

    const contextValue: ComponentSelectionContextType = {
        selectionState,
        selectComponent,
        clearSelection,
        isSelected,
        getSelectedComponentId,
    };

    return <ComponentSelectionContext.Provider value={contextValue}>{children}</ComponentSelectionContext.Provider>;
};

export const useComponentSelection = (): ComponentSelectionContextType => {
    const context = useContext(ComponentSelectionContext);
    if (context === undefined) {
        throw new Error('useComponentSelection must be used within a ComponentSelectionProvider');
    }
    return context;
};

export default ComponentSelectionContext;
