// Types
export interface Position {
    x: number;
    y: number;
}

export interface DragOffset {
    x: number;
    y: number;
}

export interface SnapZone {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SnapState {
    isSnapped: boolean;
    snapZone: SnapZone | null;
}

export interface ViewportMode {
    isEditorMode: boolean;
    isPresentationMode: boolean;
}

// Configuration constants
const CONFIG = {
    SNAP_ZONE_WIDTH: 64,
    DEFAULT_MARGIN: 16,
    MIN_TOP_MARGIN: 100,
    BOTTOM_MARGIN: 50,
    RESIZER_WIDTH: 8,
    FALLBACK_PANEL_WIDTH_PERCENT: 0.33,
    DEFAULT_TOOLBAR_WIDTH: 48,
    DEFAULT_TOOLBAR_HEIGHT: 400,
    STORAGE_KEY_SUFFIX: '_snapped',
    PANEL_WIDTH_STORAGE_KEY: 'wardleyMapEditor_splitPaneWidth',
    EVENT_DELAYS: {
        RENDER_STABILITY: 10,
        SNAP_EVENT: 100,
        PANEL_RESIZE: 200,
    },
} as const;

export class ToolbarPositioning {
    /**
     * Calculates the default position for the toolbar based on viewport size
     */
    static getDefaultPosition(): Position {
        if (typeof window === 'undefined') {
            return {x: CONFIG.DEFAULT_MARGIN, y: 300};
        }

        return {
            x: CONFIG.DEFAULT_MARGIN,
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
    static calculateDragPosition(mouseEvent: MouseEvent, dragOffset: DragOffset, toolbarElement: HTMLElement | null): Position {
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
     * Handles both snapped and floating states intelligently
     */
    static adjustForWindowResize(currentPosition: Position, toolbarElement: HTMLElement | null, mapOnlyView?: boolean): Position {
        if (typeof window === 'undefined' || !toolbarElement) {
            return currentPosition;
        }

        const toolbarRect = toolbarElement.getBoundingClientRect();
        const isCurrentlySnapped = ToolbarPositioning.isInSnapZone(currentPosition, toolbarElement, mapOnlyView);

        if (isCurrentlySnapped) {
            // For snapped toolbars, recalculate snap position for new layout
            return ToolbarPositioning.getSnappedPosition(toolbarElement, mapOnlyView);
        } else {
            // For floating toolbars, constrain to new viewport with intelligent positioning
            const constrainedPosition = ToolbarPositioning.constrainToViewport(currentPosition, toolbarElement);

            // Adjust Y position if toolbar would be too close to top edge
            if (constrainedPosition.y < CONFIG.MIN_TOP_MARGIN) {
                constrainedPosition.y = Math.min(CONFIG.MIN_TOP_MARGIN, window.innerHeight - toolbarRect.height - CONFIG.BOTTOM_MARGIN);
            }

            return constrainedPosition;
        }
    }

    /**
     * Gets the center position of the viewport for toolbar placement
     */
    static getCenterPosition(): Position {
        if (typeof window === 'undefined') {
            return {x: CONFIG.DEFAULT_MARGIN, y: 300};
        }

        return {
            x: window.innerWidth / 2 - CONFIG.DEFAULT_TOOLBAR_WIDTH / 2,
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

        const toolbarWidth = toolbarElement?.getBoundingClientRect().width || CONFIG.DEFAULT_TOOLBAR_WIDTH;
        const toolbarHeight = toolbarElement?.getBoundingClientRect().height || CONFIG.DEFAULT_TOOLBAR_HEIGHT;

        switch (edge) {
            case 'left':
                return {
                    x: CONFIG.DEFAULT_MARGIN,
                    y: window.innerHeight / 2 - toolbarHeight / 2,
                };
            case 'right':
                return {
                    x: window.innerWidth - toolbarWidth - CONFIG.DEFAULT_MARGIN,
                    y: window.innerHeight / 2 - toolbarHeight / 2,
                };
            case 'top':
                return {
                    x: window.innerWidth / 2 - toolbarWidth / 2,
                    y: CONFIG.DEFAULT_MARGIN,
                };
            case 'bottom':
                return {
                    x: window.innerWidth / 2 - toolbarWidth / 2,
                    y: window.innerHeight - toolbarHeight - CONFIG.DEFAULT_MARGIN,
                };
            default:
                return ToolbarPositioning.getDefaultPosition();
        }
    }

    /**
     * Defines the magnetic snap zone on the left side of the screen
     * In editor mode, positions it after the editor panel instead of at the leftmost edge
     * Constrains the zone to the main content area, excluding breadcrumb and header
     */
    static getSnapZone(mapOnlyView?: boolean): SnapZone {
        if (typeof window === 'undefined') {
            return {x: 0, y: 0, width: CONFIG.SNAP_ZONE_WIDTH, height: 800};
        }

        const mode = ToolbarPositioning.getViewportMode(mapOnlyView);

        // Calculate the main content area boundaries (excluding header, breadcrumb, etc.)
        const contentAreaBounds = ToolbarPositioning.getMainContentAreaBounds();

        // PRESENTATION MODE: Position at left edge within content area
        if (mode.isPresentationMode) {
            return {
                x: 0,
                y: contentAreaBounds.top,
                width: CONFIG.SNAP_ZONE_WIDTH,
                height: contentAreaBounds.height,
            };
        }

        // EDITOR MODE: Calculate position after editor panel within content area
        const leftPanelWidth = ToolbarPositioning.getEditorPanelWidth();
        const snapZoneX = leftPanelWidth + CONFIG.RESIZER_WIDTH;

        return {
            x: snapZoneX,
            y: contentAreaBounds.top,
            width: CONFIG.SNAP_ZONE_WIDTH,
            height: contentAreaBounds.height,
        };
    }

    /**
     * Determines the current viewport mode based on mapOnlyView parameter
     */
    private static getViewportMode(mapOnlyView?: boolean): ViewportMode {
        const isEditorMode = mapOnlyView === false;
        return {
            isEditorMode,
            isPresentationMode: !isEditorMode,
        };
    }

    /**
     * Gets the editor panel width using multiple fallback strategies
     */
    private static getEditorPanelWidth(): number {
        // VS Code webview integration does not render the split-pane layout used by OWM.
        // In that environment we intentionally dock to the absolute left.
        const isVsCodeWebview = typeof window !== 'undefined' && typeof (window as any).acquireVsCodeApi === 'function';
        const hasEditorLayout = !!document.querySelector(
            '.editor-panel, [data-testid="left-panel"], .left-panel, [data-testid="resizable-split-pane"], .resizable-split-pane',
        );
        if (isVsCodeWebview && !hasEditorLayout) {
            return 0;
        }

        // Primary: Get width from localStorage (most reliable for editor mode)
        const savedWidth = localStorage.getItem(CONFIG.PANEL_WIDTH_STORAGE_KEY);
        if (savedWidth) {
            const widthPercent = parseFloat(savedWidth);
            if (!isNaN(widthPercent) && widthPercent > 0 && widthPercent < 100) {
                return (window.innerWidth * widthPercent) / 100;
            }
        }

        // Fallback: DOM element measurement
        const leftPanelElement = document.querySelector('.editor-panel, [data-testid="left-panel"], .left-panel');
        if (leftPanelElement) {
            const elementWidth = leftPanelElement.getBoundingClientRect().width;
            if (elementWidth > 0) {
                return elementWidth;
            }
        }

        // Final fallback: Use default percentage
        return window.innerWidth * CONFIG.FALLBACK_PANEL_WIDTH_PERCENT;
    }

    /**
     * Gets the bounds of the main content area, excluding header, breadcrumb, and navigation
     * This is where the toolbar should be constrained to avoid overlapping UI elements
     */
    private static getMainContentAreaBounds(): {top: number; height: number} {
        if (typeof window === 'undefined') {
            return {top: CONFIG.MIN_TOP_MARGIN, height: 600};
        }

        // Primary: Try to find the main content container by data-testid
        let mainContentElement = document.querySelector('[data-testid="main-content-area"]') as HTMLElement;

        // Fallback: Try other selectors for the main content container
        if (!mainContentElement) {
            const selectors = ['div[sx*="flexGrow: 1"]', '.main-content-area', '[data-testid="resizable-split-pane"]'];

            for (const selector of selectors) {
                mainContentElement = document.querySelector(selector) as HTMLElement;
                if (mainContentElement) break;
            }
        }

        // Alternative: Find by looking for the parent of ResizableSplitPane or map canvas
        if (!mainContentElement) {
            const splitPaneElement = document.querySelector('[data-testid="resizable-split-pane"], .resizable-split-pane');
            const mapCanvasElement = document.querySelector('svg[data-testid="map-canvas"], canvas[data-testid="map-canvas"]');

            if (splitPaneElement) {
                mainContentElement = splitPaneElement.parentElement as HTMLElement;
            } else if (mapCanvasElement) {
                // Find the closest container that looks like our main content area
                let currentElement = mapCanvasElement.parentElement;
                while (currentElement) {
                    const style = window.getComputedStyle(currentElement);
                    if (style.flexGrow === '1' || style.height === '100%') {
                        mainContentElement = currentElement as HTMLElement;
                        break;
                    }
                    currentElement = currentElement.parentElement;
                }
            }
        }

        if (mainContentElement) {
            const rect = mainContentElement.getBoundingClientRect();
            return {
                top: rect.top,
                height: rect.height,
            };
        }

        // Fallback: Calculate based on common header/breadcrumb heights
        // Try to find the top navigation wrapper
        const topNavWrapper = document.getElementById('top-nav-wrapper');
        let topOffset: number = CONFIG.MIN_TOP_MARGIN;

        if (topNavWrapper) {
            const rect = topNavWrapper.getBoundingClientRect();
            topOffset = rect.bottom; // Start right after the top navigation area
        } else {
            // Fallback: Estimate based on typical header + breadcrumb height
            // Header is usually ~64px, breadcrumb ~40px, iterations ~60px
            topOffset = 164; // Conservative estimate
        }

        return {
            top: Math.max(topOffset, CONFIG.MIN_TOP_MARGIN),
            height: window.innerHeight - topOffset - CONFIG.BOTTOM_MARGIN,
        };
    }

    /**
     * Checks if the toolbar position is within the snap zone
     * Uses more lenient bounds checking for editor mode
     */
    static isInSnapZone(position: Position, toolbarElement: HTMLElement | null, mapOnlyView?: boolean): boolean {
        if (!toolbarElement) return false;

        const snapZone = ToolbarPositioning.getSnapZone(mapOnlyView);
        const toolbarRect = toolbarElement.getBoundingClientRect();
        const mode = ToolbarPositioning.getViewportMode(mapOnlyView);

        // In editor mode, check if toolbar is positioned within the snap zone area
        // In presentation mode, check traditional snap zone boundaries
        if (mode.isEditorMode) {
            // In editor mode, dock/undock should be driven by horizontal placement only.
            // Vertical bounds can shift while the page/layout scrolls, which incorrectly
            // flips docked toolbars back to floating.
            const isInHorizontalRange = position.x >= snapZone.x && position.x <= snapZone.x + snapZone.width + CONFIG.DEFAULT_MARGIN;
            return isInHorizontalRange;
        } else {
            // Presentation mode: use center-based detection
            const toolbarCenterX = position.x + toolbarRect.width / 2;
            return (
                toolbarCenterX >= snapZone.x &&
                toolbarCenterX <= snapZone.x + snapZone.width &&
                position.y >= snapZone.y &&
                position.y + toolbarRect.height <= snapZone.y + snapZone.height
            );
        }
    }

    /**
     * Gets the snapped position for the toolbar
     * Handles different viewport sizes and positions relative to editor panel
     * Centers the toolbar within the main content area
     */
    static getSnappedPosition(toolbarElement: HTMLElement | null, mapOnlyView?: boolean): Position {
        if (typeof window === 'undefined' || !toolbarElement) {
            return {x: CONFIG.DEFAULT_MARGIN, y: CONFIG.MIN_TOP_MARGIN};
        }

        const snapZone = ToolbarPositioning.getSnapZone(mapOnlyView);
        const toolbarRect = toolbarElement.getBoundingClientRect();
        const contentAreaBounds = ToolbarPositioning.getMainContentAreaBounds();
        const mode = ToolbarPositioning.getViewportMode(mapOnlyView);

        // In editor mode keep the docked toolbar pinned near the top-left of the
        // map content area so it doesn't overlap important central canvas content.
        if (mode.isEditorMode) {
            const minY = contentAreaBounds.top + CONFIG.DEFAULT_MARGIN;
            const maxY = contentAreaBounds.top + contentAreaBounds.height - toolbarRect.height - CONFIG.DEFAULT_MARGIN;
            const clampedY = Math.max(minY, Math.min(minY, maxY));

            return {
                x: snapZone.x + CONFIG.DEFAULT_MARGIN,
                y: clampedY,
            };
        }

        // Calculate ideal centered Y position within the content area
        const contentCenterY = contentAreaBounds.top + contentAreaBounds.height / 2;
        let idealY = contentCenterY - toolbarRect.height / 2;

        // Ensure toolbar stays within the content area bounds with margins
        const minY = contentAreaBounds.top + CONFIG.DEFAULT_MARGIN;
        const maxY = contentAreaBounds.top + contentAreaBounds.height - toolbarRect.height - CONFIG.DEFAULT_MARGIN;
        idealY = Math.max(minY, Math.min(idealY, maxY));

        // Position toolbar within the snap zone with appropriate margin
        // Both modes get margin from their respective snap zone edge
        const toolbarX = snapZone.x + CONFIG.DEFAULT_MARGIN;

        return {
            x: toolbarX,
            y: idealY,
        };
    }

    /**
     * Handles mode changes for snapped toolbars
     * Recalculates position when switching between editor and presentation modes
     */
    static handleModeChange(
        currentPosition: Position,
        toolbarElement: HTMLElement | null,
        isCurrentlySnapped: boolean,
        newMapOnlyView?: boolean,
    ): Position {
        if (!isCurrentlySnapped || !toolbarElement) {
            return currentPosition;
        }

        // For snapped toolbars, recalculate position based on new mode
        return ToolbarPositioning.getSnappedPosition(toolbarElement, newMapOnlyView);
    }

    /**
     * Calculates the snap state based on current position
     * Returns the snap zone for dragging preview
     */
    static calculateSnapState(position: Position, toolbarElement: HTMLElement | null, mapOnlyView?: boolean): SnapState {
        const snapZone = ToolbarPositioning.getSnapZone(mapOnlyView);
        const isSnapped = ToolbarPositioning.isInSnapZone(position, toolbarElement, mapOnlyView);

        return {
            isSnapped,
            snapZone,
        };
    }

    /**
     * Loads snap state from localStorage
     */
    static loadSnapState(storageKey: string): boolean {
        if (typeof window === 'undefined') return false;

        try {
            const saved = localStorage.getItem(`${storageKey}${CONFIG.STORAGE_KEY_SUFFIX}`);
            return saved === 'true';
        } catch {
            return false;
        }
    }

    /**
     * Saves snap state to localStorage
     */
    static saveSnapState(isSnapped: boolean, storageKey: string): void {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(`${storageKey}${CONFIG.STORAGE_KEY_SUFFIX}`, isSnapped.toString());
            } catch {
                // Ignore localStorage errors
            }
        }
    }
}
