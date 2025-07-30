# Implementation Plan

- [-] 1. Create core undo/redo data structures and types
  - Define HistoryEntry interface and ActionType enum in types directory
  - Create configuration constants for history limits and debouncing
  - Define UndoRedoContextValue and related interfaces
  - Write utility functions for generating action descriptions
  - _Requirements: 1.1, 8.1, 8.4_

- [ ] 2. Implement useUndoRedoManager hook with history stack logic
  - Create useUndoRedoManager hook with undo/redo stack management
  - Implement debounced change recording with grouping logic
  - Add history size limit enforcement and cleanup mechanisms
  - Create undo/redo operation functions with state validation
  - Write unit tests for hook functionality and edge cases
  - _Requirements: 4.1, 4.2, 4.5, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 8.1, 8.2_

- [ ] 3. Create UndoRedoProvider context component
  - Implement UndoRedoProvider component using useUndoRedoManager hook
  - Create context provider with proper state management and memoization
  - Add error handling for invalid states and memory constraints
  - Implement clearHistory and utility methods for external access
  - Write unit tests for provider functionality and context propagation
  - _Requirements: 4.3, 4.4, 8.3, 8.5_

- [ ] 4. Create undo and redo toolbar icons
  - Design UndoIcon and RedoIcon components following existing icon patterns
  - Implement proper SVG icons with accessibility attributes
  - Add visual states for enabled/disabled conditions
  - Ensure icons work across all map themes and high contrast modes
  - Write unit tests for icon rendering and visual states
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5. Extend toolbar configuration with undo/redo items
  - Add undo and redo items to TOOLBAR_ITEMS configuration
  - Implement new 'action' category and 'action' toolType
  - Add keyboard shortcut definitions for platform-specific handling
  - Update getToolbarItemById function to handle action items
  - Write unit tests for toolbar configuration changes
  - _Requirements: 1.1, 7.1, 7.2_

- [ ] 6. Enhance WysiwygToolbar with undo/redo functionality
  - Integrate UndoRedoProvider context into WysiwygToolbar component
  - Add undo/redo toolbar items with proper positioning and styling
  - Implement click handlers that delegate to context undo/redo functions
  - Add tooltips showing last/next action descriptions
  - Write unit tests for toolbar integration and user interactions
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.1, 9.2, 9.3, 9.4_

- [ ] 7. Enhance KeyboardShortcutHandler with undo/redo shortcuts
  - Add platform detection for Ctrl vs Cmd key combinations
  - Implement Ctrl+Z/Cmd+Z for undo and Ctrl+Y/Cmd+Shift+Z for redo
  - Add logic to prevent interference with text editor undo/redo
  - Ensure keyboard shortcuts work alongside existing toolbar shortcuts
  - Write unit tests for keyboard shortcut handling and platform detection
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8. Enhance MapEnvironment with undo/redo integration
  - Wrap MapEnvironment with UndoRedoProvider at the appropriate level
  - Enhance mutateMapText function to record history before applying changes
  - Add action type and description parameters to mutateMapText calls
  - Implement logic to prevent recursive history recording during undo/redo
  - Write unit tests for MapEnvironment integration and mutateMapText enhancement
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 8.5_

- [ ] 9. Add action tracking to toolbar operations
  - Modify toolbar component placement to include action type and description
  - Update linking operations to record appropriate history entries
  - Add tracking for PST box drawing with descriptive action names
  - Implement method application tracking with component and method details
  - Write unit tests for toolbar operation tracking accuracy
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 10. Add action tracking to canvas operations
  - Modify component movement logic to record canvas-move actions
  - Update double-click rename functionality to record canvas-rename actions
  - Add tracking for component deletion operations
  - Implement grouping for related canvas operations when appropriate
  - Write unit tests for canvas operation tracking and grouping
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 11. Implement change grouping and debouncing logic
  - Add debouncing to prevent excessive history entries during rapid changes
  - Implement grouping logic for related operations using groupId
  - Create timeout-based grouping for sequential operations of the same type
  - Add logic to handle group boundaries when switching operation types
  - Write unit tests for debouncing and grouping behavior
  - _Requirements: 4.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 12. Add comprehensive error handling and validation
  - Implement validation for map text states before recording history
  - Add error handling for memory constraints and storage quota issues
  - Create fallback recovery mechanisms for corrupted history data
  - Implement concurrent modification detection and conflict resolution
  - Write unit tests for error scenarios and recovery mechanisms
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [ ] 13. Add visual feedback and user experience enhancements
  - Implement tooltip system showing action descriptions for undo/redo buttons
  - Add brief visual feedback animations for undo/redo operations
  - Create loading states for operations that might take time
  - Implement proper focus management during undo/redo operations
  - Write unit tests for visual feedback and user experience features
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 14. Implement accessibility features
  - Add screen reader announcements for undo/redo operations
  - Implement proper ARIA labels and descriptions for toolbar items
  - Add keyboard shortcut documentation and help text
  - Ensure high contrast mode support for all visual elements
  - Write accessibility tests and screen reader compatibility tests
  - _Requirements: 7.5, 9.1, 9.2, 9.3, 9.4_

- [ ] 15. Add memory optimization and performance improvements
  - Implement efficient data structures for history storage
  - Add memory usage monitoring and cleanup mechanisms
  - Optimize React component rendering during undo/redo operations
  - Implement lazy loading for large history entries when needed
  - Write performance tests and memory usage benchmarks
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 16. Write comprehensive integration tests
  - Create end-to-end tests for complete undo/redo workflows
  - Test integration with existing toolbar functionality
  - Verify canvas operation tracking and undo/redo accuracy
  - Test keyboard shortcut integration and conflict prevention
  - Write tests for multi-step operation scenarios and edge cases
  - _Requirements: 2.1-2.6, 3.1-3.5, 4.1-4.5, 5.1-5.6, 6.1-6.6, 7.1-7.5_

- [ ] 17. Add browser compatibility and platform testing
  - Test keyboard shortcut handling across different browsers
  - Verify localStorage functionality and quota handling
  - Test platform-specific keyboard combinations (Ctrl vs Cmd)
  - Ensure proper behavior with browser default undo/redo prevention
  - Write cross-browser compatibility tests
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.5_

- [ ] 18. Implement user preferences and configuration
  - Add user preferences for history size limits and debouncing settings
  - Implement localStorage persistence for user configuration
  - Create settings UI for undo/redo preferences (optional)
  - Add configuration validation and fallback to defaults
  - Write tests for user preference handling and persistence
  - _Requirements: 8.1, 8.2, 8.4_

- [ ] 19. Add documentation and help system
  - Create user documentation for undo/redo functionality
  - Add inline help text and tooltips for keyboard shortcuts
  - Implement contextual help for undo/redo operations
  - Create developer documentation for extending the system
  - Write documentation tests to ensure accuracy
  - _Requirements: 7.1, 7.2, 9.1, 9.2, 9.3, 9.4_

- [ ] 20. Final integration and testing
  - Integrate all components into the main application
  - Perform comprehensive testing across all supported browsers
  - Test interaction with existing features like map iterations and saving
  - Verify performance under heavy usage scenarios
  - Conduct user acceptance testing and gather feedback
  - _Requirements: 1.1-1.5, 2.1-2.6, 3.1-3.5, 4.1-4.5, 5.1-5.6, 6.1-6.6, 7.1-7.5, 8.1-8.5, 9.1-9.5, 10.1-10.5_