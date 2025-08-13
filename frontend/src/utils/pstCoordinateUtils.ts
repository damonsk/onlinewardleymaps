/**
 * PST coordinate conversion utilities
 * Handles conversion between map coordinates (0-1) and SVG coordinates for PST elements
 */

import { PSTCoordinates, PSTBounds, ResizeConstraints } from '../types/map/pst';
import { MapDimensions } from '../constants/defaults';
import { DEFAULT_RESIZE_CONSTRAINTS } from '../constants/pstConfig';

/**
 * Convert PST map coordinates (0-1 range) to SVG bounds for rendering
 */
export function convertPSTCoordinatesToBounds(
  coordinates: PSTCoordinates,
  mapDimensions: MapDimensions
): PSTBounds {
  // Convert maturity (0-1) to SVG X coordinates
  const x = coordinates.maturity1 * mapDimensions.width;
  const right = coordinates.maturity2 * mapDimensions.width;
  
  // Convert visibility (0-1) to SVG Y coordinates
  // Higher visibility = lower Y value (top of map)
  const y = (1 - coordinates.visibility1) * mapDimensions.height;
  const bottom = (1 - coordinates.visibility2) * mapDimensions.height;
  
  // Calculate width and height, ensuring positive values
  const width = Math.abs(right - x);
  const height = Math.abs(bottom - y);
  
  // Use the minimum values for top-left corner
  const finalX = Math.min(x, right);
  const finalY = Math.min(y, bottom);
  
  return {
    x: finalX,
    y: finalY,
    width,
    height,
  };
}

/**
 * Convert SVG bounds back to PST map coordinates (0-1 range)
 */
export function convertBoundsToPSTCoordinates(
  bounds: PSTBounds,
  mapDimensions: MapDimensions
): PSTCoordinates {
  // Convert SVG coordinates back to map coordinates (0-1 range)
  const maturity1 = bounds.x / mapDimensions.width;
  const maturity2 = (bounds.x + bounds.width) / mapDimensions.width;
  
  // Convert Y coordinates back to visibility (0-1 range)
  // Lower Y value = higher visibility
  const visibility1 = 1 - bounds.y / mapDimensions.height;
  const visibility2 = 1 - (bounds.y + bounds.height) / mapDimensions.height;
  
  // Ensure coordinates are within valid range (0-1)
  return {
    maturity1: Math.max(0, Math.min(1, maturity1)),
    visibility1: Math.max(0, Math.min(1, visibility1)),
    maturity2: Math.max(0, Math.min(1, maturity2)),
    visibility2: Math.max(0, Math.min(1, visibility2)),
  };
}

/**
 * Validate PST coordinates are within valid ranges
 */
export function validatePSTCoordinates(coordinates: PSTCoordinates): boolean {
  const { maturity1, visibility1, maturity2, visibility2 } = coordinates;
  
  // Check if all coordinates are within 0-1 range
  const inRange = [maturity1, visibility1, maturity2, visibility2].every(
    coord => coord >= 0 && coord <= 1 && !isNaN(coord)
  );
  
  // Check if coordinates form a valid rectangle (not inverted)
  const validRectangle = maturity2 > maturity1 && visibility1 > visibility2;
  
  return inRange && validRectangle;
}

/**
 * Validate PST bounds meet minimum size constraints
 */
export function validatePSTBounds(
  bounds: PSTBounds,
  constraints: ResizeConstraints = DEFAULT_RESIZE_CONSTRAINTS
): boolean {
  return (
    bounds.width >= constraints.minWidth &&
    bounds.height >= constraints.minHeight &&
    bounds.width <= constraints.maxWidth &&
    bounds.height <= constraints.maxHeight &&
    !isNaN(bounds.x) &&
    !isNaN(bounds.y) &&
    !isNaN(bounds.width) &&
    !isNaN(bounds.height)
  );
}

/**
 * Constrain PST bounds to meet size and boundary requirements
 */
export function constrainPSTBounds(
  bounds: PSTBounds,
  mapDimensions: MapDimensions,
  constraints: ResizeConstraints = DEFAULT_RESIZE_CONSTRAINTS
): PSTBounds {
  let { x, y, width, height } = bounds;
  
  // Apply minimum and maximum size constraints
  width = Math.max(constraints.minWidth, Math.min(constraints.maxWidth, width));
  height = Math.max(constraints.minHeight, Math.min(constraints.maxHeight, height));
  
  // Ensure bounds stay within map boundaries
  x = Math.max(0, Math.min(mapDimensions.width - width, x));
  y = Math.max(0, Math.min(mapDimensions.height - height, y));
  
  return { x, y, width, height };
}

/**
 * Calculate the center point of PST bounds
 */
export function getPSTBoundsCenter(bounds: PSTBounds): { x: number; y: number } {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

/**
 * Check if a point is within PST bounds
 */
export function isPointInPSTBounds(
  point: { x: number; y: number },
  bounds: PSTBounds
): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Snap coordinates to grid if enabled in constraints
 */
export function snapToGrid(
  value: number,
  gridSize: number = 10,
  enabled: boolean = false
): number {
  if (!enabled) return value;
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Calculate new bounds when resizing from a specific handle
 */
export function calculateResizedBounds(
  originalBounds: PSTBounds,
  handlePosition: string,
  deltaX: number,
  deltaY: number,
  constraints: ResizeConstraints = DEFAULT_RESIZE_CONSTRAINTS,
  mapDimensions: MapDimensions
): PSTBounds {
  let { x, y, width, height } = originalBounds;
  
  // Apply resize based on handle position
  switch (handlePosition) {
    case 'top-left':
      x += deltaX;
      y += deltaY;
      width -= deltaX;
      height -= deltaY;
      break;
    case 'top-center':
      y += deltaY;
      height -= deltaY;
      break;
    case 'top-right':
      y += deltaY;
      width += deltaX;
      height -= deltaY;
      break;
    case 'middle-left':
      x += deltaX;
      width -= deltaX;
      break;
    case 'middle-right':
      width += deltaX;
      break;
    case 'bottom-left':
      x += deltaX;
      width -= deltaX;
      height += deltaY;
      break;
    case 'bottom-center':
      height += deltaY;
      break;
    case 'bottom-right':
      width += deltaX;
      height += deltaY;
      break;
  }
  
  // Apply constraints and return constrained bounds
  return constrainPSTBounds({ x, y, width, height }, mapDimensions, constraints);
}