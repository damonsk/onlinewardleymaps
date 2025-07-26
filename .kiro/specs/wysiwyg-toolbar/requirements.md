# Requirements Document

## Introduction

This feature introduces a WYSIWYG (What You See Is What You Get) editor interface for OnlineWardleyMaps with a MIRO-style toolbar. The toolbar will be positioned on the left side of the map canvas and allow users to drag and drop various map components directly onto the map. This enhances the existing QuickAdd functionality by providing a visual, intuitive interface for adding map elements without requiring users to double-click and type commands.

## Requirements

### Requirement 1

**User Story:** As a map creator, I want a visual toolbar on the left side of the map canvas, so that I can easily see and access all available map components without memorizing syntax.

#### Acceptance Criteria

1. WHEN the map page loads THEN the system SHALL display a vertical toolbar on the leftmost side of the map canvas
2. WHEN the toolbar is displayed THEN the system SHALL show icons for all available map components (anchor, component, pipeline, note, etc.)
3. WHEN the toolbar is visible THEN the system SHALL maintain consistent spacing and visual hierarchy similar to MIRO's interface
4. WHEN the map canvas is resized THEN the toolbar SHALL remain fixed in position on the left side

### Requirement 2

**User Story:** As a map creator, I want to click on toolbar items to select them, so that I can prepare to add specific components to my map.

#### Acceptance Criteria

1. WHEN I click on a toolbar item THEN the system SHALL visually indicate the item is selected (highlighted state)
2. WHEN an item is selected THEN the system SHALL change the mouse cursor to indicate drag mode
3. WHEN I click on a different toolbar item THEN the system SHALL deselect the previous item and select the new one
4. WHEN I click elsewhere on the interface THEN the system SHALL deselect any currently selected toolbar item

### Requirement 3

**User Story:** As a map creator, I want to drag selected items from the toolbar onto the map canvas, so that I can place components exactly where I want them visually.

#### Acceptance Criteria

1. WHEN I have a toolbar item selected and move my mouse over the map canvas THEN the system SHALL show a preview of the component at the mouse position
2. WHEN I click on the map canvas with a selected toolbar item THEN the system SHALL place the component at that location
3. WHEN I place a component THEN the system SHALL automatically generate appropriate default properties (name, coordinates, etc.)
4. WHEN I place a component THEN the system SHALL deselect the toolbar item and return to normal cursor mode

### Requirement 4

**User Story:** As a map creator, I want the map text to be automatically updated when I add components via the toolbar, so that my changes are reflected in the underlying map syntax.

#### Acceptance Criteria

1. WHEN I place a component using the toolbar THEN the system SHALL automatically update the mapText with the appropriate syntax
2. WHEN the mapText is updated THEN the system SHALL maintain proper formatting and line structure
3. WHEN I place multiple components THEN the system SHALL append each new component to the mapText in the correct order
4. WHEN the mapText is updated THEN the system SHALL trigger a re-render of the map to reflect the changes

### Requirement 5

**User Story:** As a map creator, I want the toolbar to support all existing map component types, so that I have complete functionality without switching between different input methods.

#### Acceptance Criteria

1. WHEN the toolbar loads THEN the system SHALL include buttons for anchors, components, pipelines, notes, and all other supported map elements
2. WHEN I select any toolbar item THEN the system SHALL support the same placement functionality regardless of component type
3. WHEN I place different component types THEN the system SHALL generate the correct syntax for each type in the mapText
4. WHEN placing components with special properties THEN the system SHALL use sensible defaults that can be edited later

### Requirement 6

**User Story:** As a map creator, I want the toolbar interface to integrate seamlessly with existing map functionality, so that I can use both toolbar and traditional input methods interchangeably.

#### Acceptance Criteria

1. WHEN I use the toolbar to add components THEN the system SHALL maintain compatibility with existing QuickAdd functionality
2. WHEN I switch between toolbar and text editing THEN the system SHALL keep the map state synchronized
3. WHEN I use the toolbar THEN the system SHALL not interfere with existing map interactions (zoom, pan, select)
4. WHEN components are added via toolbar THEN the system SHALL support all existing editing capabilities (move, delete, modify)

### Requirement 7

**User Story:** As a map creator, I want visual feedback during the drag and drop process, so that I can accurately place components where intended.

#### Acceptance Criteria

1. WHEN I hover over the map canvas with a selected toolbar item THEN the system SHALL show a ghost/preview of the component
2. WHEN the preview is shown THEN the system SHALL update its position to follow the mouse cursor
3. WHEN I move the mouse to invalid drop areas THEN the system SHALL provide visual indication that dropping is not allowed
4. WHEN I move the mouse to valid drop areas THEN the system SHALL show that dropping is allowed

### Requirement 8

**User Story:** As a map creator, I want to create links between components using a magnetic linking tool from the toolbar, so that I can visually connect components without using keyboard shortcuts.

#### Acceptance Criteria

1. WHEN I select the link tool from the toolbar THEN the system SHALL display a link icon (two circles connected by a line)
2. WHEN I move the mouse over the map canvas with the link tool selected THEN the system SHALL highlight the nearest component with a magnetic effect
3. WHEN I click on a component with the link tool selected THEN the system SHALL start the linking process and visually indicate the source component
4. WHEN I move the mouse after selecting the first component THEN the system SHALL show a preview line from the source component to the mouse cursor
5. WHEN I hover over another component during linking THEN the system SHALL highlight the target component with a magnetic effect
6. WHEN I click on a second component during linking THEN the system SHALL create a link between the two components in the DSL format 'source->target'
7. WHEN I attempt to create a link that already exists THEN the system SHALL not create a duplicate link and provide visual feedback
8. WHEN I click elsewhere during the linking process THEN the system SHALL cancel the linking operation

### Requirement 9

**User Story:** As a map creator, I want to add PST (Pioneers, Settlers, Town Planners) boxes from the toolbar using a dropdown selection, so that I can draw different types of organizational boxes on the map.

#### Acceptance Criteria

1. WHEN I click on the PST tool in the toolbar THEN the system SHALL display a dropdown with three options: Pioneers, Settlers, and Town Planners
2. WHEN I select a PST type from the dropdown THEN the system SHALL activate the box drawing mode for that specific type
3. WHEN I move the mouse over the map canvas with a PST tool selected THEN the system SHALL show a crosshair cursor indicating drawing mode
4. WHEN I click and drag on the map canvas with a PST tool selected THEN the system SHALL show a preview rectangle being drawn
5. WHEN I release the mouse button after dragging THEN the system SHALL create a PST box of the selected type with appropriate color coding
6. WHEN I create a Pioneers box THEN the system SHALL use a distinct color (to be defined in design)
7. WHEN I create a Settlers box THEN the system SHALL use a distinct color different from Pioneers
8. WHEN I create a Town Planners box THEN the system SHALL use a distinct color different from both Pioneers and Settlers
9. WHEN I create any PST box THEN the system SHALL update the map text with the appropriate PST syntax

### Requirement 10

**User Story:** As a map creator, I want to use keyboard shortcuts to quickly select toolbar items, so that I can efficiently switch between different tools without using the mouse.

#### Acceptance Criteria

1. WHEN I press the 'C' key THEN the system SHALL select the Component tool from the toolbar
2. WHEN I press the 'L' key THEN the system SHALL select the Link tool from the toolbar
3. WHEN I press the 'N' key THEN the system SHALL select the Note tool from the toolbar
4. WHEN I press the 'P' key THEN the system SHALL select the Pipeline tool from the toolbar
5. WHEN I press the 'A' key THEN the system SHALL select the Anchor tool from the toolbar
6. WHEN I press the 'M' key THEN the system SHALL select the Method tool from the toolbar
7. WHEN I press the 'T' key THEN the system SHALL select the PST (Town Planners/Settlers/Pioneers) tool from the toolbar
8. WHEN I press the 'Escape' key THEN the system SHALL deselect any currently selected toolbar item
9. WHEN a toolbar item is selected via keyboard shortcut THEN the system SHALL provide the same visual feedback as mouse selection
10. WHEN I press a keyboard shortcut while another tool is selected THEN the system SHALL switch to the new tool immediately
11. WHEN keyboard shortcuts are active THEN the system SHALL not interfere with text editing in other parts of the interface
12. WHEN I press an unassigned key THEN the system SHALL not change the current toolbar selection