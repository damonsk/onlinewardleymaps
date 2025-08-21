# Design Document

## Overview

The undo/redo functionality will provide comprehensive change tracking for all map modifications in OnlineWardleyMaps. The system will intercept all changes that pass through the `mutateMapText` function, which serves as the central point for all map text modifications. This includes changes from toolbar interactions, canvas operations (component movement, renaming), and text editor changes.

The design leverages a command pattern approach with a history stack to track map state changes. Undo and redo icons will be added to the existing WYSIWYG toolbar, providing visual feedback about available operations and integrating seamlessly with the current toolbar infrastructure.

## Architecture

### Component Hierarchy
```
WysiwygToolbar (MODIFIED)
├── UndoRedoManager (NEW) - Core undo/redo logic
├── ToolbarItem (EXISTING) - For undo/redo icons
└── KeyboardShortcutHandler (MODIFIED) - Add Ctrl+Z/Ctrl+Y support

MapEnvironment (MODIFIED)
├── Enhanced mutateMapText wrapper (MODIFIED)
└── UndoRedoProvider (NEW) - Context provider for undo/redo state
```

### State Management Architecture
The undo/redo system will use React Context to provide global access to undo/redo functionality:

```typescript
interface UndoRedoState {
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  canUndo: boolean;
  canRedo: boolean;
  isUndoRedoOperation: boolean; // Prevents recursive history recording
}

interface HistoryEntry {
  id: string;
  timestamp: number;
  previousMapText: string;
  currentMapText: string;
  actionType: 'toolbar' | 'canvas' | 'editor' | 'unknown';
  actionDescription: string;
  groupId?: string; // For grouping related operations
}
```

### Integration Points
- **mutateMapText**: Enhanced to record history entries before applying changes
- **WysiwygToolbar**: Extended with undo/redo icons and keyboard shortcuts
- **MapEnvironment**: Provides undo/redo context to all child components
- **UnifiedMapCanvas**: Canvas operations will be tracked through mutateMapText calls

## Components and Interfaces

### UndoRedoProvider Component
**Location**: `frontend/src/components/UndoRedoProvider.tsx`

**Props Interface**:
```typescript
interface UndoRedoProviderProps {
  children: React.ReactNode;
  mutateMapText: (newText: string) => void;
  mapText: string;
  maxHistorySize?: number; // Default: 50
  debounceMs?: number; // Default: 300ms for grouping rapid changes
}
```

**Context Interface**:
```typescript
interface UndoRedoContextValue {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  recordChange: (newText: string, actionType: ActionType, description: string, groupId?: string) => void;
  clearHistory: () => void;
  getLastAction: () => HistoryEntry | null;
  getNextAction: () => HistoryEntry | null;
}
```

**Responsibilities**:
- Maintain undo and redo stacks with configurable size limits
- Provide debounced change recording to group rapid successive changes
- Handle undo/redo operations and state updates
- Prevent recursive history recording during undo/redo operations
- Manage history cleanup and memory optimization

### UndoRedoManager Hook
**Location**: `frontend/src/hooks/useUndoRedoManager.ts`

**Interface**:
```typescript
interface UseUndoRedoManagerProps {
  mutateMapText: (newText: string) => void;
  mapText: string;
  maxHistorySize: number;
  debounceMs: number;
}

interface UseUndoRedoManagerResult {
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  recordChange: (newText: string, actionType: ActionType, description: string, groupId?: string) => void;
  clearHistory: () => void;
  getLastAction: () => HistoryEntry | null;
  getNextAction: () => HistoryEntry | null;
}
```

**Responsibilities**:
- Core undo/redo logic implementation
- History stack management with size limits
- Debounced change recording with grouping logic
- State derivation (canUndo, canRedo)
- Memory-efficient history entry management

### Enhanced WysiwygToolbar Component
**Modifications to**: `frontend/src/components/map/WysiwygToolbar.tsx`

**New Props**:
```typescript
interface EnhancedWysiwygToolbarProps extends WysiwygToolbarProps {
  // Existing props remain the same
  undoRedoEnabled?: boolean; // Default: true
}
```

**New Responsibilities**:
- Render undo and redo toolbar items with appropriate visual states
- Handle undo/redo button clicks and delegate to context
- Display tooltips showing the last/next action descriptions
- Integrate undo/redo items into existing toolbar layout and styling

### Enhanced KeyboardShortcutHandler Component
**Modifications to**: `frontend/src/components/map/KeyboardShortcutHandler.tsx`

**New Props**:
```typescript
interface EnhancedKeyboardShortcutHandlerProps extends KeyboardShortcutHandlerProps {
  undoRedoEnabled?: boolean; // Default: true
}
```

**New Keyboard Shortcuts**:
- `Ctrl+Z` (Windows/Linux) / `Cmd+Z` (Mac): Undo
- `Ctrl+Y` (Windows/Linux) / `Cmd+Shift+Z` (Mac): Redo
- `Escape`: Clear current selection (existing functionality)

**New Responsibilities**:
- Listen for undo/redo keyboard shortcuts
- Prevent interference with text editor undo/redo when text editing is active
- Handle platform-specific key combinations (Ctrl vs Cmd)
- Provide accessibility announcements for keyboard shortcut usage

### Enhanced MapEnvironment Component
**Modifications to**: `frontend/src/components/MapEnvironment.tsx`

**Enhanced mutateMapText Function**:
```typescript
const mutateMapText = (newText: string, actionType?: ActionType, description?: string, groupId?: string) => {
    // Record change in undo/redo history before applying
    if (undoRedoContext && !undoRedoContext.isUndoRedoOperation) {
        undoRedoContext.recordChange(
            newText, 
            actionType || 'unknown', 
            description || 'Map text changed',
            groupId
        );
    }
    
    // Apply the change (existing logic)
    legacyState.mutateMapText(newText);
    setSaveOutstanding(true);
    
    // Handle iterations (existing logic)
    if (currentIteration !== null && currentIteration > -1) {
        const newList = [...mapIterations];
        const item = newList[currentIteration];
        item.mapText = newText;
        newList.splice(currentIteration, 1);
        newList.splice(currentIteration, 0, item);
        setMapIterations(newList);
    }
};
```

**New Responsibilities**:
- Wrap the application with UndoRedoProvider
- Pass enhanced mutateMapText to all child components
- Handle undo/redo operations that affect save state and iterations
- Manage interaction between undo/redo and map iterations

## Data Models

### HistoryEntry Interface
```typescript
interface HistoryEntry {
  id: string; // Unique identifier for the entry
  timestamp: number; // When the change was made
  previousMapText: string; // Map text before the change
  currentMapText: string; // Map text after the change
  actionType: ActionType; // Type of action that caused the change
  actionDescription: string; // Human-readable description
  groupId?: string; // Optional grouping identifier for related changes
}

type ActionType = 
  | 'toolbar-component' // Component placed via toolbar
  | 'toolbar-link' // Link created via toolbar
  | 'toolbar-pst' // PST box drawn via toolbar
  | 'toolbar-method' // Method applied via toolbar
  | 'canvas-move' // Component moved on canvas
  | 'canvas-rename' // Component renamed via double-click
  | 'canvas-delete' // Component deleted via canvas
  | 'editor-text' // Direct text editing
  | 'unknown'; // Fallback for unclassified changes
```

### Toolbar Item Configuration
```typescript
// New toolbar items for undo/redo
const UNDO_REDO_ITEMS: ToolbarItemType[] = [
  {
    id: 'undo',
    label: 'Undo',
    icon: UndoIcon,
    category: 'action',
    toolType: 'action',
    keyboardShortcut: 'ctrl+z', // Platform-specific handling in component
    action: 'undo'
  },
  {
    id: 'redo',
    label: 'Redo', 
    icon: RedoIcon,
    category: 'action',
    toolType: 'action',
    keyboardShortcut: 'ctrl+y', // Platform-specific handling in component
    action: 'redo'
  }
];
```

### Configuration Constants
```typescript
const UNDO_REDO_CONFIG = {
  MAX_HISTORY_SIZE: 50, // Maximum number of undo entries
  DEBOUNCE_MS: 300, // Milliseconds to wait before recording a new entry
  GROUP_TIMEOUT_MS: 1000, // Milliseconds to group related actions
  STORAGE_KEY: 'wardley-map-undo-redo-settings', // For user preferences
} as const;

// Action descriptions for user feedback
const ACTION_DESCRIPTIONS: Record<ActionType, (details?: string) => string> = {
  'toolbar-component': (name) => `Add component${name ? ` "${name}"` : ''}`,
  'toolbar-link': (link) => `Create link${link ? ` ${link}` : ''}`,
  'toolbar-pst': (type) => `Draw ${type || 'PST'} box`,
  'toolbar-method': (method) => `Apply ${method || 'method'} decorator`,
  'canvas-move': (name) => `Move ${name || 'component'}`,
  'canvas-rename': (name) => `Rename to "${name || 'component'}"`,
  'canvas-delete': (name) => `Delete ${name || 'component'}`,
  'editor-text': () => 'Edit map text',
  'unknown': () => 'Change map'
};
```

## Error Handling

### History Stack Overflow
- Automatically remove oldest entries when max history size is reached
- Provide warning logs when approaching memory limits
- Graceful degradation if memory constraints are encountered

### Invalid Map Text States
- Validate map text before recording history entries
- Handle cases where undo/redo results in invalid map syntax
- Provide fallback recovery to last known good state
- Log errors without breaking user experience

### Concurrent Modification Detection
- Detect when map text changes outside of tracked operations
- Handle race conditions between undo/redo and other operations
- Provide user feedback when conflicts are detected
- Maintain history consistency despite external changes

### Storage and Memory Management
- Implement efficient memory usage for large history stacks
- Handle localStorage quota exceeded errors gracefully
- Provide cleanup mechanisms for old or corrupted history data
- Monitor and log memory usage patterns for optimization

### Platform-Specific Keyboard Handling
- Detect platform (Windows/Mac/Linux) for correct key combinations
- Handle browser-specific keyboard event differences
- Prevent conflicts with browser default undo/redo shortcuts
- Provide fallback behavior when keyboard shortcuts are disabled

## Testing Strategy

### Unit Tests
**Location**: `frontend/src/__tests__/components/undo-redo/`

**Test Files**:
- `UndoRedoProvider.test.tsx`
- `useUndoRedoManager.test.ts`
- `UndoRedoToolbarIntegration.test.tsx`
- `KeyboardShortcutUndo.test.tsx`

**Test Coverage**:
- History stack management and size limits
- Debounced change recording and grouping logic
- Undo/redo operations and state transitions
- Keyboard shortcut handling and platform detection
- Error handling for invalid states and memory limits
- Context provider functionality and state propagation

### Integration Tests
**Location**: `frontend/src/__tests__/integration/`

**Test Files**:
- `UndoRedoWorkflow.test.tsx`
- `ToolbarUndoRedoIntegration.test.tsx`
- `CanvasUndoRedoIntegration.test.tsx`
- `EditorUndoRedoIntegration.test.tsx`

**Test Coverage**:
- End-to-end undo/redo workflows for all action types
- Integration with existing toolbar functionality
- Canvas operation tracking and undo/redo
- Text editor integration and conflict prevention
- Multi-step operation grouping and ungrouping
- Memory management under heavy usage scenarios

### Performance Tests
- History stack performance with maximum entries
- Memory usage patterns during extended editing sessions
- Debouncing effectiveness under rapid change scenarios
- Keyboard shortcut response time and accuracy

### Accessibility Tests
- Screen reader compatibility for undo/redo announcements
- Keyboard navigation and shortcut accessibility
- High contrast mode support for undo/redo icons
- Focus management during undo/redo operations

## Implementation Notes

### Memory Optimization
- Use efficient data structures for history storage
- Implement lazy loading for large map text entries
- Consider compression for older history entries
- Monitor memory usage and provide cleanup mechanisms

### Performance Considerations
- Debounce rapid changes to prevent excessive history entries
- Use React.memo and useCallback for component optimization
- Implement efficient diff algorithms for change detection
- Minimize re-renders during undo/redo operations

### User Experience Design
- Provide clear visual feedback for available undo/redo operations
- Show meaningful action descriptions in tooltips
- Maintain consistent behavior across different interaction methods
- Handle edge cases gracefully without disrupting workflow

### Browser Compatibility
- Support for modern browsers with proper keyboard event handling
- Graceful degradation for browsers with limited localStorage
- Platform-specific keyboard shortcut detection
- Proper handling of browser default undo/redo prevention

### Accessibility Features
- Screen reader announcements for undo/redo operations
- Keyboard shortcut documentation and help text
- High contrast mode support for all visual elements
- Focus management and navigation support
- ARIA labels and descriptions for toolbar items

### Integration Considerations
- Seamless integration with existing toolbar styling and behavior
- Compatibility with all map themes and visual styles
- Proper interaction with map iterations and save functionality
- Non-interference with existing keyboard shortcuts and text editing