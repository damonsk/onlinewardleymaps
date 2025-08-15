# Implementation Plan

- [x] 1. Create PST data models and type definitions
  - Define PSTElement, PSTCoordinates, PSTBounds, and ResizeHandle interfaces in types folder
  - Create PST_CONFIG constant with color and constraint definitions for each PST type
  - Add PST-related props to UnifiedMapContent interface
  - Write unit tests for type definitions and configuration constants
  - _Requirements: 5.1, 5.3_

- [x] 2. Implement coordinate conversion utilities for PST elements
  - Create utility functions to convert between map coordinates (0-1) and SVG coordinates
  - Implement bounds calculation functions for PST boxes from coordinates
  - Add coordinate validation and constraint checking functions
  - Write unit tests for coordinate conversion accuracy and edge cases
  - _Requirements: 2.5, 4.4_

- [x] 3. Create ResizeHandles component with drag interaction
  - Implement ResizeHandles component with 8 handles (4 corners + 4 edges)
  - Add mouse event handling for drag start, move, and end operations
  - Implement appropriate cursor styling for each resize handle direction
  - Add handle scaling based on map zoom level and accessibility sizing
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 8.1, 8.2_

- [x] 4. Build ResizePreview component for visual feedback
  - Create ResizePreview component showing semi-transparent preview during resize
  - Implement real-time preview updates following mouse cursor
  - Add visual feedback for constraint violations and invalid sizes
  - Apply appropriate PST type styling and color coding to preview
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5. Implement PSTBox component with hover detection
  - Create PSTBox component that renders individual PST elements as rectangles
  - Add hover state management to show/hide resize handles
  - Implement mouse enter/leave event handling with proper timing
  - Apply PST type-specific styling (colors, labels) consistently
  - _Requirements: 1.1, 1.2, 1.4, 5.1, 5.3_

- [x] 6. Integrate resize handles with PSTBox component
  - Connect ResizeHandles component to PSTBox with proper event handling
  - Implement resize operation state management (idle, resizing, preview)
  - Add resize constraint validation and enforcement during drag operations
  - Ensure resize handles are properly positioned relative to PST box bounds
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 7. Add PST element parsing and identification to map processing
  - Modify MapElements class to include PST elements from attitudes array
  - Create PST element identification and extraction logic
  - Add PST element rendering integration with existing map element system
  - Ensure PST elements are properly included in unified component processing
  - _Requirements: 5.1, 5.2_

- [x] 8. Enhance UnifiedMapContent to render PST elements with resize capability
  - Modify UnifiedMapContent to render PST elements using PSTBox component
  - Add hover state management for PST elements at the map level
  - Implement mouse event delegation for PST hover detection
  - Integrate PST rendering with existing map element rendering pipeline
  - _Requirements: 1.1, 1.2, 5.1, 5.2_

- [x] 9. Implement resize operation state management
  - Add resize state management to UnifiedMapCanvas component
  - Implement resize start, move, and end event handlers
  - Create resize operation coordination between PSTBox and parent components
  - Add proper cleanup and state reset when resize operations complete
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 10. Add map text mutation for PST resize operations
  - Implement map text update logic when PST elements are resized
  - Create PST syntax generation functions for updated coordinates
  - Add line-specific map text replacement for individual PST elements
  - Ensure proper map text formatting and syntax validation after updates
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 11. Implement keyboard modifier support for resize operations
  - Add Shift key support for maintaining aspect ratio during resize
  - Implement Alt key support for resizing from center point
  - Add Escape key handling to cancel resize operations and revert changes
  - Provide visual feedback indicating active keyboard modifier modes
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 12. Add resize constraint validation and enforcement
  - Implement minimum size constraints (50x30 pixels) for all PST types
  - Add boundary validation to prevent resizing outside map area
  - Create constraint violation visual feedback and snapping behavior
  - Ensure consistent constraint enforcement across all PST types
  - _Requirements: 2.5, 4.3, 4.4, 5.2_

- [ ] 13. Integrate resize functionality with existing map interactions
  - Ensure resize operations don't interfere with map pan and zoom
  - Add proper tool state management when switching between resize and other tools
  - Implement compatibility with existing undo/redo functionality
  - Test interaction with other map elements and editing features
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 14. Add accessibility features for resize functionality
  - Implement keyboard navigation for selecting PST elements
  - Add ARIA labels and screen reader support for resize handles
  - Create keyboard-based resize operations as alternative to mouse dragging
  - Ensure high contrast mode compatibility and proper color contrast
  - _Requirements: 8.3, 8.4_

- [ ] 15. Implement touch device support for resize operations
  - Add touch event handling for mobile and tablet devices
  - Implement appropriately sized resize handles for finger interaction
  - Create touch-friendly drag operations with proper gesture recognition
  - Test resize functionality across different touch device screen sizes
  - _Requirements: 8.1, 8.2_

- [ ] 16. Add error handling and recovery mechanisms
  - Implement error handling for coordinate conversion failures
  - Add rollback mechanism for failed map text mutations
  - Create user feedback for resize operation errors
  - Implement conflict resolution for concurrent editing scenarios
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 17. Optimize performance for multiple PST elements
  - Implement efficient rendering for maps with many PST elements
  - Add debouncing for mouse move events during resize operations
  - Optimize coordinate conversion calculations for better performance
  - Use React.memo and useCallback to minimize unnecessary re-renders
  - _Requirements: 6.1, 6.3_

- [ ] 18. Create comprehensive unit tests for resize components
  - Write unit tests for PSTBox component rendering and interaction
  - Test ResizeHandles component drag operations and event handling
  - Add unit tests for ResizePreview component visual feedback
  - Test coordinate conversion utilities and constraint validation functions
  - _Requirements: 1.1-1.4, 2.1-2.5, 4.1-4.4, 5.1-5.4_

- [ ] 19. Write integration tests for end-to-end resize workflow
  - Create integration tests for complete resize operation from hover to map text update
  - Test resize functionality integration with existing map features
  - Add tests for keyboard modifier interactions and constraint enforcement
  - Test error handling and recovery scenarios in integrated environment
  - _Requirements: 3.1-3.4, 6.1-6.4, 7.1-7.4_

- [ ] 20. Add visual regression tests and cross-browser compatibility
  - Create visual regression tests for resize handle appearance across themes
  - Test resize functionality across different browsers and devices
  - Add responsive behavior testing at various screen sizes and zoom levels
  - Ensure consistent styling and behavior across all supported platforms
  - _Requirements: 8.1-8.4_
