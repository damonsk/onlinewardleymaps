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
    // Simplified state management - rely on parent state and minimal local state
    const [showHandles, setShowHandles] = useState(false);
    
    // Single timeout ref for managing hover delays
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get PST configuration for styling
    const pstConfig = PST_CONFIG[pstElement.type];

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
                    // Pass the handle information so parent knows which resize operation completed
                    onResizeEnd(pstElement, {handle});
                }
            } catch (error) {
                console.error('Error in PST resize end:', error);
            }
        },
        [onResizeEnd, pstElement],
    );

    // Show handles when hovered externally or resizing
    useEffect(() => {
        if (isHovered || isResizing) {
            setShowHandles(true);
        } else if (!isResizing) {
            // Small delay to prevent flickering when moving between elements
            const timeout = setTimeout(() => {
                setShowHandles(false);
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [isHovered, isResizing]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
            }
        };
    }, []);

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
                    stroke={pstConfig.color}
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
