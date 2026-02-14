import {SelectableElement} from '../selection/SelectionTypes';

/**
 * Interface for deletion operations
 * Single Responsibility: Only defines deletion behavior
 * Interface Segregation: Separate from selection concerns
 */
export interface IDeletionService {
    canDelete(element: SelectableElement): boolean;
    delete(element: SelectableElement, context: DeletionContext): Promise<DeletionResult>;
}

/**
 * Context required for deletion operations
 */
export interface DeletionContext {
    readonly mapText: string;
    readonly mutateMapText: (newText: string, actionType?: string, description?: string) => void;
}

/**
 * Result of a deletion operation
 */
export interface DeletionResult {
    readonly success: boolean;
    readonly newMapText?: string;
    readonly error?: string;
    readonly description: string;
}

/**
 * Interface for deletion notifications
 */
export interface IDeletionObserver {
    onDeletionStarted(element: SelectableElement): void;
    onDeletionCompleted(element: SelectableElement, result: DeletionResult): void;
    onDeletionFailed(element: SelectableElement, error: string): void;
}
