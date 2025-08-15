/**
 * PST (Pioneers, Settlers, Town Planners) configuration constants
 * Defines colors, constraints, and default settings for PST elements
 */

import {PSTType, PSTTypeConfig, ResizeConstraints} from '../types/map/pst';

/**
 * Configuration for each PST type including colors and constraints
 */
export const PST_CONFIG: Record<PSTType, PSTTypeConfig> = {
    pioneers: {
        color: '#3ccaf8', // Light blue (matches map styles)
        label: 'Pioneers',
        minWidth: 50,
        minHeight: 30,
    },
    settlers: {
        color: '#599afa', // Blue (matches map styles)
        label: 'Settlers',
        minWidth: 50,
        minHeight: 30,
    },
    townplanners: {
        color: '#936ff9', // Purple (matches map styles)
        label: 'Town Planners',
        minWidth: 50,
        minHeight: 30,
    },
};

/**
 * Default resize constraints for PST elements
 */
export const DEFAULT_RESIZE_CONSTRAINTS: ResizeConstraints = {
    minWidth: 50,
    minHeight: 30,
    maxWidth: 800,
    maxHeight: 600,
    snapToGrid: false,
    maintainAspectRatio: false,
};

/**
 * Resize handle size in pixels
 */
export const RESIZE_HANDLE_SIZE = 8;

/**
 * Minimum distance from map edge for PST elements (in pixels)
 */
export const PST_EDGE_MARGIN = 10;

/**
 * Opacity for resize preview overlay
 */
export const RESIZE_PREVIEW_OPACITY = 0.5;
