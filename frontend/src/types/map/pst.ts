/**
 * PST (Pioneers, Settlers, Town Planners) type definitions for resize functionality
 * These types support the interactive resize feature for PST boxes on the map canvas
 */

/**
 * PST element types
 */
export type PSTType = 'pioneers' | 'settlers' | 'townplanners';

/**
 * Resize handle positions for PST elements
 */
export type ResizeHandle = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

/**
 * PST coordinates in map space (0-1 range)
 */
export interface PSTCoordinates {
  /** Left edge maturity (0-1) */
  maturity1: number;
  /** Top edge visibility (0-1) */
  visibility1: number;
  /** Right edge maturity (0-1) */
  maturity2: number;
  /** Bottom edge visibility (0-1) */
  visibility2: number;
}

/**
 * PST bounds in SVG coordinate space for rendering
 */
export interface PSTBounds {
  /** Left edge in SVG coordinates */
  x: number;
  /** Top edge in SVG coordinates */
  y: number;
  /** Box width in SVG coordinates */
  width: number;
  /** Box height in SVG coordinates */
  height: number;
}

/**
 * PST element data structure
 */
export interface PSTElement {
  /** Unique identifier for the PST element */
  id: string;
  /** PST type (pioneers, settlers, or townplanners) */
  type: PSTType;
  /** Map coordinates defining the PST box boundaries */
  coordinates: PSTCoordinates;
  /** Line number in map text for updates */
  line: number;
  /** Optional label text for the PST box */
  name?: string;
}

/**
 * Configuration for each PST type
 */
export interface PSTTypeConfig {
  /** Display color for the PST type */
  color: string;
  /** Human-readable label */
  label: string;
  /** Minimum width constraint in pixels */
  minWidth: number;
  /** Minimum height constraint in pixels */
  minHeight: number;
}

/**
 * Resize constraints for PST elements
 */
export interface ResizeConstraints {
  /** Minimum width in pixels */
  minWidth: number;
  /** Minimum height in pixels */
  minHeight: number;
  /** Maximum width in pixels */
  maxWidth: number;
  /** Maximum height in pixels */
  maxHeight: number;
  /** Whether to snap to grid during resize */
  snapToGrid: boolean;
  /** Whether to maintain aspect ratio during resize */
  maintainAspectRatio: boolean;
}