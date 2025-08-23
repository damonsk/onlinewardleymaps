# Requirements Document

## Introduction

The Online Wardley Maps editor currently provides basic interaction capabilities through double-clicking for editing and toolbar buttons for various actions. However, users expect modern editing experiences with context-sensitive right-click menus and keyboard shortcuts for common operations. This quality-of-life improvement will enhance the map editing workflow by providing intuitive access to component and link manipulation functions directly where users are working.

The enhanced map editor interactions feature will add comprehensive right-click context menus for components and links, keyboard shortcuts for deletion, improved evolution workflows, and streamlined editing capabilities that reduce the need to switch between map elements and toolbar controls.

## Requirements

### Requirement 1

**User Story:** As a map editor, I want to right-click on any component to access editing options, so that I can quickly modify components without navigating to toolbar controls.

#### Acceptance Criteria

1. WHEN right-clicking on a component THEN a context menu SHALL appear with relevant editing options
2. WHEN selecting "Edit" from the context menu THEN the component SHALL enter inline editing mode equivalent to double-clicking
3. WHEN the context menu appears THEN it SHALL be positioned appropriately near the cursor without overlapping important map elements
4. IF the component is an evolved component THEN the context menu SHALL show options appropriate for evolved components

### Requirement 2

**User Story:** As a map editor, I want to toggle component inertia through a right-click context menu, so that I can quickly adjust component properties without using the toolbar.

#### Acceptance Criteria

1. WHEN right-clicking on a component without inertia THEN the context menu SHALL show "Add Inertia" option
2. WHEN right-clicking on a component with inertia THEN the context menu SHALL show "Remove Inertia" option
3. WHEN selecting an inertia toggle option THEN the component's inertia state SHALL change immediately and update the map text
4. WHEN toggling inertia THEN the visual representation SHALL update to reflect the new state

### Requirement 3

**User Story:** As a map editor, I want to evolve components through a context menu action, so that I can create evolution relationships efficiently without manually writing evolution syntax.

#### Acceptance Criteria

1. WHEN right-clicking on a non-evolved component THEN the context menu SHALL show "Evolve Component" option
2. WHEN selecting "Evolve Component" THEN an evolved component SHALL be created and positioned according to evolution stage rules
3. WHEN evolving a commodity-stage component THEN the evolved component SHALL be positioned slightly to the right at the same evolution level
4. WHEN evolving a component in Genesis, Custom, or Product stages THEN the evolved component SHALL be positioned at the next evolution stage (Genesis→Custom, Custom→Product, Product→Commodity)
5. WHEN a component is evolved THEN the map text SHALL be updated with the appropriate evolution syntax
6. WHEN creating an evolved component THEN it SHALL inherit appropriate properties from the source component

### Requirement 4

**User Story:** As a map editor, I want to rename evolved components by double-clicking them, so that I can update evolved component names using familiar editing interactions.

#### Acceptance Criteria

1. WHEN double-clicking on an evolved component THEN it SHALL enter inline editing mode for the name
2. WHEN editing an evolved component name THEN the changes SHALL update the map text with proper "evolve source->newname position" syntax
3. WHEN saving evolved component name changes THEN the evolution relationship SHALL be preserved
4. WHEN canceling evolved component name editing THEN the original name SHALL be restored

### Requirement 5

**User Story:** As a map editor, I want to delete components and evolved components using the Delete key or context menu, so that I can remove unwanted elements efficiently.

#### Acceptance Criteria

1. WHEN a component is selected and Delete key is pressed THEN the component SHALL be removed from the map and map text
2. WHEN right-clicking on a component THEN the context menu SHALL show "Delete Component" option
3. WHEN deleting a component through context menu THEN the component SHALL be removed from map and map text
4. WHEN deleting an evolved component THEN both the evolved component and its evolution line SHALL be removed
5. WHEN deleting a component that has evolved components THEN the system SHALL handle the deletion appropriately (either prevent deletion or remove related evolutions)
6. IF a component has dependencies THEN the user SHALL be warned before deletion

### Requirement 6

**User Story:** As a map editor, I want to select and delete links using keyboard shortcuts and context menus, so that I can manage component relationships efficiently.

#### Acceptance Criteria

1. WHEN clicking on a link THEN it SHALL become selected with visual indication
2. WHEN a link is selected and Delete key is pressed THEN the link SHALL be removed from the map and map text
3. WHEN right-clicking on a selected link THEN a context menu SHALL appear with "Delete Link" option
4. WHEN deleting a link through context menu THEN the link SHALL be removed from map and map text
5. WHEN a link is deleted THEN any related visual elements (arrows, labels) SHALL also be removed
6. WHEN multiple links exist between components THEN individual links SHALL be selectable and deletable

### Requirement 7

**User Story:** As a map editor, I want consistent keyboard shortcuts across all editing operations, so that I can work efficiently without constantly switching between mouse and keyboard.

#### Acceptance Criteria

1. WHEN pressing Delete key with any selected element THEN the appropriate deletion action SHALL be performed
2. WHEN pressing Escape during any editing operation THEN the operation SHALL be canceled and original state restored
3. WHEN using keyboard shortcuts THEN they SHALL work consistently across all map elements (components, evolved components, links)
4. IF no element is selected THEN keyboard shortcuts SHALL not perform unintended actions

### Requirement 8

**User Story:** As a map editor, I want visual feedback for all interactive elements, so that I can easily understand what can be selected, edited, or manipulated.

#### Acceptance Criteria

1. WHEN hovering over interactive elements THEN they SHALL show visual hover states
2. WHEN elements are selected THEN they SHALL show clear selection indicators
3. WHEN context menus are available THEN cursor SHALL indicate right-click availability
4. WHEN operations are in progress THEN appropriate visual feedback SHALL be shown
5. WHEN invalid operations are attempted THEN clear error states SHALL be displayed
