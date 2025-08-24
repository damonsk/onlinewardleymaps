import {useCallback, useState} from 'react';
import {ToolbarItem} from '../../../types/toolbar';
import {UnifiedComponent} from '../../../types/unified';

/**
 * Types for toolbar item state management
 */
export interface ToolbarState {
    selectedToolbarItem: ToolbarItem | null;
    isValidDropZone: boolean;
    methodHighlightedComponent?: UnifiedComponent | null;
}

export interface ToolbarActions {
    setSelectedToolbarItem: (item: ToolbarItem | null) => void;
    setIsValidDropZone: (isValid: boolean) => void;
    setMethodHighlightedComponent?: (component: UnifiedComponent | null) => void;
}

export interface UseToolbarItemStateReturn extends ToolbarState, ToolbarActions {}

/**
 * Hook to manage toolbar item selection and related state
 * This handles which tool is currently selected and drag/drop validation
 */
export const useToolbarItemState = (): UseToolbarItemStateReturn => {
    const [selectedToolbarItem, setSelectedToolbarItem] = useState<ToolbarItem | null>(null);
    const [isValidDropZone, setIsValidDropZone] = useState<boolean>(false);
    const [methodHighlightedComponent, setMethodHighlightedComponent] = useState<UnifiedComponent | null>(null);

    const handleSetSelectedToolbarItem = useCallback((item: ToolbarItem | null) => {
        setSelectedToolbarItem(item);
        // Reset validation state when changing tools
        if (!item) {
            setIsValidDropZone(false);
            setMethodHighlightedComponent(null);
        }
    }, []);

    const handleSetIsValidDropZone = useCallback((isValid: boolean) => {
        setIsValidDropZone(isValid);
    }, []);

    const handleSetMethodHighlightedComponent = useCallback((component: UnifiedComponent | null) => {
        setMethodHighlightedComponent(component);
    }, []);

    return {
        selectedToolbarItem,
        isValidDropZone,
        methodHighlightedComponent,
        setSelectedToolbarItem: handleSetSelectedToolbarItem,
        setIsValidDropZone: handleSetIsValidDropZone,
        setMethodHighlightedComponent: handleSetMethodHighlightedComponent,
    };
};