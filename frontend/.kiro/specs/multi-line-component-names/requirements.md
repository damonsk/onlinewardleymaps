# Requirements Document

## Introduction

This feature enables multi-line component names in OnlineWardleyMaps, similar to the existing multi-line notes functionality. Currently, component names are limited to single-line text, which can be restrictive for complex component descriptions or when users want to include additional context directly in the component name. This feature will extend the map text DSL to support quoted multi-line component names and update the rendering and editing systems to handle line breaks properly.

## Requirements

### Requirement 1

**User Story:** As a map creator, I want to create component names with multiple lines, so that I can include detailed descriptions or context directly in the component name without being limited to single-line text.

#### Acceptance Criteria

1. WHEN I write a component with quoted text containing \n THEN the system SHALL parse it as a multi-line component name
2. WHEN I create a component like `component "Multi-line\nComponent Name" [0.5, 0.7]` THEN the system SHALL display the component with text on separate lines
3. WHEN I use multi-line component names THEN the system SHALL preserve the line breaks in both the DSL and visual representation
4. WHEN I save a map with multi-line component names THEN the system SHALL maintain the multi-line format in the exported map text

### Requirement 2

**User Story:** As a map creator, I want multi-line component names to render properly on the map, so that the text is readable and well-positioned without overlapping other elements.

#### Acceptance Criteria

1. WHEN a component has a multi-line name THEN the system SHALL render each line as a separate tspan element with proper spacing
2. WHEN multi-line component names are displayed THEN the system SHALL center-align the text and position it appropriately relative to the component symbol
3. WHEN component names have different numbers of lines THEN the system SHALL adjust the vertical positioning to maintain visual balance
4. WHEN multi-line component names are rendered THEN the system SHALL use consistent line height and spacing that matches the map theme

### Requirement 3

**User Story:** As a map creator, I want to edit multi-line component names inline, so that I can modify complex component descriptions with the same convenience as single-line names.

#### Acceptance Criteria

1. WHEN I double-click on a multi-line component name THEN the system SHALL open the inline editor with all lines displayed
2. WHEN I edit a multi-line component name THEN the system SHALL support Enter key for new lines and Ctrl+Enter for saving
3. WHEN I save changes to a multi-line component name THEN the system SHALL update the map text DSL with proper escaping of line breaks
4. WHEN I cancel editing a multi-line component name THEN the system SHALL revert to the original multi-line content

### Requirement 4

**User Story:** As a map creator, I want multi-line component names to work with all existing component features, so that I don't lose functionality when using multi-line text.

#### Acceptance Criteria

1. WHEN I use multi-line component names THEN the system SHALL support all existing component decorators (buy, build, outsource, market, ecosystem)
2. WHEN I evolve a component with a multi-line name THEN the system SHALL properly handle the evolution syntax and display
3. WHEN I add inertia to a component with a multi-line name THEN the system SHALL apply the inertia styling correctly
4. WHEN I use labels with multi-line component names THEN the system SHALL position labels appropriately relative to the multi-line text

### Requirement 5

**User Story:** As a map creator, I want the DSL syntax for multi-line component names to be consistent with multi-line notes, so that the learning curve is minimal and the syntax feels familiar.

#### Acceptance Criteria

1. WHEN I write multi-line component names THEN the system SHALL use the same quoted string syntax as multi-line notes
2. WHEN I escape characters in multi-line component names THEN the system SHALL handle \n, \", and \\ the same way as in notes
3. WHEN I mix single-line and multi-line component names in the same map THEN the system SHALL parse both correctly
4. WHEN I use complex escaping in component names THEN the system SHALL process the escaping consistently with note escaping

### Requirement 6

**User Story:** As a map creator, I want multi-line component names to maintain backward compatibility, so that existing maps continue to work without modification.

#### Acceptance Criteria

1. WHEN I load an existing map with single-line component names THEN the system SHALL continue to display them correctly
2. WHEN I mix old single-line syntax with new multi-line syntax THEN the system SHALL handle both formats in the same map
3. WHEN I export a map with multi-line component names THEN the system SHALL use the quoted format that can be re-imported correctly
4. WHEN legacy parsing encounters quoted component names THEN the system SHALL gracefully handle the new syntax

### Requirement 7

**User Story:** As a map creator, I want multi-line component names to work properly with component linking and evolution, so that complex relationships are maintained even with detailed component descriptions.

#### Acceptance Criteria

1. WHEN I create links between components with multi-line names THEN the system SHALL correctly identify and connect the components
2. WHEN I evolve a component with a multi-line name THEN the system SHALL maintain the link between the original and evolved versions
3. WHEN I use component names with line breaks in evolution syntax THEN the system SHALL parse the evolution target correctly
4. WHEN components with multi-line names are part of pipelines THEN the system SHALL maintain proper pipeline connections

### Requirement 8

**User Story:** As a map creator, I want multi-line component names to be searchable and referenceable, so that I can find and link to components regardless of their text complexity.

#### Acceptance Criteria

1. WHEN I search for components THEN the system SHALL find components with multi-line names by searching across all lines
2. WHEN I reference a component with a multi-line name in evolution or linking THEN the system SHALL match the component correctly
3. WHEN I use component names with special characters and line breaks THEN the system SHALL handle the matching logic properly
4. WHEN I rename a component from single-line to multi-line or vice versa THEN the system SHALL update all references correctly

### Requirement 9

**User Story:** As a map creator, I want multi-line component names to work with all map themes and styling options, so that the visual appearance remains consistent across different map presentations.

#### Acceptance Criteria

1. WHEN I use different map themes THEN multi-line component names SHALL render with appropriate colors and fonts for each theme
2. WHEN I change map styling options THEN multi-line component names SHALL adapt their appearance accordingly
3. WHEN I use evolved components with multi-line names THEN the system SHALL apply evolved styling to all lines of text
4. WHEN I print or export maps with multi-line component names THEN the system SHALL maintain proper formatting and readability

### Requirement 10

**User Story:** As a map creator, I want validation and error handling for multi-line component names, so that I receive clear feedback when syntax errors occur.

#### Acceptance Criteria

1. WHEN I create malformed multi-line component syntax THEN the system SHALL provide clear error messages indicating the issue
2. WHEN I use invalid escape sequences in component names THEN the system SHALL either correct them automatically or show validation errors
3. WHEN I attempt to save component names with problematic characters THEN the system SHALL validate the content and provide feedback
4. WHEN parsing fails for multi-line component names THEN the system SHALL gracefully degrade and show the raw text rather than breaking the map
