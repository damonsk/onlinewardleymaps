import {useEffect, useRef} from 'react';
import {SelectionManager, SelectableElement} from '../../../services/SelectionManager';
import {UnifiedComponent} from '../../../types/unified/components';
import {ComponentOperations} from './useComponentOperations';

interface UseSelectionManagerProps {
    componentOps: ComponentOperations;
}

export const useSelectionManager = ({componentOps}: UseSelectionManagerProps) => {
    const selectionManagerRef = useRef<SelectionManager | null>(null);

    useEffect(() => {
        const manager = new SelectionManager({
            onDeleteRequested: (element: SelectableElement) => {
                if (element.type === 'component' || element.type === 'evolved-component') {
                    componentOps.handleDeleteComponent(element.id, element.type, element.componentData);
                }
                manager.clearSelection();
            },
        });

        manager.attachKeyboardEvents();
        selectionManagerRef.current = manager;

        return () => {
            manager.destroy();
        };
    }, [componentOps]);

    const selectComponent = (component: UnifiedComponent) => {
        if (!selectionManagerRef.current) return;

        const element: SelectableElement = {
            id: component.id || component.name,
            type: component.evolved ? 'evolved-component' : 'component',
            name: component.name,
            componentData: component,
        };

        selectionManagerRef.current.selectElement(element);
    };

    const clearSelection = () => {
        selectionManagerRef.current?.clearSelection();
    };

    const getSelectedElement = () => {
        return selectionManagerRef.current?.getSelectedElement() || null;
    };

    const isSelected = (elementId: string, elementType: 'component' | 'evolved-component') => {
        return selectionManagerRef.current?.isSelected(elementId, elementType) || false;
    };

    return {
        selectComponent,
        clearSelection,
        getSelectedElement,
        isSelected,
    };
};
