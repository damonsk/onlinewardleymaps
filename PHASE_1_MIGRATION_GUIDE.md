# Phase 1 Migration Guide: Type Consolidation

## Overview

Phase 1 of the OnlineWardleyMaps refactoring focuses on consolidating the scattered type definitions into a unified, coherent type system. This guide provides step-by-step instructions for migrating from the old fragmented types to the new unified system.

## What We've Accomplished

### ✅ Created Unified Type System

- **Location**: `frontend/src/types/unified/`
- **Purpose**: Consolidates 8+ overlapping component interfaces into 4 core types
- **Files Created**:
  - `components.ts` - Unified component type hierarchy
  - `links.ts` - Consolidated link types
  - `map.ts` - Clean WardleyMap structure
  - `index.ts` - Central export point

### ✅ Built Migration Infrastructure

- **UnifiedConverter**: Adapter layer that converts legacy WardleyMap to unified types
- **UnifiedMapElements**: Simplified map processing with type safety
- **useUnifiedMapState**: Consolidated state management hook

### ✅ Backward Compatibility

- **useLegacyMapState**: Hook that provides old component interfaces during transition
- **Migration helpers**: Functions to convert between old and new types

## Type Mapping

### Old → New Component Types

| Old Interface    | New Unified Type   | Notes                              |
| ---------------- | ------------------ | ---------------------------------- |
| `MapElement`     | `UnifiedComponent` | Core component with all properties |
| `Component`      | `UnifiedComponent` | Merged into unified interface      |
| `MapComponents`  | `MapComponentData` | Specialized type for components    |
| `NamedComponent` | `BaseMapElement`   | Base interface for named elements  |
| `MapAnchors`     | `MapAnchorData`    | Specialized type for anchors       |
| `MapSubmaps`     | `MapSubmapData`    | Specialized type for submaps       |
| `MapMarkets`     | `MapMarketData`    | Specialized type for markets       |
| `MapEcosystems`  | `MapEcosystemData` | Specialized type for ecosystems    |

### Old → New Link Types

| Old Interface | New Unified Type       | Notes                         |
| ------------- | ---------------------- | ----------------------------- |
| `Link`        | `BaseLink`             | Core link interface           |
| `MapLinks`    | `FlowLink`             | Enhanced with flow properties |
| `LinkResult`  | `LinkExtractionResult` | Extraction result type        |

### Old → New Map Structure

| Old Property | New Property | Type Change                              |
| ------------ | ------------ | ---------------------------------------- |
| `elements`   | `components` | `MapComponents[]` → `UnifiedComponent[]` |
| `anchors`    | `anchors`    | `MapAnchors[]` → `UnifiedComponent[]`    |
| `submaps`    | `submaps`    | `MapSubmaps[]` → `UnifiedComponent[]`    |
| `markets`    | `markets`    | `MapMarkets[]` → `UnifiedComponent[]`    |
| `ecosystems` | `ecosystems` | `MapEcosystems[]` → `UnifiedComponent[]` |
| `links`      | `links`      | `MapLinks[]` → `FlowLink[]`              |
| `evolved`    | `evolved`    | `MapEvolved[]` → `EvolvedElementData[]`  |
| `pipelines`  | `pipelines`  | `MapPipelines[]` → `PipelineData[]`      |

## Migration Steps

### Step 1: Update Import Statements

**Before:**

```typescript
import {
  MapElement,
  Component,
  MapComponents,
  NamedComponent,
  MapLinks,
  WardleyMap,
} from "../types/base";
```

**After:**

```typescript
import {
  UnifiedComponent,
  FlowLink,
  UnifiedWardleyMap,
  MapComponentData,
  createUnifiedComponent,
} from "../types/unified";
```

### Step 2: Update Component Interfaces

**Before:**

```typescript
interface MyComponentProps {
  element: MapElement;
  components: MapComponents[];
  links: MapLinks[];
}
```

**After:**

```typescript
interface MyComponentProps {
  element: UnifiedComponent;
  components: UnifiedComponent[];
  links: FlowLink[];
}
```

### Step 3: Use Helper Functions for Component Creation

**Before:**

```typescript
const component: Component = {
  name: "MyComponent",
  id: "comp_1",
  maturity: 0.5,
  visibility: 0.7,
  // ... many optional properties
};
```

**After:**

```typescript
const component = createUnifiedComponent({
  id: "comp_1",
  name: "MyComponent",
  type: "component",
  maturity: 0.5,
  visibility: 0.7,
  // Only specify what you need - defaults are provided
});
```

### Step 4: Update Type Guards

**Before:**

```typescript
if (element.type === "component") {
  // Type narrowing was manual
}
```

**After:**

```typescript
import { isComponent } from "../types/unified";

if (isComponent(element)) {
  // element is now typed as MapComponentData
}
```

### Step 5: Migrate State Management

**Before:**

```typescript
const [mapComponents, setMapComponents] = useState<MapComponents[]>([]);
const [mapAnchors, setMapAnchors] = useState<MapAnchors[]>([]);
const [mapSubMaps, setMapSubMaps] = useState<MapSubmaps[]>([]);
// ... 12+ more useState hooks
```

**After:**

```typescript
const mapState = useUnifiedMapState();
// OR for gradual migration:
const legacyState = useLegacyMapState(mapState);
```

## Code Examples

### Example 1: Component Processing

**Before:**

```typescript
function processComponents(components: MapComponents[]): ProcessedComponent[] {
  return components.map((comp) => ({
    id: comp.id || generateId(comp.name),
    name: comp.name || "",
    maturity: comp.maturity || 0,
    visibility: comp.visibility || 0,
    evolved: comp.evolved || false,
    // Manual property assignment with fallbacks
  }));
}
```

**After:**

```typescript
function processComponents(components: UnifiedComponent[]): UnifiedComponent[] {
  // No processing needed - defaults are already set
  return components.filter(isComponent);
}
```

### Example 2: Map Conversion

**Before:**

```typescript
function convertMap(legacyMap: WardleyMap): ProcessedMap {
  return {
    components: legacyMap.elements.map(convertComponent),
    anchors: legacyMap.anchors.map(convertAnchor),
    submaps: legacyMap.submaps.map(convertSubmap),
    // ... lots of manual conversion
  };
}
```

**After:**

```typescript
function convertMap(mapText: string): UnifiedWardleyMap {
  const converter = new UnifiedConverter(featureSwitches);
  return converter.parse(mapText); // Handles all conversions
}
```

### Example 3: MapElements Usage

**Before:**

```typescript
const mapElements = new MapElements(
  [
    {
      collection: mapComponents.map(convertToMapElementsComponent),
      type: "component",
    },
    {
      collection: mapSubMaps.map(convertToMapElementsComponent),
      type: "submap",
    },
    // ... multiple conversion calls
  ],
  mapEvolved.map(convertToMapElementsEvolved),
  mapPipelines.map(convertToMapElementsPipeline)
);
```

**After:**

```typescript
const mapElements = new UnifiedMapElements(unifiedMap);
```

## Testing Migration

### Validation Script

```typescript
// test-migration.ts
import { UnifiedConverter } from "../conversion/UnifiedConverter";
import { UnifiedMapElements } from "../processing/UnifiedMapElements";

const testMapText = `
title My Test Map
component A [0.5, 0.7]
component B [0.3, 0.4]
A->B
`;

const converter = new UnifiedConverter(featureSwitches);
const unifiedMap = converter.parse(testMapText);
const mapElements = new UnifiedMapElements(unifiedMap);

console.log("Components:", mapElements.getAllComponents().length);
console.log("Validation:", mapElements.validate());
```

## Migration Checklist

### Phase 1A: Infrastructure (✅ Complete)

- [x] Create unified type definitions
- [x] Build UnifiedConverter adapter
- [x] Create UnifiedMapElements processor
- [x] Implement consolidated state management
- [x] Add backward compatibility helpers

### Phase 1B: Gradual Component Migration (Next)

- [ ] Update MapCanvas to use UnifiedConverter
- [ ] Migrate MapView to use unified types
- [ ] Update component rendering files
- [ ] Test with existing functionality

### Phase 1C: Complete Migration

- [ ] Remove old type definitions
- [ ] Remove conversion functions
- [ ] Update all import statements
- [ ] Run full test suite

## Rollback Plan

If issues arise during migration:

1. **Gradual Rollback**: Use `useLegacyMapState` to revert individual components
2. **Full Rollback**: Revert to using original types and remove unified files
3. **Backup Strategy**: All original files remain untouched during Phase 1

## Performance Benefits

### Before

- 8+ type interfaces for similar concepts
- 6 data conversion steps
- 15+ useState hooks triggering re-renders
- Manual property assignment with fallbacks

### After

- 4 core unified types
- 2 conversion steps (mapText → UnifiedMap → components)
- 3-5 useState hooks in consolidated state
- Default values provided by helper functions

## Next Steps

1. **Test the unified system** with existing map data
2. **Gradually migrate components** starting with MapCanvas
3. **Validate functionality** matches existing behavior
4. **Proceed to Phase 2** once Phase 1 is stable

## Support

For questions about the migration:

- Check type definitions in `frontend/src/types/unified/`
- Use helper functions for component creation
- Leverage type guards for type safety
- Consult this guide for mapping between old and new types
