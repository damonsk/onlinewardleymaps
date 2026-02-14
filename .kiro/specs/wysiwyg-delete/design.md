# Design Document

## Overview

The Map Component Delete feature integrates with the existing map editor architecture to provide intuitive deletion capabilities for map components. The design leverages the existing undo/redo system, keyboard shortcut handler, and map component selection mechanisms to create a seamless deletion experience.

The feature will extend the current `KeyboardShortcutHandler` to support Delete/Backspace keys, integrate with the existing `UndoRedoProvider` for undoable operations, and work with the current map component selection system to identify which components to delete.

## Architecture

### Core Components

1. **Enhanced KeyboardShortcutHandler**: Extended to handle Delete/Backspace keys for selected map components
2. **MapComponentSelector**: New service to manage component selection state and identify deletable components
3. **MapComponentDeleter**: Core deletion logic that removes components from mapText and integrates with undo/redo
4. **ContextMenuProvider**: Enhanced context menu system for right-click deletion options
5. **SelectionVisualizer**: Visual feedback system for selected components

### Integration Points

- **UndoRedoProvider**: All deletion operations will be recorded as undoable actions with type `'canvas-delete'`
- **Existing Map Components**: PST boxes, regular components, and other map elements will support selection and deletion
- **MapText Mutation**: Leverages existing `mutateMapText` patterns and utilities like `pstMapTextMutation.ts`

## Components and Interfaces

### MapComponentSelector Service

```typescript
interface MapComponentSelector {
    selectedComponent: string | null;
    selectComponent(componentId: string): void;
    clearSelection(): void;
    isSelected(componentId: string): boolean;
    getSelectedComponent(): MapComponent | null;
}
```

### MapComponentDeleter Service

```typescript
interface MapComponentDeleter {
    deleteComponent(componentId: string, mapText: string): string;
}
```

### Enhanced KeyboardShortcutHandler

The existing `KeyboardShortcutHandler` will be extended to:

- Handle Delete and Backspace keys when components are selected
- Prevent deletion when text editing contexts are active
- Integrate with the selection system to identify target components

### ContextMenuProvider

```typescript
interface ContextMenuProvider {
    showContextMenu(position: {x: number; y: number}, componentId: string): void;
    hideContextMenu(): void;
    getMenuItems(componentId: string): ContextMenuItem[];
}

interface ContextMenuItem {
    id: string;
    label: string;
    action: () => void;
    disabled?: boolean;
    icon?: string;
}
```

## Data Models

### Selection State

```typescript
interface SelectionState {
    selectedComponent: string | null;
}
```

### Deletion Operation

```typescript
interface DeletionOperation {
    componentId: string;
    originalMapText: string;
    updatedMapText: string;
    timestamp: number;
    description: string;
}
```

### Component Metadata

```typescript
interface DeletableComponent {
    id: string;
    type: 'pst' | 'component' | 'market' | 'anchor' | 'note';
    line: number;
}
```

## Error Handling

### Validation Errors

- **Map Integrity**: Ensure deletion doesn't break map structure
- **Component Identification**: Handle cases where components cannot be found in mapText

### Runtime Errors

- **MapText Parsing**: Handle malformed map text gracefully
- **Undo/Redo Integration**: Ensure deletion operations are properly recorded
- **Selection State**: Handle edge cases with component selection

### User Feedback

- **Visual Indicators**: Show selected components with clear highlighting
- **Error Messages**: Clear feedback for failed deletion attempts
- **Smooth Transitions**: Visual feedback during deletion operations

## Testing Strategy

### Unit Tests

- **MapComponentDeleter**: Test deletion logic for different component types
- **MapComponentSelector**: Test selection state management
- **Keyboard Integration**: Test Delete/Backspace key handling
- **Context Menu**: Test menu generation and action handling

### Integration Tests

- **End-to-End Deletion**: Test complete deletion workflow from selection to mapText update
- **Undo/Redo Integration**: Verify deletion operations can be undone/redone correctly
- **Component Type Coverage**: Test deletion for PST boxes, components, markets, and other map elements

### Behavior Tests

- **User Workflows**: Test common deletion patterns (select → delete, right-click → delete)
- **Edge Cases**: Test deletion with no selection, invalid components
- **Accessibility**: Test keyboard navigation and screen reader compatibility
- **Touch Devices**: Test touch-based selection and deletion

## Implementation Approach

### Phase 1: Core Infrastructure

1. Implement `MapComponentSelector` service
2. Extend `KeyboardShortcutHandler` for Delete/Backspace keys
3. Create basic `MapComponentDeleter` with PST box support

### Phase 2: Visual Feedback

1. Implement selection visualization
2. Add hover states for deletable components
3. Create visual feedback for deletion operations

### Phase 3: Context Menu Integration

1. Implement `ContextMenuProvider`
2. Add right-click deletion options
3. Handle context menu positioning and lifecycle

### Phase 4: Component Type Support

1. Support for all map component types (components, markets, anchors, notes)
2. Proper mapText parsing and updating for each component type
3. Component relationship handling during deletion

### Phase 5: Testing and Polish

1. Comprehensive test coverage
2. Accessibility improvements
3. Performance optimization
4. Error handling refinement

## Technical Considerations

### Performance

- **Selection State**: Efficient single component selection tracking
- **MapText Updates**: Optimize single component deletion operations
- **Visual Updates**: Minimize re-rendering during selection and deletion

### Accessibility

- **Keyboard Navigation**: Support Tab/Arrow keys for component selection
- **Screen Readers**: Provide clear announcements for selection and deletion
- **Focus Management**: Maintain proper focus after deletion operations

### Browser Compatibility

- **Event Handling**: Use modern event APIs with fallbacks
- **Touch Support**: Handle both mouse and touch interactions
- **Keyboard Events**: Support different keyboard layouts and modifier keys

### Integration with Existing Systems

- **Undo/Redo**: Use existing `ActionType` enum with new `'canvas-delete'` type
- **Map Components**: Work with existing component rendering and interaction patterns
- **Styling**: Follow existing theme and styling conventions
