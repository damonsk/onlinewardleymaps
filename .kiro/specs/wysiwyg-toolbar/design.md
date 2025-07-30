# Design Document

## Overview

The WYSIWYG toolbar feature will introduce a MIRO-style vertical toolbar positioned on the left side of the map canvas. This toolbar will provide visual icons for all available map components, allowing users to drag and drop elements directly onto the map. The feature provides a visual interface for component placement.

The design leverages the existing map infrastructure including the UnifiedMapCanvas, position calculation utilities, and map text mutation functions. The toolbar will integrate seamlessly with the current map rendering and editing capabilities.

## Architecture

### Component Hierarchy
```
MapView
├── WysiwygToolbar (NEW)
│   ├── ToolbarItem (NEW)
│   ├── ToolbarDropdown (NEW) - For PST selection
│   ├── DragPreview (NEW)
│   ├── LinkingPreview (NEW) - For component linking
│   └── DrawingPreview (NEW) - For PST box drawing
├── UnifiedMapCanvas (MODIFIED)
└── Component Templates (EXISTING)
```

### State Management
The toolbar will use React state to manage:
- Selected toolbar item and tool type
- Drag state (dragging/not dragging)
- Mouse position for preview
- Drop validation state
- Linking state (idle/selecting-source/selecting-target)
- Selected source component for linking
- Drawing state for PST boxes (start position, current position)
- Selected PST type from dropdown
- Component highlighting for magnetic effects
- Keyboard shortcut listeners and focus management

### Integration Points
- **UnifiedMapCanvas**: Enhanced to handle drop events and coordinate conversion
- **MapView**: Container for the new toolbar component
- **Component Templates**: Template generation logic will be reused
- **Position Calculator**: Used for coordinate conversion from screen to map coordinates

## Components and Interfaces

### WysiwygToolbar Component
**Location**: `frontend/src/components/map/WysiwygToolbar.tsx`

**Props Interface**:
```typescript
interface WysiwygToolbarProps {
  mapStyleDefs: MapTheme;
  mapDimensions: MapDimensions;
  mapText: string;
  mutateMapText: (newText: string) => void;
  onItemSelect: (item: ToolbarItem | null) => void;
  selectedItem: ToolbarItem | null;
  keyboardShortcutsEnabled?: boolean;
}
```

**Responsibilities**:
- Render vertical toolbar with all map component icons
- Handle item selection and deselection
- Manage visual states (selected, hover)
- Provide consistent MIRO-style styling
- Listen for keyboard shortcuts and trigger appropriate tool selection
- Manage focus states for keyboard navigation

### ToolbarItem Component
**Location**: `frontend/src/components/map/ToolbarItem.tsx`

**Props Interface**:
```typescript
interface ToolbarItemProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  template: (name: string, y: string, x: string) => string;
  isSelected: boolean;
  onClick: () => void;
  mapStyleDefs: MapTheme;
}
```

**Responsibilities**:
- Render individual toolbar items with icons
- Handle click events for selection
- Apply visual states (selected, hover, disabled)

### DragPreview Component
**Location**: `frontend/src/components/map/DragPreview.tsx`

**Props Interface**:
```typescript
interface DragPreviewProps {
  selectedItem: ToolbarItem | null;
  mousePosition: { x: number; y: number };
  isValidDropZone: boolean;
  mapStyleDefs: MapTheme;
}
```

**Responsibilities**:
- Render ghost preview of selected component at mouse position
- Show visual feedback for valid/invalid drop zones
- Follow mouse cursor during drag operation

### ToolbarDropdown Component
**Location**: `frontend/src/components/map/ToolbarDropdown.tsx`

**Props Interface**:
```typescript
interface ToolbarDropdownProps {
  items: ToolbarSubItem[];
  isOpen: boolean;
  onSelect: (item: ToolbarSubItem) => void;
  onClose: () => void;
  position: { x: number; y: number };
}
```

**Responsibilities**:
- Render dropdown menu for PST selection
- Handle item selection and menu closing
- Position dropdown relative to toolbar item

### LinkingPreview Component
**Location**: `frontend/src/components/map/LinkingPreview.tsx`

**Props Interface**:
```typescript
interface LinkingPreviewProps {
  linkingState: 'idle' | 'selecting-source' | 'selecting-target';
  sourceComponent: MapComponent | null;
  mousePosition: { x: number; y: number };
  highlightedComponent: MapComponent | null;
  mapStyleDefs: MapTheme;
}
```

**Responsibilities**:
- Show preview line from source component to mouse cursor
- Highlight components with magnetic effect
- Provide visual feedback during linking process

### DrawingPreview Component
**Location**: `frontend/src/components/map/DrawingPreview.tsx`

**Props Interface**:
```typescript
interface DrawingPreviewProps {
  isDrawing: boolean;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number };
  selectedPSTType: ToolbarSubItem | null;
  mapStyleDefs: MapTheme;
}
```

**Responsibilities**:
- Show preview rectangle during PST box drawing
- Apply appropriate color based on selected PST type
- Handle drawing state visualization

### KeyboardShortcutHandler Component
**Location**: `frontend/src/components/map/KeyboardShortcutHandler.tsx`

**Props Interface**:
```typescript
interface KeyboardShortcutHandlerProps {
  toolbarItems: ToolbarItem[];
  onToolSelect: (toolId: string | null) => void;
  isEnabled: boolean;
  currentSelectedTool: string | null;
}
```

**Responsibilities**:
- Listen for keyboard events and map them to toolbar items
- Handle escape key for deselecting tools
- Prevent interference with text editing contexts
- Provide visual feedback for keyboard shortcuts

### Enhanced UnifiedMapCanvas
**Modifications to**: `frontend/src/components/map/UnifiedMapCanvas.tsx`

**New Props**:
```typescript
interface EnhancedUnifiedMapCanvasProps extends ModernUnifiedMapCanvasProps {
  selectedToolbarItem: ToolbarItem | null;
  toolState: ToolState;
  onToolbarItemDrop: (item: ToolbarItem, position: { x: number; y: number }) => void;
  onComponentClick: (component: MapComponent) => void;
  onLinkingComplete: (source: MapComponent, target: MapComponent) => void;
  onDrawingComplete: (startPos: { x: number; y: number }, endPos: { x: number; y: number }, pstType: ToolbarSubItem) => void;
  onMethodApplication: (component: MapComponent, method: string) => void;
}

interface ToolState {
  type: 'placement' | 'linking' | 'drawing' | 'method-application';
  linkingState?: 'selecting-source' | 'selecting-target';
  sourceComponent?: MapComponent;
  drawingStart?: { x: number; y: number };
  selectedPSTType?: ToolbarSubItem;
  selectedMethod?: string;
}
```

**New Responsibilities**:
- Handle mouse move events for all tool types
- Detect component proximity for magnetic linking and method application
- Manage drawing state for PST boxes
- Convert screen coordinates to map coordinates
- Trigger appropriate actions based on tool type
- Highlight components during method application mode
- Handle component clicks for method application

## Data Models

### ToolbarItem Interface
```typescript
interface ToolbarItem {
  id: string;
  label: string;
  icon: React.ComponentType<IconProps>;
  template?: (name: string, y: string, x: string) => string;
  category: 'component' | 'method' | 'note' | 'pipeline' | 'link' | 'pst' | 'other';
  defaultName?: string;
  toolType: 'placement' | 'linking' | 'drawing' | 'method-application';
  keyboardShortcut?: string; // Single character keyboard shortcut
  subItems?: ToolbarSubItem[]; // For PST dropdown
  methodName?: string; // For method application tools (build, buy, outsource)
}

interface ToolbarSubItem {
  id: string;
  label: string;
  color: string;
  template: (x1: string, y1: string, x2: string, y2: string) => string;
}
```

### Toolbar Configuration
```typescript
const TOOLBAR_ITEMS: ToolbarItem[] = [
  // ... existing component items ...
  {
    id: 'component',
    label: 'Component',
    icon: ComponentIcon,
    template: (name, y, x) => `component ${name} [${y}, ${x}]`,
    category: 'component',
    defaultName: 'New Component',
    toolType: 'placement',
    keyboardShortcut: 'c'
  },
  {
    id: 'note',
    label: 'Note',
    icon: NoteIcon,
    template: (name, y, x) => `note ${name} [${y}, ${x}]`,
    category: 'note',
    defaultName: 'New Note',
    toolType: 'placement',
    keyboardShortcut: 'n'
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: PipelineIcon,
    template: (name, y, x) => `pipeline ${name} [${y}, ${x}]`,
    category: 'pipeline',
    defaultName: 'New Pipeline',
    toolType: 'placement',
    keyboardShortcut: 'p'
  },
  {
    id: 'anchor',
    label: 'Anchor',
    icon: AnchorIcon,
    template: (name, y, x) => `anchor ${name} [${y}, ${x}]`,
    category: 'other',
    defaultName: 'New Anchor',
    toolType: 'placement',
    keyboardShortcut: 'a'
  },
  // ... other existing items with toolType: 'placement' ...
  
  // New linking tool
  {
    id: 'link',
    label: 'Link Components',
    icon: LinkIcon, // Two circles connected by a line
    category: 'link',
    toolType: 'linking',
    keyboardShortcut: 'l'
  },
  
  // Method application tools
  {
    id: 'method-build',
    label: 'Build Method',
    icon: BuildIcon,
    category: 'method',
    toolType: 'method-application',
    methodName: 'build',
    keyboardShortcut: 'b'
  },
  {
    id: 'method-buy',
    label: 'Buy Method',
    icon: BuyIcon,
    category: 'method',
    toolType: 'method-application',
    methodName: 'buy',
    keyboardShortcut: 'u'
  },
  {
    id: 'method-outsource',
    label: 'Outsource Method',
    icon: OutsourceIcon,
    category: 'method',
    toolType: 'method-application',
    methodName: 'outsource',
    keyboardShortcut: 'o'
  },
  
  // New PST tool with dropdown
  {
    id: 'pst',
    label: 'PST Boxes',
    icon: PSTIcon, // Generic box icon
    category: 'pst',
    toolType: 'drawing',
    keyboardShortcut: 't',
    subItems: [
      {
        id: 'pioneers',
        label: 'Pioneers',
        color: '#FF6B6B', // Red
        template: (x1, y1, x2, y2) => `pioneers [${y1}, ${x1}] [${y2}, ${x2}]`
      },
      {
        id: 'settlers',
        label: 'Settlers',
        color: '#4ECDC4', // Teal
        template: (x1, y1, x2, y2) => `settlers [${y1}, ${x1}] [${y2}, ${x2}]`
      },
      {
        id: 'townplanners',
        label: 'Town Planners',
        color: '#45B7D1', // Blue
        template: (x1, y1, x2, y2) => `townplanners [${y1}, ${x1}] [${y2}, ${x2}]`
      }
    ]
  }
];

// Keyboard shortcut mapping for quick lookup
const KEYBOARD_SHORTCUTS: Record<string, string> = {
  'c': 'component',
  'l': 'link',
  'n': 'note',
  'p': 'pipeline',
  'a': 'anchor',
  'b': 'method-build',
  'u': 'method-buy',
  'o': 'method-outsource',
  't': 'pst'
};
```

## Error Handling

### Invalid Drop Zones
- Detect when user attempts to drop outside the valid map area
- Show visual feedback (red highlight, crossed-out cursor)
- Prevent component creation in invalid areas

### Coordinate Conversion Errors
- Handle edge cases where screen coordinates cannot be converted to map coordinates
- Provide fallback positioning near the center of the map
- Log errors for debugging without breaking user experience

### Map Text Mutation Failures
- Catch and handle errors during map text updates
- Provide user feedback if component creation fails
- Maintain map state consistency

### Template Generation Errors
- Validate template parameters before generating map text
- Handle missing or invalid component names
- Provide sensible defaults for all template parameters

### Component Linking Errors
- Detect and prevent duplicate link creation
- Handle cases where components are not found during linking
- Validate component compatibility for linking
- Provide user feedback for invalid linking attempts

### PST Box Drawing Errors
- Validate drawing area boundaries
- Handle minimum size requirements for PST boxes
- Prevent overlapping PST boxes of the same type
- Ensure proper coordinate ordering (top-left to bottom-right)

### Keyboard Shortcut Conflicts
- Detect and prevent conflicts with existing application shortcuts
- Handle cases where text input fields are focused
- Provide fallback behavior when shortcuts are disabled
- Ensure shortcuts don't interfere with browser default behaviors

### Method Application Errors
- Handle cases where components are not found or invalid for method application
- Validate component types that can receive method decorators
- Prevent method application to incompatible component types (notes, anchors, etc.)
- Provide user feedback when method application fails
- Handle map text parsing errors when updating component methods
- Ensure proper regex matching for existing method replacement

## Testing Strategy

### Unit Tests
**Location**: `frontend/src/__tests__/components/map/`

**Test Files**:
- `WysiwygToolbar.test.tsx`
- `ToolbarItem.test.tsx`
- `ToolbarDropdown.test.tsx`
- `DragPreview.test.tsx`
- `LinkingPreview.test.tsx`
- `DrawingPreview.test.tsx`
- `KeyboardShortcutHandler.test.tsx`

**Test Coverage**:
- Component rendering with different props
- Event handling (click, mouse events, drag events, keyboard events)
- State management (selection, linking, drawing states)
- Template generation with various inputs
- Component linking logic and duplicate prevention
- PST box drawing and validation
- Magnetic component highlighting
- Keyboard shortcut mapping and tool selection
- Keyboard shortcut conflict prevention
- Error handling scenarios

### Integration Tests
**Location**: `frontend/src/__tests__/integration/`

**Test Files**:
- `WysiwygToolbarIntegration.test.tsx`
- `ComponentLinkingIntegration.test.tsx`
- `PSTBoxDrawingIntegration.test.tsx`
- `KeyboardShortcutIntegration.test.tsx`

**Test Coverage**:
- Toolbar integration with UnifiedMapCanvas
- Coordinate conversion accuracy
- Map text mutation after component placement
- Component linking workflow end-to-end
- PST box drawing and map text generation
- Magnetic component detection and highlighting
- Keyboard shortcut integration with toolbar selection
- Keyboard shortcut behavior during different tool states
- Interaction with existing component placement functionality
- Multi-tool usage scenarios

### Visual Regression Tests
- Toolbar appearance in different themes
- Icon rendering consistency
- Drag preview visual feedback
- Responsive behavior at different screen sizes

### User Interaction Tests
- Click-to-select toolbar items
- Drag and drop component placement
- Keyboard shortcut tool selection
- Keyboard navigation and accessibility
- Touch device compatibility

## Implementation Notes

### Styling Approach
- Use CSS-in-JS with styled-components for consistency with existing codebase
- Implement MIRO-style design patterns (rounded corners, subtle shadows, hover effects)
- Ensure proper contrast and accessibility compliance
- Support all existing map themes (wardley, colour, plain, handwritten, dark)

### Performance Considerations
- Minimize re-renders during drag operations using React.memo and useCallback
- Debounce mouse move events for drag preview updates
- Lazy load toolbar icons to reduce initial bundle size
- Use efficient coordinate conversion algorithms

### Accessibility Features
- Keyboard navigation support for toolbar items
- Keyboard shortcuts with visual indicators and tooltips
- Screen reader compatibility with proper ARIA labels
- High contrast mode support
- Focus management during drag operations
- Keyboard shortcut announcements for screen readers

### Browser Compatibility
- Support for modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- Touch event handling for mobile devices
- Proper cursor styling across different platforms