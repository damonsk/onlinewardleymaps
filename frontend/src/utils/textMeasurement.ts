import React from 'react';

/**
 * Utility functions for measuring text dimensions in SVG context
 * Used to create dynamic selection boxes that properly encapsulate text content
 */

export interface TextDimensions {
    width: number;
    height: number;
    x: number;
    y: number;
}

/**
 * Measures the bounding box of an SVG text element
 * @param element - The SVG text element to measure
 * @returns The dimensions and position of the text element
 */
export function measureTextElement(element: SVGTextElement | null): TextDimensions {
    if (!element) {
        return {width: 40, height: 20, x: -20, y: -10}; // Default fallback size
    }

    try {
        const bbox = element.getBBox();
        return {
            width: bbox.width,
            height: bbox.height,
            x: bbox.x,
            y: bbox.y,
        };
    } catch (error) {
        console.warn('Failed to measure text element, using default dimensions:', error);
        return {width: 40, height: 20, x: -20, y: -10};
    }
}

/**
 * Estimates text dimensions based on content and styling
 * Fallback method when getBBox() is not available
 * @param text - The text content
 * @param fontSize - Font size in pixels
 * @param fontFamily - Font family name
 * @param isMultiLine - Whether the text spans multiple lines
 * @returns Estimated dimensions
 */
export function estimateTextDimensions(
    text: string,
    fontSize: number = 14,
    fontFamily: string = 'Arial, sans-serif',
    isMultiLine: boolean = false,
): TextDimensions {
    if (!text || text.trim().length === 0) {
        return {width: 10, height: fontSize, x: -5, y: -fontSize / 2};
    }

    // Create a temporary canvas to measure text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
        // Fallback to character-based estimation
        const avgCharWidth = fontSize * 0.6; // Approximation
        const lines = isMultiLine ? text.split('\n') : [text];
        const maxLineLength = Math.max(...lines.map(line => line.length));
        const width = maxLineLength * avgCharWidth;
        const height = lines.length * fontSize * 1.2; // Line height factor

        return {
            width,
            height,
            x: -width / 2,
            y: -height / 2,
        };
    }

    context.font = `${fontSize}px ${fontFamily}`;

    if (isMultiLine) {
        const lines = text.split('\n');
        let maxWidth = 0;

        for (const line of lines) {
            const lineWidth = context.measureText(line).width;
            maxWidth = Math.max(maxWidth, lineWidth);
        }

        const height = lines.length * fontSize * 1.2; // Line height factor

        return {
            width: maxWidth,
            height,
            x: -maxWidth / 2,
            y: -height / 2,
        };
    } else {
        const metrics = context.measureText(text);
        const width = metrics.width;
        const height = fontSize; // Single line height

        return {
            width,
            height,
            x: -width / 2,
            y: -height / 2,
        };
    }
}

/**
 * Creates a selection box dimensions with padding around the text
 * @param textDimensions - The measured text dimensions
 * @param padding - Additional padding around the text (default: 4px)
 * @returns Selection box dimensions
 */
export function createSelectionBoxDimensions(textDimensions: TextDimensions, padding: number = 4): TextDimensions {
    return {
        width: textDimensions.width + padding * 2,
        height: textDimensions.height + padding * 2,
        x: textDimensions.x - padding,
        y: textDimensions.y - padding,
    };
}

/**
 * Hook to measure text element dimensions with React ref
 * @param text - The text content for fallback estimation
 * @param fontSize - Font size for fallback estimation
 * @param fontFamily - Font family for fallback estimation
 * @param isMultiLine - Whether text is multi-line
 * @returns A ref callback and current dimensions
 */
export function useTextDimensions(
    text: string,
    fontSize: number = 14,
    fontFamily: string = 'Arial, sans-serif',
    isMultiLine: boolean = false,
) {
    const [dimensions, setDimensions] = React.useState<TextDimensions>(() =>
        estimateTextDimensions(text, fontSize, fontFamily, isMultiLine),
    );

    const textRef = React.useCallback((element: SVGTextElement | null) => {
        if (element) {
            // Use setTimeout to ensure the element is fully rendered
            setTimeout(() => {
                const measured = measureTextElement(element);
                setDimensions(measured);
            }, 0);
        }
    }, []);

    // Update dimensions when text changes
    React.useEffect(() => {
        setDimensions(estimateTextDimensions(text, fontSize, fontFamily, isMultiLine));
    }, [text, fontSize, fontFamily, isMultiLine]);

    return {textRef, dimensions};
}
