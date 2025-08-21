# Implementation Plan

- [x] 1. Extend context menu system for component interactions - [COMPLETED]
  - Enhance existing ContextMenu component to support component-specific menu items
  - Add right-click detection for map components with proper event handling
  - Create menu item definitions for edit, inertia toggle, and evolve actions
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 1.1 Enhance ContextMenuProvider for component detection - [COMPLETED]
  - Extend ContextMenuProvider to detect right-clicks on components vs other map elements
  - Add component type identification (regular component vs evolved component)
  - Implement component property extraction (name, inertia state, evolution state)
  - Add event delegation to handle right-clicks on dynamically rendered components
  - _Requirements: 1.1, 1.3_

- [x] 1.2 Create component-specific context menu items - [COMPLETED]
  - Define ContextMenuItemDefinition interface with conditional visibility/enabled logic
  - Implement "Edit Component" menu item that triggers inline editing equivalent to double-click
  - Create "Add/Remove Inertia" toggle menu item that uses existing toolbar inertia logic
  - Add "Evolve Component" menu item for non-evolved components only
  - Create "Delete Component" menu item with destructive styling
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 5.3_

- [x] 1.3 Integrate context menu actions with existing systems - [COMPLETED]
  - Connect "Edit Component" action to existing InlineEditor component activation
  - Wire "Toggle Inertia" action to existing toolbar inertia method application logic
  - Implement context menu positioning to avoid viewport edge overflow (basic implementation)
  - Add proper cleanup and state management for menu lifecycle
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [ ] 2. Implement component evolution functionality through context menu
  - Create ComponentEvolutionManager service for automated evolution workflows
  - Add evolution positioning logic based on current maturity stage
  - Generate proper evolve syntax and update map text accordingly
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 2.1 Create ComponentEvolutionManager service
  - Implement service class with methods for evolution position calculation
  - Add logic to determine next evolution stage (Genesis→Custom→Product→Commodity)
  - Create positioning algorithm for lateral evolution in commodity stage (slight right movement)
  - Implement positioning algorithm for stage-based evolution (move to next stage X position)
  - Add evolved component name generation (default to source name + " Evolved")
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 2.2 Implement map text generation for evolution
  - Create function to generate "evolve SourceName->EvolvedName maturity" syntax
  - Integrate with existing map text update mechanisms
  - Add validation to ensure source component exists before creating evolution
  - Implement proper line insertion in map text for new evolve statements
  - _Requirements: 3.4, 3.5, 3.6_

- [ ] 2.3 Add evolution positioning and visual feedback
  - Calculate target position based on source component maturity and evolution stage
  - Add visual preview of where evolved component will be positioned
  - Implement smooth visual transition for newly created evolved components
  - Add error handling for invalid evolution attempts (evolved components cannot be evolved)
  - _Requirements: 3.2, 3.3, 3.4, 3.6_

- [ ] 3. Enable inline editing for evolved components
  - Extend existing InlineEditor to support evolved component name editing
  - Handle double-click detection on evolved components
  - Update evolve syntax in map text when evolved component names change
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 3.1 Extend InlineEditor for evolved components
  - Add detection for evolved components in double-click handler
  - Extract current evolved component name from map text for editing
  - Implement validation that evolved component names don't conflict with existing components
  - Add special handling for evolved component display during editing
  - _Requirements: 4.1, 4.2_

- [ ] 3.2 Implement evolved component syntax updates
  - Create function to find and update "evolve source->oldname position" lines in map text
  - Replace evolved component name while preserving source name and position
  - Add syntax validation for evolved component name changes
  - Handle edge cases like multi-line component names in evolved components
  - _Requirements: 4.2, 4.3_

- [ ] 4. Add unified deletion system with keyboard shortcuts
  - Create SelectionManager service to handle element selection state
  - Implement Delete key handling for selected components and evolved components
  - Extend existing MapComponentDeleter to handle evolved component deletion
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.3_

- [ ] 4.1 Create SelectionManager service
  - Implement service to track currently selected map elements (components, evolved components)
  - Add methods for selecting/deselecting elements with visual feedback
  - Create keyboard event handler for Delete key that routes to appropriate deletion logic
  - Add selection visual indicators (outline, highlight, etc.) for selected elements
  - _Requirements: 5.1, 7.1, 8.2_

- [ ] 4.2 Extend MapComponentDeleter for evolved components
  - Add support for deleting evolved components by removing both evolved component and evolve line
  - Implement logic to handle deletion of source components that have evolved components
  - Add deletion confirmation for components with dependencies (evolved versions)
  - Create proper cleanup of evolution relationships when components are deleted
  - _Requirements: 5.4, 5.5, 5.6_

- [ ] 4.3 Implement keyboard deletion workflow
  - Connect Delete key handler to SelectionManager for element type identification
  - Route component deletions through enhanced MapComponentDeleter
  - Add undo/redo support for deletion operations using existing undo system
  - Implement proper focus management after deletions (focus next selectable element)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.3_

- [ ] 5. Implement link selection and deletion functionality
  - Add click detection and selection support for component links
  - Create visual selection indicators for selected links
  - Implement link deletion through Delete key and context menu
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 5.1 Create LinkSelectionManager service
  - Implement click detection on link elements (lines, arrows) with proper hit testing
  - Add visual selection state for links (highlight, selection outline)
  - Create link identification system to map visual links to map text entries
  - Add support for selecting individual links when multiple links exist between components
  - _Requirements: 6.1, 6.2, 6.6_

- [ ] 5.2 Implement link deletion functionality
  - Create LinkDeleter service that removes link lines from map text
  - Add pattern matching to identify and remove various link syntaxes (A->B, A<->B, flows, etc.)
  - Implement proper cleanup of visual link elements after deletion
  - Add undo/redo support for link deletion operations
  - _Requirements: 6.3, 6.4, 6.5_

- [ ] 5.3 Add link context menu and keyboard support
  - Create right-click context menu specifically for selected links
  - Add "Delete Link" menu item with destructive styling
  - Integrate link deletion with Delete key handler through SelectionManager
  - Add proper selection clearing and focus management after link deletion
  - _Requirements: 6.3, 6.4, 7.1, 7.3_

- [ ] 6. Enhance visual feedback and interaction indicators
  - Add hover states for all interactive map elements
  - Implement selection indicators for components, evolved components, and links
  - Create cursor changes to indicate interactive elements and available actions
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 6.1 Implement hover states for map elements
  - Add CSS hover effects for components showing they are clickable/right-clickable
  - Create hover states for evolved components with distinct styling
  - Add link hover effects with proper hit testing for thin line elements
  - Implement cursor changes (pointer for clickable, context-menu cursor for right-clickable)
  - _Requirements: 8.1, 8.3_

- [ ] 6.2 Create selection visual indicators
  - Design selection outline/highlight styling for components and evolved components
  - Implement selection indicators for links (highlight, thicker line, etc.)
  - Add multiple selection visual feedback for bulk operations
  - Create focus indicators that work with keyboard navigation and screen readers
  - _Requirements: 8.2, 8.4_

- [ ] 6.3 Add operation feedback and loading states
  - Implement visual feedback during evolution operations (positioning preview, progress)
  - Add loading states for deletion operations that modify map text
  - Create error state visuals for failed operations with clear error messages
  - Add success feedback for completed operations (brief highlight, notification)
  - _Requirements: 8.4, 8.5_

- [ ] 7. Write comprehensive tests for all new functionality
  - Create unit tests for all new services and managers
  - Write integration tests for complete interaction workflows
  - Add E2E tests for user scenarios and edge cases
  - _Requirements: All requirements validation_

- [ ] 7.1 Write unit tests for core services
  - Test ComponentEvolutionManager with various evolution stage scenarios
  - Test SelectionManager selection state management and keyboard routing
  - Test LinkSelectionManager click detection and selection logic
  - Test context menu item generation and conditional visibility/enabled logic
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 6.1_

- [ ] 7.2 Create integration tests for context menu workflows
  - Test right-click to context menu appearance for different element types
  - Test context menu action execution (edit, inertia toggle, evolve, delete)
  - Test context menu integration with existing systems (InlineEditor, toolbar methods, MapComponentDeleter)
  - Test keyboard navigation and accessibility within context menus
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 5.1, 5.2, 5.3_

- [ ] 7.3 Write E2E tests for complete user workflows
  - Test complete component evolution workflow (right-click → evolve → positioned correctly → map text updated)
  - Test evolved component editing workflow (double-click → edit name → syntax updated)
  - Test deletion workflows (select → Delete key → component removed → map text cleaned)
  - Test link selection and deletion (click link → Delete key → link removed from map and text)
  - Test keyboard-only interaction flows for accessibility compliance
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 6.3, 6.4, 7.1, 7.3_