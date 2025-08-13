# Requirements Document

## Introduction

This feature adds resize functionality for existing PST (Pioneers, Settlers, Town Planners) boxes on the map canvas. Users can currently create PST boxes using the WYSIWYG toolbar and move them around the map, but they cannot resize them after creation. This enhancement will allow users to adjust the size of PST boxes by dragging resize handles, providing more flexibility in map layout and visual organization.

## Requirements

### Requirement 1

**User Story:** As a map creator, I want to see resize handles on PST boxes when I hover over them, so that I can visually identify which elements can be resized.

#### Acceptance Criteria

1. WHEN I hover over an existing PST box THEN the system SHALL display resize handles at the corners and edges of the box
2. WHEN I move my mouse away from a PST box THEN the system SHALL hide the resize handles after a brief delay
3. WHEN resize handles are visible THEN the system SHALL show 8 handles: 4 corner handles and 4 edge handles (top, bottom, left, right)
4. WHEN resize handles are displayed THEN the system SHALL use distinct visual styling to differentiate them from the PST box content

### Requirement 2

**User Story:** As a map creator, I want to drag resize handles to change the dimensions of PST boxes, so that I can adjust their size to fit my content and layout needs.

#### Acceptance Criteria

1. WHEN I click and drag a corner resize handle THEN the system SHALL resize the PST box proportionally from the opposite corner
2. WHEN I click and drag an edge resize handle THEN the system SHALL resize the PST box only in the direction of that edge
3. WHEN I am resizing a PST box THEN the system SHALL show a real-time preview of the new dimensions
4. WHEN I release the mouse button after resizing THEN the system SHALL apply the new dimensions to the PST box
5. WHEN I resize a PST box THEN the system SHALL maintain the minimum size constraints (at least 50x30 pixels)

### Requirement 3

**User Story:** As a map creator, I want the map text to be automatically updated when I resize PST boxes, so that my changes are preserved and reflected in the underlying map syntax.

#### Acceptance Criteria

1. WHEN I complete a resize operation THEN the system SHALL update the mapText with the new coordinates
2. WHEN the mapText is updated THEN the system SHALL maintain the correct PST syntax format: `pioneers [y1, x1] [y2, x2]`
3. WHEN I resize multiple PST boxes THEN the system SHALL update each box's coordinates independently in the mapText
4. WHEN the mapText is updated THEN the system SHALL trigger a re-render to reflect the changes visually

### Requirement 4

**User Story:** As a map creator, I want visual feedback during the resize operation, so that I can accurately adjust the PST box to my desired size.

#### Acceptance Criteria

1. WHEN I start dragging a resize handle THEN the system SHALL change the cursor to indicate resize direction
2. WHEN I am dragging a resize handle THEN the system SHALL show a semi-transparent preview of the new box dimensions
3. WHEN I drag beyond the minimum size constraints THEN the system SHALL prevent further resizing and provide visual feedback
4. WHEN I drag to create an invalid size THEN the system SHALL snap to the nearest valid dimensions

### Requirement 5

**User Story:** As a map creator, I want resize functionality to work consistently across all PST types (Pioneers, Settlers, Town Planners), so that I have uniform editing capabilities regardless of the PST box type.

#### Acceptance Criteria

1. WHEN I hover over any PST box type THEN the system SHALL display resize handles with consistent appearance
2. WHEN I resize any PST box type THEN the system SHALL use the same interaction patterns and constraints
3. WHEN I resize different PST box types THEN the system SHALL maintain their distinct color coding
4. WHEN I resize any PST box type THEN the system SHALL generate the correct syntax for that specific type

### Requirement 6

**User Story:** As a map creator, I want resize operations to integrate seamlessly with existing map functionality, so that I can use resize alongside other editing features without conflicts.

#### Acceptance Criteria

1. WHEN I am resizing a PST box THEN the system SHALL not interfere with map pan and zoom operations
2. WHEN I resize a PST box THEN the system SHALL maintain compatibility with undo/redo functionality
3. WHEN I resize a PST box THEN the system SHALL not affect other map elements or their positioning
4. WHEN I switch between resize and other tools THEN the system SHALL properly manage tool states and cursor changes

### Requirement 7

**User Story:** As a map creator, I want keyboard shortcuts to enhance the resize experience, so that I can efficiently control resize operations without relying solely on mouse interactions.

#### Acceptance Criteria

1. WHEN I press the Escape key during a resize operation THEN the system SHALL cancel the resize and revert to the original dimensions
2. WHEN I hold the Shift key while resizing THEN the system SHALL maintain the aspect ratio of the PST box
3. WHEN I hold the Alt key while resizing THEN the system SHALL resize from the center point instead of the opposite corner
4. WHEN I use keyboard modifiers THEN the system SHALL provide visual feedback indicating the active resize mode

### Requirement 8

**User Story:** As a map creator, I want resize handles to be accessible and work well on different devices, so that I can resize PST boxes regardless of my input method.

#### Acceptance Criteria

1. WHEN I use a touch device THEN the system SHALL provide appropriately sized resize handles for finger interaction
2. WHEN I use a high-DPI display THEN the system SHALL render resize handles with proper scaling and clarity
3. WHEN I use keyboard navigation THEN the system SHALL allow me to select and manipulate resize handles using keyboard controls
4. WHEN using assistive technologies THEN the system SHALL provide appropriate ARIA labels and screen reader support for resize operations