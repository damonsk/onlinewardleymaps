/**
 * UndoRedoMapComponentDeleter Service
 * Integrates MapComponentDeleter with the undo/redo system
 */

import {MapComponentDeleter, ComponentDeletionParams, ComponentDeletionResult} from './MapComponentDeleter';
import {ActionType} from '../types/undo-redo';
import {ACTION_DESCRIPTIONS} from '../constants/undoRedo';

/**
 * Interface for undo/redo context (to avoid circular dependency)
 */
export interface UndoRedoContext {
    mutateMapText: (newText: string, actionType?: ActionType, description?: string, groupId?: string) => void;
    isUndoRedoOperation: boolean;
}

/**
 * Interface for deletion with undo/redo integration
 */
export interface UndoRedoDeletionParams extends ComponentDeletionParams {
    componentName?: string; // Optional component name for better undo descriptions
}

/**
 * Service that integrates MapComponentDeleter with undo/redo functionality
 */
export class UndoRedoMapComponentDeleter {
    private deleter: MapComponentDeleter;

    constructor(deleter?: MapComponentDeleter) {
        this.deleter = deleter || new MapComponentDeleter();
    }

    /**
     * Deletes a component and records the operation in undo/redo history
     */
    public deleteComponentWithUndo(params: UndoRedoDeletionParams, undoRedoContext: UndoRedoContext): ComponentDeletionResult {
        // Validate parameters
        const validation = this.deleter.validateDeletionParams(params);
        if (!validation.isValid) {
            throw new Error(`Invalid deletion parameters: ${validation.errors.join(', ')}`);
        }

        // Perform the deletion
        const result = this.deleter.deleteComponent(params);

        // Generate a descriptive action description
        const componentName = params.componentName || params.componentId;
        const actionDescription = ACTION_DESCRIPTIONS['canvas-delete'](componentName);

        // Record the change in undo/redo history using the enhanced mutateMapText
        // This will automatically handle the undo/redo recording
        undoRedoContext.mutateMapText(result.updatedMapText, 'canvas-delete', actionDescription);

        return result;
    }

    /**
     * Checks if a component can be deleted
     */
    public canDelete(componentId: string, componentType?: string): boolean {
        return this.deleter.canDelete(componentId, componentType);
    }

    /**
     * Validates deletion parameters
     */
    public validateDeletionParams(params: ComponentDeletionParams) {
        return this.deleter.validateDeletionParams(params);
    }

    /**
     * Gets the underlying MapComponentDeleter instance
     */
    public getDeleter(): MapComponentDeleter {
        return this.deleter;
    }
}

/**
 * Default instance of UndoRedoMapComponentDeleter for use throughout the application
 */
export const undoRedoMapComponentDeleter = new UndoRedoMapComponentDeleter();
