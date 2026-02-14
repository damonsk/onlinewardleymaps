import {useCallback, useEffect, useMemo, useRef} from 'react';
import {useSelectionService} from '../hooks/useSelectionService';
import {DeletionService} from '../services/deletion/DeletionService';
import {DeletionContext, IDeletionObserver, IDeletionService} from '../services/deletion/IDeletionService';
import {IKeyboardActionHandlers, KeyboardEventCoordinator} from '../services/keyboard/KeyboardEventCoordinator';
import {SelectableElement} from '../services/selection/SelectionTypes';

interface UseMapInteractionServiceProps {
    mapText: string;
    mutateMapText: (newText: string, actionType?: string, description?: string) => void;
    onToolSelect?: (toolId: string | null) => void;
    onUndo?: () => void;
    onRedo?: () => void;
}

/**
 * High-level hook that coordinates all map interaction services
 * Single Responsibility: Only orchestrates services
 * Dependency Inversion: Depends on abstractions, not concrete implementations
 */
export const useMapInteractionService = ({mapText, mutateMapText, onToolSelect, onUndo, onRedo}: UseMapInteractionServiceProps) => {
    const selectionService = useSelectionService();
    const deletionServiceRef = useRef<IDeletionService>(new DeletionService());

    // Observer for deletion events to clear selection after successful deletion
    const deletionObserver = useRef<IDeletionObserver>({
        onDeletionStarted: (element: SelectableElement) => {
            console.log(`Starting deletion of ${element.type}: ${element.name}`);
        },
        onDeletionCompleted: (element: SelectableElement, result) => {
            console.log(`Successfully deleted ${element.type}: ${element.name}`);
            selectionService.clearSelection();
        },
        onDeletionFailed: (element: SelectableElement, error: string) => {
            console.error(`Failed to delete ${element.type} ${element.name}:`, error);
        },
    });

    // Setup deletion observer
    useEffect(() => {
        const service = deletionServiceRef.current as DeletionService;
        service.addObserver(deletionObserver.current);

        return () => {
            const currentService = deletionServiceRef.current as DeletionService;
            const observer = deletionObserver.current;
            if (observer && currentService) {
                currentService.removeObserver(observer);
            }
        };
    }, []);

    // Handle deletion action
    const handleDelete = useCallback(async () => {
        const selectedElement = selectionService.getSelectedElement();
        if (!selectedElement) {
            console.log('No element selected for deletion');
            return;
        }

        const deletionContext: DeletionContext = {
            mapText,
            mutateMapText,
        };

        await deletionServiceRef.current.delete(selectedElement, deletionContext);
    }, [selectionService, mapText, mutateMapText]);

    // Keyboard action handlers
    const keyboardHandlers = useMemo<IKeyboardActionHandlers>(() => ({
        onDelete: handleDelete,
        onEscape: () => {
            selectionService.clearSelection();
            onToolSelect?.(null);
        },
        onUndo,
        onRedo,
        onToolSelect,
    }), [handleDelete, selectionService, onUndo, onRedo, onToolSelect]);

    // Setup keyboard event coordination
    const keyboardCoordinator = useRef(new KeyboardEventCoordinator(keyboardHandlers));

    // Update keyboard handlers when dependencies change
    useEffect(() => {
        keyboardCoordinator.current.updateHandlers(keyboardHandlers);
    }, [handleDelete, onToolSelect, onUndo, onRedo, selectionService, keyboardHandlers]);

    // Global keyboard event listener
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Skip if focus is on input elements
            const activeElement = document.activeElement;
            if (
                activeElement instanceof HTMLInputElement ||
                activeElement instanceof HTMLTextAreaElement ||
                (activeElement instanceof HTMLElement && activeElement.contentEditable === 'true')
            ) {
                return;
            }

            keyboardCoordinator.current.handleKeyDown(event);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return {
        // Selection operations
        selectComponent: selectionService.selectComponent,
        selectLink: selectionService.selectLink,
        clearSelection: selectionService.clearSelection,
        isSelected: selectionService.isSelected,
        getSelectedElement: selectionService.getSelectedElement,
        getSelectedLink: selectionService.getSelectedLink,
        getSelectedComponent: selectionService.getSelectedComponent,

        // Deletion operations
        canDelete: (element: SelectableElement) => deletionServiceRef.current.canDelete(element),
        deleteElement: handleDelete,
    };
};
