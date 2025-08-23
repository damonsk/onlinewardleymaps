import { useMapInteractionService } from '../../../hooks/useMapInteractionService';
import { ComponentOperations } from './useComponentOperations';

interface UseSelectionManagerProps {
    componentOps: ComponentOperations;
}

/**
 * Migration adapter for the existing useSelectionManager hook
 * Maintains backward compatibility while using the new SOLID architecture
 *
 * This provides the same API as the original useSelectionManager but delegates
 * to the new SOLID services internally.
 */
export const useSelectionManager = ({componentOps}: UseSelectionManagerProps) => {
    const mapInteractionService = useMapInteractionService({
        mapText: componentOps.mapText,
        mutateMapText: componentOps.mutateMapText,
        // TODO: Wire up undo/redo when available in componentOps
        // onUndo: componentOps.undo,
        // onRedo: componentOps.redo,
    });

    // Return the same interface as the original hook for backward compatibility
    return {
        selectComponent: mapInteractionService.selectComponent,
        selectLink: mapInteractionService.selectLink,
        clearSelection: mapInteractionService.clearSelection,
        getSelectedElement: mapInteractionService.getSelectedElement,
        getSelectedLink: mapInteractionService.getSelectedLink,
        isSelected: (elementId: string, elementType: 'component' | 'evolved-component' | 'link') => {
            // The new service uses a simpler isSelected that doesn't need the type
            return mapInteractionService.isSelected(elementId);
        },
    };
};
