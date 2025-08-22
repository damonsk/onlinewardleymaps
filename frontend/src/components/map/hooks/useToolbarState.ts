import {useCallback, useState} from 'react';
import {PST_SUB_ITEMS} from '../../../constants/toolbarItems';
import {ToolbarItem} from '../../../types/toolbar';

export interface ToolbarState {
    selectedToolbarItem: ToolbarItem | null;
    isValidDropZone: boolean;
    methodHighlightedComponent: any; // UnifiedComponent | null
}

export interface ToolbarActions {
    setSelectedToolbarItem: (item: ToolbarItem | null) => void;
    setIsValidDropZone: (isValid: boolean) => void;
    setMethodHighlightedComponent: (component: any) => void;
    handleToolbarItemSelect: (item: ToolbarItem | null) => void;
}

export interface ToolbarStateDependencies {
    onLinkingModeStart?: () => void;
    onDrawingModeStart?: (item: ToolbarItem) => void;
    onMethodApplicationModeStart?: (item: ToolbarItem) => void;
    onModeReset?: () => void;
    showUserFeedback?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const useToolbarState = (dependencies?: ToolbarStateDependencies): ToolbarState & ToolbarActions => {
    const [selectedToolbarItem, setSelectedToolbarItem] = useState<ToolbarItem | null>(null);
    const [isValidDropZone, setIsValidDropZone] = useState(false);
    const [methodHighlightedComponent, setMethodHighlightedComponent] = useState<any>(null);

    const handleToolbarItemSelect = useCallback(
        (item: ToolbarItem | null) => {
            console.log('Toolbar item selection changed:', item?.id || 'none');

            // Handle PST tool default selection
            let finalItem = item;
            if (item?.id === 'pst' && !item.selectedSubItem && item.subItems) {
                const pioneerSubItem = PST_SUB_ITEMS.find(subItem => subItem.id === 'pioneers');
                if (pioneerSubItem) {
                    finalItem = {
                        ...item,
                        selectedSubItem: pioneerSubItem,
                    };
                    console.log('Auto-selected Pioneer for PST tool via keyboard shortcut');
                }
            }

            setSelectedToolbarItem(finalItem);

            // Reset drop zone validation when selection changes
            if (!item) {
                setIsValidDropZone(false);
            }

            // Handle different tool types with proper state coordination
            if (item?.toolType === 'linking') {
                dependencies?.onLinkingModeStart?.();
                dependencies?.showUserFeedback?.('Hover & click components to link', 'info');
            } else if (item?.toolType === 'drawing') {
                dependencies?.onDrawingModeStart?.(item);
                if (item.selectedSubItem) {
                    dependencies?.showUserFeedback?.(`Click and drag to draw ${item.selectedSubItem.label} box`, 'info');
                } else {
                    dependencies?.showUserFeedback?.('Select a PST type from the dropdown first', 'warning');
                }
            } else if (item?.toolType === 'method-application') {
                dependencies?.onMethodApplicationModeStart?.(item);
                const methodName = item.methodName || 'method';
                dependencies?.showUserFeedback?.(`Hover over components to apply ${methodName} method`, 'info');
            } else {
                // Reset all tool states when switching to other tools or deselecting
                dependencies?.onModeReset?.();
            }

            console.log('Toolbar item processed:', finalItem?.id || 'none', 'with toolType:', finalItem?.toolType || 'none');
        },
        [dependencies],
    );

    return {
        selectedToolbarItem,
        isValidDropZone,
        methodHighlightedComponent,
        setSelectedToolbarItem,
        setIsValidDropZone,
        setMethodHighlightedComponent,
        handleToolbarItemSelect,
    };
};
