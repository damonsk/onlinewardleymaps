/**
 * Interface defining core selection operations
 * Single Responsibility: Only defines selection behavior
 */
export interface ISelectionService<T> {
    select(item: T): void;
    deselect(): void;
    getSelected(): T | null;
    isSelected(id: string): boolean;
}

/**
 * Interface for selection change notifications
 * Single Responsibility: Only handles selection events
 */
export interface ISelectionObserver {
    onSelectionChanged(selectedId: string | null): void;
}

/**
 * Interface for registering observers
 * Interface Segregation: Separate concern for observers
 */
export interface IObservable {
    addObserver(observer: ISelectionObserver): void;
    removeObserver(observer: ISelectionObserver): void;
}
