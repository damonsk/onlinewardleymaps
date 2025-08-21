# Design Document

## Overview

The PST resize functionality will add interactive resize handles to existing PST (Pioneers, Settlers, Town Planners) boxes on the map canvas. Users will be able to hover over PST boxes to reveal resize handles, then drag these handles to adjust the dimensions of the boxes. The changes will be automatically reflected in the map text syntax.

This feature builds on the existing PST drawing functionality from the WYSIWYG toolbar and integrates with the current map rendering architecture. PST elements are currently parsed as "attitudes" in the conversion system and rendered as rectangular boxes with distinct colors.

## Architecture

### Component Hierarchy
```
UnifiedMapCanvas (MODIFIED)
├── UnifiedMapContent (MODIFIED)
│   ├── PSTBox (NEW) - Renders individual PST boxes with resize handles
│   │   ├── PSTBoxRenderer (NEW) - Core box rendering
│   │   └── ResizeHandles (NEW) - Interactive resize handles
│   ├── ResizePreview (NEW) - Shows preview during resize operations
│   └── [Existing components...]
└── [Existing components...]
```

### State Management
The resize functionality will use React state to manage:
- Hovered PST box identification
- Active resize operation state
- Resize handle being dragged
- Preview dimensions during resize
- Mouse position tracking
- Resize constraints and validation

### Integration Points
- **AttitudeExtractionStrategy**: Already parses PST elements from map text
- **UnifiedMapContent**: Will be enhanced to render PST boxes with resize capability
- **MapElements**: Will include PST elements in the unified component system
- **Position Calculator**: Used for coordinate conversion between screen and map coordinates
- **Map Text Mutation**: Updated to reflect resize changes in the underlying syntax

## Components and Interfaces

### PSTBox Component
**Location**: `frontend/src/components/map/PSTBox.tsx`

**Props Interface**:
```typescript
interface PSTBoxProps {
  pstElement: PSTElement;
  mapDimensions: MapDimensions;
  mapStyleDefs: MapTheme;
  scaleFactor: number;
  isHovered: boolean;
  isResizing: boolean;
  onResizeStart: (element: PSTElement, handle: ResizeHandle) => void;
  onResizeEnd: (element: PSTElement, newCoordinates: PSTCoordinates) => void;
  onHover: (element: PSTElement | null) => void;
  mutateMapText: (newText: string) => void;
  mapText: string;
}
```

**Responsibilities**:
- Render PST box with appropriate color and styling
- Show/hide resize handles based on hover state
- Handle mouse events for hover detection
- Coordinate resize operations with parent components
- Apply visual feedback during resize operations

### ResizeHandles Component
**Location**: `frontend/src/components/map/ResizeHandles.tsx`

**Props Interface**:
```typescript
interface ResizeHandlesProps {
  bounds: PSTBounds;
  isVisible: boolean;
  onResizeStart: (handle: ResizeHandle, startPosition: { x: number; y: number }) => void;
  onResizeMove: (handle: ResizeHandle, currentPosition: { x: number; y: number }) => void;
  onResizeEnd: (handle: ResizeHandle) => void;
  scaleFactor: number;
  mapStyleDefs: MapTheme;
}

type ResizeHandle = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';
```

**Responsibilities**:
- Render 8 resize handles (4 corners + 4 edges)
- Handle mouse events for drag operations
- Provide appropriate cursor styling for each handle
- Scale handle size based on map zoom level
- Apply accessibility attributes for screen readers

### ResizePreview Component
**Location**: `frontend/src/components/map/ResizePreview.tsx`

**Props Interface**:
```typescript
interface ResizePreviewProps {
  isActive: boolean;
  originalBounds: PSTBounds;
  previewBounds: PSTBounds;
  pstType: PSTType;
  mapStyleDefs: MapTheme;
}
```

**Responsibilities**:
- Show semi-transparent preview of new dimensions during resize
- Maintain original box styling with reduced opacity
- Provide visual feedback for constraint violations
- Handle smooth transitions and animations

### Enhanced UnifiedMapContent
**Modifications to**: `frontend/src/components/map/UnifiedMapContent.tsx`

**New Props**:
```typescript
interface EnhancedUnifiedMapContentProps extends ModernUnifiedMapContentProps {
  // PST resize functionality
  hoveredPSTElement: PSTElement | null;
  resizingPSTElement: PSTElement | null;
  resizeHandle: ResizeHandle | null;
  resizePreviewBounds: PSTBounds | null;
  onPSTHover: (element: PSTElement | null) => void;
  onPSTResizeStart: (element: PSTElement, handle: ResizeHandle) => void;
  onPSTResizeMove: (newBounds: PSTBounds) => void;
  onPSTResizeEnd: (element: PSTElement, newCoordinates: PSTCoordinates) => void;
}
```

**New Responsibilities**:
- Render PST elements using the new PSTBox component
- Manage hover state for PST elements
- Coordinate resize operations between components
- Handle mouse events for resize functionality
- Integrate with existing map interaction systems

## Data Models

### PST Element Interface
```typescript
interface PSTElement {
  id: string;
  type: PSTType;
  coordinates: PSTCoordinates;
  line: number; // Line number in map text for updates
  name?: string; // Optional label text
}

type PSTType = 'pioneers' | 'settlers' | 'townplanners';

interface PSTCoordinates {
  // Map coordinates (0-1 range)
  maturity1: number;    // Left edge maturity
  visibility1: number;  // Top edge visibility  
  maturity2: number;    // Right edge maturity
  visibility2: number;  // Bottom edge visibility
}
```

### PST Bounds Interface
```typescript
interface PSTBounds {
  // SVG coordinates for rendering
  x: number;      // Left edge
  y: number;      // Top edge
  width: number;  // Box width
  height: number; // Box height
}
```

### PST Configuration
```typescript
const PST_CONFIG: Record<PSTType, PSTTypeConfig> = {
  pioneers: {
    color: '#FF6B6B',
    label: 'Pioneers',
    minWidth: 50,
    minHeight: 30,
  },
  settlers: {
    color: '#4ECDC4', 
    label: 'Settlers',
    minWidth: 50,
    minHeight: 30,
  },
  townplanners: {
    color: '#45B7D1',
    label: 'Town Planners', 
    minWidth: 50,
    minHeight: 30,
  },
};

interface PSTTypeConfig {
  color: string;
  label: string;
  minWidth: number;
  minHeight: number;
}
```

### Resize Constraints
```typescript
interface ResizeConstraints {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  snapToGrid: boolean;
  maintainAspectRatio: boolean;
}

const DEFAULT_RESIZE_CONSTRAINTS: ResizeConstraints = {
  minWidth: 50,
  minHeight: 30,
  maxWidth: 800,
  maxHeight: 600,
  snapToGrid: false,
  maintainAspectRatio: false,
};
```

## Error Handling

### Coordinate Conversion Errors
- Handle edge cases where SVG coordinates cannot be converted to map coordinates
- Provide fallback positioning to prevent boxes from disappearing
- Log conversion errors for debugging without breaking user experience

### Map Text Mutation Failures
- Catch and handle errors during map text updates after resize operations
- Provide user feedback if resize changes cannot be saved
- Implement rollback mechanism to restore original dimensions on failure
- Maintain map state consistency during error conditions

### Resize Constraint Violations
- Prevent resizing below minimum dimensions with visual feedback
- Handle attempts to resize beyond map boundaries
- Snap to valid dimensions when user releases mouse outside constraints
- Provide visual indicators when constraints are active

### Concurrent Editing Conflicts
- Handle cases where map text is modified during resize operations
- Detect and resolve conflicts between resize changes and other edits
- Provide user notification when conflicts occur
- Implement conflict resolution strategies (user choice, last-write-wins, etc.)

### Performance Edge Cases
- Handle resize operations on maps with many PST elements
- Optimize rendering performance during rapid mouse movements
- Prevent memory leaks from event listeners during resize operations
- Handle browser compatibility issues with mouse events

## Testing Strategy

### Unit Tests
**Location**: `frontend/src/__tests__/components/map/`

**Test Files**:
- `PSTBox.test.tsx`
- `ResizeHandles.test.tsx` 
- `ResizePreview.test.tsx`

**Test Coverage**:
- Component rendering with different PST types and states
- Hover state management and visual feedback
- Resize handle interaction and drag operations
- Coordinate conversion accuracy between screen and map coordinates
- Constraint validation and enforcement
- Map text generation after resize operations
- Error handling for invalid resize operations
- Accessibility features and keyboard navigation
- Performance with multiple PST elements

### Integration Tests
**Location**: `frontend/src/__tests__/integration/`

**Test Files**:
- `PSTResizeIntegration.test.tsx`
- `PSTResizeMapTextIntegration.test.tsx`

**Test Coverage**:
- End-to-end resize workflow from hover to map text update
- Integration with existing map functionality (zoom, pan, other tools)
- Coordinate system consistency across different map sizes
- Undo/redo functionality with resize operations
- Multi-PST element scenarios and interactions
- Performance testing with complex maps
- Cross-browser compatibility testing

### Visual Regression Tests
- Resize handle appearance across different themes
- PST box styling consistency during resize operations
- Preview overlay rendering and positioning
- Responsive behavior at different screen sizes and zoom levels

### Accessibility Tests
- Screen reader compatibility with resize handles
- Keyboard navigation for resize operations
- High contrast mode support
- Touch device interaction testing

## Implementation Notes

### Styling Approach
- Use CSS-in-JS with styled-components for consistency with existing codebase
- Implement theme-aware styling that works with all map themes (wardley, colour, plain, handwritten, dark)
- Ensure proper contrast and accessibility compliance for resize handles
- Support high-DPI displays with appropriate scaling

### Performance Considerations
- Use React.memo and useCallback to minimize re-renders during resize operations
- Debounce mouse move events during resize to improve performance
- Implement efficient coordinate conversion algorithms
- Use requestAnimationFrame for smooth preview animations
- Optimize SVG rendering for multiple PST elements

### Accessibility Features
- Provide ARIA labels for resize handles with clear descriptions
- Support keyboard navigation for selecting and resizing PST elements
- Implement screen reader announcements for resize operations
- Ensure sufficient color contrast for resize handles and previews
- Support high contrast mode with appropriate styling overrides

### Browser Compatibility
- Support for modern browsers (Chrome, Firefox, Safari, Edge)
- Handle touch events for mobile and tablet devices
- Provide fallback behavior for older browsers
- Test mouse event handling across different platforms
- Ensure consistent cursor styling across browsers

### Integration with Existing Systems
- Maintain compatibility with existing undo/redo functionality
- Ensure resize operations work alongside other map tools
- Preserve existing keyboard shortcuts and interactions
- Integrate with the existing map text mutation system
- Support all current map themes and styling options