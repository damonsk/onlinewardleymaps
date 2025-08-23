# MapView.tsx Complexity Reduction Proposal

## Executive Summary

The current `MapView.tsx` is a 1400+ line monolithic component that violates multiple SOLID principles and React best practices. This proposal outlines a systematic refactoring approach to reduce complexity by ~70% while maintaining all existing functionality.

## Current State Analysis

### Problems Identified

1. **Single Responsibility Principle Violation**

    - Component handles UI rendering, state management, business logic, and event handling
    - 15+ useState hooks managing different concerns
    - Mixed toolbar, linking, drawing, and feedback responsibilities

2. **Code Duplication**

    - State reset logic repeated 4+ times
    - Position validation scattered throughout
    - Component finding logic duplicated
    - Error handling patterns repeated

3. **Deep Nesting & Complexity**

    - Nested callbacks with complex conditional logic
    - Long parameter lists (40+ props passed between components)
    - Deeply nested try-catch blocks

4. **Poor Separation of Concerns**
    - Business logic mixed with UI components
    - Event handlers contain validation, state updates, and side effects
    - No clear abstraction boundaries

## Proposed Solution

### 1. Extract Custom Hooks (Single Responsibility)

#### `useToolbarState` Hook

```typescript
// Consolidates: selectedToolbarItem, isValidDropZone, methodHighlightedComponent
export const useToolbarState = (): ToolbarState & ToolbarActions
```

**Benefits:**

- Encapsulates all toolbar-related state
- Provides clean API for toolbar interactions
- Reduces main component by ~150 lines

#### `useLinkingState` Hook

```typescript
// Consolidates: 8 linking-related state variables + logic
export const useLinkingState = (): LinkingState & LinkingActions
```

**Benefits:**

- Encapsulates complex linking workflow
- Automatic cleanup when components are deleted
- Reduces main component by ~300 lines

#### `useDrawingState` Hook

```typescript
// Consolidates: isDrawing, positions, mouse tracking
export const useDrawingState = (): DrawingState & DrawingActions
```

**Benefits:**

- Handles PST box drawing logic
- Coordinate transformation abstracted
- Reduces main component by ~200 lines

#### `useUserFeedback` Hook

```typescript
// Consolidates: userFeedback state + auto-hide logic
export const useUserFeedback = (): UserFeedbackState & UserFeedbackActions
```

**Benefits:**

- Centralized notification management
- Consistent auto-hide behavior
- Reduces main component by ~50 lines

### 2. Extract UI Components (Interface Segregation)

#### `UserFeedbackNotification` Component

- Extracts 80+ lines of notification UI
- Consolidates styling logic
- Improves reusability

#### `MapContainer` Component

- Handles container-level styling and events
- Removes style object creation from main component

#### `ValidationUtils` Module

- Consolidates position validation logic
- Provides consistent error messaging
- Reduces duplication across handlers

### 3. Consolidate Event Handlers (Open/Closed Principle)

#### `useMapHandlers` Hook

```typescript
// Consolidates all event handlers with shared dependencies
export const useMapHandlers = dependencies => ({
    handleComponentClick,
    handleMouseMove,
    handleToolbarItemDrop,
    // ... other handlers
});
```

**Benefits:**

- Shared state access
- Consistent error handling
- Reduced prop drilling

## Implementation Strategy

### Phase 1: Extract State Management (Low Risk)

1. Create custom hooks for each state concern
2. Replace useState calls with hook usage
3. Test each hook independently

### Phase 2: Extract UI Components (Medium Risk)

1. Extract notification component
2. Extract container component
3. Update main component to use new components

### Phase 3: Consolidate Handlers (Medium Risk)

1. Create useMapHandlers hook
2. Move handler logic to hook
3. Update event bindings

### Phase 4: Cleanup & Optimization (Low Risk)

1. Remove unused code
2. Consolidate imports
3. Update prop interfaces

## Expected Benefits

### Quantitative Improvements

- **File Size**: Reduce from 1400+ to ~400 lines (70% reduction)
- **Cyclomatic Complexity**: Reduce from ~45 to ~15
- **State Variables**: Reduce from 15+ to 4 consolidated states
- **Props**: Reduce prop drilling by consolidating related props

### Qualitative Improvements

- **Maintainability**: Each concern in separate, testable unit
- **Reusability**: Hooks can be reused in other components
- **Testability**: Each hook can be unit tested independently
- **Readability**: Main component becomes declarative
- **Type Safety**: Better TypeScript interfaces with focused concerns

## Risk Assessment

### Low Risk Changes

- Custom hook extraction (pure state management)
- Utility function extraction
- Component splitting

### Medium Risk Changes

- Event handler consolidation
- Prop interface changes

### Risk Mitigation

- Maintain exact same public API
- Comprehensive unit tests for each hook
- Integration tests to verify unchanged behavior
- Gradual rollout with feature flags

## Testing Strategy

### Unit Tests

- Each custom hook tested independently
- Validation utilities tested with edge cases
- UI components tested with React Testing Library

### Integration Tests

- Main MapView component behavior unchanged
- All user interactions work identically
- Performance regression testing

## Migration Path

### Backward Compatibility

- All existing props maintained
- Same component export name
- Identical behavior guarantee

### Developer Experience

- Better TypeScript autocomplete
- Clearer error messages
- Easier debugging with separated concerns

## Success Metrics

- [ ] File size reduced by >60%
- [ ] Cyclomatic complexity reduced by >50%
- [ ] No regression in functionality
- [ ] All existing tests pass
- [ ] Performance maintained or improved
- [ ] Code review approval from team

## Alternative Considered

### Component Composition Approach

Split into multiple specialized components (ToolbarView, LinkingView, etc.)
**Rejected**: Would require significant prop interface changes and higher migration risk

### Context API Approach

Use React Context for state sharing
**Rejected**: Adds unnecessary complexity for component-local state

### State Machine Approach

Use XState for complex state management
**Rejected**: Overkill for current requirements, adds learning curve

## Conclusion

This refactoring proposal significantly reduces complexity while maintaining all functionality. The approach follows SOLID principles, improves maintainability, and sets up the codebase for future feature development. The risk is minimal due to the incremental approach and comprehensive testing strategy.

The custom hooks approach is the most React-idiomatic solution that provides immediate benefits without requiring major architectural changes to the broader application.
