import {SelectableElement, isComponentElement, isLinkElement} from '../selection/SelectionTypes';
import {DeletionContext, DeletionResult, IDeletionObserver, IDeletionService} from './IDeletionService';
import {LinkDeletionStrategy} from './LinkDeletionStrategy';

/**
 * Unified deletion service using Strategy pattern
 * Single Responsibility: Coordinates deletion operations
 * Open/Closed: Easy to add new deletion strategies
 * Strategy Pattern: Delegates to appropriate deletion strategy
 */
export class DeletionService implements IDeletionService {
    private linkDeletionStrategy = new LinkDeletionStrategy();
    private observers: Set<IDeletionObserver> = new Set();

    public canDelete(element: SelectableElement): boolean {
        // Currently supports links and components
        return isLinkElement(element) || isComponentElement(element);
    }

    public async delete(element: SelectableElement, context: DeletionContext): Promise<DeletionResult> {
        if (!this.canDelete(element)) {
            const error = `Cannot delete element of type: ${element.type}`;
            this.notifyFailed(element, error);
            return {
                success: false,
                error,
                description: `Failed to delete ${element.name}`,
            };
        }

        this.notifyStarted(element);

        try {
            if (isLinkElement(element)) {
                return await this.deleteLinkElement(element, context);
            } else if (isComponentElement(element)) {
                return await this.deleteComponentElement(element, context);
            }

            const error = 'Unknown element type';
            this.notifyFailed(element, error);
            return {
                success: false,
                error,
                description: `Failed to delete ${(element as SelectableElement).name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this.notifyFailed(element, errorMessage);
            return {
                success: false,
                error: errorMessage,
                description: `Failed to delete ${(element as SelectableElement).name}`,
            };
        }
    }

    private async deleteLinkElement(element: SelectableElement & {type: 'link'}, context: DeletionContext): Promise<DeletionResult> {
        const newMapText = this.linkDeletionStrategy.deleteLink(context.mapText, element.linkData);

        if (newMapText === context.mapText) {
            const error = 'Link not found in map text';
            this.notifyFailed(element, error);
            return {
                success: false,
                error,
                description: `Failed to delete link ${element.name}`,
            };
        }

        const description = `Deleted link ${element.name}`;
        context.mutateMapText(newMapText, 'link-deletion', description);

        const result: DeletionResult = {
            success: true,
            newMapText,
            description,
        };

        this.notifyCompleted(element, result);
        return result;
    }

    private async deleteComponentElement(
        element: SelectableElement & {type: 'component' | 'evolved-component'},
        context: DeletionContext,
    ): Promise<DeletionResult> {
        // TODO: Implement component deletion strategy
        // For now, return a placeholder implementation
        const error = 'Component deletion not yet implemented';
        this.notifyFailed(element, error);
        return {
            success: false,
            error,
            description: `Failed to delete component ${element.name}`,
        };
    }

    public addObserver(observer: IDeletionObserver): void {
        this.observers.add(observer);
    }

    public removeObserver(observer: IDeletionObserver): void {
        this.observers.delete(observer);
    }

    private notifyStarted(element: SelectableElement): void {
        this.observers.forEach(observer => {
            try {
                observer.onDeletionStarted(element);
            } catch (error) {
                console.error('Error notifying deletion observer:', error);
            }
        });
    }

    private notifyCompleted(element: SelectableElement, result: DeletionResult): void {
        this.observers.forEach(observer => {
            try {
                observer.onDeletionCompleted(element, result);
            } catch (error) {
                console.error('Error notifying deletion observer:', error);
            }
        });
    }

    private notifyFailed(element: SelectableElement, error: string): void {
        this.observers.forEach(observer => {
            try {
                observer.onDeletionFailed(element, error);
            } catch (error) {
                console.error('Error notifying deletion observer:', error);
            }
        });
    }
}
