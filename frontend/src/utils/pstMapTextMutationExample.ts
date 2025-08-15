/**
 * Example usage of PST Map Text Mutation utilities
 * This file demonstrates how to integrate PST resize functionality with map text updates
 */

import {
    updatePSTElementInMapText,
    extractPSTElementsFromMapText,
    generatePSTSyntax,
    validatePSTSyntax,
    batchUpdatePSTElements,
} from './pstMapTextMutation';
import {PSTElement, PSTCoordinates} from '../types/map/pst';
import {convertBoundsToPSTCoordinates} from './pstCoordinateUtils';
import {MapDimensions} from '../constants/defaults';

/**
 * Example: Handle PST element resize completion
 * This function would be called when a user finishes resizing a PST element
 */
export function handlePSTResizeComplete(
    mapText: string,
    pstElement: PSTElement,
    newBounds: {x: number; y: number; width: number; height: number},
    mapDimensions: MapDimensions,
    onMapTextUpdate: (newMapText: string) => void,
): void {
    try {
        // Convert SVG bounds back to PST coordinates
        const newCoordinates = convertBoundsToPSTCoordinates(newBounds, mapDimensions);
        
        // Validate the new coordinates
        const newSyntax = generatePSTSyntax(pstElement.type, newCoordinates, pstElement.name);
        const validation = validatePSTSyntax(newSyntax);
        
        if (!validation.isValid) {
            console.error('Invalid PST coordinates after resize:', validation.errors);
            return;
        }
        
        // Log warnings if any
        if (validation.warnings.length > 0) {
            console.warn('PST resize warnings:', validation.warnings);
        }
        
        // Update the map text
        const updatedMapText = updatePSTElementInMapText({
            mapText,
            pstElement,
            newCoordinates,
        });
        
        // Notify the application of the map text change
        onMapTextUpdate(updatedMapText);
        
        console.log(`PST element ${pstElement.id} resized successfully`);
    } catch (error) {
        console.error('Failed to update map text after PST resize:', error);
    }
}

/**
 * Example: Handle multiple PST elements being resized simultaneously
 */
export function handleBatchPSTResize(
    mapText: string,
    resizeOperations: Array<{
        element: PSTElement;
        newBounds: {x: number; y: number; width: number; height: number};
    }>,
    mapDimensions: MapDimensions,
    onMapTextUpdate: (newMapText: string) => void,
): void {
    try {
        // Convert all resize operations to coordinate updates
        const updates = resizeOperations.map(operation => {
            const newCoordinates = convertBoundsToPSTCoordinates(operation.newBounds, mapDimensions);
            return {
                element: operation.element,
                newCoordinates,
            };
        });
        
        // Validate all updates before applying
        const validationErrors: string[] = [];
        updates.forEach((update, index) => {
            const syntax = generatePSTSyntax(update.element.type, update.newCoordinates, update.element.name);
            const validation = validatePSTSyntax(syntax);
            
            if (!validation.isValid) {
                validationErrors.push(`Element ${index}: ${validation.errors.join(', ')}`);
            }
        });
        
        if (validationErrors.length > 0) {
            console.error('Batch PST resize validation failed:', validationErrors);
            return;
        }
        
        // Apply batch updates
        const updatedMapText = batchUpdatePSTElements(mapText, updates);
        
        // Notify the application of the map text change
        onMapTextUpdate(updatedMapText);
        
        console.log(`Batch PST resize completed for ${updates.length} elements`);
    } catch (error) {
        console.error('Failed to apply batch PST resize:', error);
    }
}

/**
 * Example: Initialize PST elements from map text for rendering
 */
export function initializePSTElementsFromMapText(mapText: string): PSTElement[] {
    try {
        const pstElements = extractPSTElementsFromMapText(mapText);
        
        console.log(`Extracted ${pstElements.length} PST elements from map text`);
        
        // Log any elements that might need attention
        pstElements.forEach(element => {
            const syntax = generatePSTSyntax(element.type, element.coordinates, element.name);
            const validation = validatePSTSyntax(syntax);
            
            if (validation.warnings.length > 0) {
                console.warn(`PST element ${element.id} has warnings:`, validation.warnings);
            }
        });
        
        return pstElements;
    } catch (error) {
        console.error('Failed to initialize PST elements from map text:', error);
        return [];
    }
}

/**
 * Example: Validate entire map text for PST syntax issues
 */
export function validateMapTextForPSTIssues(mapText: string): {
    hasErrors: boolean;
    hasWarnings: boolean;
    summary: string;
} {
    try {
        const validation = require('./pstMapTextMutation').validateMapTextPSTSyntax(mapText);
        
        const hasErrors = validation.errors.length > 0;
        const hasWarnings = validation.warnings.length > 0;
        
        let summary = 'PST validation complete. ';
        
        if (hasErrors) {
            summary += `Found ${validation.errors.length} error(s). `;
            validation.errors.forEach(error => {
                console.error(`Line ${error.line + 1}: ${error.error}`);
            });
        }
        
        if (hasWarnings) {
            summary += `Found ${validation.warnings.length} warning(s). `;
            validation.warnings.forEach(warning => {
                console.warn(`Line ${warning.line + 1}: ${warning.warning}`);
            });
        }
        
        if (!hasErrors && !hasWarnings) {
            summary += 'No issues found.';
        }
        
        return {hasErrors, hasWarnings, summary};
    } catch (error) {
        console.error('Failed to validate map text for PST issues:', error);
        return {
            hasErrors: true,
            hasWarnings: false,
            summary: 'Validation failed due to an error.',
        };
    }
}

/**
 * Example: Create a new PST element and add it to map text
 */
export function addNewPSTElementToMapText(
    mapText: string,
    type: 'pioneers' | 'settlers' | 'townplanners',
    coordinates: PSTCoordinates,
    name?: string,
): string {
    try {
        // Generate syntax for the new PST element
        const newPSTSyntax = generatePSTSyntax(type, coordinates, name);
        
        // Validate the syntax
        const validation = validatePSTSyntax(newPSTSyntax);
        if (!validation.isValid) {
            throw new Error(`Invalid PST syntax: ${validation.errors.join(', ')}`);
        }
        
        // Add to map text
        const updatedMapText = mapText.trim() ? `${mapText}\n${newPSTSyntax}` : newPSTSyntax;
        
        console.log(`Added new ${type} element to map text`);
        return updatedMapText;
    } catch (error) {
        console.error('Failed to add new PST element to map text:', error);
        return mapText;
    }
}

/**
 * Example: Remove a PST element from map text
 */
export function removePSTElementFromMapText(mapText: string, pstElement: PSTElement): string {
    try {
        const lines = mapText.split('\n');
        const lineIndex = require('./pstMapTextMutation').findPSTElementLine(mapText, pstElement);
        
        if (lineIndex === -1) {
            console.warn('PST element not found in map text, nothing to remove');
            return mapText;
        }
        
        // Remove the line
        lines.splice(lineIndex, 1);
        
        console.log(`Removed PST element ${pstElement.id} from map text`);
        return lines.join('\n');
    } catch (error) {
        console.error('Failed to remove PST element from map text:', error);
        return mapText;
    }
}