import React, {createContext, useContext, useState, ReactNode, useCallback, useEffect} from 'react';

interface EditingState {
    isEditing: boolean;
    editingElementId: string | null;
    editingElementType: 'component' | 'note' | 'anchor' | null;
}

interface EditingContextType {
    editingState: EditingState;
    startEditing: (elementId: string, elementType: 'component' | 'note' | 'anchor') => void;
    stopEditing: () => void;
    isAnyElementEditing: () => boolean;
    isElementEditing: (elementId: string) => boolean;
}

const defaultEditingState: EditingState = {
    isEditing: false,
    editingElementId: null,
    editingElementType: null,
};

const EditingContext = createContext<EditingContextType | undefined>(undefined);

export interface EditingProviderProps {
    children: ReactNode;
}

export const EditingProvider: React.FC<EditingProviderProps> = ({children}) => {
    const [editingState, setEditingState] = useState<EditingState>(defaultEditingState);

    const startEditing = useCallback((elementId: string, elementType: 'component' | 'note' | 'anchor') => {
        setEditingState({
            isEditing: true,
            editingElementId: elementId,
            editingElementType: elementType,
        });
    }, []);

    const stopEditing = useCallback(() => {
        setEditingState(defaultEditingState);
    }, []);

    const isAnyElementEditing = useCallback(() => {
        return editingState.isEditing;
    }, [editingState.isEditing]);

    const isElementEditing = useCallback(
        (elementId: string) => {
            return editingState.isEditing && editingState.editingElementId === elementId;
        },
        [editingState.isEditing, editingState.editingElementId],
    );

    const contextValue: EditingContextType = {
        editingState,
        startEditing,
        stopEditing,
        isAnyElementEditing,
        isElementEditing,
    };

    return <EditingContext.Provider value={contextValue}>{children}</EditingContext.Provider>;
};

export const useEditing = (): EditingContextType => {
    const context = useContext(EditingContext);
    if (context === undefined) {
        throw new Error('useEditing must be used within an EditingProvider');
    }
    return context;
};

export default EditingContext;
