# Design Document

## Overview

The Safari inline editor positioning issue stems from differences in how Safari interprets `foreignObject` coordinates within SVG elements compared to Chrome. Safari appears to handle coordinate transformations differently, causing the inline editor to appear at incorrect positions.

## Architecture

The solution involves creating a browser-aware positioning system that:

1. Detects Safari browser
2. Applies Safari-specific coordinate adjustments for `foreignObject` positioning
3. Maintains backward compatibility with existing Chrome/Firefox behavior

## Components and Interfaces

### Browser Detection Utility

```typescript
interface BrowserInfo {
    isSafari: boolean;
    isChrome: boolean;
    isFirefox: boolean;
}

function detectBrowser(): BrowserInfo;
```

### Position Calculator

```typescript
interface SVGPosition {
    x: number;
    y: number;
}

interface ForeignObjectPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

function calculateForeignObjectPosition(
    svgPosition: SVGPosition,
    editorDimensions: { width: number; height: number },
    isSafari: boolean
): ForeignObjectPosition;
```

### Updated Components

1. **MapTitle Component**: Apply Safari-specific positioning for title editing
2. **ComponentText Component**: Apply Safari-specific positioning for component name editing
3. **InlineEditor Component**: Ensure consistent styling across browsers

## Data Models

No new data models required. The fix involves coordinate transformation logic only.

## Error Handling

- Graceful fallback to default positioning if browser detection fails
- Console warnings for debugging positioning issues
- Maintain existing error handling for save/cancel operations

## Testing Strategy

1. **Cross-browser Testing**: Verify positioning works correctly in Safari, Chrome, and Firefox
2. **Zoom Level Testing**: Ensure positioning works at different map zoom levels
3. **Pan Position Testing**: Verify positioning works when map is panned to different positions
4. **Responsive Testing**: Test on different screen sizes and device orientations

## Implementation Details

### Safari-Specific Adjustments

Safari requires different coordinate calculations for `foreignObject` positioning:

1. **Coordinate System**: Safari may interpret SVG coordinates differently when transforms are applied
2. **Transform Compensation**: Need to account for any parent SVG transforms
3. **Viewport Adjustments**: Ensure editor stays within visible viewport bounds

### Positioning Logic

```typescript
// Pseudo-code for positioning logic
function getEditorPosition(originalPosition: SVGPosition, isSafari: boolean) {
    if (isSafari) {
        // Apply Safari-specific adjustments
        return {
            x: originalPosition.x + safariXOffset,
            y: originalPosition.y + safariYOffset
        };
    }
    
    // Use existing logic for other browsers
    return originalPosition;
}
```

### Browser Detection

Use user agent detection as a fallback, with feature detection as primary method:

```typescript
function isSafariBrowser(): boolean {
    // Feature detection first
    const hasSafariQuirks = /* Safari-specific feature checks */;
    
    // User agent as fallback
    const userAgent = navigator.userAgent;
    const isSafariUA = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    
    return hasSafariQuirks || isSafariUA;
}
```