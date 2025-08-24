import {useCallback, useState} from 'react';
import {PSTBounds, PSTCoordinates, PSTElement, ResizeHandle} from '../../../types/map/pst';
import {
    calculateResizedBounds,
    constrainPSTBounds,
    convertBoundsToPSTCoordinates,
    convertPSTCoordinatesToBounds,
} from '../../../utils/pstCoordinateUtils';
import {updatePSTInMapText} from '../../../utils/pstElementUtils';

interface UsePSTInteractionsProps {
    mapDimensions: {width: number; height: number};
    mapText: string;
    mutateMapText: (text: string) => void;
    setTool: (tool: any) => void;
}

interface UsePSTInteractionsReturn {
    // Hover state
    hoveredPSTElement: PSTElement | null;

    // Resize state
    resizingPSTElement: PSTElement | null;
    resizeHandle: ResizeHandle | null;
    resizePreviewBounds: PSTBounds | null;
    keyboardModifiers: {maintainAspectRatio: boolean; resizeFromCenter: boolean};

    // Drag state
    draggingPSTElement: PSTElement | null;
    dragPreviewBounds: PSTBounds | null;

    // Event handlers
    handlePSTHover: (element: PSTElement | null) => void;
    handlePSTResizeStart: (element: PSTElement, handle: ResizeHandle, startPosition: {x: number; y: number}) => void;
    handlePSTResizeMove: (handle: ResizeHandle, currentPosition: {x: number; y: number}) => void;
    handlePSTResizeEnd: (element: PSTElement, newCoordinates: PSTCoordinates) => void;
    handlePSTDragStart: (element: PSTElement, startPosition: {x: number; y: number}) => void;
    handlePSTDragMove: (element: PSTElement, currentPosition: {x: number; y: number}) => void;
    handlePSTDragEnd: (element: PSTElement) => void;
    resetResizeState: () => void;
    resetDragState: () => void;
}

export const usePSTInteractions = (props: UsePSTInteractionsProps): UsePSTInteractionsReturn => {
    const {mapDimensions, mapText, mutateMapText, setTool} = props;

    // Hover state
    const [hoveredPSTElement, setHoveredPSTElement] = useState<PSTElement | null>(null);

    // Resize state management
    const [resizingPSTElement, setResizingPSTElement] = useState<PSTElement | null>(null);
    const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
    const [resizePreviewBounds, setResizePreviewBounds] = useState<PSTBounds | null>(null);
    const [resizeStartPosition, setResizeStartPosition] = useState<{x: number; y: number} | null>(null);
    const [originalBounds, setOriginalBounds] = useState<PSTBounds | null>(null);
    const [keyboardModifiers, setKeyboardModifiers] = useState<{maintainAspectRatio: boolean; resizeFromCenter: boolean}>({
        maintainAspectRatio: false,
        resizeFromCenter: false,
    });

    // Drag state management
    const [draggingPSTElement, setDraggingPSTElement] = useState<PSTElement | null>(null);
    const [dragPreviewBounds, setDragPreviewBounds] = useState<PSTBounds | null>(null);
    const [dragStartPosition, setDragStartPosition] = useState<{x: number; y: number} | null>(null);
    const [dragOriginalBounds, setDragOriginalBounds] = useState<PSTBounds | null>(null);

    const resetResizeState = useCallback(() => {
        setResizingPSTElement(null);
        setResizeHandle(null);
        setResizePreviewBounds(null);
        setResizeStartPosition(null);
        setOriginalBounds(null);
        setKeyboardModifiers({maintainAspectRatio: false, resizeFromCenter: false});
    }, []);

    const resetDragState = useCallback(() => {
        setDraggingPSTElement(null);
        setDragPreviewBounds(null);
        setDragStartPosition(null);
        setDragOriginalBounds(null);
    }, []);

    const handlePSTHover = useCallback(
        (element: PSTElement | null) => {
            // Only update hover state if not currently resizing or dragging
            if (!resizingPSTElement && !draggingPSTElement) {
                setHoveredPSTElement(element);
            }
        },
        [resizingPSTElement, draggingPSTElement],
    );

    const handlePSTResizeStart = useCallback(
        (element: PSTElement, handle: ResizeHandle, startPosition: {x: number; y: number}) => {
            try {
                // Validate element and coordinates
                if (!element || !element.coordinates || !handle) {
                    console.warn('Invalid PST element or handle for resize start:', {element, handle});
                    return;
                }

                // Set resize state
                setResizingPSTElement(element);
                setResizeHandle(handle);
                setResizeStartPosition(startPosition);

                // Convert PST coordinates to bounds for resize operations
                const bounds = convertPSTCoordinatesToBounds(element.coordinates, mapDimensions);

                // Validate bounds
                if (isNaN(bounds.x) || isNaN(bounds.y) || isNaN(bounds.width) || isNaN(bounds.height)) {
                    console.warn('Invalid bounds calculated for PST element:', {element, bounds});
                    return;
                }

                setOriginalBounds(bounds);
                setResizePreviewBounds(bounds);

                // Disable pan/zoom during resize to prevent conflicts
                setTool('TOOL_NONE');

                // Clear hover state during resize to prevent conflicts
                setHoveredPSTElement(null);

                console.log('PST resize started:', {element: element.id, handle, bounds});
            } catch (error) {
                console.error('Error starting PST resize:', error);
                resetResizeState();
            }
        },
        [mapDimensions, setTool, resetResizeState],
    );

    const handlePSTResizeMove = useCallback(
        (handle: ResizeHandle, currentPosition: {x: number; y: number}) => {
            try {
                // Validate resize state
                if (!resizingPSTElement || !originalBounds || !resizeStartPosition || !handle) {
                    console.warn('Invalid resize state during move:', {
                        hasElement: !!resizingPSTElement,
                        hasBounds: !!originalBounds,
                        hasStartPos: !!resizeStartPosition,
                        handle,
                    });
                    return;
                }

                // Calculate movement delta
                const deltaX = currentPosition.x - resizeStartPosition.x;
                const deltaY = currentPosition.y - resizeStartPosition.y;

                // Calculate new bounds based on handle and deltas
                const newBounds = calculateResizedBounds(
                    originalBounds,
                    handle,
                    deltaX,
                    deltaY,
                    undefined, // Use default constraints
                    mapDimensions,
                    keyboardModifiers,
                );

                // Apply constraints to keep bounds within valid limits
                const constrainedBounds = constrainPSTBounds(newBounds, mapDimensions);

                // Update preview bounds
                setResizePreviewBounds(constrainedBounds);

                console.log('PST resize move:', {handle, delta: {deltaX, deltaY}, bounds: constrainedBounds});
            } catch (error) {
                console.error('Error during PST resize move:', error);
            }
        },
        [resizingPSTElement, originalBounds, resizeStartPosition, keyboardModifiers, mapDimensions],
    );

    const handlePSTResizeEnd = useCallback(
        (element: PSTElement, newCoordinates: PSTCoordinates) => {
            try {
                // Validate final coordinates and element
                if (!element || !newCoordinates) {
                    console.warn('Invalid element or coordinates for resize end:', {element, newCoordinates});
                    resetResizeState();
                    return;
                }

                // Update the map text with new coordinates
                const updatedMapText = updatePSTInMapText(mapText, element, newCoordinates);
                if (updatedMapText !== mapText) {
                    mutateMapText(updatedMapText);
                    console.log('PST element updated:', {elementId: element.id, newCoordinates});
                } else {
                    console.warn('No changes made to PST element:', {elementId: element.id});
                }

                // Reset resize state
                resetResizeState();
            } catch (error) {
                console.error('Error ending PST resize:', error);
                resetResizeState();
            }
        },
        [mapText, mutateMapText, resetResizeState],
    );

    const handlePSTDragStart = useCallback(
        (element: PSTElement, startPosition: {x: number; y: number}) => {
            try {
                // Validate element
                if (!element || !element.coordinates) {
                    console.warn('Invalid PST element for drag start:', element);
                    return;
                }

                // Set drag state
                setDraggingPSTElement(element);
                setDragStartPosition(startPosition);

                // Convert PST coordinates to bounds for drag operations
                const bounds = convertPSTCoordinatesToBounds(element.coordinates, mapDimensions);

                // Validate bounds
                if (isNaN(bounds.x) || isNaN(bounds.y) || isNaN(bounds.width) || isNaN(bounds.height)) {
                    console.warn('Invalid bounds calculated for PST drag:', {element, bounds});
                    return;
                }

                setDragOriginalBounds(bounds);
                setDragPreviewBounds(bounds);

                // Disable pan/zoom during drag to prevent conflicts
                setTool('TOOL_NONE');

                // Clear hover state during drag to prevent conflicts
                setHoveredPSTElement(null);

                console.log('PST drag started:', {element: element.id, bounds});
            } catch (error) {
                console.error('Error starting PST drag:', error);
                resetDragState();
            }
        },
        [mapDimensions, setTool, resetDragState],
    );

    const handlePSTDragMove = useCallback(
        (element: PSTElement, currentPosition: {x: number; y: number}) => {
            try {
                // Validate drag state
                if (!draggingPSTElement || !dragOriginalBounds || !dragStartPosition) {
                    console.warn('Invalid drag state during move:', {
                        hasElement: !!draggingPSTElement,
                        hasBounds: !!dragOriginalBounds,
                        hasStartPos: !!dragStartPosition,
                    });
                    return;
                }

                // Calculate movement delta
                const deltaX = currentPosition.x - dragStartPosition.x;
                const deltaY = currentPosition.y - dragStartPosition.y;

                // Calculate new bounds with offset
                const newBounds = {
                    ...dragOriginalBounds,
                    x: dragOriginalBounds.x + deltaX,
                    y: dragOriginalBounds.y + deltaY,
                };

                // Apply constraints to keep bounds within valid limits
                const constrainedBounds = constrainPSTBounds(newBounds, mapDimensions);

                // Update preview bounds
                setDragPreviewBounds(constrainedBounds);

                console.log('PST drag move:', {delta: {deltaX, deltaY}, bounds: constrainedBounds});
            } catch (error) {
                console.error('Error during PST drag move:', error);
            }
        },
        [draggingPSTElement, dragOriginalBounds, dragStartPosition, mapDimensions],
    );

    const handlePSTDragEnd = useCallback(
        (element: PSTElement) => {
            try {
                // Validate element and drag state
                if (!element || !dragPreviewBounds) {
                    console.warn('Invalid element or bounds for drag end:', {element, dragPreviewBounds});
                    resetDragState();
                    return;
                }

                // Convert final bounds back to PST coordinates
                const newCoordinates = convertBoundsToPSTCoordinates(dragPreviewBounds, mapDimensions);

                // Update the map text with new coordinates
                const updatedMapText = updatePSTInMapText(mapText, element, newCoordinates);
                if (updatedMapText !== mapText) {
                    mutateMapText(updatedMapText);
                    console.log('PST element dragged:', {elementId: element.id, newCoordinates});
                } else {
                    console.warn('No changes made to PST element during drag:', {elementId: element.id});
                }

                // Reset drag state
                resetDragState();
            } catch (error) {
                console.error('Error ending PST drag:', error);
                resetDragState();
            }
        },
        [dragPreviewBounds, mapDimensions, mapText, mutateMapText, resetDragState],
    );

    return {
        // State
        hoveredPSTElement,
        resizingPSTElement,
        resizeHandle,
        resizePreviewBounds,
        keyboardModifiers,
        draggingPSTElement,
        dragPreviewBounds,

        // Handlers
        handlePSTHover,
        handlePSTResizeStart,
        handlePSTResizeMove,
        handlePSTResizeEnd,
        handlePSTDragStart,
        handlePSTDragMove,
        handlePSTDragEnd,
        resetResizeState,
        resetDragState,
    };
};
