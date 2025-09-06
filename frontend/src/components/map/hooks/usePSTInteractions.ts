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
    currentTool: any;
    panZoomValue: any;
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
    const {mapDimensions, mapText, mutateMapText, setTool, currentTool, panZoomValue} = props;

    // Hover state
    const [hoveredPSTElement, setHoveredPSTElement] = useState<PSTElement | null>(null);

    // Resize state management
    const [resizingPSTElement, setResizingPSTElement] = useState<PSTElement | null>(null);
    const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
    const [resizePreviewBounds, setResizePreviewBounds] = useState<PSTBounds | null>(null);
    const [resizeStartPosition, setResizeStartPosition] = useState<{x: number; y: number} | null>(null);
    const [originalBounds, setOriginalBounds] = useState<PSTBounds | null>(null);
    const [originalTool, setOriginalTool] = useState<any>(null);
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
        
        // Restore original tool state
        if (originalTool !== null) {
            setTool(originalTool);
            setOriginalTool(null);
        }
    }, [originalTool, setTool]);

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
            if (!element?.coordinates || !handle) return;

            try {
                const bounds = convertPSTCoordinatesToBounds(element.coordinates, mapDimensions);
                
                setResizingPSTElement(element);
                setResizeHandle(handle);
                setResizeStartPosition(startPosition);
                setOriginalBounds(bounds);
                setResizePreviewBounds(bounds);
                
                // Store current tool and disable pan/zoom during resize
                setOriginalTool(currentTool);
                setTool('TOOL_NONE');
                setHoveredPSTElement(null);
            } catch (error) {
                console.error('Error starting PST resize:', error);
                resetResizeState();
            }
        },
        [mapDimensions, setTool, currentTool, resetResizeState],
    );

    const handlePSTResizeMove = useCallback(
        (handle: ResizeHandle, currentPosition: {x: number; y: number}) => {
            if (!resizingPSTElement || !originalBounds || !resizeStartPosition || !handle) return;

            try {
                const deltaX = currentPosition.x - resizeStartPosition.x;
                const deltaY = currentPosition.y - resizeStartPosition.y;

                const newBounds = calculateResizedBounds(
                    originalBounds,
                    handle,
                    deltaX,
                    deltaY,
                    undefined,
                    mapDimensions,
                    keyboardModifiers,
                );

                const constrainedBounds = constrainPSTBounds(newBounds, mapDimensions);
                setResizePreviewBounds(constrainedBounds);
            } catch (error) {
                console.error('Error during PST resize move:', error);
            }
        },
        [resizingPSTElement, originalBounds, resizeStartPosition, keyboardModifiers, mapDimensions],
    );

    const handlePSTResizeEnd = useCallback(
        (element: PSTElement, newCoordinates?: PSTCoordinates) => {
            if (!element) {
                resetResizeState();
                return;
            }

            try {
                let coordinatesToUpdate = newCoordinates;
                
                // If no coordinates provided, calculate from preview bounds
                if (!coordinatesToUpdate && resizePreviewBounds) {
                    coordinatesToUpdate = convertBoundsToPSTCoordinates(resizePreviewBounds, mapDimensions);
                }

                if (coordinatesToUpdate) {
                    const updatedMapText = updatePSTInMapText(mapText, element, coordinatesToUpdate);
                    if (updatedMapText !== mapText) {
                        mutateMapText(updatedMapText);
                    }
                }

                resetResizeState();
            } catch (error) {
                console.error('Error ending PST resize:', error);
                resetResizeState();
            }
        },
        [mapText, mutateMapText, resetResizeState, resizePreviewBounds, mapDimensions],
    );

    const handlePSTDragStart = useCallback(
        (_element: PSTElement, _startPosition: {x: number; y: number}) => {
            // DISABLED: Conflicts with PSTBox drag handling - PSTBox manages drag start internally
        },
        [],
    );

    const handlePSTDragMove = useCallback(
        (element: PSTElement, currentPosition: {x: number; y: number}) => {
            try {
                // Initialize drag state if not already started (PSTBox initiates drag differently)
                if (!draggingPSTElement || !dragOriginalBounds || !dragStartPosition) {
                    if (!draggingPSTElement && element) {
                        const bounds = convertPSTCoordinatesToBounds(element.coordinates, mapDimensions);
                        setDraggingPSTElement(element);
                        setDragOriginalBounds(bounds);
                        setDragStartPosition(currentPosition);
                        setDragPreviewBounds(bounds);
                        return;
                    }
                    return;
                }

                // Convert client pixel delta to SVG coordinate delta accounting for zoom
                const clientDeltaX = currentPosition.x - dragStartPosition.x;
                const clientDeltaY = currentPosition.y - dragStartPosition.y;
                const deltaX = clientDeltaX / panZoomValue.a;
                const deltaY = clientDeltaY / panZoomValue.d;

                // Calculate and constrain new bounds
                const newBounds = {
                    ...dragOriginalBounds,
                    x: dragOriginalBounds.x + deltaX,
                    y: dragOriginalBounds.y + deltaY,
                };
                const constrainedBounds = constrainPSTBounds(newBounds, mapDimensions);
                setDragPreviewBounds(constrainedBounds);
            } catch (error) {
                console.error('Error during PST drag move:', error);
            }
        },
        [draggingPSTElement, dragOriginalBounds, dragStartPosition, mapDimensions, panZoomValue],
    );

    const handlePSTDragEnd = useCallback(
        (element: PSTElement) => {
            if (!element || !dragPreviewBounds) {
                resetDragState();
                return;
            }

            try {
                const newCoordinates = convertBoundsToPSTCoordinates(dragPreviewBounds, mapDimensions);
                const updatedMapText = updatePSTInMapText(mapText, element, newCoordinates);
                
                if (updatedMapText !== mapText) {
                    mutateMapText(updatedMapText);
                }

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
