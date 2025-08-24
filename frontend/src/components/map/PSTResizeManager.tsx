/**
 * PST Resize Manager Component
 * Manages PST resize operations and coordinates map text updates
 */

import React, {useCallback, useState, useRef} from 'react';
import {PSTElement, PSTCoordinates, ResizeHandle, PSTBounds, ResizeModifiers} from '../../types/map/pst';
import {MapDimensions} from '../../constants/defaults';
import {
    convertPSTCoordinatesToBounds,
    convertBoundsToPSTCoordinates,
    calculateResizedBounds,
    constrainPSTBounds,
} from '../../utils/pstCoordinateUtils';
import {updatePSTElementInMapText} from '../../utils/pstMapTextMutation';
import {DEFAULT_RESIZE_CONSTRAINTS} from '../../constants/pstConfig';

interface PSTResizeManagerProps {
    /** PST elements to manage */
    pstElements: PSTElement[];
    /** Map dimensions for coordinate conversion */
    mapDimensions: MapDimensions;
    /** Current map text */
    mapText: string;
    /** Callback to update map text */
    onMapTextUpdate: (newMapText: string) => void;
    /** Children render function */
    children: (props: {
        hoveredElement: PSTElement | null;
        resizingElement: PSTElement | null;
        draggingElement: PSTElement | null;
        keyboardModifiers: ResizeModifiers;
        onPSTHover: (element: PSTElement | null) => void;
        onPSTResizeStart: (element: PSTElement, handle: ResizeHandle, startPosition: {x: number; y: number}) => void;
        onPSTResizeMove: (handle: ResizeHandle, currentPosition: {x: number; y: number}) => void;
        onPSTResizeEnd: (element: PSTElement, data: any) => void;
        onPSTDragStart: (element: PSTElement, startPosition: {x: number; y: number}) => void;
        onPSTDragMove: (element: PSTElement, currentPosition: {x: number; y: number}) => void;
        onPSTDragEnd: (element: PSTElement) => void;
        getResizePreviewBounds: (element: PSTElement) => PSTBounds | null;
        getDragPreviewBounds: (element: PSTElement) => PSTBounds | null;
    }) => React.ReactNode;
}

interface ResizeState {
    element: PSTElement;
    handle: ResizeHandle;
    startPosition: {x: number; y: number};
    startBounds: PSTBounds;
    currentBounds: PSTBounds;
}

interface DragState {
    element: PSTElement;
    startPosition: {x: number; y: number};
    startBounds: PSTBounds;
    currentBounds: PSTBounds;
}

/**
 * PST Resize Manager handles the coordination of PST resize operations
 * and ensures map text is properly updated when resize operations complete
 */
const PSTResizeManager: React.FC<PSTResizeManagerProps> = ({pstElements, mapDimensions, mapText, onMapTextUpdate, children}) => {
    const [hoveredElement, setHoveredElement] = useState<PSTElement | null>(null);
    const [resizeState, setResizeState] = useState<ResizeState | null>(null);
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [keyboardModifiers, setKeyboardModifiers] = useState<ResizeModifiers>({
        maintainAspectRatio: false,
        resizeFromCenter: false,
    });

    // Use refs to store current state for stable access in callbacks
    const resizeStateRef = useRef<ResizeState | null>(null);
    const dragStateRef = useRef<DragState | null>(null);
    const keyboardModifiersRef = useRef<ResizeModifiers>({
        maintainAspectRatio: false,
        resizeFromCenter: false,
    });
    const isMountedRef = useRef(true);

    // Update refs whenever state changes
    React.useEffect(() => {
        resizeStateRef.current = resizeState;
    }, [resizeState]);

    React.useEffect(() => {
        dragStateRef.current = dragState;
    }, [dragState]);

    React.useEffect(() => {
        keyboardModifiersRef.current = keyboardModifiers;
    }, [keyboardModifiers]);

    // Track component mount/unmount
    React.useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            console.log('PSTResizeManager unmounting during operations:', {
                resize: !!resizeStateRef.current,
                drag: !!dragStateRef.current,
            });
        };
    }, []);

    // Track keyboard modifiers during resize operations
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!resizeStateRef.current) return;

            const newModifiers = {
                maintainAspectRatio: event.shiftKey,
                resizeFromCenter: event.altKey,
            };

            // Only update if modifiers actually changed
            if (
                newModifiers.maintainAspectRatio !== keyboardModifiersRef.current.maintainAspectRatio ||
                newModifiers.resizeFromCenter !== keyboardModifiersRef.current.resizeFromCenter
            ) {
                setKeyboardModifiers(newModifiers);
            }

            // Handle Escape key to cancel resize
            if (event.key === 'Escape') {
                console.log('Resize operation cancelled by Escape key');
                setResizeState(null);
                setKeyboardModifiers({
                    maintainAspectRatio: false,
                    resizeFromCenter: false,
                });
                event.preventDefault();
                event.stopPropagation();
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (!resizeStateRef.current) return;

            const newModifiers = {
                maintainAspectRatio: event.shiftKey,
                resizeFromCenter: event.altKey,
            };

            // Only update if modifiers actually changed
            if (
                newModifiers.maintainAspectRatio !== keyboardModifiersRef.current.maintainAspectRatio ||
                newModifiers.resizeFromCenter !== keyboardModifiersRef.current.resizeFromCenter
            ) {
                setKeyboardModifiers(newModifiers);
            }
        };

        if (resizeState) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.removeEventListener('keyup', handleKeyUp);
            };
        }
    }, [resizeState]);

    // Track if we're in the middle of operations
    const isResizing = resizeState !== null;
    const isDragging = dragState !== null;
    const resizingElement = resizeState?.element || null;
    const draggingElement = dragState?.element || null;

    // Handle PST element hover
    const handlePSTHover = useCallback((element: PSTElement | null) => {
        setHoveredElement(element);
    }, []);

    // Handle resize start
    const handlePSTResizeStart = useCallback(
        (element: PSTElement, handle: ResizeHandle, startPosition: {x: number; y: number}) => {
            try {
                console.log('PST resize started:', {element: element.id, handle, bounds: startPosition});

                // Validate input parameters
                if (!element || !element.coordinates || !handle || !startPosition) {
                    console.error('Invalid resize start parameters:', {element, handle, startPosition});
                    return;
                }

                // Convert PST coordinates to SVG bounds
                let startBounds;
                try {
                    startBounds = convertPSTCoordinatesToBounds(element.coordinates, mapDimensions);
                } catch (error) {
                    console.error('Error converting PST coordinates to bounds:', error);
                    return;
                }

                // Validate the converted bounds
                if (
                    !startBounds ||
                    typeof startBounds.x !== 'number' ||
                    typeof startBounds.y !== 'number' ||
                    typeof startBounds.width !== 'number' ||
                    typeof startBounds.height !== 'number' ||
                    isNaN(startBounds.x) ||
                    isNaN(startBounds.y) ||
                    isNaN(startBounds.width) ||
                    isNaN(startBounds.height)
                ) {
                    console.error('Invalid start bounds from coordinate conversion:', {
                        startBounds,
                        coordinates: element.coordinates,
                        mapDimensions,
                        convertFunction: typeof convertPSTCoordinatesToBounds,
                    });
                    return;
                }

                // Initialize resize state
                const newResizeState = {
                    element,
                    handle,
                    startPosition,
                    startBounds,
                    currentBounds: startBounds,
                };

                setResizeState(newResizeState);
            } catch (error) {
                console.error('Failed to start PST resize:', error);
            }
        },
        [mapDimensions],
    );

    // Handle resize move
    const handlePSTResizeMove = useCallback(
        (handle: ResizeHandle, currentPosition: {x: number; y: number}) => {
            const currentResizeState = resizeStateRef.current;
            if (!currentResizeState) {
                console.warn('PST resize move called without active resize state');
                return;
            }

            try {
                const {startPosition, startBounds} = currentResizeState;

                // Calculate delta from start position
                const deltaX = currentPosition.x - startPosition.x;
                const deltaY = currentPosition.y - startPosition.y;

                // Calculate new bounds based on handle and delta, with keyboard modifiers
                let newBounds;
                try {
                    newBounds = calculateResizedBounds(
                        startBounds,
                        handle,
                        deltaX,
                        deltaY,
                        DEFAULT_RESIZE_CONSTRAINTS,
                        mapDimensions,
                        keyboardModifiersRef.current,
                    );
                } catch (error) {
                    console.error('Error calculating resized bounds:', error);
                    return;
                }

                // Constrain bounds to valid ranges
                let constrainedBounds;
                try {
                    constrainedBounds = constrainPSTBounds(newBounds, mapDimensions, DEFAULT_RESIZE_CONSTRAINTS);
                } catch (error) {
                    console.error('Error constraining PST bounds:', error);
                    return;
                }

                // Update resize state with new bounds
                setResizeState(prev =>
                    prev
                        ? {
                              ...prev,
                              currentBounds: constrainedBounds,
                          }
                        : null,
                );
            } catch (error) {
                console.error('Failed to update PST resize:', error);
            }
        },
        [mapDimensions],
    );

    // Handle resize end
    const handlePSTResizeEnd = useCallback(
        (element: PSTElement, data?: any) => {
            const currentResizeState = resizeStateRef.current;
            if (!currentResizeState) {
                console.error('PST resize end called without active resize state');
                console.error('This may indicate a component lifecycle issue or missing coordinate conversion functions');
                console.error('Debug info:', {
                    element: element.id,
                    data,
                    hasResizeState: !!resizeState,
                    isMounted: isMountedRef.current,
                    mapDimensions,
                    hasConvertFunctions: {
                        convertPSTCoordinatesToBounds: typeof convertPSTCoordinatesToBounds,
                        convertBoundsToPSTCoordinates: typeof convertBoundsToPSTCoordinates,
                        calculateResizedBounds: typeof calculateResizedBounds,
                        constrainPSTBounds: typeof constrainPSTBounds,
                    },
                });
                return;
            }

            if (!isMountedRef.current) {
                console.warn('PST resize end called on unmounted component');
                return;
            }

            try {
                // Use currentBounds if available, otherwise fall back to startBounds
                // This handles cases where resize end is called without any move events
                const {currentBounds, startBounds} = currentResizeState;
                const finalBounds = currentBounds || startBounds;

                // Validate that we have valid bounds
                if (
                    !finalBounds ||
                    typeof finalBounds.x !== 'number' ||
                    typeof finalBounds.y !== 'number' ||
                    typeof finalBounds.width !== 'number' ||
                    typeof finalBounds.height !== 'number' ||
                    isNaN(finalBounds.x) ||
                    isNaN(finalBounds.y) ||
                    isNaN(finalBounds.width) ||
                    isNaN(finalBounds.height)
                ) {
                    console.error('Invalid final coordinates:', {
                        finalBounds,
                        currentBounds,
                        startBounds,
                        resizeState: currentResizeState,
                        data,
                        element: element.id,
                    });
                    setResizeState(null);
                    return;
                }

                // Convert final bounds back to PST coordinates
                let newCoordinates;
                try {
                    newCoordinates = convertBoundsToPSTCoordinates(finalBounds, mapDimensions);
                } catch (error) {
                    console.error('Error converting bounds to PST coordinates:', error);
                    setResizeState(null);
                    return;
                }

                // Validate the new coordinates
                if (
                    !newCoordinates ||
                    typeof newCoordinates.maturity1 !== 'number' ||
                    typeof newCoordinates.visibility1 !== 'number' ||
                    typeof newCoordinates.maturity2 !== 'number' ||
                    typeof newCoordinates.visibility2 !== 'number' ||
                    isNaN(newCoordinates.maturity1) ||
                    isNaN(newCoordinates.visibility1) ||
                    isNaN(newCoordinates.maturity2) ||
                    isNaN(newCoordinates.visibility2) ||
                    newCoordinates.maturity1 < 0 ||
                    newCoordinates.maturity1 > 1 ||
                    newCoordinates.visibility1 < 0 ||
                    newCoordinates.visibility1 > 1 ||
                    newCoordinates.maturity2 < 0 ||
                    newCoordinates.maturity2 > 1 ||
                    newCoordinates.visibility2 < 0 ||
                    newCoordinates.visibility2 > 1 ||
                    newCoordinates.maturity2 <= newCoordinates.maturity1 ||
                    newCoordinates.visibility1 <= newCoordinates.visibility2
                ) {
                    console.error('Invalid converted coordinates:', {
                        newCoordinates,
                        finalBounds,
                        mapDimensions,
                        element: element.id,
                    });
                    setResizeState(null);
                    return;
                }

                // Update map text with new coordinates
                const updatedMapText = updatePSTElementInMapText({
                    mapText,
                    pstElement: element,
                    newCoordinates,
                });

                // Notify parent of map text update
                onMapTextUpdate(updatedMapText);

                console.log('PST resize completed:', {
                    element: element.id,
                    oldCoordinates: element.coordinates,
                    newCoordinates,
                    finalBounds,
                });

                // Clear resize state and reset keyboard modifiers
                setResizeState(null);
                setKeyboardModifiers({
                    maintainAspectRatio: false,
                    resizeFromCenter: false,
                });
            } catch (error) {
                console.error('Failed to complete PST resize:', error);
                console.warn('Map text was not updated during resize end');

                // Clear resize state and reset keyboard modifiers even on error
                setResizeState(null);
                setKeyboardModifiers({
                    maintainAspectRatio: false,
                    resizeFromCenter: false,
                });
            }
        },
        [resizeState, mapDimensions, mapText, onMapTextUpdate],
    );

    // Handle drag start
    const handlePSTDragStart = useCallback(
        (element: PSTElement, startPosition: {x: number; y: number}) => {
            try {
                console.log('PST drag started:', {element: element.id, startPosition});

                // Don't start drag if we're already resizing
                if (resizeStateRef.current) {
                    console.warn('Cannot start drag while resizing');
                    return;
                }

                // Validate input parameters
                if (!element || !element.coordinates || !startPosition) {
                    console.error('Invalid drag start parameters:', {element, startPosition});
                    return;
                }

                // Convert PST coordinates to SVG bounds
                let startBounds;
                try {
                    startBounds = convertPSTCoordinatesToBounds(element.coordinates, mapDimensions);
                } catch (error) {
                    console.error('Error converting PST coordinates to bounds for drag:', error);
                    return;
                }

                // Validate the converted bounds
                if (
                    !startBounds ||
                    typeof startBounds.x !== 'number' ||
                    typeof startBounds.y !== 'number' ||
                    typeof startBounds.width !== 'number' ||
                    typeof startBounds.height !== 'number' ||
                    isNaN(startBounds.x) ||
                    isNaN(startBounds.y) ||
                    isNaN(startBounds.width) ||
                    isNaN(startBounds.height)
                ) {
                    console.error('Invalid start bounds from coordinate conversion for drag:', {
                        startBounds,
                        coordinates: element.coordinates,
                        mapDimensions,
                    });
                    return;
                }

                // Initialize drag state
                const newDragState = {
                    element,
                    startPosition,
                    startBounds,
                    currentBounds: startBounds,
                };

                setDragState(newDragState);
            } catch (error) {
                console.error('Failed to start PST drag:', error);
            }
        },
        [mapDimensions],
    );

    // Handle drag move
    const handlePSTDragMove = useCallback(
        (element: PSTElement, currentPosition: {x: number; y: number}) => {
            const currentDragState = dragStateRef.current;
            if (!currentDragState) {
                console.warn('PST drag move called without active drag state');
                return;
            }

            try {
                const {startPosition, startBounds} = currentDragState;

                // Calculate delta from start position
                const deltaX = currentPosition.x - startPosition.x;
                const deltaY = currentPosition.y - startPosition.y;

                // Calculate new bounds by translating the original bounds
                const newBounds = {
                    x: startBounds.x + deltaX,
                    y: startBounds.y + deltaY,
                    width: startBounds.width,
                    height: startBounds.height,
                };

                // Constrain bounds to valid ranges
                let constrainedBounds;
                try {
                    constrainedBounds = constrainPSTBounds(newBounds, mapDimensions, DEFAULT_RESIZE_CONSTRAINTS);
                } catch (error) {
                    console.error('Error constraining PST bounds during drag:', error);
                    return;
                }

                // Update drag state with new bounds
                setDragState(prev =>
                    prev
                        ? {
                              ...prev,
                              currentBounds: constrainedBounds,
                          }
                        : null,
                );
            } catch (error) {
                console.error('Failed to update PST drag:', error);
            }
        },
        [mapDimensions],
    );

    // Handle drag end
    const handlePSTDragEnd = useCallback(
        (element: PSTElement) => {
            const currentDragState = dragStateRef.current;
            if (!currentDragState) {
                console.error('PST drag end called without active drag state');
                return;
            }

            if (!isMountedRef.current) {
                console.warn('PST drag end called on unmounted component');
                return;
            }

            try {
                // Use currentBounds if available, otherwise fall back to startBounds
                const {currentBounds, startBounds} = currentDragState;
                const finalBounds = currentBounds || startBounds;

                // Validate that we have valid bounds
                if (
                    !finalBounds ||
                    typeof finalBounds.x !== 'number' ||
                    typeof finalBounds.y !== 'number' ||
                    typeof finalBounds.width !== 'number' ||
                    typeof finalBounds.height !== 'number' ||
                    isNaN(finalBounds.x) ||
                    isNaN(finalBounds.y) ||
                    isNaN(finalBounds.width) ||
                    isNaN(finalBounds.height)
                ) {
                    console.error('Invalid final bounds for drag:', {
                        finalBounds,
                        currentBounds,
                        startBounds,
                        dragState: currentDragState,
                        element: element.id,
                    });
                    setDragState(null);
                    return;
                }

                // Convert final bounds back to PST coordinates
                let newCoordinates;
                try {
                    newCoordinates = convertBoundsToPSTCoordinates(finalBounds, mapDimensions);
                } catch (error) {
                    console.error('Error converting bounds to PST coordinates for drag:', error);
                    setDragState(null);
                    return;
                }

                // Validate the new coordinates
                if (
                    !newCoordinates ||
                    typeof newCoordinates.maturity1 !== 'number' ||
                    typeof newCoordinates.visibility1 !== 'number' ||
                    typeof newCoordinates.maturity2 !== 'number' ||
                    typeof newCoordinates.visibility2 !== 'number' ||
                    isNaN(newCoordinates.maturity1) ||
                    isNaN(newCoordinates.visibility1) ||
                    isNaN(newCoordinates.maturity2) ||
                    isNaN(newCoordinates.visibility2) ||
                    newCoordinates.maturity1 < 0 ||
                    newCoordinates.maturity1 > 1 ||
                    newCoordinates.visibility1 < 0 ||
                    newCoordinates.visibility1 > 1 ||
                    newCoordinates.maturity2 < 0 ||
                    newCoordinates.maturity2 > 1 ||
                    newCoordinates.visibility2 < 0 ||
                    newCoordinates.visibility2 > 1 ||
                    newCoordinates.maturity2 <= newCoordinates.maturity1 ||
                    newCoordinates.visibility1 <= newCoordinates.visibility2
                ) {
                    console.error('Invalid converted coordinates for drag:', {
                        newCoordinates,
                        finalBounds,
                        mapDimensions,
                        element: element.id,
                    });
                    setDragState(null);
                    return;
                }

                // Update map text with new coordinates
                const updatedMapText = updatePSTElementInMapText({
                    mapText,
                    pstElement: element,
                    newCoordinates,
                });

                // Notify parent of map text update
                onMapTextUpdate(updatedMapText);

                console.log('PST drag completed:', {
                    element: element.id,
                    oldCoordinates: element.coordinates,
                    newCoordinates,
                    finalBounds,
                });

                // Clear drag state
                setDragState(null);
            } catch (error) {
                console.error('Failed to complete PST drag:', error);
                console.warn('Map text was not updated during drag end');

                // Clear drag state even on error
                setDragState(null);
            }
        },
        [mapDimensions, mapText, onMapTextUpdate],
    );

    // Get preview bounds for a specific element during resize
    const getResizePreviewBounds = useCallback(
        (element: PSTElement): PSTBounds | null => {
            if (!resizeState || resizeState.element.id !== element.id) {
                return null;
            }
            return resizeState.currentBounds;
        },
        [resizeState],
    );

    // Get preview bounds for a specific element during drag
    const getDragPreviewBounds = useCallback(
        (element: PSTElement): PSTBounds | null => {
            if (!dragState || dragState.element.id !== element.id) {
                return null;
            }
            return dragState.currentBounds;
        },
        [dragState],
    );

    return (
        <>
            {children({
                hoveredElement,
                resizingElement,
                draggingElement,
                keyboardModifiers,
                onPSTHover: handlePSTHover,
                onPSTResizeStart: handlePSTResizeStart,
                onPSTResizeMove: handlePSTResizeMove,
                onPSTResizeEnd: handlePSTResizeEnd,
                onPSTDragStart: handlePSTDragStart,
                onPSTDragMove: handlePSTDragMove,
                onPSTDragEnd: handlePSTDragEnd,
                getResizePreviewBounds,
                getDragPreviewBounds,
            })}
        </>
    );
};

export default PSTResizeManager;
