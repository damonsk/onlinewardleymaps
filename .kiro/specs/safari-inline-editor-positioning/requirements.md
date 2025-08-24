# Requirements Document

## Introduction

Fix Safari-specific positioning issues with inline editors for map titles and component names. Currently, when users double-click to edit map titles or component names in Safari, the inline editor appears at the wrong position (typically at the top of the viewport, outside of view), while Chrome displays it correctly.

## Requirements

### Requirement 1

**User Story:** As a Safari user, I want to edit map titles by double-clicking, so that I can modify the title text in the same location as the original text.

#### Acceptance Criteria

1. WHEN a user double-clicks on a map title in Safari THEN the inline editor SHALL appear at the correct position relative to the original title text
2. WHEN the inline editor is displayed THEN it SHALL be fully visible within the viewport
3. WHEN the user saves or cancels the edit THEN the editor SHALL disappear and show the updated or original title text

### Requirement 2

**User Story:** As a Safari user, I want to edit component names by double-clicking, so that I can rename components in place without the editor appearing off-screen.

#### Acceptance Criteria

1. WHEN a user double-clicks on a component name in Safari THEN the inline editor SHALL appear at the correct position relative to the original component text
2. WHEN the inline editor is displayed THEN it SHALL be positioned correctly regardless of map zoom level or pan position
3. WHEN the user interacts with the editor THEN it SHALL remain in the correct position throughout the editing session

### Requirement 3

**User Story:** As a developer, I want the inline editor positioning to work consistently across browsers, so that users have the same experience regardless of their browser choice.

#### Acceptance Criteria

1. WHEN the inline editor is displayed THEN it SHALL use browser-specific positioning logic to ensure correct placement
2. WHEN Safari is detected THEN the positioning SHALL account for Safari's different foreignObject coordinate interpretation
3. WHEN Chrome or other browsers are used THEN the existing positioning logic SHALL continue to work correctly