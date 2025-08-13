import React, { useCallback, useState, useRef, useEffect } from 'react';
import { PSTElement, PSTBounds, ResizeHandle } from '../../types/map/pst';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../types/map/styles';
import { PST_CONFIG } from '../../constants/pstConfig';
import { convertPSTCoordinatesToBounds } from '../../utils/pstCoordinateUtils';
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
  onResizeStart: (element: PSTElement, handle: ResizeHandle) => void;
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
  onResizeEnd,
  onHover,
  mutateMapText,
  mapText,
}) => {
  // State for managing hover timing and visual feedback
  const [showHandles, setShowHandles] = useState(false);
  const [isMouseInside, setIsMouseInside] = useState(false);
  
  // Refs for managing hover timing
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get PST configuration for styling
  const pstConfig = PST_CONFIG[pstElement.type];
  
  // Convert PST coordinates to SVG bounds for rendering
  const bounds = convertPSTCoordinatesToBounds(pstElement.coordinates, mapDimensions);

  // Calculate label position (center of the box)
  const labelX = bounds.x + bounds.width / 2;
  const labelY = bounds.y + bounds.height / 2;

  // Handle mouse enter with proper timing
  const handleMouseEnter = useCallback(() => {
    setIsMouseInside(true);
    
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Show handles immediately if not already showing
    if (!showHandles) {
      // Small delay to prevent flickering on quick mouse movements
      hoverTimeoutRef.current = setTimeout(() => {
        setShowHandles(true);
        onHover(pstElement);
      }, 100);
    } else {
      // Already showing, just update hover state
      onHover(pstElement);
    }
  }, [showHandles, onHover, pstElement]);

  // Handle mouse leave with proper timing
  const handleMouseLeave = useCallback(() => {
    setIsMouseInside(false);
    
    // Clear any pending show timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // Hide handles after a brief delay unless we're resizing
    if (!isResizing) {
      hideTimeoutRef.current = setTimeout(() => {
        setShowHandles(false);
        onHover(null);
      }, 200);
    }
  }, [isResizing, onHover]);

  // Handle resize start
  const handleResizeStart = useCallback((handle: ResizeHandle, startPosition: { x: number; y: number }) => {
    onResizeStart(pstElement, handle);
  }, [onResizeStart, pstElement]);

  // Handle resize end
  const handleResizeEnd = useCallback((handle: ResizeHandle) => {
    // This will be handled by the parent component through onResizeEnd
    // The parent will calculate new coordinates and call onResizeEnd
  }, []);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Update handle visibility based on external hover state
  useEffect(() => {
    if (isHovered && !showHandles) {
      setShowHandles(true);
    } else if (!isHovered && !isMouseInside && !isResizing) {
      setShowHandles(false);
    }
  }, [isHovered, isMouseInside, isResizing, showHandles]);

  // Keep handles visible during resize operations
  useEffect(() => {
    if (isResizing) {
      setShowHandles(true);
      // Clear any pending hide timeout during resize
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    }
  }, [isResizing]);

  return (
    <g 
      data-testid={`pst-box-${pstElement.id}`}
      className="pst-box"
      role="button"
      tabIndex={0}
      aria-label={`${pstConfig.label} box: ${pstElement.name || 'Unnamed'}`}
      aria-describedby={`pst-box-description-${pstElement.id}`}
    >
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
          cursor: isResizing ? 'grabbing' : 'pointer',
          transition: isResizing ? 'none' : 'all 0.2s ease-in-out',
          filter: isHovered ? 'brightness(1.1)' : 'none',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={(event) => {
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
        }}
      >
        {pstElement.name || pstConfig.label}
      </text>

      {/* Resize handles - only show when hovered or resizing */}
      <ResizeHandles
        bounds={bounds}
        isVisible={showHandles || isResizing}
        onResizeStart={handleResizeStart}
        onResizeMove={() => {}} // Handled by parent component
        onResizeEnd={handleResizeEnd}
        scaleFactor={scaleFactor}
        mapStyleDefs={mapStyleDefs}
      />

      {/* Hidden description for screen readers */}
      <text
        id={`pst-box-description-${pstElement.id}`}
        x={-1000}
        y={-1000}
        style={{ opacity: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
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