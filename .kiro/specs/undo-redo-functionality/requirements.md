# Requirements Document

## Introduction

This feature introduces undo and redo functionality to the OnlineWardleyMaps WYSIWYG toolbar. The system will track all map modifications made through toolbar interactions, canvas interactions (such as double-click renaming and component movement), and any changes that pass through the `mutateMapText` function. Users will be able to undo and redo these changes using dedicated toolbar icons, providing a familiar editing experience similar to other visual editing tools.

## Requirements

### Requirement 1

**User Story:** As a map creator, I want undo and redo icons in the WYSIWYG toolbar, so that I can easily reverse or restore my recent changes without manually editing the map text.

#### Acceptance Criteria

1. WHEN the WYSIWYG toolbar loads THEN the system SHALL display undo and redo icons in the toolbar
2. WHEN the undo icon is displayed THEN the system SHALL show it as disabled when there are no actions to undo
3. WHEN the redo icon is displayed THEN the system SHALL show it as disabled when there are no actions to redo
4. WHEN there are actions available to undo THEN the system SHALL show the undo icon as enabled with appropriate visual styling
5. WHEN there are actions available to redo THEN the system SHALL show the redo icon as enabled with appropriate visual styling

### Requirement 2

**User Story:** As a map creator, I want to track all changes made through toolbar items, so that I can undo any component placements, linking operations, or method applications I've made.

#### Acceptance Criteria

1. WHEN I place a component using a toolbar item THEN the system SHALL record this action in the undo history
2. WHEN I create a link between components using the toolbar THEN the system SHALL record this action in the undo history
3. WHEN I draw a PST box using the toolbar THEN the system SHALL record this action in the undo history
4. WHEN I apply a method decorator using the toolbar THEN the system SHALL record this action in the undo history
5. WHEN I perform any toolbar action THEN the system SHALL clear the redo history
6. WHEN I perform any toolbar action THEN the system SHALL update the undo/redo button states appropriately

### Requirement 3

**User Story:** As a map creator, I want to track changes made through canvas interactions, so that I can undo component movements, renaming operations, and other direct map manipulations.

#### Acceptance Criteria

1. WHEN I double-click to rename a component on the canvas THEN the system SHALL record this action in the undo history
2. WHEN I move a component by dragging it on the canvas THEN the system SHALL record this action in the undo history
3. WHEN I delete a component through canvas interaction THEN the system SHALL record this action in the undo history
4. WHEN I perform any canvas modification THEN the system SHALL clear the redo history
5. WHEN I perform any canvas modification THEN the system SHALL update the undo/redo button states appropriately

### Requirement 4

**User Story:** As a map creator, I want all changes that pass through `mutateMapText` to be tracked, so that I have comprehensive undo/redo coverage regardless of how changes are made.

#### Acceptance Criteria

1. WHEN any function calls `mutateMapText` THEN the system SHALL record the previous map text state in the undo history
2. WHEN `mutateMapText` is called THEN the system SHALL store sufficient information to restore the previous state
3. WHEN `mutateMapText` is called THEN the system SHALL clear the redo history
4. WHEN `mutateMapText` is called THEN the system SHALL update the undo/redo button states
5. WHEN multiple rapid calls to `mutateMapText` occur THEN the system SHALL debounce the history recording to avoid excessive history entries

### Requirement 5

**User Story:** As a map creator, I want to click the undo icon to reverse my last action, so that I can quickly correct mistakes or experiment with different approaches.

#### Acceptance Criteria

1. WHEN I click the undo icon and there are actions to undo THEN the system SHALL restore the map to the previous state
2. WHEN I perform an undo operation THEN the system SHALL update the map text to the previous version
3. WHEN I perform an undo operation THEN the system SHALL re-render the map to reflect the restored state
4. WHEN I perform an undo operation THEN the system SHALL move the undone action to the redo history
5. WHEN I perform an undo operation THEN the system SHALL update the undo/redo button states appropriately
6. WHEN I click the undo icon and there are no actions to undo THEN the system SHALL not perform any action

### Requirement 6

**User Story:** As a map creator, I want to click the redo icon to restore a previously undone action, so that I can easily reapply changes I accidentally undid.

#### Acceptance Criteria

1. WHEN I click the redo icon and there are actions to redo THEN the system SHALL restore the map to the next state in the redo history
2. WHEN I perform a redo operation THEN the system SHALL update the map text to the next version
3. WHEN I perform a redo operation THEN the system SHALL re-render the map to reflect the restored state
4. WHEN I perform a redo operation THEN the system SHALL move the redone action back to the undo history
5. WHEN I perform a redo operation THEN the system SHALL update the undo/redo button states appropriately
6. WHEN I click the redo icon and there are no actions to redo THEN the system SHALL not perform any action

### Requirement 7

**User Story:** As a map creator, I want keyboard shortcuts for undo and redo operations, so that I can quickly access these functions using familiar key combinations.

#### Acceptance Criteria

1. WHEN I press Ctrl+Z (or Cmd+Z on Mac) THEN the system SHALL perform an undo operation if actions are available
2. WHEN I press Ctrl+Y (or Cmd+Shift+Z on Mac) THEN the system SHALL perform a redo operation if actions are available
3. WHEN I press the undo keyboard shortcut and no actions are available THEN the system SHALL not perform any action
4. WHEN I press the redo keyboard shortcut and no actions are available THEN the system SHALL not perform any action
5. WHEN keyboard shortcuts are pressed while text editing is active THEN the system SHALL not interfere with text editor undo/redo functionality

### Requirement 8

**User Story:** As a map creator, I want the undo/redo system to maintain a reasonable history limit, so that the system doesn't consume excessive memory while still providing useful functionality.

#### Acceptance Criteria

1. WHEN the undo history reaches the maximum limit THEN the system SHALL remove the oldest entries to maintain the limit
2. WHEN the redo history reaches the maximum limit THEN the system SHALL remove the oldest entries to maintain the limit
3. WHEN I perform actions that would exceed the history limit THEN the system SHALL continue to function normally without performance degradation
4. WHEN the history limit is reached THEN the system SHALL maintain the most recent actions in the history
5. WHEN the page is refreshed or reloaded THEN the system SHALL clear both undo and redo histories

### Requirement 9

**User Story:** As a map creator, I want visual feedback about what actions can be undone or redone, so that I understand what will happen when I use these functions.

#### Acceptance Criteria

1. WHEN I hover over the undo icon THEN the system SHALL display a tooltip indicating the last action that can be undone
2. WHEN I hover over the redo icon THEN the system SHALL display a tooltip indicating the next action that can be redone
3. WHEN there are no actions to undo THEN the undo tooltip SHALL indicate that no actions are available
4. WHEN there are no actions to redo THEN the redo tooltip SHALL indicate that no actions are available
5. WHEN I perform an undo or redo operation THEN the system SHALL provide brief visual feedback confirming the action

### Requirement 10

**User Story:** As a map creator, I want the undo/redo system to handle complex operations appropriately, so that multi-step actions are treated as single undoable units.

#### Acceptance Criteria

1. WHEN I perform a complex operation that involves multiple map text changes THEN the system SHALL group these into a single undoable action
2. WHEN I undo a complex operation THEN the system SHALL restore all related changes as a single unit
3. WHEN I perform rapid successive changes of the same type THEN the system SHALL optionally group them into a single undoable action
4. WHEN I switch between different types of operations THEN the system SHALL treat each type change as a natural grouping boundary
5. WHEN grouping is applied THEN the system SHALL ensure that undo operations restore the map to a consistent and expected state