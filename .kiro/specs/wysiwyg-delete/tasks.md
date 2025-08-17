# Implementation Plan

- [x] 1. Create component selection infrastructure
  - Implement MapComponentSelector service for tracking selected components
  - Create selection state management with single component selection
  - Add component selection methods (select, deselect, clear)
  - _Requirements: 3.2_

- [x] 2. Implement visual selection feedback
  - Add selection styling to map components when selected
  - Create hover indicators for deletable components
  - Implement smooth visual transitions for selection state changes
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 3. Extend KeyboardShortcutHandler for deletion
  - Add Delete and Backspace key handling to existing KeyboardShortcutHandler
  - Integrate with component selection to identify target for deletion
  - Ensure keyboard shortcuts only work when components are selected
  - Prevent deletion when text editing contexts are active
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 4. Create MapComponentDeleter service
  - Implement core deletion logic for removing components from mapText
  - Add support for PST box deletion using existing pstMapTextMutation utilities
  - Create component identification and line finding logic
  - Add basic validation to ensure components can be deleted
  - _Requirements: 5.1, 6.1_

- [x] 5. Integrate deletion with undo/redo system
  - Connect MapComponentDeleter with existing UndoRedoProvider
  - Record deletion operations with 'canvas-delete' action type
  - Ensure deleted components can be restored via undo
  - Test undo/redo functionality with deletion operations
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Implement context menu deletion
  - Create context menu provider for right-click interactions
  - Add delete option to context menu when component is selected
  - Handle context menu positioning and lifecycle
  - Integrate context menu deletion with MapComponentDeleter service
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 7. Add support for regular map components
  - Extend deletion logic to handle regular components (not just PST boxes)
  - Implement component line identification and mapText updating
  - Add component type detection for proper deletion handling
  - Test deletion of components with different syntax patterns
  - _Requirements: 5.3, 6.1_

- [ ] 8. Add support for market components
  - Implement market component deletion logic
  - Add market component identification in mapText
  - Create market-specific mapText updating logic
  - Test market component deletion and undo functionality
  - _Requirements: 5.2, 6.1_

- [ ] 9. Handle component relationships during deletion
  - Implement logic to maintain map integrity when deleting components
  - Handle components that may affect other map elements
  - Ensure mapText consistency after component removal
  - Add validation for deletion operations that could break map structure
  - _Requirements: 5.4, 6.3_

- [ ] 10. Implement batch mapText updates
  - Optimize mapText updates to handle single deletion operations efficiently
  - Ensure proper change event triggering after deletion
  - Add error handling for mapText parsing and updating
  - Test mapText consistency after various deletion scenarios
  - _Requirements: 6.1, 6.4_

- [ ] 11. Add comprehensive error handling
  - Implement error handling for component identification failures
  - Add graceful handling of malformed mapText during deletion
  - Create user feedback for failed deletion attempts
  - Add logging and debugging support for deletion operations
  - _Requirements: 3.3_

- [ ] 12. Create comprehensive test suite
  - Write unit tests for MapComponentSelector service
  - Create unit tests for MapComponentDeleter service
  - Add integration tests for keyboard shortcut deletion
  - Test context menu deletion functionality
  - Write tests for undo/redo integration with deletion
  - Add tests for different component types (PST, component, market)
  - Create edge case tests (no selection, invalid components)
  - _Requirements: All requirements_

- [ ] 13. Integrate with existing map components
  - Update PSTBox component to support selection and deletion
  - Modify MapComponent to handle selection state
  - Ensure all map component types can be selected and deleted
  - Test integration with existing map interaction patterns
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.2_

- [ ] 14. Add accessibility support
  - Implement keyboard navigation for component selection
  - Add screen reader announcements for selection and deletion
  - Ensure proper focus management after deletion operations
  - Test accessibility with keyboard-only navigation
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 15. Optimize performance and polish
  - Optimize selection state updates to minimize re-rendering
  - Ensure smooth visual transitions during deletion
  - Add performance monitoring for deletion operations
  - Polish visual feedback and interaction patterns
  - Test performance with large maps containing many components
  - _Requirements: 3.4_
