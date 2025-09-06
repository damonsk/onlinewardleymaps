import React, {useCallback, useEffect, useState} from 'react';
import {PSTBounds, ResizeHandle} from '../../types/map/pst';
import {MapTheme} from '../../types/map/styles';

interface ResizeHandlesProps {
    /** Bounds of the PST element being resized */
    bounds: PSTBounds;
    /** Whether the resize handles should be visible */
    isVisible: boolean;
    /** Callback when resize operation starts */
    onResizeStart: (handle: ResizeHandle, startPosition: {x: number; y: number}) => void;
    /** Callback during resize operation */
    onResizeMove: (handle: ResizeHandle, currentPosition: {x: number; y: number}) => void;
    /** Callback when resize operation ends */
    onResizeEnd: (handle: ResizeHandle) => void;
    /** Scale factor for handle sizing based on map zoom */
    scaleFactor: number;
    /** Map theme for styling */
    mapStyleDefs: MapTheme;
    /** Keyboard modifiers for visual feedback */
    keyboardModifiers?: {maintainAspectRatio: boolean; resizeFromCenter: boolean};
}

/**
 * ResizeHandles component provides interactive resize handles for PST elements
 * Renders 8 handles: 4 corners + 4 edges with appropriate cursor styling
 */
const ResizeHandles: React.FC<ResizeHandlesProps> = ({
    bounds,
    isVisible,
    onResizeStart,
    onResizeMove,
    onResizeEnd,
    scaleFactor,
    mapStyleDefs,
    keyboardModifiers = {maintainAspectRatio: false, resizeFromCenter: false},
}) => {
    const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPosition, setDragStartPosition] = useState<{x: number; y: number} | null>(null);

    // Detect if device supports touch
    const isTouchDevice = useCallback(() => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }, []);

    // Calculate handle size based on scale factor, accessibility requirements, and touch support
    const getHandleSize = useCallback(() => {
        // Base size of 8px for mouse, 16px for touch devices
        const baseSize = isTouchDevice() ? 16 : 8;
        const scaledSize = baseSize / scaleFactor;
        // Minimum 6px for mouse, 12px for touch devices
        const minSize = isTouchDevice() ? 12 : 6;
        return Math.max(scaledSize, minSize);
    }, [scaleFactor, isTouchDevice]);

    // Get cursor style for each handle direction
    const getCursorStyle = useCallback((handle: ResizeHandle): string => {
        const cursorMap: Record<ResizeHandle, string> = {
            'top-left': 'nw-resize',
            'top-center': 'n-resize',
            'top-right': 'ne-resize',
            'middle-left': 'w-resize',
            'middle-right': 'e-resize',
            'bottom-left': 'sw-resize',
            'bottom-center': 's-resize',
            'bottom-right': 'se-resize',
        };
        return cursorMap[handle];
    }, []);

    // Calculate handle position based on bounds and handle type
    const getHandlePosition = useCallback(
        (handle: ResizeHandle) => {
            const {x, y, width, height} = bounds;
            const handleSize = getHandleSize();
            const offset = handleSize / 2;

            const positions: Record<ResizeHandle, {x: number; y: number}> = {
                'top-left': {x: x - offset, y: y - offset},
                'top-center': {x: x + width / 2 - offset, y: y - offset},
                'top-right': {x: x + width - offset, y: y - offset},
                'middle-left': {x: x - offset, y: y + height / 2 - offset},
                'middle-right': {x: x + width - offset, y: y + height / 2 - offset},
                'bottom-left': {x: x - offset, y: y + height - offset},
                'bottom-center': {x: x + width / 2 - offset, y: y + height - offset},
                'bottom-right': {x: x + width - offset, y: y + height - offset},
            };

            return positions[handle];
        },
        [bounds, getHandleSize],
    );

    // Handle pointer down (mouse or touch) on resize handle
    const handlePointerDown = useCallback(
        (handle: ResizeHandle, event: React.MouseEvent | React.TouchEvent) => {
            try {
                event.preventDefault();
                event.stopPropagation();

                // Get position from mouse or touch event
                let clientX: number, clientY: number;
                if ('touches' in event && event.touches.length > 0) {
                    // Touch event
                    clientX = event.touches[0].clientX;
                    clientY = event.touches[0].clientY;
                } else if ('clientX' in event) {
                    // Mouse event
                    clientX = event.clientX;
                    clientY = event.clientY;
                } else {
                    console.warn('Invalid event type in resize handle pointerdown');
                    return;
                }

                // Validate position
                if (isNaN(clientX) || isNaN(clientY)) {
                    console.warn('Invalid pointer position in resize handle pointerdown:', {x: clientX, y: clientY});
                    return;
                }

                const startPosition = {x: clientX, y: clientY};
                setActiveHandle(handle);
                setIsDragging(true);
                setDragStartPosition(startPosition);

                if (onResizeStart) {
                    onResizeStart(handle, startPosition);
                }
            } catch (error) {
                console.error('Error in resize handle pointerdown:', error);
                // Reset state on error
                setActiveHandle(null);
                setIsDragging(false);
                setDragStartPosition(null);
            }
        },
        [onResizeStart],
    );

    // Handle mouse down on resize handle (legacy support)
    const handleMouseDown = useCallback(
        (handle: ResizeHandle, event: React.MouseEvent) => {
            handlePointerDown(handle, event);
        },
        [handlePointerDown],
    );

    // Handle touch start on resize handle
    const handleTouchStart = useCallback(
        (handle: ResizeHandle, event: React.TouchEvent) => {
            handlePointerDown(handle, event);
        },
        [handlePointerDown],
    );

    // Handle pointer move during drag (mouse or touch)
    const handlePointerMove = useCallback(
        (event: MouseEvent | TouchEvent) => {
            try {
                if (!isDragging || !activeHandle || !dragStartPosition) return;

                event.preventDefault();

                // Get position from mouse or touch event
                let clientX: number, clientY: number;
                if ('touches' in event && event.touches.length > 0) {
                    // Touch event
                    clientX = event.touches[0].clientX;
                    clientY = event.touches[0].clientY;
                } else if ('clientX' in event) {
                    // Mouse event
                    clientX = event.clientX;
                    clientY = event.clientY;
                } else {
                    console.warn('Invalid event type during resize move');
                    return;
                }

                // Validate position
                if (isNaN(clientX) || isNaN(clientY)) {
                    console.warn('Invalid pointer position during resize move:', {x: clientX, y: clientY});
                    return;
                }

                const currentPosition = {x: clientX, y: clientY};

                if (onResizeMove) {
                    onResizeMove(activeHandle, currentPosition);
                }
            } catch (error) {
                console.error('Error during resize move:', error);
                // Don't reset state during move to avoid interrupting the operation
            }
        },
        [isDragging, activeHandle, dragStartPosition, onResizeMove],
    );

    // Handle pointer end to end drag (mouse or touch)
    const handlePointerEnd = useCallback(
        (event: MouseEvent | TouchEvent) => {
            try {
                if (!isDragging || !activeHandle) return;

                event.preventDefault();

                // Store current handle before resetting state
                const currentActiveHandle = activeHandle;

                // Reset drag state
                setIsDragging(false);
                setActiveHandle(null);
                setDragStartPosition(null);

                // Notify parent of resize end
                console.log('ResizeHandles: calling onResizeEnd for handle:', currentActiveHandle);
                if (onResizeEnd) {
                    onResizeEnd(currentActiveHandle);
                }
            } catch (error) {
                console.error('Error ending resize operation:', error);
                // Always reset state, even on error
                setIsDragging(false);
                setActiveHandle(null);
                setDragStartPosition(null);
            }
        },
        [isDragging, activeHandle, onResizeEnd],
    );

    // Legacy mouse handlers
    const handleMouseMove = useCallback(
        (event: MouseEvent) => {
            handlePointerMove(event);
        },
        [handlePointerMove],
    );

    const handleMouseUp = useCallback(
        (event: MouseEvent) => {
            handlePointerEnd(event);
        },
        [handlePointerEnd],
    );

    // Touch handlers
    const handleTouchMove = useCallback(
        (event: TouchEvent) => {
            handlePointerMove(event);
        },
        [handlePointerMove],
    );

    const handleTouchEnd = useCallback(
        (event: TouchEvent) => {
            handlePointerEnd(event);
        },
        [handlePointerEnd],
    );

    // Set up global pointer event listeners for drag operations (mouse and touch)
    useEffect(() => {
        if (isDragging) {
            // Mouse events
            document.addEventListener('mousemove', handleMouseMove, {passive: false});
            document.addEventListener('mouseup', handleMouseUp, {passive: false});
            document.addEventListener('mouseleave', handleMouseUp, {passive: false});

            // Touch events
            document.addEventListener('touchmove', handleTouchMove, {passive: false});
            document.addEventListener('touchend', handleTouchEnd, {passive: false});
            document.addEventListener('touchcancel', handleTouchEnd, {passive: false});

            // Prevent text selection and scrolling during drag
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            document.body.style.touchAction = 'none';

            return () => {
                // Remove mouse events
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('mouseleave', handleMouseUp);

                // Remove touch events
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
                document.removeEventListener('touchcancel', handleTouchEnd);

                // Restore text selection and scrolling
                document.body.style.userSelect = '';
                document.body.style.webkitUserSelect = '';
                document.body.style.touchAction = '';
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    // Cleanup on unmount or when visibility changes
    useEffect(() => {
        return () => {
            if (isDragging) {
                // Force cleanup if component unmounts during drag
                setIsDragging(false);
                setActiveHandle(null);
                setDragStartPosition(null);

                // Restore text selection and touch action
                document.body.style.userSelect = '';
                document.body.style.webkitUserSelect = '';
                document.body.style.touchAction = '';
            }
        };
    }, [isDragging]);

    // Reset state when handles become invisible
    useEffect(() => {
        if (!isVisible && isDragging) {
            // Cancel drag operation if handles become invisible
            setIsDragging(false);
            setActiveHandle(null);
            setDragStartPosition(null);
        }
    }, [isVisible, isDragging]);

    // Don't render if not visible
    if (!isVisible) return null;

    const handleSize = getHandleSize();
    const handles: ResizeHandle[] = [
        'top-left',
        'top-center',
        'top-right',
        'middle-left',
        'middle-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
    ];

    return (
        <g
            className="resize-handles"
            data-testid="resize-handles"
            onMouseEnter={event => {
                // Prevent parent from hiding handles when mouse is over resize handles
                event.stopPropagation();
            }}
            onMouseLeave={event => {
                // Allow parent to handle mouse leave
                event.stopPropagation();
            }}>
            {handles.map(handle => {
                const position = getHandlePosition(handle);
                const isActive = activeHandle === handle;

                return (
                    <rect
                        key={handle}
                        data-testid={`resize-handle-${handle}`}
                        x={position.x}
                        y={position.y}
                        width={handleSize}
                        height={handleSize}
                        fill={
                            isActive
                                ? '#2196F3'
                                : keyboardModifiers.maintainAspectRatio || keyboardModifiers.resizeFromCenter
                                  ? '#FFC107'
                                  : '#ffffff'
                        }
                        stroke={
                            isActive
                                ? '#1976D2'
                                : keyboardModifiers.maintainAspectRatio || keyboardModifiers.resizeFromCenter
                                  ? '#FF8F00'
                                  : '#666666'
                        }
                        strokeWidth={keyboardModifiers.maintainAspectRatio || keyboardModifiers.resizeFromCenter ? 2 : 1}
                        rx={2}
                        ry={2}
                        style={{
                            cursor: getCursorStyle(handle),
                            opacity: isActive ? 1 : 0.8,
                            transition: isDragging ? 'none' : 'all 0.2s ease-in-out',
                        }}
                        onMouseDown={event => handleMouseDown(handle, event)}
                        onTouchStart={event => {
                            // Handle touch start for resize operation
                            handleTouchStart(handle, event);
                            // Add touch feedback and prevent parent from hiding handles
                            const element = event.currentTarget as SVGRectElement;
                            if (!isDragging) {
                                element.style.opacity = '1';
                                element.style.transform = 'scale(1.2)';
                            }
                            // Prevent event from bubbling to parent
                            event.stopPropagation();
                        }}
                        onMouseEnter={event => {
                            // Add hover effect and prevent parent from hiding handles
                            const element = event.currentTarget as SVGRectElement;
                            if (!isDragging) {
                                element.style.opacity = '1';
                                element.style.transform = 'scale(1.1)';
                            }
                            // Prevent event from bubbling to parent
                            event.stopPropagation();
                        }}
                        onMouseLeave={event => {
                            // Remove hover effect
                            const element = event.currentTarget as SVGRectElement;
                            if (!isDragging) {
                                element.style.opacity = '0.8';
                                element.style.transform = 'scale(1)';
                            }
                            // Prevent event from bubbling to parent
                            event.stopPropagation();
                        }}
                        onTouchEnd={event => {
                            // Remove touch feedback
                            const element = event.currentTarget as SVGRectElement;
                            if (!isDragging) {
                                element.style.opacity = '0.8';
                                element.style.transform = 'scale(1)';
                            }
                            // Prevent event from bubbling to parent
                            event.stopPropagation();
                        }}
                        // Accessibility attributes
                        role="button"
                        tabIndex={0}
                        aria-label={`Resize handle: ${handle.replace('-', ' ')}`}
                        aria-describedby="resize-instructions"
                        onKeyDown={event => {
                            // Support keyboard interaction
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                // Simulate mouse down for keyboard users
                                const mouseEvent = new MouseEvent('mousedown', {
                                    clientX: position.x + handleSize / 2,
                                    clientY: position.y + handleSize / 2,
                                    bubbles: true,
                                }) as any;
                                handleMouseDown(handle, mouseEvent);
                            }
                        }}
                    />
                );
            })}

            {/* Keyboard modifier indicators */}
            {(keyboardModifiers.maintainAspectRatio || keyboardModifiers.resizeFromCenter) && (
                <g className="keyboard-modifier-indicators">
                    {/* Background for modifier text */}
                    <rect
                        x={bounds.x + bounds.width + 10}
                        y={bounds.y - 5}
                        width={120}
                        height={keyboardModifiers.maintainAspectRatio && keyboardModifiers.resizeFromCenter ? 35 : 20}
                        fill="rgba(0, 0, 0, 0.8)"
                        stroke="#FFC107"
                        strokeWidth={1}
                        rx={4}
                        ry={4}
                        pointerEvents="none"
                    />

                    {/* Shift key indicator */}
                    {keyboardModifiers.maintainAspectRatio && (
                        <text
                            x={bounds.x + bounds.width + 15}
                            y={bounds.y + 8}
                            fill="#FFC107"
                            fontSize="10"
                            fontWeight="600"
                            pointerEvents="none"
                            style={{userSelect: 'none'}}>
                            Shift: Aspect Ratio
                        </text>
                    )}

                    {/* Alt key indicator */}
                    {keyboardModifiers.resizeFromCenter && (
                        <text
                            x={bounds.x + bounds.width + 15}
                            y={keyboardModifiers.maintainAspectRatio ? bounds.y + 23 : bounds.y + 8}
                            fill="#FFC107"
                            fontSize="10"
                            fontWeight="600"
                            pointerEvents="none"
                            style={{userSelect: 'none'}}>
                            Alt: Resize from Center
                        </text>
                    )}
                </g>
            )}

            {/* Hidden element for screen reader instructions */}
            <text id="resize-instructions" x={-1000} y={-1000} style={{opacity: 0, pointerEvents: 'none'}} aria-hidden="true">
                Use arrow keys or drag to resize. Press Escape to cancel.
            </text>
        </g>
    );
};

export default ResizeHandles;
