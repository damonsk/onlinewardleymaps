import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ToolbarItem} from '../../../types/toolbar';
import {Position, SnapState, ToolbarPositioning} from '../services/ToolbarPositioning';

// Configuration constants
const HOOK_CONFIG = {
    DEFAULT_STORAGE_KEY: 'wysiwyg-toolbar-position',
    RENDER_STABILITY_DELAY: 10,
    SNAP_EVENT_DELAY: 100,
    PANEL_RESIZE_DELAY: 200,
} as const;

interface UseToolbarStateProps {
    defaultPosition?: Position;
    storageKey?: string;
    mapOnlyView?: boolean; // Presentation mode (true) vs Editor mode (false)
    toolbarVisible?: boolean; // Whether the toolbar is currently visible
}

interface UseToolbarStateReturn {
    position: Position;
    isDragging: boolean;
    toolbarRef: React.RefObject<HTMLDivElement | null>;
    renderKey: number;
    handleMouseDown: (e: React.MouseEvent) => void;
    resetPosition: () => void;
    isSnapped: boolean;
    snapState: SnapState;
    toggleSnap: () => void;
}

// Types expected by useMapHandlers
export interface ToolbarState {
    selectedToolbarItem: ToolbarItem | null;
    isValidDropZone: boolean;
}

export interface ToolbarActions {
    setSelectedToolbarItem: (item: ToolbarItem | null) => void;
    setIsValidDropZone: (isValid: boolean) => void;
}

export const useToolbarState = (props: UseToolbarStateProps = {}): UseToolbarStateReturn => {
    const {defaultPosition, storageKey = HOOK_CONFIG.DEFAULT_STORAGE_KEY, mapOnlyView, toolbarVisible = true} = props;

    const [position, setPosition] = useState<Position>(() => {
        return ToolbarPositioning.loadSavedPosition(storageKey);
    });

    const [isSnapped, setIsSnapped] = useState(() => {
        return ToolbarPositioning.loadSnapState(storageKey);
    });

    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState<Position>({x: 0, y: 0});
    const [renderKey, setRenderKey] = useState(0);
    const toolbarRef = useRef<HTMLDivElement>(null);

    // Calculate current snap state - now reactive to mapOnlyView prop changes
    const snapState = useMemo(() => {
        return ToolbarPositioning.calculateSnapState(position, toolbarRef.current, mapOnlyView);
    }, [position, mapOnlyView]); // Re-calculate when position OR mapOnlyView changes

    // Force a re-render after initial mount to ensure styled-components classes are stable
    useEffect(() => {
        const timer = setTimeout(() => setRenderKey(1), HOOK_CONFIG.RENDER_STABILITY_DELAY);
        return () => clearTimeout(timer);
    }, []);

    // Save position to localStorage whenever it changes
    useEffect(() => {
        ToolbarPositioning.savePosition(position, storageKey);
    }, [position, storageKey]);

    // Save snap state to localStorage whenever it changes
    useEffect(() => {
        ToolbarPositioning.saveSnapState(isSnapped, storageKey);
    }, [isSnapped, storageKey]);

    // Dispatch toolbar snap event for map canvas to resize
    const dispatchSnapEvent = useCallback((effectiveSnappedState: boolean) => {
        setTimeout(() => {
            const event = new CustomEvent('toolbarSnap', {
                detail: {isSnapped: effectiveSnappedState},
            });
            window.dispatchEvent(event);
        }, HOOK_CONFIG.SNAP_EVENT_DELAY);
    }, []);

    // Calculate effective snap state for canvas sizing
    // Toolbar is effectively snapped for canvas sizing only if it's both snapped AND visible
    const effectiveSnappedForCanvas = isSnapped && toolbarVisible;

    // Handle toolbar visibility changes
    // When toolbar visibility changes while snapped, we need to notify the map canvas to resize
    useEffect(() => {
        // Dispatch event based on effective snap state (snap state AND visibility)
        // This will tell the map canvas to resize appropriately:
        // - Hidden + Snapped = behave as unsnapped for canvas sizing
        // - Visible + Snapped = behave as snapped for canvas sizing
        dispatchSnapEvent(effectiveSnappedForCanvas);
    }, [toolbarVisible, isSnapped, dispatchSnapEvent, effectiveSnappedForCanvas]);

    // Handle mode changes for snapped toolbars
    useEffect(() => {
        if (isSnapped && toolbarRef.current) {
            const newPosition = ToolbarPositioning.handleModeChange(position, toolbarRef.current, isSnapped, mapOnlyView);

            // Only update position if it actually changed
            if (newPosition.x !== position.x || newPosition.y !== position.y) {
                setPosition(newPosition);
            }
        }
    }, [mapOnlyView, isSnapped, position]); // React to mode changes and snap state changes

    // Update snap state when position changes
    useEffect(() => {
        const newSnapState = ToolbarPositioning.calculateSnapState(position, toolbarRef.current, mapOnlyView);
        if (newSnapState.isSnapped !== isSnapped) {
            setIsSnapped(newSnapState.isSnapped);
            // Dispatch event with effective snap state (considering visibility)
            const effectiveSnapped = newSnapState.isSnapped && toolbarVisible;
            dispatchSnapEvent(effectiveSnapped);
        }
    }, [position, isSnapped, mapOnlyView, toolbarVisible, dispatchSnapEvent]);

    // Constrain position to viewport bounds
    const constrainPosition = useCallback((x: number, y: number): Position => {
        return ToolbarPositioning.constrainToViewport({x, y}, toolbarRef.current);
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!toolbarRef.current) return;

        const offset = ToolbarPositioning.calculateDragOffset(e, toolbarRef.current);
        setDragOffset(offset);
        setIsDragging(true);
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;

            const newPosition = ToolbarPositioning.calculateDragPosition(e, dragOffset, toolbarRef.current);
            setPosition(newPosition);
        },
        [isDragging, dragOffset],
    );

    const handleMouseUp = useCallback(() => {
        if (isDragging && toolbarRef.current) {
            // Check if we should snap to the left zone
            const currentSnapState = ToolbarPositioning.calculateSnapState(position, toolbarRef.current, mapOnlyView);
            if (currentSnapState.isSnapped) {
                // Snap to the designated position
                const snappedPosition = ToolbarPositioning.getSnappedPosition(toolbarRef.current, mapOnlyView);
                setPosition(snappedPosition);
                setIsSnapped(true);
            }
        }
        setIsDragging(false);
    }, [isDragging, position, mapOnlyView]);

    const toggleSnap = useCallback(() => {
        if (!toolbarRef.current) return;

        if (isSnapped) {
            // Unsnap - move to a default floating position
            const defaultPos = ToolbarPositioning.getDefaultPosition();
            setPosition(defaultPos);
            setIsSnapped(false);
            // Always dispatch false when unsnapping
            dispatchSnapEvent(false);
        } else {
            // Snap to left zone
            const snappedPosition = ToolbarPositioning.getSnappedPosition(toolbarRef.current, mapOnlyView);
            setPosition(snappedPosition);
            setIsSnapped(true);
            // Dispatch based on effective snap state (considering visibility)
            const effectiveSnapped = toolbarVisible;
            dispatchSnapEvent(effectiveSnapped);
        }
    }, [isSnapped, mapOnlyView, toolbarVisible, dispatchSnapEvent]);

    const resetPosition = useCallback(() => {
        const newPosition = defaultPosition || ToolbarPositioning.getDefaultPosition();
        setPosition(newPosition);
    }, [defaultPosition]);

    // Add global mouse event listeners when dragging
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Handle panel resize events to update snap zone position
    const handlePanelResize = useCallback(() => {
        // If toolbar is snapped, update position to new snap zone location
        if (isSnapped && toolbarRef.current) {
            setTimeout(() => {
                const snappedPosition = ToolbarPositioning.getSnappedPosition(toolbarRef.current, mapOnlyView);
                setPosition(snappedPosition);
            }, HOOK_CONFIG.PANEL_RESIZE_DELAY); // Delay to ensure panel resize has completed
        }
    }, [isSnapped, mapOnlyView]);

    // Handle window resize to keep toolbar in bounds
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setPosition((prev: Position) => {
                const newPosition = ToolbarPositioning.adjustForWindowResize(prev, toolbarRef.current, mapOnlyView);

                // If toolbar is currently snapped, ensure we maintain the snap state
                // and update to the correct snapped position for the new viewport
                if (isSnapped) {
                    const snappedPosition = ToolbarPositioning.getSnappedPosition(toolbarRef.current, mapOnlyView);
                    return snappedPosition;
                }

                return newPosition;
            });
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('panelResize', handlePanelResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('panelResize', handlePanelResize);
        };
    }, [isSnapped, mapOnlyView, handlePanelResize]);

    return {
        position,
        isDragging,
        toolbarRef,
        renderKey,
        handleMouseDown,
        resetPosition,
        isSnapped,
        snapState,
        toggleSnap,
    };
};
