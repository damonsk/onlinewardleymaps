import {useCallback} from 'react';

/**
 * Interface for keyboard action handlers
 * Interface Segregation: Separate concerns for different actions
 */
export interface IKeyboardActionHandlers {
    onDelete?: () => void;
    onEscape?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onToolSelect?: (toolId: string | null) => void;
}

/**
 * Keyboard event coordination service
 * Single Responsibility: Only handles keyboard event delegation
 * Open/Closed: Easy to add new keyboard handlers
 */
export class KeyboardEventCoordinator {
    private handlers: IKeyboardActionHandlers;

    constructor(handlers: IKeyboardActionHandlers) {
        this.handlers = handlers;
    }

    public handleKeyDown = (event: KeyboardEvent): boolean => {
        // Handle deletion keys (Delete/Backspace)
        if (this.isDeletionKey(event) && this.handlers.onDelete) {
            event.preventDefault();
            this.handlers.onDelete();
            return true;
        }

        // Handle Escape key
        if (event.key === 'Escape' && this.handlers.onEscape) {
            event.preventDefault();
            this.handlers.onEscape();
            return true;
        }

        // Handle undo/redo (Ctrl+Z, Ctrl+Y, Cmd+Z, Cmd+Shift+Z)
        if (this.isUndoKey(event) && this.handlers.onUndo) {
            event.preventDefault();
            this.handlers.onUndo();
            return true;
        }

        if (this.isRedoKey(event) && this.handlers.onRedo) {
            event.preventDefault();
            this.handlers.onRedo();
            return true;
        }

        // Handle single character tool selection
        if (this.isToolSelectionKey(event) && this.handlers.onToolSelect) {
            const toolId = this.getToolIdFromKey(event.key);
            if (toolId) {
                event.preventDefault();
                this.handlers.onToolSelect(toolId);
                return true;
            }
        }

        return false;
    };

    private isDeletionKey(event: KeyboardEvent): boolean {
        return (event.key === 'Delete' || event.key === 'Backspace') &&
               !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey;
    }

    private isUndoKey(event: KeyboardEvent): boolean {
        const key = event.key.toLowerCase();
        const isMac = navigator.platform.toLowerCase().includes('mac');
        const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;
        
        return key === 'z' && isCtrlOrCmd && !event.shiftKey && !event.altKey;
    }

    private isRedoKey(event: KeyboardEvent): boolean {
        const key = event.key.toLowerCase();
        const isMac = navigator.platform.toLowerCase().includes('mac');
        const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;
        
        return ((key === 'y' && isCtrlOrCmd && !isMac) ||
                (key === 'z' && isCtrlOrCmd && isMac && event.shiftKey)) &&
               !event.altKey;
    }

    private isToolSelectionKey(event: KeyboardEvent): boolean {
        return event.key.length === 1 && 
               !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey;
    }

    private getToolIdFromKey(key: string): string | null {
        // Map keys to tool IDs - this could be moved to a configuration
        const keyToToolMap: Record<string, string> = {
            'c': 'component',
            'l': 'link',
            'n': 'note',
            'p': 'pipeline',
            'a': 'anchor',
            'm': 'method',
        };
        
        return keyToToolMap[key.toLowerCase()] || null;
    }

    public updateHandlers(handlers: Partial<IKeyboardActionHandlers>): void {
        this.handlers = { ...this.handlers, ...handlers };
    }
}

/**
 * React hook for keyboard event coordination
 * Single Responsibility: Only handles React integration for keyboard events
 */
export const useKeyboardEventCoordinator = (handlers: IKeyboardActionHandlers) => {
    const coordinator = useCallback(() => new KeyboardEventCoordinator(handlers), []);
    
    return coordinator().handleKeyDown;
};