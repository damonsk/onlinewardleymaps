import {IObservable, ISelectionObserver, ISelectionService} from './ISelectionService';
import {SelectableElement} from './SelectionTypes';

/**
 * Core selection service implementation
 * Single Responsibility: Manages selection state only
 * Open/Closed: Easy to extend without modification
 */
export class SelectionService implements ISelectionService<SelectableElement>, IObservable {
    private selectedElement: SelectableElement | null = null;
    private observers: Set<ISelectionObserver> = new Set();

    public select(element: SelectableElement): void {
        const previousId = this.selectedElement?.id || null;
        this.selectedElement = element;

        // Only notify if selection actually changed
        if (previousId !== element.id) {
            this.notifyObservers(element.id);
        }
    }

    public deselect(): void {
        if (this.selectedElement) {
            this.selectedElement = null;
            this.notifyObservers(null);
        }
    }

    public getSelected(): SelectableElement | null {
        return this.selectedElement;
    }

    public isSelected(id: string): boolean {
        return this.selectedElement?.id === id;
    }

    public addObserver(observer: ISelectionObserver): void {
        this.observers.add(observer);
    }

    public removeObserver(observer: ISelectionObserver): void {
        this.observers.delete(observer);
    }

    private notifyObservers(selectedId: string | null): void {
        this.observers.forEach(observer => {
            try {
                observer.onSelectionChanged(selectedId);
            } catch (error) {
                console.error('Error notifying selection observer:', error);
            }
        });
    }
}
