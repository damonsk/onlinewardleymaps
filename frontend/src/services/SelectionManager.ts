export type SelectableElementType = 'component' | 'evolved-component' | 'link';

export interface SelectableElement {
    id: string;
    type: SelectableElementType;
    name: string;
    componentData?: any; // Store the full component object for deletion logic
    linkData?: {
        start: string;
        end: string;
        flow?: boolean;
        flowValue?: string;
        line: number;
    }; // Store link data for deletion logic
}

export interface SelectionManagerOptions {
    onDeleteRequested?: (element: SelectableElement) => void;
}

export class SelectionManager {
    private selectedElement: SelectableElement | null = null;
    private options: SelectionManagerOptions;
    private keyboardAttached = false;

    constructor(options: SelectionManagerOptions = {}) {
        this.options = options;
    }

    public attachKeyboardEvents(): void {
        if (this.keyboardAttached) return;
        document.addEventListener('keydown', this.handleKeyDown);
        this.keyboardAttached = true;
    }

    public detachKeyboardEvents(): void {
        if (!this.keyboardAttached) return;
        document.removeEventListener('keydown', this.handleKeyDown);
        this.keyboardAttached = false;
    }

    private handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Delete' && this.selectedElement && !this.isInputFocused()) {
            event.preventDefault();
            this.options.onDeleteRequested?.(this.selectedElement);
        }

        if (event.key === 'Escape') {
            this.clearSelection();
        }
    };

    private isInputFocused(): boolean {
        const activeElement = document.activeElement;
        return (
            activeElement instanceof HTMLInputElement ||
            activeElement instanceof HTMLTextAreaElement ||
            (activeElement instanceof HTMLElement && activeElement.contentEditable === 'true')
        );
    }

    public selectElement(element: SelectableElement): void {
        this.selectedElement = element;
    }

    public clearSelection(): void {
        this.selectedElement = null;
    }

    public getSelectedElement(): SelectableElement | null {
        return this.selectedElement;
    }

    public isSelected(elementId: string, elementType: SelectableElementType): boolean {
        return this.selectedElement?.id === elementId && this.selectedElement?.type === elementType;
    }

    public destroy(): void {
        this.detachKeyboardEvents();
        this.clearSelection();
    }
}
