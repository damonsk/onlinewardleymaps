import { useEffect, useRef, useState } from 'react';
import { SelectableElement, SelectionManager } from '../../../services/SelectionManager';
import { UnifiedComponent } from '../../../types/unified/components';
import { ComponentOperations } from './useComponentOperations';

interface UseSelectionManagerProps {
    componentOps: ComponentOperations;
}

export const useSelectionManager = ({componentOps}: UseSelectionManagerProps) => {
    const selectionManagerRef = useRef<SelectionManager | null>(null);
    // State to force re-renders when selection changes
    const [selectionVersion, setSelectionVersion] = useState(0);

    const triggerSelectionUpdate = () => {
        setSelectionVersion(prev => prev + 1);
    };

    useEffect(() => {
        const manager = new SelectionManager({
            onDeleteRequested: (element: SelectableElement) => {
                console.log('SelectionManager: onDeleteRequested called, but deferring to KeyboardShortcutHandler');
                // Don't handle deletion here - let KeyboardShortcutHandler coordinate the deletion
                // and clear selection after successful deletion
            },
        });

        // Don't attach keyboard events - let KeyboardShortcutHandler handle all keyboard interactions
        // manager.attachKeyboardEvents();
        selectionManagerRef.current = manager;

        return () => {
            manager.destroy();
        };
    }, []); // Empty dependency array to prevent recreation

    const selectComponent = (component: UnifiedComponent) => {
        if (!selectionManagerRef.current) return;

        const element: SelectableElement = {
            id: String(component.id || component.name),
            type: component.evolved ? 'evolved-component' : 'component',
            name: component.name,
            componentData: component,
        };

        selectionManagerRef.current.selectElement(element);
        triggerSelectionUpdate(); // Trigger React re-render
    };

    const clearSelection = () => {
        selectionManagerRef.current?.clearSelection();
        triggerSelectionUpdate(); // Trigger React re-render
    };

    const getSelectedElement = () => {
        return selectionManagerRef.current?.getSelectedElement() || null;
    };

    const selectLink = (linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number}) => {
        if (!selectionManagerRef.current) return;

        const linkId = `${linkInfo.start}->${linkInfo.end}`;
        console.log('useSelectionManager: selectLink called', {linkId, linkInfo});
        const element: SelectableElement = {
            id: linkId,
            type: 'link',
            name: `${linkInfo.start} → ${linkInfo.end}`,
            linkData: linkInfo,
        };

        selectionManagerRef.current.selectElement(element);
        triggerSelectionUpdate(); // Trigger React re-render
        console.log('useSelectionManager: link selected', element);
    };

    const isSelected = (elementId: string, elementType: 'component' | 'evolved-component' | 'link') => {
        const result = selectionManagerRef.current?.isSelected(elementId, elementType) || false;
        return result;
    };

    const getSelectedLink = () => {
        const selectedElement = selectionManagerRef.current?.getSelectedElement();
        console.log('useSelectionManager: getSelectedLink called', {
            selectedElement,
            hasSelectionManager: !!selectionManagerRef.current,
            elementType: selectedElement?.type,
            hasLinkData: !!selectedElement?.linkData,
        });

        if (!selectedElement || selectedElement.type !== 'link' || !selectedElement.linkData) {
            console.log('useSelectionManager: getSelectedLink returning null - conditions not met');
            return null;
        }

        const result = {
            id: selectedElement.id,
            linkData: selectedElement.linkData,
        };
        console.log('useSelectionManager: getSelectedLink returning:', result);
        return result;
    };

    return {
        selectComponent,
        selectLink,
        clearSelection,
        getSelectedElement,
        getSelectedLink,
        isSelected,
    };
};
