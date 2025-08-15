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
    /** Callback when resize operation starts */
    onResizeStart: (element: PSTElement, handle: ResizeHandle, startPosition: {x: number; y: number}) => void;
    /** Callback during resize operation */
    onResizeMove?: (handle: ResizeHandle, currentPosition: {x: number; y: number}) => void;
    /** Callback when resize operation ends */
    onResizeEnd: (element: PSTElement, newCoordinates: any) => void;
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
    onResizeStart,
    onResizeMove,
    onResizeEnd,
    onHover,
    mutateMapText,
    mapText,
}) => {
    // State for managing hover timing and visual feedback
    const [showHandles, setShowHandles] = useState(false);
    const [isMouseInside, setIsMouseInside] = useState(false);

    // Refs for managing hover timing and tracking mouse state
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mouseInsideRef = useRef(false); // Use ref to track actual mouse state

    // Get PST configuration for styling
    const pstConfig = PST_CONFIG[pstElement.type];

    // Convert PST coordinates to SVG bounds for rendering
    const bounds = convertPSTCoordinatesToBounds(pstElement.coordinates, mapDimensions);

    // Calculate label position (center of the box)
    const labelX = bounds.x + bounds.width / 2;
    const labelY = bounds.y + bounds.height / 2;

    // Handle mouse enter with improved timing to prevent flickering
    const handleMouseEnter = useCallback(() => {
        console.log('PST Box mouse enter:', pstElement.id, 'current showHandles:', showHandles);
        
        // Use ref to track mouse state immediately
        mouseInsideRef.current = true;
        setIsMouseInside(true);

        // Clear any pending hide timeout immediately
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }

        // Clear any pending show timeout to avoid duplicate calls
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        // Notify parent of hover state
        onHover(pstElement);
        console.log('PST Box notified parent of hover');
    }, [onHover, pstElement, showHandles]);

    // Handle mouse leave with longer delay to prevent flickering when moving to handles
    const handleMouseLeave = useCallback(() => {
        console.log('PST Box mouse leave:', pstElement.id);
        
        // Use ref to track mouse state immediately
        mouseInsideRef.current = false;
        setIsMouseInside(false);

        // Clear any pending show timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        // Hide handles after a longer delay unless we're resizing
        // This gives time for the mouse to move to the resize handles
        if (!isResizing) {
            hideTimeoutRef.current = setTimeout(() => {
                // Double-check using ref (more reliable than state)
                if (!mouseInsideRef.current && !isResizing) {
                    setShowHandles(false);
                    onHover(null);
                }
            }, 500); // Increased delay to prevent flickering
        }
    }, [isResizing, onHover, pstElement.id]);

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
                // The parent component will handle the actual coordinate calculation and map text update
                // We just need to ensure proper cleanup of local state
                if (onResizeEnd) {
                    // Let parent handle the final coordinate calculation
                    onResizeEnd(pstElement, pstElement.coordinates);
                }
            } catch (error) {
                console.error('Error in PST resize end:', error);
            }
        },
        [onResizeEnd, pstElement],
    );

    // Clean up timeouts and state on unmount or when element changes
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
            }
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }

            // Clear hover state on unmount
            if (showHandles) {
                onHover(null);
            }
        };
    }, [showHandles, onHover]);

    // Reset local state when PST element changes
    useEffect(() => {
        // Clear any pending timeouts first
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }

        // Reset state
        setShowHandles(false);
        setIsMouseInside(false);
        onHover(null);
    }, [pstElement.id, onHover]);

    // Simplified handle visibility management - rely primarily on internal state
    useEffect(() => {
        console.log('PST Box effect triggered:', {
            isMouseInside,
            isResizing,
            currentShowHandles: showHandles,
            mouseInsideRef: mouseInsideRef.current,
        });

        // Clear any existing timeout
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }

        // Show handles if mouse is inside or resizing (use ref for more reliable check)
        if (mouseInsideRef.current || isResizing) {
            console.log('Setting showHandles to true (using ref)');
            setShowHandles(true);
        } else {
            // Hide handles after a delay when not hovered and not resizing
            console.log('Starting hide timer (using ref)');
            hideTimeoutRef.current = setTimeout(() => {
                // Double-check conditions using ref before hiding
                if (!mouseInsideRef.current && !isResizing) {
                    console.log('Hiding handles after timeout (using ref)');
                    setShowHandles(false);
                }
            }, 1000); // Much longer delay to prevent flickering when moving to handles
        }

        // Cleanup function
        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
        };
    }, [isMouseInside, isResizing]); // Keep state dependency but use ref for logic

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
            style={{cursor: isResizing ? 'grabbing' : 'pointer'}}>
            {/* Main PST box rectangle */}
            <rect
                data-testid={`pst-box-rect-${pstElement.id}`}
                x={bounds.x}
                y={bounds.y}
                width={bounds.width}
                height={bounds.height}
                fill={pstConfig.color}
                fillOpacity={isHovered ? 0.8 : 0.6}
                stroke={pstConfig.color}
                strokeWidth={isHovered ? 2 : 1}
                strokeOpacity={isHovered ? 1 : 0.8}
                rx={4}
                ry={4}
                style={{
                    transition: isResizing ? 'none' : 'all 0.2s ease-in-out',
                    filter: isHovered ? 'brightness(1.1)' : 'none',
                }}
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
                fontSize={Math.max(10, 12 / scaleFactor)}
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

            {/* Resize handles - only show when hovered or resizing */}
            <ResizeHandles
                bounds={bounds}
                isVisible={showHandles || isResizing}
                onResizeStart={handleResizeStart}
                onResizeMove={handleResizeMove}
                onResizeEnd={handleResizeEnd}
                scaleFactor={scaleFactor}
                mapStyleDefs={mapStyleDefs}
            />

            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
                <text x={bounds.x} y={bounds.y - 10} fill="red" fontSize="10" pointerEvents="none">
                    {`showHandles: ${showHandles}, isHovered: ${isHovered}, isMouseInside: ${isMouseInside}`}
                </text>
            )}

            {/* Hidden description for screen readers */}
            <text
                id={`pst-box-description-${pstElement.id}`}
                x={-1000}
                y={-1000}
                style={{opacity: 0, pointerEvents: 'none'}}
                aria-hidden="true">
                {`${pstConfig.label} box positioned at maturity ${Math.round(pstElement.coordinates.maturity1 * 100)}% to ${Math.round(pstElement.coordinates.maturity2 * 100)}%, visibility ${Math.round(pstElement.coordinates.visibility2 * 100)}% to ${Math.round(pstElement.coordinates.visibility1 * 100)}%. Hover to show resize handles.`}
            </text>

            {/* Visual feedback for hover state */}
            {isHovered && (
                <rect
                    data-testid={`pst-box-hover-outline-${pstElement.id}`}
                    x={bounds.x - 2}
                    y={bounds.y - 2}
                    width={bounds.width + 4}
                    height={bounds.height + 4}
                    fill="none"
                    stroke={pstConfig.color}
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    strokeDasharray="3,3"
                    rx={6}
                    ry={6}
                    pointerEvents="none"
                    style={{
                        animation: 'pstHoverPulse 2s ease-in-out infinite',
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
          `}
                </style>
            </defs>
        </g>
    );
};

export default PSTBox;
