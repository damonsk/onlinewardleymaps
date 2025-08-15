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
}) => {
    const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPosition, setDragStartPosition] = useState<{x: number; y: number} | null>(null);

    // Calculate handle size based on scale factor and accessibility requirements
    const getHandleSize = useCallback(() => {
        // Base size of 8px, scaled by zoom level, minimum 6px for accessibility
        const baseSize = 8;
        const scaledSize = baseSize / scaleFactor;
        return Math.max(scaledSize, 6);
    }, [scaleFactor]);

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

    // Handle mouse down on resize handle
    const handleMouseDown = useCallback(
        (handle: ResizeHandle, event: React.MouseEvent) => {
            try {
                event.preventDefault();
                event.stopPropagation();

                // Validate event and position
                if (isNaN(event.clientX) || isNaN(event.clientY)) {
                    console.warn('Invalid mouse position in resize handle mousedown:', { x: event.clientX, y: event.clientY });
                    return;
                }

                const startPosition = {x: event.clientX, y: event.clientY};
                setActiveHandle(handle);
                setIsDragging(true);
                setDragStartPosition(startPosition);

                if (onResizeStart) {
                    onResizeStart(handle, startPosition);
                }
            } catch (error) {
                console.error('Error in resize handle mousedown:', error);
                // Reset state on error
                setActiveHandle(null);
                setIsDragging(false);
                setDragStartPosition(null);
            }
        },
        [onResizeStart],
    );

    // Handle mouse move during drag
    const handleMouseMove = useCallback(
        (event: MouseEvent) => {
            try {
                if (!isDragging || !activeHandle || !dragStartPosition) return;

                event.preventDefault();
                
                // Validate mouse position
                if (isNaN(event.clientX) || isNaN(event.clientY)) {
                    console.warn('Invalid mouse position during resize move:', { x: event.clientX, y: event.clientY });
                    return;
                }

                const currentPosition = {x: event.clientX, y: event.clientY};

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

    // Handle mouse up to end drag
    const handleMouseUp = useCallback(
        (event: MouseEvent) => {
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

    // Set up global mouse event listeners for drag operations
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove, { passive: false });
            document.addEventListener('mouseup', handleMouseUp, { passive: false });
            document.addEventListener('mouseleave', handleMouseUp, { passive: false });
            
            // Prevent text selection during drag
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('mouseleave', handleMouseUp);
                
                // Restore text selection
                document.body.style.userSelect = '';
                document.body.style.webkitUserSelect = '';
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Cleanup on unmount or when visibility changes
    useEffect(() => {
        return () => {
            if (isDragging) {
                // Force cleanup if component unmounts during drag
                setIsDragging(false);
                setActiveHandle(null);
                setDragStartPosition(null);
                
                // Restore text selection
                document.body.style.userSelect = '';
                document.body.style.webkitUserSelect = '';
            }
        };
    }, []);

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
        >
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
                        fill={isActive ? '#2196F3' : '#ffffff'}
                        stroke={isActive ? '#1976D2' : '#666666'}
                        strokeWidth={1}
                        rx={2}
                        ry={2}
                        style={{
                            cursor: getCursorStyle(handle),
                            opacity: isActive ? 1 : 0.8,
                            transition: isDragging ? 'none' : 'all 0.2s ease-in-out',
                        }}
                        onMouseDown={event => handleMouseDown(handle, event)}
                        onMouseEnter={event => {
                            // Add hover effect
                            const element = event.currentTarget as SVGRectElement;
                            if (!isDragging) {
                                element.style.opacity = '1';
                                element.style.transform = 'scale(1.1)';
                            }
                        }}
                        onMouseLeave={event => {
                            // Remove hover effect
                            const element = event.currentTarget as SVGRectElement;
                            if (!isDragging) {
                                element.style.opacity = '0.8';
                                element.style.transform = 'scale(1)';
                            }
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

            {/* Hidden element for screen reader instructions */}
            <text id="resize-instructions" x={-1000} y={-1000} style={{opacity: 0, pointerEvents: 'none'}} aria-hidden="true">
                Use arrow keys or drag to resize. Press Escape to cancel.
            </text>
        </g>
    );
};

export default ResizeHandles;
