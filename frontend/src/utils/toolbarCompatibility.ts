/**
 * Utility functions to ensure WYSIWYG Toolbar compatibility with existing map functionality
 * Addresses Requirements 6.1, 6.2, 6.3, 6.4
 */

import {ToolbarItem} from '../types/toolbar';

/**
 * Validates that toolbar placement doesn't interfere with existing map interactions
 * Requirement 6.3: Non-interference with map interactions
 */
export const validateMapInteractionCompatibility = (
    selectedToolbarItem: ToolbarItem | null,
    event: MouseEvent | React.MouseEvent,
): {
    allowNormalInteraction: boolean;
    allowToolbarPlacement: boolean;
    shouldPreventDefault: boolean;
} => {
    // If no toolbar item is selected, allow normal map interactions
    if (!selectedToolbarItem) {
        return {
            allowNormalInteraction: true,
            allowToolbarPlacement: false,
            shouldPreventDefault: false,
        };
    }

    // If toolbar item is selected, prioritize toolbar placement
    return {
        allowNormalInteraction: false,
        allowToolbarPlacement: true,
        shouldPreventDefault: true,
    };
};

/**
 * Ensures toolbar-placed components support all existing editing capabilities
 * Requirement 6.4: Support for existing editing capabilities
 */
export const ensureToolbarComponentEditingCompatibility = (
    componentText: string,
    existingMapText: string,
): {
    isCompatible: boolean;
    updatedMapText: string;
    warnings: string[];
} => {
    const warnings: string[] = [];

    // Ensure the component text follows the correct format
    if (!componentText.trim()) {
        warnings.push('Empty component text provided');
        return {
            isCompatible: false,
            updatedMapText: existingMapText,
            warnings,
        };
    }

    // Ensure proper line ending format
    const normalizedExistingText = existingMapText.replace(/\r\n/g, '\n').trim();
    const normalizedComponentText = componentText.replace(/\r\n/g, '\n').trim();

    // Add the new component with proper formatting
    const updatedMapText = normalizedExistingText + (normalizedExistingText ? '\n' : '') + normalizedComponentText;

    // Validate the result doesn't break existing structure
    const lines = updatedMapText.split('\n');
    const hasTitle = lines.some(line => line.trim().startsWith('title '));

    if (!hasTitle && lines.length > 1) {
        warnings.push('Map may be missing a title line');
    }

    return {
        isCompatible: true,
        updatedMapText,
        warnings,
    };
};

/**
 * Manages cursor state for toolbar compatibility
 * Requirement 6.3: Non-interference with map interactions
 */
export const getCompatibleCursorStyle = (selectedToolbarItem: ToolbarItem | null, isValidDropZone: boolean): string => {
    if (!selectedToolbarItem) {
        return 'default';
    }

    if (isValidDropZone) {
        return 'crosshair';
    }

    return 'not-allowed';
};

/**
 * Validates coordinate compatibility for toolbar placement
 * Ensures coordinates work with existing map functionality
 */
export const validateCoordinateCompatibility = (
    x: number,
    y: number,
): {
    isValid: boolean;
    normalizedX: number;
    normalizedY: number;
    warnings: string[];
} => {
    const warnings: string[] = [];

    // Ensure coordinates are within valid range [0, 1]
    let normalizedX = Math.max(0, Math.min(1, x));
    let normalizedY = Math.max(0, Math.min(1, y));

    if (x !== normalizedX) {
        warnings.push(`X coordinate ${x} was clamped to ${normalizedX}`);
    }

    if (y !== normalizedY) {
        warnings.push(`Y coordinate ${y} was clamped to ${normalizedY}`);
    }

    // Check for edge cases that might cause issues
    if (normalizedX < 0.01 || normalizedX > 0.99) {
        warnings.push('X coordinate is very close to map edge');
    }

    if (normalizedY < 0.01 || normalizedY > 0.99) {
        warnings.push('Y coordinate is very close to map edge');
    }

    return {
        isValid: !isNaN(normalizedX) && !isNaN(normalizedY),
        normalizedX,
        normalizedY,
        warnings,
    };
};

/**
 * Ensures proper event handling compatibility
 * Prevents toolbar events from interfering with existing map event handlers
 */
export const handleCompatibleMapEvent = (
    event: MouseEvent | React.MouseEvent,
    selectedToolbarItem: ToolbarItem | null,
    existingHandlers: {
        onMapClick?: (event: any) => void;
        onMapDoubleClick?: (event: any) => void;
        onComponentClick?: (event: any) => void;
    },
): {
    shouldCallExistingHandlers: boolean;
    shouldHandleToolbarPlacement: boolean;
    eventData: any;
} => {
    const eventData = {
        clientX: event.clientX,
        clientY: event.clientY,
        target: event.target,
        type: event.type,
    };

    // If toolbar item is selected, prioritize toolbar handling
    if (selectedToolbarItem) {
        return {
            shouldCallExistingHandlers: false,
            shouldHandleToolbarPlacement: true,
            eventData,
        };
    }

    // Otherwise, allow existing handlers to work normally
    return {
        shouldCallExistingHandlers: true,
        shouldHandleToolbarPlacement: false,
        eventData,
    };
};
