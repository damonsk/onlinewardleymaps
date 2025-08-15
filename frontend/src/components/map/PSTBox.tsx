import React, {useCallback, useState, useRef, useEffect} from 'react';
import {PSTElement, PSTBounds, ResizeHandle} from '../../types/map/pst';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import {PST_CONFIG} from '../../constants/pstConfig';
import {convertPSTCoordinatesToBounds} from '../../utils/pstCoordinateUtils';
import ResizeHandles from './ResizeHandles';

interface PSTBoxProps {
    /** PST element to render */
    pstElement: PSTElement;
    /** Map dimensions for coordinate conversion */
    mapDimensions: MapDimensions;
    /** Map theme for styling */
    mapStyleDefs: MapTheme;
    /** Scale factor for responsive sizing */
    scaleFactor: number;
    /** Whether this PST element is currently hovered */
    isHovered: boolean;
    /** Whether this PST element is currently being resized */
    isResizing: boolean;
    /** Whether this PST element is currently being dragged */
    isDragging?: boolean;
    /** Keyboard modifiers for resize operations */
    keyboardModifiers?: {maintainAspectRatio: boolean; resizeFromCenter: boolean};
    /** Callback when resize operation starts */
    onResizeStart: (element: PSTElement, handle: ResizeHandle, startPosition: {x: number; y: number}) => void;
    /** Callback during resize operation */
    onResizeMove?: (handle: ResizeHandle, currentPosition: {x: number; y: number}) => void;
    /** Callback when resize operation ends */
    onResizeEnd: (element: PSTElement, newCoordinates: any) => void;
    /** Callback when drag operation starts */
    onDragStart?: (element: PSTElement, startPosition: {x: number; y: number}) => void;
    /** Callback during drag operation */
    onDragMove?: (element: PSTElement, currentPosition: {x: number; y: number}) => void;
    /** Callback when drag operation ends */
    onDragEnd?: (element: PSTElement) => void;
    /** Callback when hover state changes */
    onHover: (element: PSTElement | null) => void;
    /** Function to update map text */
    mutateMapText: (newText: string) => void;
    /** Current map text */
    mapText: string;
}

/**
 * PSTBox component renders individual PST elements as rectangles with hover detection
 * and resize handle integration. Provides visual feedback and interaction capabilities
 * for PST elements on the map canvas.
 */
const PSTBox: React.FC<PSTBoxProps> = ({
    pstElement,
    mapDimensions,
    mapStyleDefs,
    scaleFactor,
    isHovered,
    isResizing,
    isDragging = false,
    keyboardModifiers = {maintainAspectRatio: false, resizeFromCenter: false},
    onResizeStart,
    onResizeMove,
    onResizeEnd,
    onDragStart,
    onDragMove,
    onDragEnd,
    onHover,
    mutateMapText,
    mapText,
}) => {
    // State management for local interactions
    const [showHandles, setShowHandles] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const [touchSelected, setTouchSelected] = useState(false);

    // Refs for managing timeouts and drag state
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dragStartPositionRef = useRef<{x: number; y: number} | null>(null);
    const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Detect if device supports touch
    const isTouchDevice = useCallback(() => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }, []);

    // Get PST configuration for styling
    const pstConfig = PST_CONFIG[pstElement.type];

    // Get colors from map styles instead of PST_CONFIG, with fallback to PST_CONFIG
    const pstColors = mapStyleDefs.attitudes?.[pstElement.type] || {
        fill: pstConfig.color,
        stroke: pstConfig.color,
        fillOpacity: 0.6,
        strokeOpacity: 0.8,
    };

    // Convert PST coordinates to SVG bounds for rendering
    const bounds = convertPSTCoordinatesToBounds(pstElement.coordinates, mapDimensions);

    // Calculate label position (center of the box)
    const labelX = bounds.x + bounds.width / 2;
    const labelY = bounds.y + bounds.height / 2;

    // Handle mouse enter - simplified logic
    const handleMouseEnter = useCallback(() => {
        // Clear any pending timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        // Immediately show handles and notify parent
        setShowHandles(true);
        onHover(pstElement);
    }, [onHover, pstElement]);

    // Handle mouse leave - simplified with delay for moving to handles
    const handleMouseLeave = useCallback(() => {
        // Clear any pending timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        // Don't hide immediately if resizing
        if (isResizing) {
            return;
        }

        // Hide handles after delay to allow moving to resize handles
        hoverTimeoutRef.current = setTimeout(() => {
            setShowHandles(false);
            onHover(null);
        }, 300);
    }, [isResizing, onHover]);

    // Handle resize start
    const handleResizeStart = useCallback(
        (handle: ResizeHandle, startPosition: {x: number; y: number}) => {
            onResizeStart(pstElement, handle, startPosition);
        },
        [onResizeStart, pstElement],
    );

    // Handle resize move - this will be called during drag operations
    const handleResizeMove = useCallback(
        (handle: ResizeHandle, currentPosition: {x: number; y: number}) => {
            // Forward the resize move event to the parent component
            if (onResizeMove) {
                onResizeMove(handle, currentPosition);
            }
        },
        [onResizeMove],
    );

    // Handle resize end - coordinate with parent component
    const handleResizeEnd = useCallback(
        (handle: ResizeHandle) => {
            try {
                // The parent component should have calculated new coordinates during resize moves
                // We signal the end of the resize operation so the parent can finalize the update
                if (onResizeEnd) {
                    // Call with undefined coordinates - let parent handle coordinate calculation
                    // The parent (UnifiedMapCanvas) will calculate coordinates from its own resize state
                    onResizeEnd(pstElement, undefined);
                }
            } catch (error) {
                console.error('Error in PST resize end:', error);
            }
        },
        [onResizeEnd, pstElement],
    );

    // Handle pointer start (mouse or touch) for drag
    const handlePointerStart = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            // Don't start drag if we're already resizing
            if (isResizing) {
                return;
            }

            // Don't start drag if clicking on resize handles (they have specific data attributes)
            const target = event.target as Element;
            if (target && target.getAttribute && target.getAttribute('data-resize-handle')) {
                return;
            }

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
                return;
            }

            const startPosition = {x: clientX, y: clientY};
            dragStartPositionRef.current = startPosition;
            setIsDragActive(true);

            if (onDragStart) {
                onDragStart(pstElement, startPosition);
            }
        },
        [isResizing, onDragStart, pstElement],
    );

    // Handle drag start (legacy mouse support)
    const handleDragStart = useCallback(
        (event: React.MouseEvent) => {
            handlePointerStart(event);
        },
        [handlePointerStart],
    );

    // Handle touch start for drag
    const handleTouchStart = useCallback(
        (event: React.TouchEvent) => {
            // On touch devices, first touch shows handles, second touch starts drag
            if (isTouchDevice()) {
                if (!touchSelected && !isResizing) {
                    // First touch - show handles and select the element
                    event.preventDefault();
                    event.stopPropagation();
                    
                    setTouchSelected(true);
                    setShowHandles(true);
                    onHover(pstElement);
                    
                    // Auto-hide handles after 5 seconds if no interaction
                    if (touchTimeoutRef.current) {
                        clearTimeout(touchTimeoutRef.current);
                    }
                    touchTimeoutRef.current = setTimeout(() => {
                        setTouchSelected(false);
                        setShowHandles(false);
                        onHover(null);
                    }, 5000);
                    
                    return;
                }
            }
            
            // Second touch or non-touch device - start drag
            handlePointerStart(event);
        },
        [handlePointerStart, isTouchDevice, touchSelected, isResizing, onHover, pstElement],
    );

    // Handle pointer move during drag (mouse or touch)
    const handlePointerMove = useCallback(
        (event: MouseEvent | TouchEvent) => {
            if (!isDragActive || !dragStartPositionRef.current) {
                return;
            }

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
                return;
            }

            const currentPosition = {x: clientX, y: clientY};

            if (onDragMove) {
                onDragMove(pstElement, currentPosition);
            }
        },
        [isDragActive, onDragMove, pstElement],
    );

    // Handle pointer end to end drag (mouse or touch)
    const handlePointerEnd = useCallback(
        (event: MouseEvent | TouchEvent) => {
            if (!isDragActive) {
                return;
            }

            event.preventDefault();

            setIsDragActive(false);
            dragStartPositionRef.current = null;

            if (onDragEnd) {
                onDragEnd(pstElement);
            }
        },
        [isDragActive, onDragEnd, pstElement],
    );

    // Legacy mouse handlers
    const handleDragMove = useCallback(
        (event: MouseEvent) => {
            handlePointerMove(event);
        },
        [handlePointerMove],
    );

    const handleDragEnd = useCallback(
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
        if (isDragActive) {
            // Mouse events
            document.addEventListener('mousemove', handleDragMove, {passive: false});
            document.addEventListener('mouseup', handleDragEnd, {passive: false});
            document.addEventListener('mouseleave', handleDragEnd, {passive: false});

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
                document.removeEventListener('mousemove', handleDragMove);
                document.removeEventListener('mouseup', handleDragEnd);
                document.removeEventListener('mouseleave', handleDragEnd);

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
    }, [isDragActive, handleDragMove, handleDragEnd, handleTouchMove, handleTouchEnd]);

    // Show handles when hovered externally or resizing
    useEffect(() => {
        if (isHovered || isResizing) {
            setShowHandles(true);
        } else if (!isResizing && !touchSelected) {
            // Small delay to prevent flickering when moving between elements
            const timeout = setTimeout(() => {
                setShowHandles(false);
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [isHovered, isResizing, touchSelected]);

    // Handle touch outside to deselect on touch devices
    useEffect(() => {
        if (!isTouchDevice() || !touchSelected) return;

        const handleTouchOutside = (event: TouchEvent) => {
            // Check if touch is outside this element
            const target = event.target as Element;
            const pstElement = document.querySelector(`[data-testid="pst-box-${pstElement.id}"]`);
            
            if (pstElement && !pstElement.contains(target)) {
                setTouchSelected(false);
                setShowHandles(false);
                onHover(null);
                
                if (touchTimeoutRef.current) {
                    clearTimeout(touchTimeoutRef.current);
                    touchTimeoutRef.current = null;
                }
            }
        };

        document.addEventListener('touchstart', handleTouchOutside, {passive: true});
        
        return () => {
            document.removeEventListener('touchstart', handleTouchOutside);
        };
    }, [isTouchDevice, touchSelected, onHover, pstElement.id]);

    // Cleanup timeouts and drag state on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
            }

            if (touchTimeoutRef.current) {
                clearTimeout(touchTimeoutRef.current);
                touchTimeoutRef.current = null;
            }

            // Clean up drag state if component unmounts during drag
            if (isDragActive) {
                setIsDragActive(false);
                dragStartPositionRef.current = null;

                // Restore text selection and touch action
                document.body.style.userSelect = '';
                document.body.style.webkitUserSelect = '';
                document.body.style.touchAction = '';
            }
        };
    }, [isDragActive]);

    return (
        <g
            data-testid={`pst-box-${pstElement.id}`}
            className="pst-box"
            role="button"
            tabIndex={0}
            aria-label={`${pstConfig.label} box: ${pstElement.name || 'Unnamed'}`}
            aria-describedby={`pst-box-description-${pstElement.id}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{cursor: isResizing ? 'grabbing' : isDragActive || isDragging ? 'grabbing' : 'grab'}}>
            {/* Main PST box rectangle */}
            <rect
                data-testid={`pst-box-rect-${pstElement.id}`}
                x={bounds.x}
                y={bounds.y}
                width={bounds.width}
                height={bounds.height}
                fill={pstColors.fill}
                fillOpacity={isHovered ? pstColors.fillOpacity || 0.8 : pstColors.fillOpacity || 0.6}
                stroke={pstColors.stroke}
                strokeWidth={isHovered ? 2 : 1}
                strokeOpacity={isHovered ? 1 : pstColors.strokeOpacity || 0.8}
                rx={4}
                ry={4}
                style={{
                    transition: isResizing || isDragActive || isDragging ? 'none' : 'all 0.2s ease-in-out',
                    filter: isHovered ? 'brightness(1.1)' : 'none',
                    cursor: isResizing ? 'grabbing' : isDragActive || isDragging ? 'grabbing' : 'grab',
                }}
                onMouseDown={handleDragStart}
                onTouchStart={handleTouchStart}
                onKeyDown={event => {
                    // Support keyboard interaction
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleMouseEnter();
                    }
                }}
            />

            {/* PST box label */}
            <text
                data-testid={`pst-box-label-${pstElement.id}`}
                x={labelX}
                y={labelY}
                fill="white"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="none"
                style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    userSelect: 'none',
                }}>
                {pstElement.name || pstConfig.label}
            </text>

            {/* Resize handles - show when hovered, resizing, or touch selected */}
            <ResizeHandles
                bounds={bounds}
                isVisible={showHandles || isResizing || touchSelected}
                onResizeStart={handleResizeStart}
                onResizeMove={handleResizeMove}
                onResizeEnd={handleResizeEnd}
                scaleFactor={scaleFactor}
                mapStyleDefs={mapStyleDefs}
                keyboardModifiers={keyboardModifiers}
            />

            {/* Hidden description for screen readers */}
            <text
                id={`pst-box-description-${pstElement.id}`}
                x={-1000}
                y={-1000}
                style={{opacity: 0, pointerEvents: 'none'}}
                aria-hidden="true">
                {`${pstConfig.label} box positioned at maturity ${Math.round(pstElement.coordinates.maturity1 * 100)}% to ${Math.round(pstElement.coordinates.maturity2 * 100)}%, visibility ${Math.round(pstElement.coordinates.visibility2 * 100)}% to ${Math.round(pstElement.coordinates.visibility1 * 100)}%. Hover to show resize handles.`}
            </text>

            {/* Visual feedback for hover state - subtle outline */}
            {isHovered && (
                <rect
                    data-testid={`pst-box-hover-outline-${pstElement.id}`}
                    x={bounds.x - 1}
                    y={bounds.y - 1}
                    width={bounds.width + 2}
                    height={bounds.height + 2}
                    fill="none"
                    stroke={pstColors.stroke}
                    strokeWidth={1}
                    strokeOpacity={0.6}
                    strokeDasharray="2,2"
                    rx={5}
                    ry={5}
                    pointerEvents="none"
                    style={{
                        animation: 'pstHoverPulse 1.5s ease-in-out infinite',
                    }}
                />
            )}

            {/* Visual feedback for touch selection - solid outline */}
            {touchSelected && !isHovered && (
                <rect
                    data-testid={`pst-box-touch-outline-${pstElement.id}`}
                    x={bounds.x - 2}
                    y={bounds.y - 2}
                    width={bounds.width + 4}
                    height={bounds.height + 4}
                    fill="none"
                    stroke="#2196F3"
                    strokeWidth={2}
                    strokeOpacity={0.8}
                    rx={6}
                    ry={6}
                    pointerEvents="none"
                    style={{
                        animation: 'pstTouchPulse 2s ease-in-out infinite',
                    }}
                />
            )}

            {/* CSS animations */}
            <defs>
                <style>
                    {`
            @keyframes pstHoverPulse {
              0%, 100% {
                stroke-opacity: 0.3;
              }
              50% {
                stroke-opacity: 0.7;
              }
            }
            @keyframes pstTouchPulse {
              0%, 100% {
                stroke-opacity: 0.5;
                stroke-width: 2;
              }
              50% {
                stroke-opacity: 1;
                stroke-width: 3;
              }
            }
          `}
                </style>
            </defs>
        </g>
    );
};

export default PSTBox;
