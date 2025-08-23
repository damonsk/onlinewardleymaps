# Design Document

## Overview

The inline editing improvements feature will enhance the existing double-click rename functionality for Components and extend it to Notes. The current implementation uses a basic HTML textarea with minimal styling, which provides poor UX. This design will create a polished, consistent inline editing experience across all editable map elements.

The design leverages the existing infrastructure including the `rename` function for map text mutation, the `ComponentTextSymbol` component for text rendering, and the feature switch system. The improvements will focus on creating a styled inline editor component that can be reused across different map element types.

## Architecture

### Component Hierarchy

```
MapView
├── UnifiedMapCanvas
│   ├── ComponentText (ENHANCED)
│   │   ├── InlineEditor (NEW)
│   │   └── ComponentTextSymbol (EXISTING)
│   └── Note (ENHANCED)
│       ├── InlineEditor (NEW)
│       └── ComponentTextSymbol (EXISTING)
```

### State Management

The inline editing system will use React state to manage:

- Edit mode state (editing/not editing)
- Current text value during editing
- Validation state and error messages
- Focus and selection state
- Multi-line content handling

### Integration Points

- **ComponentText**: Enhanced to use the new InlineEditor component
- **Note**: Enhanced to support double-click editing with InlineEditor
- **ComponentTextSymbol**: Modified to support double-click events for Notes
- **rename function**: Reused for map text mutation
- **FeatureSwitches**: Extended to control inline editing for Notes

## Components and Interfaces

### InlineEditor Component

**Location**: `frontend/src/components/map/InlineEditor.tsx`

**Props Interface**:

```typescript
interface InlineEditorProps {
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    isMultiLine?: boolean;
    placeholder?: string;
    x: number;
    y: number;
    width?: number;
    minWidth?: number;
    fontSize?: string;
    fontFamily?: string;
    mapStyleDefs: MapTheme;
    autoFocus?: boolean;
    selectAllOnFocus?: boolean;
    validation?: {
        required?: boolean;
        maxLength?: number;
        pattern?: RegExp;
        customValidator?: (value: string) => string | null;
    };
}
```

**Responsibilities**:

- Render a styled inline editor with proper theming
- Handle keyboard events (Enter to save, Escape to cancel, Ctrl+Enter for multi-line save)
- Provide visual feedback for validation errors
- Auto-resize for multi-line content
- Focus management and text selection
- Integration with map themes

### Enhanced ComponentText Component

**Modifications to**: `frontend/src/components/map/ComponentText.tsx`

**New Features**:

- Replace basic textarea with InlineEditor component
- Improved styling and visual feedback
- Better keyboard handling
- Enhanced validation

**Key Changes**:

```typescript
// Replace the renderEditMode function
const renderEditMode = () => (
  <foreignObject
    x={Number(cx) + getX() - 60}
    y={Number(cy) + getY() - 30}
    width="120"
    height="60"
    style={{overflow: 'visible'}}
  >
    <InlineEditor
      value={text}
      onChange={setText}
      onSave={handleSave}
      onCancel={handleCancel}
      x={0}
      y={0}
      fontSize={fontSize}
      mapStyleDefs={mapStyleDefs}
      autoFocus={true}
      selectAllOnFocus={true}
      validation={{
        required: true,
        maxLength: 100
      }}
    />
  </foreignObject>
);
```

### Enhanced Note Component

**Modifications to**: `frontend/src/components/map/Note.tsx`

**New Props**:

```typescript
interface EnhancedNoteProps extends ModernNoteProps {
    enableInlineEditing?: boolean;
}
```

**New State and Methods**:

```typescript
const [editMode, setEditMode] = useState(false);
const [editText, setEditText] = useState(note.text);

const handleDoubleClick = () => {
    if (enableInlineEditing) {
        setEditMode(true);
        setEditText(note.text);
    }
};

const handleSave = () => {
    if (editText.trim() !== note.text && editText.trim().length > 0) {
        // Use similar logic to rename function but for note content
        updateNoteText(note.line, note.text, editText.trim());
    }
    setEditMode(false);
};

const handleCancel = () => {
    setEditText(note.text);
    setEditMode(false);
};
```

**Enhanced Rendering**:

```typescript
const renderEditMode = () => (
  <foreignObject
    x={x() - 60}
    y={y() - 30}
    width="120"
    height="60"
    style={{overflow: 'visible'}}
  >
    <InlineEditor
      value={editText}
      onChange={setEditText}
      onSave={handleSave}
      onCancel={handleCancel}
      isMultiLine={true}
      x={0}
      y={0}
      mapStyleDefs={mapStyleDefs}
      autoFocus={true}
      selectAllOnFocus={true}
      validation={{
        required: true,
        maxLength: 500
      }}
    />
  </foreignObject>
);

return (
  <Movable
    id={`modern_note_${note.id}`}
    onMove={endDrag}
    x={x()}
    y={y()}
    fixedY={false}
    fixedX={false}
    scaleFactor={scaleFactor}
  >
    {editMode ? renderEditMode() : (
      <ComponentTextSymbol
        id={`modern_note_text_${note.id}`}
        note={note.text}
        textTheme={mapStyleDefs?.note}
        onClick={() => setHighlightLine(note.line)}
        onDoubleClick={handleDoubleClick}
      />
    )}
  </Movable>
);
```

### Enhanced ComponentTextSymbol Component

**Modifications to**: `frontend/src/components/symbols/ComponentTextSymbol.tsx`

**New Props**:

```typescript
interface EnhancedComponentTextSymbolProps extends ComponentTextSymbolProps {
    onDoubleClick?: (e: React.MouseEvent<SVGTextElement, MouseEvent>) => void;
}
```

**Enhanced Double-Click Handling**:

```typescript
const handleDblClick = (e: React.MouseEvent<SVGTextElement, MouseEvent>): void => {
    e.stopPropagation();

    // Call external double-click handler if provided (for Notes)
    if (onDoubleClick) {
        onDoubleClick(e);
    }

    // Call existing setShowTextField for Components
    if (setShowTextField) {
        setShowTextField(true);
    }
};
```

### Note Text Mutation Function

**Location**: `frontend/src/constants/noteRename.ts`

**Function Interface**:

```typescript
export const renameNote = (
    currentLine: number,
    originalText: string,
    newText: string,
    mapText: string,
    mutateMapMethod: (updatedText: string) => void,
): void => {
    if (newText !== originalText && newText.length > 0) {
        const lines: string[] = mapText.split('\n');
        const elementAtLine: string = lines[currentLine - 1];

        // Replace the note text while preserving the note syntax and coordinates
        const notePattern = /^(\s*note\s+)(.+?)(\s+\[[^\]]+\])?(\s*$)/;
        const match = elementAtLine.match(notePattern);

        if (match) {
            const [, prefix, , coordinates = '', suffix] = match;
            lines[currentLine - 1] = `${prefix}${newText}${coordinates}${suffix}`;
            mutateMapMethod(lines.join('\n'));
        }
    }
};
```

## Data Models

### InlineEditorState Interface

```typescript
interface InlineEditorState {
    isEditing: boolean;
    currentValue: string;
    originalValue: string;
    validationError: string | null;
    isDirty: boolean;
}
```

### ValidationConfig Interface

```typescript
interface ValidationConfig {
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => string | null;
}
```

### EditingContext Interface

```typescript
interface EditingContext {
    elementType: 'component' | 'note';
    elementId: string;
    line: number;
    originalText: string;
    coordinates?: {
        x: number;
        y: number;
    };
}
```

## Error Handling

### Validation Errors

- **Empty Content**: Prevent saving empty text with visual feedback
- **Length Limits**: Enforce maximum character limits with real-time feedback
- **Invalid Characters**: Sanitize or reject problematic characters
- **Pattern Matching**: Validate against custom patterns if needed

### Map Text Mutation Errors

- **Line Not Found**: Handle cases where the target line has been modified
- **Syntax Errors**: Validate that mutations don't break map syntax
- **Concurrent Edits**: Handle conflicts when multiple edits occur simultaneously
- **Undo Support**: Maintain ability to revert changes if mutation fails

### Focus and State Management Errors

- **Lost Focus**: Handle cases where editor loses focus unexpectedly
- **State Synchronization**: Ensure UI state matches actual map data
- **Memory Leaks**: Proper cleanup of event listeners and timers

## Testing Strategy

### Unit Tests

**Location**: `frontend/src/__tests__/components/map/`

**Test Files**:

- `InlineEditor.test.tsx`
- `EnhancedComponentText.test.tsx`
- `EnhancedNote.test.tsx`

**Test Coverage**:

- InlineEditor component rendering and styling
- Keyboard event handling (Enter, Escape, Ctrl+Enter)
- Validation logic and error display
- Auto-focus and text selection behavior
- Multi-line content handling
- Theme integration and responsive sizing

### Integration Tests

**Location**: `frontend/src/__tests__/integration/`

**Test Files**:

- `InlineEditingWorkflow.test.tsx`
- `ComponentNoteEditingIntegration.test.tsx`

**Test Coverage**:

- Complete double-click to save workflow for Components
- Complete double-click to save workflow for Notes
- Map text mutation accuracy
- Interaction with existing map functionality
- Validation and error handling scenarios
- Multi-line note editing
- Keyboard shortcuts and accessibility

### Visual Regression Tests

- InlineEditor appearance across all map themes
- Proper positioning relative to map elements
- Responsive behavior at different zoom levels
- Error state visual feedback
- Focus indicators and selection highlighting

## Implementation Notes

### Styling Approach

- Use styled-components for consistent theming
- Support all existing map themes (wardley, colour, plain, handwritten, dark)
- Implement smooth transitions for edit mode entry/exit
- Ensure proper contrast and accessibility compliance
- Responsive sizing based on content and zoom level

### Performance Considerations

- Minimize re-renders during text input using debouncing
- Efficient validation that doesn't block typing
- Lazy loading of validation logic
- Proper cleanup of event listeners and timers
- Memory-efficient state management

### Accessibility Features

- Proper ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management and visual indicators
- Support for assistive technologies

### Browser Compatibility

- Support for modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- Touch device support for mobile editing
- Proper handling of different input methods
- Cross-platform keyboard shortcut support

### Feature Switch Integration

- Extend existing `enableDoubleClickRename` for Components
- Add new `enableNoteInlineEditing` feature switch
- Backward compatibility with existing functionality
- Gradual rollout capability
- Easy disable/enable for troubleshooting

### Multi-line Content Handling

- Auto-resize editor based on content
- Proper line break handling in map text
- Scroll support for very long content
- Word wrap and text overflow management
- Consistent formatting preservation

### Theme Integration

- Dynamic styling based on current map theme
- Proper color inheritance from theme definitions
- Font size and family consistency
- Border and background styling that complements map design
- Hover and focus states that match theme aesthetics
