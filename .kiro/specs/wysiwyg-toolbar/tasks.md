# Implementation Plan

- [x]   1. Create core toolbar infrastructure and types

    - Create TypeScript interfaces for ToolbarItem and toolbar configuration
    - Define toolbar constants with all map component types and their templates
    - Set up basic component structure for WysiwygToolbar
    - _Requirements: 1.2, 5.1, 5.3_

- [x]   2. Implement ToolbarItem component with visual states

    - Create ToolbarItem component with icon rendering and click handling
    - Implement visual states (normal, hover, selected) with MIRO-style styling
    - Add proper accessibility attributes and keyboard navigation support
    - Write unit tests for ToolbarItem component behavior
    - _Requirements: 2.1, 2.2, 2.4_

- [x]   3. Build main WysiwygToolbar component with selection logic

    - Implement WysiwygToolbar component with vertical layout and MIRO-style positioning
    - Add item selection state management and click event handling
    - Integrate all toolbar items from configuration with proper spacing and grouping
    - Write unit tests for toolbar selection and state management
    - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3_

- [x]   4. Create DragPreview component for visual feedback

    - Implement DragPreview component that follows mouse cursor during drag operations
    - Add visual indicators for valid/invalid drop zones with appropriate styling
    - Implement ghost preview rendering of selected component at mouse position
    - Write unit tests for drag preview positioning and visual states
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x]   5. Enhance UnifiedMapCanvas with drag and drop support

    - Modify UnifiedMapCanvas to accept selectedToolbarItem prop and handle drop events
    - Implement mouse move event handling for drag preview positioning
    - Add coordinate conversion from screen position to map coordinates using PositionCalculator
    - Implement click handling for component placement when toolbar item is selected
    - _Requirements: 3.1, 3.2, 3.3_

- [x]   6. Integrate toolbar with MapView and coordinate conversion

    - Modify MapView to include WysiwygToolbar component with proper positioning
    - Implement state management for selected toolbar item in MapView
    - Connect toolbar selection with UnifiedMapCanvas drag and drop functionality
    - Add coordinate validation to ensure components are placed within valid map boundaries
    - _Requirements: 1.4, 3.1, 3.2, 6.1, 6.3_

- [x]   7. Implement map text generation and mutation

    - Create component placement logic that generates appropriate map text syntax
    - Implement automatic map text updates when components are placed via toolbar
    - Add default naming logic for new components with incremental numbering
    - Ensure proper map text formatting and line structure maintenance
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.3_

- [x]   8. Add comprehensive error handling and validation

    - Implement validation for drop zones and coordinate boundaries
    - Add error handling for coordinate conversion failures with fallback positioning
    - Create error handling for map text mutation failures with user feedback
    - Add template generation validation with sensible defaults
    - _Requirements: 3.4, 4.1, 4.2_

- [x]   9. Ensure compatibility with existing map functionality

    - Test and ensure toolbar works alongside existing QuickAdd functionality
    - Verify toolbar doesn't interfere with map interactions (zoom, pan, select)
    - Implement proper state synchronization between toolbar and text editing
    - Add support for all existing editing capabilities on toolbar-placed components
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x]   10. Create missing toolbar icons and complete visual integration

    - Create missing icon components (PipelineIcon, AnchorIcon) following existing icon patterns
    - Implement consistent styling across all map themes (wardley, colour, plain, handwritten, dark)
    - Add responsive behavior and proper positioning relative to map canvas
    - Ensure toolbar maintains fixed position during map zoom and pan operations
    - _Requirements: 1.1, 1.3, 1.4, 5.1, 5.2_

- [x]   11. Write comprehensive integration tests

    - Create integration tests for toolbar-to-canvas drag and drop workflow
    - Test coordinate conversion accuracy across different map sizes and zoom levels
    - Verify map text generation and mutation for all component types
    - Test interaction between toolbar and existing map functionality
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 6.1, 6.2_

- [-] 12. Add accessibility features and keyboard support

    - Implement keyboard navigation for toolbar items with proper focus management
    - Add screen reader support with appropriate ARIA labels and descriptions
    - Ensure high contrast mode compatibility and proper color contrast ratios
    - Test and optimize for touch device interactions and mobile responsiveness
    - _Requirements: 2.4, 7.1, 7.2_

- [x]   13. Implement component linking functionality

    - Create LinkIcon component showing two circles connected by a line
    - Add linking tool to toolbar configuration with toolType: 'linking'
    - Implement magnetic component detection logic to highlight nearest components
    - Create LinkingPreview component to show preview line during linking process
    - _Requirements: 8.1, 8.2, 8.4_

- [x]   14. Build component linking interaction workflow

    - Implement two-click linking process with source and target selection
    - Add visual feedback for selected source component during linking
    - Create link validation logic to prevent duplicate links
    - Generate appropriate DSL syntax 'source->target' when linking is completed
    - _Requirements: 8.3, 8.5, 8.6, 8.7_

- [x]   15. Add linking cancellation and error handling

    - Implement click-elsewhere cancellation during linking process
    - Add visual feedback when attempting to create duplicate links
    - Handle edge cases where components are deleted during linking
    - Ensure proper state cleanup when linking is cancelled or completed
    - _Requirements: 8.8, 8.7_

- [x]   16. Create PST dropdown and selection system

    - Create ToolbarDropdown component for PST type selection
    - Implement PSTIcon component for the main toolbar button
    - Add PST tool configuration with three sub-items (Pioneers, Settlers, Town Planners)
    - Implement dropdown positioning and interaction logic
    - _Requirements: 9.1, 9.2_

- [x]   17. Implement PST box drawing functionality

    - Create DrawingPreview component for rectangle drawing feedback
    - Implement click-and-drag drawing interaction with crosshair cursor
    - Add real-time preview rectangle that follows mouse during drag
    - Apply distinct color coding for each PST type during drawing
    - _Requirements: 9.3, 9.4, 9.6, 9.7, 9.8_

- [x]   18. Complete PST box creation and map text generation

    - Implement PST box completion logic when mouse is released after drag
    - Generate appropriate PST syntax for map text based on selected type
    - Add validation for minimum box size and boundary constraints
    - Ensure proper coordinate ordering (top-left to bottom-right) in generated syntax
    - _Requirements: 9.5, 9.9_

- [ ]   19. Enhance UnifiedMapCanvas for new tool types

    - Modify UnifiedMapCanvas to handle linking, drawing, and placement tool types
    - Implement component proximity detection for magnetic linking effects
    - Add mouse event handling for PST box drawing interactions
    - Create unified tool state management system for all three tool types
    - _Requirements: 8.2, 8.5, 9.3, 9.4_

- [x]   20. Implement keyboard shortcuts for toolbar items

    - Create KeyboardShortcutHandler component to manage keyboard event listeners
    - Add keyboard shortcut properties to ToolbarItem interface and configuration
    - Implement keyboard shortcut mapping (C for Component, L for Link, N for Note, P for Pipeline, A for Anchor, M for Method, T for PST)
    - Add Escape key handling to deselect current toolbar item
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [x]   21. Integrate keyboard shortcuts with toolbar selection system

    - Connect KeyboardShortcutHandler with WysiwygToolbar component
    - Implement visual feedback for keyboard-selected tools matching mouse selection
    - Add logic to prevent keyboard shortcuts from interfering with text editing contexts
    - Ensure keyboard shortcuts work alongside existing mouse-based tool selection
    - _Requirements: 10.9, 10.10, 10.11, 10.12_

- [x]   22. Add keyboard shortcut visual indicators and accessibility

    - Display keyboard shortcuts in toolbar item tooltips
    - Add visual indicators showing which key corresponds to each tool
    - Implement screen reader announcements for keyboard shortcut activation
    - Ensure keyboard shortcuts work with high contrast and accessibility modes
    - _Requirements: 10.9, 10.11_

- [x]   23. Implement method application toolbar tools

    - Create BuildIcon, BuyIcon, and OutsourceIcon components for method tools
    - Add method application tools (build, buy, outsource) to toolbar configuration
    - Implement method-application toolType handling in toolbar selection logic
    - Add keyboard shortcuts (B for build, U for buy, O for outsource) for method tools
    - _Requirements: 11.1_

- [x]   24. Add component highlighting for method application

    - Implement component hover detection and highlighting during method application mode
    - Add visual feedback to indicate which components can receive method decorators
    - Create component validation logic to determine method compatibility
    - Ensure highlighting works consistently across all map themes
    - _Requirements: 11.2_

- [ ]   25. Implement method application click handling

    - Add component click detection when in method application mode
    - Implement method decorator application logic to update component DSL
    - Create map text mutation logic to replace existing methods or add new ones
    - Add automatic tool deselection after successful method application
    - _Requirements: 11.3, 11.4, 11.5, 11.6_

- [ ]   26. Add method application cancellation and error handling

    - Implement click-elsewhere cancellation during method application mode
    - Add error handling for invalid component types or parsing failures
    - Create user feedback for failed method applications
    - Ensure proper map re-rendering after method changes
    - _Requirements: 11.7, 11.8_

- [ ]   27. Write comprehensive tests for new functionality
    - Create unit tests for LinkingPreview, DrawingPreview, ToolbarDropdown, and KeyboardShortcutHandler components
    - Write integration tests for component linking workflow end-to-end
    - Add integration tests for PST box drawing and map text generation
    - Test keyboard shortcut integration and conflict prevention
    - Test magnetic component detection and highlighting accuracy
    - Add unit and integration tests for method application functionality
    - Test method decorator replacement and map text mutation accuracy
    - _Requirements: 8.1-8.8, 9.1-9.9, 10.1-10.12, 11.1-11.8_
