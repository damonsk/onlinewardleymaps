import {useCallback, useState} from 'react';
import {ToolbarItem} from '../../../types/toolbar';
import {PST_SUB_ITEMS} from '../../../constants/toolbarItems';

/**
 * Custom hook to manage toolbar state and validation
 * Extracted from MapView to reduce complexity
 */
export const useToolbarState = () => {
    const [selectedToolbarItem, setSelectedToolbarItem] = useState<ToolbarItem | null>(null);
    const [isValidDropZone, setIsValidDropZone] = useState(false);

    // Enhanced toolbar item selection with automatic PST sub-item handling
    const handleToolbarItemSelect = useCallback((item: ToolbarItem | null) => {
        console.log('Toolbar item selection changed:', item?.id || 'none');

        // Special handling for PST tool - default to Pioneer if no sub-item is selected
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
    }, []);

    return {
        selectedToolbarItem,
        setSelectedToolbarItem,
        isValidDropZone,
        setIsValidDropZone,
        handleToolbarItemSelect,
    };
};
