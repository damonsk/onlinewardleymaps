/**
 * Hook for map component deletion with undo/redo integration
 */

import {useCallback} from 'react';
import {useUndoRedo} from '../components/UndoRedoProvider';
import {UndoRedoDeletionParams, UndoRedoMapComponentDeleter} from '../services/UndoRedoMapComponentDeleter';

/**
 * Interface for the deletion hook result
 */
export interface UseMapComponentDeletionResult {
    deleteComponent: (params: UndoRedoDeletionParams) => void;
}

/**
 * Hook that provides component deletion functionality with undo/redo integration
 */
export const useMapComponentDeletion = (deleter?: UndoRedoMapComponentDeleter): UseMapComponentDeletionResult => {
    const undoRedoContext = useUndoRedo();
    const componentDeleter = deleter || new UndoRedoMapComponentDeleter();

    const deleteComponent = useCallback(
        (params: UndoRedoDeletionParams) => {
            console.log('useMapComponentDeletion: deleteComponent called with params:', params);
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

    return {
        deleteComponent,
    };
};
