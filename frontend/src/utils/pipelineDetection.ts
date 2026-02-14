/**
 * Pipeline Detection and Position Validation Utilities
 *
 * This module provides enhanced position validation that can detect when a component
 * should be snapped to an existing pipeline based on its position.
 */

import {UnifiedWardleyMap} from '../types/unified/map';
import {PipelineData} from '../types/unified/components';
import {calculatePipelineBounds, isPositionWithinPipelineBounds, PipelineBounds} from './mapTextGeneration';

/**
 * Interface for position validation with pipeline detection
 */
export interface PositionValidationResult {
    isValid: boolean;
    errors: string[];
    nearbyPipeline?: PipelineBounds;
    shouldSnapToPipeline?: boolean;
    suggestedPosition?: {x: number; y: number};
}

/**
 * Enhanced position validation that includes pipeline detection
 *
 * @param position - Position to validate
 * @param wardleyMap - Current map data
 * @param options - Validation options
 * @returns Enhanced validation result
 */
export function validatePositionWithPipelineDetection(
    position: {x: number; y: number},
    wardleyMap: UnifiedWardleyMap,
    options: {
        tolerance?: number;
        enablePipelineSnapping?: boolean;
    } = {},
): PositionValidationResult {
    const {tolerance = 0.1, enablePipelineSnapping = true} = options;

    // Basic position validation
    const errors: string[] = [];

    if (typeof position.x !== 'number' || isNaN(position.x)) {
        errors.push('Position x must be a valid number');
    } else if (position.x < 0 || position.x > 1) {
        errors.push('Position x must be between 0 and 1');
    }

    if (typeof position.y !== 'number' || isNaN(position.y)) {
        errors.push('Position y must be a valid number');
    } else if (position.y < 0 || position.y > 1) {
        errors.push('Position y must be between 0 and 1');
    }

    const basicValidation = {
        isValid: errors.length === 0,
        errors,
        shouldSnapToPipeline: false,
    };

    if (!basicValidation.isValid || !enablePipelineSnapping) {
        return basicValidation;
    }

    // Pipeline detection
    try {
        const nearbyPipeline = detectNearbyPipeline(position, wardleyMap.pipelines || [], tolerance);

        if (nearbyPipeline) {
            return {
                ...basicValidation,
                nearbyPipeline,
                shouldSnapToPipeline: true,
                suggestedPosition: {
                    x: position.x, // Keep original maturity
                    y: nearbyPipeline.visibility, // Snap to pipeline visibility
                },
            };
        }
    } catch (pipelineError) {
        console.warn('Pipeline detection failed:', pipelineError);
        // Continue with basic validation if pipeline detection fails
    }

    return basicValidation;
}

/**
 * Detects if a position is near any pipeline bounds
 *
 * @param position - Position to check
 * @param pipelines - Array of pipeline data
 * @param tolerance - Tolerance for proximity detection
 * @returns Pipeline bounds if position is nearby, undefined otherwise
 */
export function detectNearbyPipeline(
    position: {x: number; y: number},
    pipelines: PipelineData[],
    tolerance: number = 0.1,
): PipelineBounds | undefined {
    if (!pipelines || !Array.isArray(pipelines)) {
        return undefined;
    }

    for (const pipeline of pipelines) {
        try {
            const bounds = calculatePipelineBounds(pipeline);

            if (isPositionWithinPipelineBounds(position, bounds, tolerance)) {
                return bounds;
            }
        } catch (error) {
            console.warn(`Failed to calculate bounds for pipeline "${pipeline.name}":`, error);
            continue;
        }
    }

    return undefined;
}

/**
 * Gets all pipeline bounds from a map
 *
 * @param wardleyMap - Map data
 * @returns Array of pipeline bounds
 */
export function getAllPipelineBounds(wardleyMap: UnifiedWardleyMap): PipelineBounds[] {
    if (!wardleyMap.pipelines || !Array.isArray(wardleyMap.pipelines)) {
        return [];
    }

    const bounds: PipelineBounds[] = [];

    for (const pipeline of wardleyMap.pipelines) {
        try {
            bounds.push(calculatePipelineBounds(pipeline));
        } catch (error) {
            console.warn(`Failed to calculate bounds for pipeline "${pipeline.name}":`, error);
        }
    }

    return bounds;
}

/**
 * Finds the best pipeline for a component based on position
 *
 * @param position - Component position
 * @param wardleyMap - Map data
 * @param tolerance - Tolerance for matching
 * @returns Best matching pipeline bounds or undefined
 */
export function findBestPipelineForPosition(
    position: {x: number; y: number},
    wardleyMap: UnifiedWardleyMap,
    tolerance: number = 0.1,
): PipelineBounds | undefined {
    const allBounds = getAllPipelineBounds(wardleyMap);

    if (allBounds.length === 0) {
        return undefined;
    }

    // Find pipelines that contain the position
    const matchingPipelines = allBounds.filter(bounds => isPositionWithinPipelineBounds(position, bounds, tolerance));

    if (matchingPipelines.length === 0) {
        return undefined;
    }

    // If multiple pipelines match, prefer the one with closest visibility
    if (matchingPipelines.length === 1) {
        return matchingPipelines[0];
    }

    return matchingPipelines.reduce((closest, current) => {
        const currentDistance = Math.abs(current.visibility - position.y);
        const closestDistance = Math.abs(closest.visibility - position.y);
        return currentDistance < closestDistance ? current : closest;
    });
}

/**
 * Generates a unique component name for pipeline insertion
 *
 * @param baseName - Base name for the component
 * @param existingNames - Array of existing component names
 * @param maxAttempts - Maximum attempts to find unique name
 * @returns Unique component name
 */
export function generateUniquePipelineComponentName(
    baseName: string = 'New Component',
    existingNames: string[] = [],
    maxAttempts: number = 100,
): string {
    if (!existingNames.includes(baseName)) {
        return baseName;
    }

    for (let i = 1; i <= maxAttempts; i++) {
        const candidateName = `${baseName} ${i}`;
        if (!existingNames.includes(candidateName)) {
            return candidateName;
        }
    }

    // Fallback with timestamp
    return `${baseName} ${Date.now()}`;
}
