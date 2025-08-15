import {useCallback} from 'react';
import {useComponentSelection} from '../components/ComponentSelectionContext';
import {UnifiedComponent} from '../types/unified/components';
import {UseMapStateResult} from './useUnifiedMapState';

export interface MapComponentSelector {
    selectedComponentId: string | null;
    selectComponent: (componentId: string) => void;
    clearSelection: () => void;
    isSelected: (componentId: string) => boolean;
    getSelectedComponent: () => UnifiedComponent | null;
    canSelectComponent: (componentId: string) => boolean;
}

export const useMapComponentSelector = (mapState: UseMapStateResult): MapComponentSelector => {
    const {selectComponent, clearSelection, isSelected, getSelectedComponentId} = useComponentSelection();
    const {getAllComponents, findComponentByName} = mapState;

    const getSelectedComponent = useCallback((): UnifiedComponent | null => {
        const selectedId = getSelectedComponentId();
        if (!selectedId) {
            return null;
        }

        // Try to find by ID first, then by name as fallback
        const allComponents = getAllComponents();
        const componentById = allComponents.find(c => c.id === selectedId);
        if (componentById) {
            return componentById;
        }

        // Fallback to finding by name (for backward compatibility)
        return findComponentByName(selectedId) || null;
    }, [getSelectedComponentId, getAllComponents, findComponentByName]);

    const canSelectComponent = useCallback(
        (componentId: string): boolean => {
            // Check if the component exists in the map
            const allComponents = getAllComponents();
            const component = allComponents.find(c => c.id === componentId || c.name === componentId);
            return component !== undefined;
        },
        [getAllComponents],
    );

    const selectComponentWithValidation = useCallback(
        (componentId: string) => {
            if (canSelectComponent(componentId)) {
                selectComponent(componentId);
            }
        },
        [canSelectComponent, selectComponent],
    );

    return {
        selectedComponentId: getSelectedComponentId(),
        selectComponent: selectComponentWithValidation,
        clearSelection,
        isSelected,
        getSelectedComponent,
        canSelectComponent,
    };
};
