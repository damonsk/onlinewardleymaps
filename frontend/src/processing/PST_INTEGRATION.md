# PST Element Integration in MapElements

## Overview

This document describes how PST (Pioneers, Settlers, Town Planners) elements are integrated into the unified map processing system through the MapElements class.

## Integration Details

### PST Element Extraction

PST elements are extracted from the `attitudes` array in the UnifiedWardleyMap and converted to PSTElement objects using the `extractPSTElementsFromAttitudes` utility function.

### Unified Component Integration

PST elements are converted to UnifiedComponent objects and integrated into the main component processing system:

- **Type**: `'pst'`
- **PST-specific properties**: 
  - `pstType`: The PST type ('pioneers', 'settlers', 'townplanners')
  - `pstCoordinates`: The full coordinate structure with maturity1, visibility1, maturity2, visibility2
- **Primary coordinates**: Uses maturity1/visibility1 as the primary maturity/visibility for compatibility

### New Methods

The MapElements class provides several new methods for PST element access:

- `getPSTElements()`: Returns all PST elements as PSTElement objects
- `getPSTElementsByType(type)`: Returns PST elements filtered by type
- `getPSTComponents()`: Returns PST elements as UnifiedComponent objects
- `getAllComponentsIncludingPST()`: Returns all components including PST elements

### Legacy Adapter

The legacy adapter includes all PST methods to maintain backward compatibility.

## Usage

```typescript
const mapElements = new MapElements(wardleyMap);

// Get PST elements
const pstElements = mapElements.getPSTElements();
const pioneers = mapElements.getPSTElementsByType('pioneers');

// Get PST components in unified format
const pstComponents = mapElements.getPSTComponents();

// Get all components including PST
const allComponents = mapElements.getAllComponents(); // Now includes PST elements
```

## Rendering Integration

The UnifiedMapContent component now uses PST elements directly from MapElements instead of extracting them separately from attitudes:

```typescript
// Before
{props.mapAttitudes && 
  extractPSTElementsFromAttitudes(props.mapAttitudes).map(...)}

// After  
{mapElements.getPSTElements().map(...)}
```

This ensures PST elements are processed through the same unified system as other map elements.

## Testing

- Unit tests: `MapElementsPST.test.ts`
- Integration tests: `PSTMapElementsIntegration.test.tsx`

Both test suites verify that PST elements are properly extracted, integrated, and rendered through the unified system.