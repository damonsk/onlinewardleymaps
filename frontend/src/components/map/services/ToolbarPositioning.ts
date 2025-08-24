interface Position {
    x: number;
    y: number;
}

interface DragOffset {
    x: number;
    y: number;
}

export class ToolbarPositioning {
    /**
     * Calculates the default position for the toolbar based on viewport size
     */
    static getDefaultPosition(): Position {
        if (typeof window === 'undefined') {
            return {x: 16, y: 300};
        }
        
        return {
            x: 16,
            y: window.innerHeight / 2 - 200,
        };
    }

    /**
     * Loads saved position from localStorage with fallback to default
     */
    static loadSavedPosition(storageKey: string): Position {
        if (typeof window === 'undefined') {
            return ToolbarPositioning.getDefaultPosition();
        }

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const position = JSON.parse(saved);
                // Validate the position object
                if (typeof position.x === 'number' && typeof position.y === 'number') {
                    return position;
                }
            }
        } catch {
            // Fall back to default if parsing fails
        }

        return ToolbarPositioning.getDefaultPosition();
    }

    /**
     * Saves position to localStorage
     */
    static savePosition(position: Position, storageKey: string): void {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(storageKey, JSON.stringify(position));
            } catch {
                // Ignore localStorage errors (e.g., private browsing mode)
            }
        }
    }

    /**
     * Constrains position to keep toolbar within viewport bounds
     */
    static constrainToViewport(position: Position, toolbarElement: HTMLElement | null): Position {
        if (typeof window === 'undefined' || !toolbarElement) {
            return position;
        }

        const rect = toolbarElement.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        return {
            x: Math.max(0, Math.min(position.x, maxX)),
            y: Math.max(0, Math.min(position.y, maxY)),
        };
    }

    /**
     * Calculates the initial drag offset based on mouse position relative to toolbar
     */
    static calculateDragOffset(mouseEvent: React.MouseEvent, toolbarElement: HTMLElement): DragOffset {
        const rect = toolbarElement.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - rect.left,
            y: mouseEvent.clientY - rect.top,
        };
    }

    /**
     * Calculates new position during drag operation
     */
    static calculateDragPosition(
        mouseEvent: MouseEvent, 
        dragOffset: DragOffset, 
        toolbarElement: HTMLElement | null
    ): Position {
        const newPosition = {
            x: mouseEvent.clientX - dragOffset.x,
            y: mouseEvent.clientY - dragOffset.y,
        };

        return ToolbarPositioning.constrainToViewport(newPosition, toolbarElement);
    }

    /**
     * Validates if a position is within reasonable bounds
     */
    static isValidPosition(position: Position): boolean {
        return (
            typeof position.x === 'number' && 
            typeof position.y === 'number' &&
            !isNaN(position.x) && 
            !isNaN(position.y) &&
            position.x >= 0 && 
            position.y >= 0
        );
    }

    /**
     * Calculates position adjustment needed after window resize
     */
    static adjustForWindowResize(currentPosition: Position, toolbarElement: HTMLElement | null): Position {
        return ToolbarPositioning.constrainToViewport(currentPosition, toolbarElement);
    }

    /**
     * Gets the center position of the viewport for toolbar placement
     */
    static getCenterPosition(): Position {
        if (typeof window === 'undefined') {
            return {x: 16, y: 300};
        }

        return {
            x: window.innerWidth / 2 - 24, // Half toolbar width (48px / 2)
            y: window.innerHeight / 2 - 200, // Approximate half toolbar height
        };
    }

    /**
     * Gets position for specific screen edges
     */
    static getEdgePosition(edge: 'left' | 'right' | 'top' | 'bottom', toolbarElement?: HTMLElement | null): Position {
        if (typeof window === 'undefined') {
            return ToolbarPositioning.getDefaultPosition();
        }

        const margin = 16;
        const toolbarWidth = toolbarElement?.getBoundingClientRect().width || 48;
        const toolbarHeight = toolbarElement?.getBoundingClientRect().height || 400;

        switch (edge) {
            case 'left':
                return {
                    x: margin,
                    y: window.innerHeight / 2 - toolbarHeight / 2,
                };
            case 'right':
                return {
                    x: window.innerWidth - toolbarWidth - margin,
                    y: window.innerHeight / 2 - toolbarHeight / 2,
                };
            case 'top':
                return {
                    x: window.innerWidth / 2 - toolbarWidth / 2,
                    y: margin,
                };
            case 'bottom':
                return {
                    x: window.innerWidth / 2 - toolbarWidth / 2,
                    y: window.innerHeight - toolbarHeight - margin,
                };
            default:
                return ToolbarPositioning.getDefaultPosition();
        }
    }
}