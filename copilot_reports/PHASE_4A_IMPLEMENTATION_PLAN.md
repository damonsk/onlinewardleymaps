# Phase 4A Implementation Plan

## Overview

This document details the implementation steps for Phase 4A of the OnlineWardleyMaps migration plan, focusing on updating core component interfaces to use the unified type system directly.

## Key Components to Migrate

### 1. MapView Component

The `MapView.tsx` component currently accepts multiple individual props for map elements. It should be updated to use the `UnifiedWardleyMap` type directly, similar to `ModernMapView.tsx`.

### 2. UnifiedMapContent Component

The `UnifiedMapContent.tsx` component contains numerous occurrences of adapter functions like `adaptUnifiedToMapElement`. These need to be eliminated, and the component should work directly with `UnifiedComponent` and other unified types.

### 3. Component Interfaces

The following components need interface updates to work with unified types:

- **MapComponent.tsx** → **ModernMapComponent.tsx**
- **ComponentSymbol.tsx** → **ModernComponentSymbol.tsx** (already exists)
- **ComponentText.tsx** → **ModernComponentText.tsx**
- **MapPipelines.tsx** → **ModernMapPipelines.tsx**

## Implementation Approach

### Step 1: Create Modern Component Interfaces

For each component that needs migration, create a modern version with an updated interface that uses the unified types directly.

Example for ComponentText:
```typescript
// ModernComponentText.tsx
interface ModernComponentTextProps {
  component: UnifiedComponent;  // Use UnifiedComponent directly
  cx: string | number;
  cy: string | number;
  styles: MapComponentTheme;
  valueChain?: string;
}
```

### Step 2: Implement Modern Component Functionality

Implement the modern component versions, ensuring they work directly with the unified types without any adapters.

### Step 3: Update ModernUnifiedMapContent

Update `ModernUnifiedMapContent.tsx` to use the new modern components and remove all occurrences of adapter functions like `adaptUnifiedToMapElement`.

### Step 4: Integration Testing

Test each component update individually to ensure it renders correctly and maintains all functionality.

## Completion Criteria

1. All adapter functions are eliminated from ModernUnifiedMapContent
2. All modern components use UnifiedComponent and other unified types directly
3. No type conversion is needed when passing props between components
4. All components render and behave identically to their legacy versions

## Dependencies

- The unified type system (`UnifiedComponent`, `UnifiedWardleyMap`, etc.)
- Existing modern component implementations (ModernComponentSymbol, etc.)

## Implementation Order

1. ModernComponentText
2. ModernMapComponent
3. ModernMapPipelines
4. ModernUnifiedMapContent
5. Final integration tests

This phased approach allows us to incrementally migrate the codebase while maintaining compatibility with existing code.
