# Phase 4C Modernization Patterns

This document outlines the patterns and approaches used in Phase 4C of the OnlineWardleyMaps TypeScript migration project.

## Modern Component Pattern

Throughout this phase, we've established a consistent pattern for modernizing components:

1. **Naming Convention:** Modern components are prefixed with "Modern" (e.g., `ModernSingletonPositionUpdater`)
2. **Direct Usage of Unified Types:** Modern components use `UnifiedComponent` and other unified types directly
3. **Improved Type Safety:** All components include proper TypeScript typing
4. **JSDoc Documentation:** Components include detailed JSDoc documentation
5. **Consistent Interface Implementation:** All components implement standardized interfaces

## Position Updater Pattern

Position updaters follow a specific pattern:

```typescript
export default class ModernPositionUpdater implements PositionUpdater {
    // Properties
    type: string;
    mapText: string;
    mutator: (updatedText: string) => void;
    
    // Constructor accepting necessary parameters
    constructor(type, mapText, mutator, ...) {
        // Initialize properties
    }
    
    // Implementation of the PositionUpdater interface
    update(moved: any, identifier: string): void {
        // Implementation
    }
    
    // Optional: Chain of Responsibility pattern
    setSuccessor(positionUpdater: PositionUpdater): void {
        // Implementation
    }
}
```

## Matcher Pattern

Matchers follow a consistent pattern:

```typescript
export const ModernMatcher: Replacer = {
    matcher: (line: string, identifier: string, type: string): boolean => {
        // Check if the line matches the criteria
        return lineMatchesPattern;
    },
    
    action: (line: string, moved: SomeMovedType): string => {
        // Transform the line based on the moved parameters
        return transformedLine;
    },
};
```

## Migration Steps

When migrating a component:

1. **Create a modern version** with the "Modern" prefix
2. **Adopt unified types directly** instead of legacy types
3. **Add comprehensive JSDoc comments**
4. **Implement proper interfaces**
5. **Add test coverage** to verify functionality
6. **Update relevant documentation**

## Common Interfaces

Key interfaces used across the codebase:

- `PositionUpdater`: Interface for classes that update positions of elements
- `Replacer`: Interface for matcher/action pairs that modify map DSL text
- `Moved`: Interface for elements with simple coordinates (param1, param2)
- `ManyCoordsMoved`: Interface for elements with multiple coordinates

## Examples

### Position Calculator

```typescript
export default class ModernPositionCalculator {
    visibilityToY(visibility: number, mapHeight: number): number {
        return (1 - visibility) * mapHeight;
    }
    
    maturityToX(maturity: number, mapWidth: number): number {
        return maturity * mapWidth;
    }
    
    // Additional methods...
}
```

### SingletonPositionUpdater

```typescript
export default class ModernSingletonPositionUpdater implements PositionUpdater {
    // Implementation...
    update(moved: Moved, identifier: string): void {
        if (this.elementExists() && this.hasSuccessor()) {
            this.delegate(moved, identifier);
        } else {
            this.createNewElement(moved);
        }
    }
}
```

## Progress and Next Steps

Phase 4C has successfully modernized:
- Position updaters (DefaultPositionUpdater, LineNumberPositionUpdater, SingletonPositionUpdater)
- Matcher utilities (ExistingCoordsMatcher, ExistingManyCoordsMatcher)
- Various map components (FluidLink, RelativeMovable, etc.)

Next steps include:
1. Integration testing
2. Additional component modernization 
3. End-to-end testing of the map rendering system
