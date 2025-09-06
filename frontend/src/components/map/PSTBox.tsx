import React, {useCallback, useEffect, useRef, useState} from 'react';
import {MapDimensions} from '../../constants/defaults';
import {PST_CONFIG} from '../../constants/pstConfig';
import {PSTElement, ResizeHandle} from '../../types/map/pst';
import {MapTheme} from '../../types/map/styles';
import {convertPSTCoordinatesToBounds} from '../../utils/pstCoordinateUtils';
import {useComponentSelection} from '../ComponentSelectionContext';
import {useContextMenu} from './ContextMenuProvider';
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
    const {isSelected, selectComponent, clearSelection} = useComponentSelection();
    const {showContextMenu} = useContextMenu();
    const [showHandles, setShowHandles] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const [touchSelected, setTouchSelected] = useState(false);

    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dragStartPositionRef = useRef<{x: number; y: number} | null>(null);
    const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isTouchDevice = useCallback(() => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }, []);

    const pstConfig = PST_CONFIG[pstElement.type];

    const pstColors = mapStyleDefs.attitudes?.[pstElement.type] || {
        fill: pstConfig.color,
        stroke: pstConfig.color,
        fillOpacity: 0.6,
        strokeOpacity: 0.8,
    };

    const bounds = convertPSTCoordinatesToBounds(pstElement.coordinates, mapDimensions);

    const labelX = bounds.x + bounds.width / 2;
    const labelY = bounds.y + bounds.height / 2;

    const isElementSelected = isSelected(pstElement.id);

    const handleMouseEnter = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        setShowHandles(true);
        onHover(pstElement);
    }, [onHover, pstElement]);

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        if (isResizing) {
            return;
        }

        hoverTimeoutRef.current = setTimeout(() => {
            setShowHandles(false);
            onHover(null);
        }, 300);
    }, [isResizing, onHover]);

    const handleResizeStart = useCallback(
        (handle: ResizeHandle, startPosition: {x: number; y: number}) => {
            onResizeStart(pstElement, handle, startPosition);
        },
        [onResizeStart, pstElement],
    );

    const handleResizeMove = useCallback(
        (handle: ResizeHandle, currentPosition: {x: number; y: number}) => {
            if (onResizeMove) {
                onResizeMove(handle, currentPosition);
            }
        },
        [onResizeMove],
    );

    const handleResizeEnd = useCallback(
        (handle: ResizeHandle) => {
            try {
                if (onResizeEnd) {
                    onResizeEnd(pstElement, undefined);
                }
            } catch (error) {
                console.error('Error in PST resize end:', error);
            }
        },
        [onResizeEnd, pstElement],
    );

    const handleComponentClick = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            selectComponent(pstElement.id);
            event.stopPropagation();
        },
        [selectComponent, pstElement.id],
    );

    const handleContextMenu = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();

            if (!isElementSelected) {
                console.log('Selecting component:', pstElement.id);
                selectComponent(pstElement.id);
            } else {
                console.log('Component already selected:', pstElement.id);
            }

            console.log('Showing context menu at:', {x: event.clientX, y: event.clientY});
            showContextMenu({x: event.clientX, y: event.clientY}, pstElement.id);
        },
        [isElementSelected, selectComponent, pstElement.id, showContextMenu],
    );

    const handlePointerStart = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            if (isResizing) {
                return;
            }

            const target = event.target as Element;
            if (target && target.getAttribute && target.getAttribute('data-resize-handle')) {
                return;
            }

            if ('button' in event && event.button === 2) {
                return;
            }

            selectComponent(pstElement.id);

            event.preventDefault();
            event.stopPropagation();

            let clientX: number, clientY: number;
            if ('touches' in event && event.touches.length > 0) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else if ('clientX' in event) {
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
        [isResizing, onDragStart, pstElement, selectComponent],
    );

    const handleDragStart = useCallback(
        (event: React.MouseEvent) => {
            handlePointerStart(event);
        },
        [handlePointerStart],
    );

    const handleTouchStart = useCallback(
        (event: React.TouchEvent) => {
            if (isTouchDevice()) {
                if (!touchSelected && !isResizing) {
                    event.preventDefault();
                    event.stopPropagation();

                    setTouchSelected(true);
                    setShowHandles(true);
                    onHover(pstElement);

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

            handlePointerStart(event);
        },
        [handlePointerStart, isTouchDevice, touchSelected, isResizing, onHover, pstElement],
    );

    const handlePointerMove = useCallback(
        (event: MouseEvent | TouchEvent) => {
            if (!isDragActive || !dragStartPositionRef.current) {
                return;
            }

            event.preventDefault();

            let clientX: number, clientY: number;
            if ('touches' in event && event.touches.length > 0) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else if ('clientX' in event) {
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

    const handlePointerEnd = useCallback(
        (event: MouseEvent | TouchEvent) => {
            console.debug('PSTBox handlePointerEnd called:', {
                isDragActive,
                elementId: pstElement.id,
                eventType: event.type
            });
            
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

    useEffect(() => {
        if (isDragActive) {
            
            document.addEventListener('mousemove', handleDragMove, {passive: false});
            document.addEventListener('mouseup', handleDragEnd, {passive: false});
            document.addEventListener('mouseleave', handleDragEnd, {passive: false});

            document.addEventListener('touchmove', handleTouchMove, {passive: false});
            document.addEventListener('touchend', handleTouchEnd, {passive: false});
            document.addEventListener('touchcancel', handleTouchEnd, {passive: false});

            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            document.body.style.touchAction = 'none';

            return () => {
                
                document.removeEventListener('mousemove', handleDragMove);
                document.removeEventListener('mouseup', handleDragEnd);
                document.removeEventListener('mouseleave', handleDragEnd);

                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
                document.removeEventListener('touchcancel', handleTouchEnd);

                document.body.style.userSelect = '';
                document.body.style.webkitUserSelect = '';
                document.body.style.touchAction = '';
            };
        } else {
        }
    }, [isDragActive, handleDragMove, handleDragEnd, handleTouchMove, handleTouchEnd, pstElement.id]);

    useEffect(() => {
        if (isHovered || isResizing) {
            setShowHandles(true);
        } else if (!isResizing && !touchSelected) {
            const timeout = setTimeout(() => {
                setShowHandles(false);
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [isHovered, isResizing, touchSelected]);

    useEffect(() => {
        if (!isTouchDevice() || !touchSelected) return;

        const handleTouchOutside = (event: TouchEvent) => {
            const target = event.target as Element;
            const pstElementDOM = document.querySelector(`[data-testid="pst-box-${pstElement.id}"]`);

            if (pstElementDOM && !pstElementDOM.contains(target)) {
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

            if (isDragActive) {
                setIsDragActive(false);
                dragStartPositionRef.current = null;

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
                fillOpacity={
                    isElementSelected
                        ? (pstColors.fillOpacity || 0.6) + 0.2
                        : isHovered
                          ? pstColors.fillOpacity || 0.8
                          : pstColors.fillOpacity || 0.6
                }
                stroke={isElementSelected ? '#2196F3' : pstColors.stroke}
                strokeWidth={isElementSelected ? 3 : isHovered ? 2 : 1}
                strokeOpacity={isElementSelected || isHovered ? 1 : pstColors.strokeOpacity || 0.8}
                rx={4}
                ry={4}
                style={{
                    transition: isResizing || isDragActive || isDragging ? 'none' : 'all 0.2s ease-in-out',
                    filter: isElementSelected
                        ? 'brightness(1.2) drop-shadow(0 0 8px rgba(33, 150, 243, 0.4))'
                        : isHovered
                          ? 'brightness(1.1)'
                          : 'none',
                    cursor: isResizing ? 'grabbing' : isDragActive || isDragging ? 'grabbing' : 'pointer',
                }}
                onMouseDown={handleDragStart}
                onTouchStart={handleTouchStart}
                onClick={handleComponentClick}
                onContextMenu={handleContextMenu}
                onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleComponentClick(event as any);
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

            {/* Visual feedback for selection state - prominent outline */}
            {isElementSelected && (
                <rect
                    data-testid={`pst-box-selection-outline-${pstElement.id}`}
                    x={bounds.x - 3}
                    y={bounds.y - 3}
                    width={bounds.width + 6}
                    height={bounds.height + 6}
                    fill="none"
                    stroke="#2196F3"
                    strokeWidth={2}
                    strokeOpacity={0.8}
                    strokeDasharray="4,2"
                    rx={7}
                    ry={7}
                    pointerEvents="none"
                    style={{
                        animation: 'pstSelectionPulse 2s ease-in-out infinite',
                    }}
                />
            )}

            {/* Visual feedback for hover state - subtle outline (only when not selected) */}
            {isHovered && !isElementSelected && (
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

            {/* Deletable indicator - small icon when hovered and not selected */}
            {isHovered && !isElementSelected && (
                <g
                    data-testid={`pst-box-delete-indicator-${pstElement.id}`}
                    transform={`translate(${bounds.x + bounds.width - 16}, ${bounds.y + 4})`}
                    pointerEvents="none"
                    style={{
                        opacity: 0.7,
                        animation: 'fadeIn 0.2s ease-in-out',
                    }}>
                    <circle cx="8" cy="8" r="8" fill="rgba(244, 67, 54, 0.9)" stroke="white" strokeWidth="1" />
                    <text x="8" y="8" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                        ×
                    </text>
                </g>
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
            @keyframes pstSelectionPulse {
              0%, 100% {
                stroke-opacity: 0.6;
                stroke-width: 2;
              }
              50% {
                stroke-opacity: 1;
                stroke-width: 3;
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
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.8);
              }
              to {
                opacity: 0.7;
                transform: scale(1);
              }
            }
          `}
                </style>
            </defs>
        </g>
    );
};

export default PSTBox;
