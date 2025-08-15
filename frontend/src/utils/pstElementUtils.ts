/**
 * Utility functions for converting attitude data to PST elements
 * and managing PST element operations
 */

import { PSTElement, PSTType, PSTCoordinates } from '../types/map/pst';

/**
 * Convert attitude data structure to PST element
 */
export function convertAttitudeToPSTElement(attitude: any): PSTElement | null {
  // Check if this is a PST attitude type
  const pstTypes: PSTType[] = ['pioneers', 'settlers', 'townplanners'];
  if (!pstTypes.includes(attitude.attitude)) {
    return null;
  }

  // Generate unique ID for the PST element
  const id = `pst-${attitude.attitude}-${attitude.line}`;

  // Convert attitude coordinates to PST coordinates
  const coordinates: PSTCoordinates = {
    maturity1: attitude.maturity,
    visibility1: attitude.visibility,
    maturity2: attitude.maturity2,
    visibility2: attitude.visibility2,
  };

  return {
    id,
    type: attitude.attitude as PSTType,
    coordinates,
    line: attitude.line,
    name: attitude.name || undefined,
  };
}

/**
 * Extract PST elements from attitudes array
 */
export function extractPSTElementsFromAttitudes(attitudes: any[]): PSTElement[] {
  if (!Array.isArray(attitudes)) {
    return [];
  }

  return attitudes
    .map(convertAttitudeToPSTElement)
    .filter((element): element is PSTElement => element !== null);
}

/**
 * Update map text with new PST coordinates after resize
 */
export function updatePSTInMapText(
  mapText: string,
  pstElement: PSTElement,
  newCoordinates: PSTCoordinates
): string {
  const lines = mapText.split('\n');
  
  if (pstElement.line < 1 || pstElement.line > lines.length) {
    console.warn(`Invalid line number ${pstElement.line} for PST element ${pstElement.id}`);
    return mapText;
  }

  // Get the line to update (line numbers are 1-based)
  const lineIndex = pstElement.line - 1;
  const currentLine = lines[lineIndex];

  // Create the new PST syntax with updated coordinates
  const newPSTSyntax = `${pstElement.type} [${newCoordinates.visibility1.toFixed(2)}, ${newCoordinates.maturity1.toFixed(2)}, ${newCoordinates.visibility2.toFixed(2)}, ${newCoordinates.maturity2.toFixed(2)}]`;

  // Replace the PST coordinates in the line
  // Match the pattern: type [v1, m1, v2, m2]
  const pstPattern = new RegExp(
    `${pstElement.type}\\s*\\[\\s*[+-]?\\d*\\.?\\d+\\s*,\\s*[+-]?\\d*\\.?\\d+\\s*,\\s*[+-]?\\d*\\.?\\d+\\s*,\\s*[+-]?\\d*\\.?\\d+\\s*\\]`
  );

  const updatedLine = currentLine.replace(pstPattern, newPSTSyntax);
  
  // Update the line in the array
  lines[lineIndex] = updatedLine;
  
  return lines.join('\n');
}

/**
 * Find PST element by ID in a list
 */
export function findPSTElementById(elements: PSTElement[], id: string): PSTElement | null {
  return elements.find(element => element.id === id) || null;
}

/**
 * Check if two PST elements are the same
 */
export function isPSTElementEqual(element1: PSTElement, element2: PSTElement): boolean {
  return element1.id === element2.id && element1.line === element2.line;
}