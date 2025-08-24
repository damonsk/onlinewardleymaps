# Map Interaction Services - SOLID Refactoring

This document outlines the refactored architecture for map interaction services, following SOLID principles to improve maintainability, testability, and extensibility.

## Architecture Overview

The refactored system separates concerns into distinct, focused services:

### 🎯 Selection Services (`/services/selection/`)
- **ISelectionService**: Interface defining core selection operations
- **SelectionService**: Concrete implementation with observer pattern
- **SelectableElementFactory**: Factory for creating selection elements
- **SelectionTypes**: Type definitions and type guards

### 🗑️ Deletion Services (`/services/deletion/`)
- **IDeletionService**: Interface for deletion operations
- **DeletionService**: Unified deletion coordinator using Strategy pattern
- **LinkDeletionStrategy**: Specific strategy for link deletion
- **ComponentDeletionStrategy**: (TODO) Strategy for component deletion

### ⌨️ Keyboard Services (`/services/keyboard/`)
- **KeyboardEventCoordinator**: Handles keyboard event delegation
- **IKeyboardActionHandlers**: Interface for keyboard action handlers

### 🔗 Integration Hooks (`/hooks/`)
- **useSelectionService**: React adapter for selection services
- **useMapInteractionService**: High-level coordinator hook

## SOLID Principles Applied

### 1. Single Responsibility Principle (SRP)
- Each service has one reason to change:
  - `SelectionService`: Only manages selection state
  - `LinkDeletionStrategy`: Only handles link text manipulation
  - `KeyboardEventCoordinator`: Only handles keyboard event routing

### 2. Open/Closed Principle (OCP)
- Easy to extend without modifying existing code:
  - Add new deletion strategies by implementing `IDeletionService`
  - Add new selection types by extending `SelectableElement`
  - Add new keyboard actions by extending `IKeyboardActionHandlers`

### 3. Liskov Substitution Principle (LSP)
- Interfaces can be substituted with any conforming implementation:
  - Any `IDeletionService` implementation works with `DeletionService`
  - Any `ISelectionService` implementation works with React hooks

### 4. Interface Segregation Principle (ISP)
- Clients depend only on interfaces they use:
  - `ISelectionService` separate from `IObservable`
  - `IDeletionService` separate from `IDeletionObserver`
  - `IKeyboardActionHandlers` contains only needed methods

### 5. Dependency Inversion Principle (DIP)
- High-level modules depend on abstractions:
  - `useMapInteractionService` depends on `IDeletionService` interface
  - `DeletionService` uses dependency injection for strategies

## Migration Strategy

### Phase 1: Parallel Implementation (Current)
- New SOLID services implemented alongside existing code
- `useSelectionManager.refactored.ts` provides migration adapter
- Existing APIs maintained for backward compatibility

### Phase 2: Gradual Migration
```typescript
// Replace existing hook usage
// OLD:
const selectionManager = useSelectionManager({componentOps});

// NEW:
const mapInteraction = useMapInteractionService({
    mapText: props.mapText,
    mutateMapText: props.mutateMapText,
});
```

### Phase 3: Complete Replacement
- Remove old `SelectionManager` class
- Remove old `LinkDeleter` class
- Remove old `KeyboardShortcutHandler` duplication
- Update all consumers to use new services

## Benefits of Refactoring

### 🧪 **Improved Testability**
- Services can be unit tested in isolation
- Easy to mock dependencies
- Clear interfaces enable effective testing

### 🔧 **Better Maintainability**
- Each service has a single responsibility
- Changes are localized to specific services
- Clear separation of concerns

### 📈 **Enhanced Extensibility**
- New deletion types: Just add a new strategy
- New selection types: Extend the type system
- New keyboard shortcuts: Add to the coordinator

### 🐛 **Reduced Bugs**
- No more shared mutable state issues
- Clear ownership of responsibilities
- Type safety with strong interfaces

## Example Usage

### Basic Selection and Deletion
```typescript
const mapInteraction = useMapInteractionService({
    mapText,
    mutateMapText,
});

// Select a link
mapInteraction.selectLink({
    start: 'Component A',
    end: 'Component B',
    line: 5,
});

// Delete selected element
await mapInteraction.deleteElement();
```

### Custom Deletion Observer
```typescript
const deletionObserver: IDeletionObserver = {
    onDeletionStarted: (element) => showSpinner(),
    onDeletionCompleted: (element, result) => {
        hideSpinner();
        showSuccess(result.description);
    },
    onDeletionFailed: (element, error) => {
        hideSpinner();
        showError(error);
    },
};

deletionService.addObserver(deletionObserver);
```

### Custom Keyboard Actions
```typescript
const keyboardHandlers: IKeyboardActionHandlers = {
    onDelete: () => mapInteraction.deleteElement(),
    onEscape: () => mapInteraction.clearSelection(),
    onUndo: () => undoRedoService.undo(),
    onRedo: () => undoRedoService.redo(),
};
```

## Files to Review

### New Files (SOLID Architecture)
- `/services/selection/` - Selection management
- `/services/deletion/` - Deletion operations
- `/services/keyboard/` - Keyboard handling
- `/hooks/useMapInteractionService.ts` - Main integration hook
- `/hooks/useSelectionService.ts` - Selection React adapter

### Migration Files
- `/components/map/hooks/useSelectionManager.refactored.ts` - Backward compatibility adapter

### Files to Eventually Replace
- `/services/SelectionManager.ts` - Old selection management
- `/services/LinkDeleter.ts` - Old link deletion
- `/components/map/KeyboardShortcutHandler.tsx` - Keyboard handling parts
- `/components/map/hooks/useSelectionManager.ts` - Old React integration

## Next Steps

1. **Test the refactored architecture** with existing functionality
2. **Gradually migrate components** to use new services
3. **Add comprehensive unit tests** for each service
4. **Implement component deletion strategy**
5. **Remove old code** once migration is complete

The refactored architecture provides a solid foundation for future enhancements while maintaining backward compatibility during the transition period.