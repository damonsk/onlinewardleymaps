/**
 * Hook for map component deletion with undo/redo integration
 */

import {useCallback} from 'react';
import {useUndoRedo} from '../components/UndoRedoProvider';
import {UndoRedoMapComponentDeleter, UndoRedoDeletionParams} from '../services/UndoRedoMapComponentDeleter';

/**
 * Interface for the deletion hook result
 */
export interface UseMapComponentDeletionResult {
    deleteComponent: (params: UndoRedoDeletionParams) => void;
    canDelete: (componentId: string, componentType?: string) => boolean;
}

/**
 * Hook that provides component deletion functionality with undo/redo integration
 */
export const useMapComponentDeletion = (
    deleter?: UndoRedoMapComponentDeleter,
): UseMapComponentDeletionResult => {
    const undoRedoContext = useUndoRedo();
    const componentDeleter = deleter || new UndoRedoMapComponentDeleter();

    const deleteComponent = useCallback(
        (params: UndoRedoDeletionParams) => {
            try {
                componentDeleter.deleteComponentWithUndo(params, undoRedoContext);
            } catch (error) {
                console.error('Error deleting component:', error);
                // Optionally, you could emit an error event or show a user notification here
                throw error;
            }
        },
        [componentDeleter, undoRedoContext],
    );

    const canDelete = useCallback(
        (componentId: string, componentType?: string) => {
            return componentDeleter.canDelete(componentId, componentType);
        },
        [componentDeleter],
    );

    return {
        deleteComponent,
        canDelete,
    };
};