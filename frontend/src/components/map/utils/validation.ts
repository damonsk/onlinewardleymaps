export interface Position {
    x: number;
    y: number;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export const validatePosition = (position: Position | null): ValidationResult => {
    const errors: string[] = [];

    if (!position) {
        errors.push('Position is null or undefined');
        return {isValid: false, errors};
    }

    if (typeof position.x !== 'number' || typeof position.y !== 'number') {
        errors.push('Position coordinates must be numbers');
        console.debug('validatePosition: Invalid types', {position, xType: typeof position.x, yType: typeof position.y});
        return {isValid: false, errors};
    }

    if (isNaN(position.x) || isNaN(position.y)) {
        errors.push('Position coordinates cannot be NaN');
        console.debug('validatePosition: NaN values', {position});
        return {isValid: false, errors};
    }

    // Allow slightly out-of-bounds coordinates during interactive use (pan/zoom edge cases)
    // but clamp them to valid range for actual placement
    const tolerance = 0.1;
    if (position.x < -tolerance || position.x > 1 + tolerance || position.y < -tolerance || position.y > 1 + tolerance) {
        errors.push('Position coordinates are too far outside map boundaries');
        console.debug('validatePosition: Out of bounds', {position});
        return {isValid: false, errors};
    }

    return {isValid: true, errors: []};
};

export const validatePositionBounds = (position: Position, minSize = 0.05, maxSize = 0.8): ValidationResult => {
    const basicValidation = validatePosition(position);
    if (!basicValidation.isValid) return basicValidation;

    const errors: string[] = [];

    // Check if position is too close to edges
    if (position.x < minSize || position.x > 1 - minSize || position.y < minSize || position.y > 1 - minSize) {
        errors.push('Position too close to map boundaries');
    }

    return {isValid: errors.length === 0, errors};
};

export const validateRectangle = (start: Position, end: Position, minSize = 0.05, maxSize = 0.8): ValidationResult => {
    const startValidation = validatePosition(start);
    const endValidation = validatePosition(end);

    if (!startValidation.isValid) return startValidation;
    if (!endValidation.isValid) return endValidation;

    const errors: string[] = [];

    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    if (width < minSize || height < minSize) {
        errors.push(`Rectangle too small (minimum ${minSize})`);
    }

    if (width > maxSize || height > maxSize) {
        errors.push(`Rectangle too large (maximum ${maxSize})`);
    }

    return {isValid: errors.length === 0, errors};
};

export const generateUniqueComponentName = (baseName: string, existingNames: string[], maxAttempts = 100): string => {
    let componentName = baseName;
    let counter = 1;

    while (existingNames.includes(componentName) && counter < maxAttempts) {
        componentName = `${baseName} ${counter}`;
        counter++;
    }

    if (counter >= maxAttempts) {
        throw new Error('Could not generate unique component name');
    }

    return componentName;
};
