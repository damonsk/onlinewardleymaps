# ModernMapElements API Documentation

## Overview
This documentation covers the ModernMapElements class, which replaces the legacy UnifiedMapElements class and provides a more modern, type-safe API for working with Wardley Map components.

## Class Description
ModernMapElements is a fully modern implementation of map element processing that works directly with unified types without converting to legacy MapElement types. It provides cleaner and more type-safe interfaces for modern components.

## Importing
```typescript
import { ModernMapElements } from '../processing/ModernMapElements';
```

## Constructor
```typescript
constructor(map: UnifiedWardleyMap)
```
Creates a new instance of ModernMapElements with the given UnifiedWardleyMap.

## Key Methods

### Component Access Methods

#### `getAllComponents(): UnifiedComponent[]`
Returns all components in the map, including components, anchors, submaps, markets, and ecosystems.

#### `getComponentsByType(type: string): UnifiedComponent[]`
Returns components of a specific type (e.g., 'component', 'anchor', 'submap', etc.).

#### `getEvolvingComponents(): UnifiedComponent[]`
Returns components that are in the process of evolving.

#### `getEvolvedComponents(): UnifiedComponent[]`
Returns the evolved versions of components.

#### `getNonEvolvingComponents(): UnifiedComponent[]`
Returns components that are not evolving (not in the evolvedElements collection).

#### `getNeitherEvolvedNorEvolvingComponents(): UnifiedComponent[]`
Returns components that are neither evolved nor evolving.

#### `getEitherEvolvedOrEvolvingComponents(): UnifiedComponent[]`
Returns components that are either evolved or evolving.

#### `getMergedComponents(): UnifiedComponent[]`
Returns all components merged with their evolved versions, providing a complete set of components for rendering.

#### `getPipelineComponents(): PipelineData[]`
Returns pipeline components.

### Legacy Adapter

#### `getLegacyAdapter(): any`
Creates a legacy UnifiedMapElements-compatible adapter for backward compatibility during the transition period. This should only be used in components that haven't been fully migrated yet.

**Note:** This method is deprecated and will be removed once all components are updated to use ModernMapElements directly.

## Usage Examples

### Basic Usage
```typescript
// Create a new ModernMapElements instance
const mapElements = new ModernMapElements(unifiedWardleyMap);

// Get all components
const allComponents = mapElements.getAllComponents();

// Get components by type
const anchors = mapElements.getComponentsByType('anchor');
```

### Working with Evolved Components
```typescript
// Get components that are evolving
const evolvingComponents = mapElements.getEvolvingComponents();

// Get evolved versions of components
const evolvedComponents = mapElements.getEvolvedComponents();

// Get all components for rendering (merged with evolved versions)
const renderComponents = mapElements.getMergedComponents();
```

### Working with Link Strategies
```typescript
// In LinksBuilder.ts
constructor(
    mapLinks: Link[],
    modernMapElements: ModernMapElements,
    mapAnchors: MapAnchors[],
    showLinkedEvolved: boolean,
) {
    // Use legacy adapter for transition period
    const mapElements = modernMapElements.getLegacyAdapter();
    
    // Create link strategies
    this.linkStrategies = [
        new AllLinksStrategy(mapLinks, mapElements),
        new AnchorLinksStrategy(mapLinks, mapElements, mapAnchors),
        // ...other strategies
    ];
}
```

### In Modern Components
```typescript
// In a React component
function MyMapComponent({ mapElements }: { mapElements: ModernMapElements }) {
    // Use ModernMapElements methods directly
    const components = mapElements.getMergedComponents();
    
    return (
        <div>
            {components.map(component => (
                <ComponentRenderer key={component.id} component={component} />
            ))}
        </div>
    );
}
```

## Migration Guide

### Migrating from UnifiedMapElements
1. Replace import statements:
   ```typescript
   // Old
   import { UnifiedMapElements } from '../processing/UnifiedMapElements';
   
   // New
   import { ModernMapElements } from '../processing/ModernMapElements';
   ```

2. Update constructor parameters:
   ```typescript
   // Old
   constructor(links: Link[], mapElements: UnifiedMapElements) {
       this.mapElements = mapElements;
   }
   
   // New
   constructor(links: Link[], mapElements: ModernMapElements) {
       this.mapElements = mapElements.getLegacyAdapter();
   }
   ```

3. For new components, use ModernMapElements methods directly:
   ```typescript
   // Old pattern (with adapter)
   const components = mapElements.getLegacyAdapter().getMergedElements();
   
   // New pattern (direct usage)
   const components = mapElements.getMergedComponents();
   ```

4. Update method names:
   - `getEvolveElements()` → `getEvolvingComponents()`
   - `getEvolvedElements()` → `getEvolvedComponents()`
   - `getMergedElements()` → `getMergedComponents()`
   - `getMapPipelines()` → `getPipelineComponents()`
   - `getNoneEvolvedOrEvolvingElements()` → `getNeitherEvolvedNorEvolvingComponents()`
   - `getNoneEvolvingElements()` → `getNonEvolvingComponents()`
