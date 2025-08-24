# OnlineWardleyMaps Frontend Refactoring Implementation Plan

## Overview

This plan targets the largest and most complex files in the OnlineWardleyMaps TypeScript frontend, focusing on reducing complexity while maintaining functionality. The approach follows established code conventions emphasizing simplicity, single responsibility principle, and avoiding overengineering.

## Code Conventions Compliance

**Core Principles from .kiro/steering/code-conventions.md:**
- ✅ Implement the simplest thing that can make it work
- ✅ Avoid overengineering or over-complicating the implementation
- ✅ Avoid large implementation and use single responsibility principle to decompose
- ✅ Upon completion of each task, commit the changes using git
- ✅ Avoid comments, the code should explain itself
- ✅ Avoid over testing. Favour fewer, stronger, outside in tests
- ✅ When bug fixing, commit often and seek feedback on the fix

## Current Complexity Analysis

### Top 5 Target Files for Refactoring:

1. **UnifiedMapCanvas.tsx** - 1,021 lines
   - Complex pan/zoom state management
   - PST element interactions (resize, drag, hover)
   - Event coordination and delegation
   - Multiple state variables for different interaction modes

2. **WysiwygToolbar.tsx** - 850 lines
   - Toolbar positioning and drag functionality
   - Complex styled components with responsive behavior
   - Multiple interaction states and keyboard handling
   - Undo/redo integration

3. **MapEnvironment.tsx** - 797 lines
   - Multiple concerns: persistence, dimensions, parsing, layout
   - 20+ useState hooks with complex dependencies
   - Large useEffect blocks with resize handling
   - Mixed UI and business logic

4. **ContextMenuProvider.tsx** - 776 lines
   - Context menu state management
   - Dynamic menu generation based on context
   - Complex positioning calculations
   - Action handling and business logic

5. **UnifiedMapContent.tsx** - 627 lines
   - 25+ props interface
   - Multiple map element type rendering
   - Repetitive conditional rendering patterns
   - Tight coupling between element types

## Implementation Strategy

### Phase 1: Planning and Analysis ⏳
- [x] Analyze complexity metrics for top 5 largest files
- [ ] Document current behavior and create initial tests before refactoring

### Phase 2: MapEnvironment.tsx Refactoring (797 → <200 lines)
**Target: Break into 4-5 focused modules**

1. **Extract useMapPersistence hook**
   - Save/load operations
   - Map iterations management
   - URL state management
   - beforeunload handling

2. **Extract useMapDimensions hook**
   - Canvas sizing calculations (getHeight, getWidth)
   - Resize event handling with debouncing
   - Panel resize coordination
   - Dimension state management

3. **Extract useMapParsing hook**
   - Map text parsing with UnifiedConverter
   - Error handling and validation
   - Style application logic
   - Evolution states management

4. **Extract MapLayout component**
   - Layout structure (header, breadcrumb, iterations)
   - Navigation visibility management
   - Split pane configuration
   - Dialog rendering

### Phase 3: UnifiedMapCanvas.tsx Refactoring (1,021 → <400 lines)
**Target: Break into 3-4 focused modules**

1. **Extract usePSTInteractions hook**
   - PST resize state (hovering, resizing, handles)
   - PST drag state (dragging, preview bounds)
   - Keyboard modifiers handling
   - Constraint calculations

2. **Extract useCanvasState hook**
   - Pan/zoom value management
   - Scale factor tracking
   - Mouse position tracking
   - Tool state management

3. **Extract CanvasEventCoordinator component**
   - Click event handling
   - Element interaction coordination
   - Event delegation patterns
   - Debug position tracking

### Phase 4: WysiwygToolbar.tsx Refactoring (850 → <300 lines)
**Target: Break into 3-4 focused modules**

1. **Extract useToolbarState hook**
   - Position management (x, y coordinates)
   - Dragging state and constraints
   - Visibility and hover states
   - Local storage persistence

2. **Extract ToolbarItems component**
   - Item rendering and grouping
   - Separator management
   - Responsive behavior
   - Accessibility support

3. **Extract ToolbarPositioning service**
   - Drag event handlers
   - Position calculations
   - Constraint enforcement
   - Default position reset

### Phase 5: UnifiedMapContent.tsx Refactoring (627 → <300 lines)
**Target: Break into specialized renderers**

1. **Extract ElementRenderers**
   - ComponentRenderer (anchors, components, symbols)
   - LinkRenderer (links, evolving links, fluid links)
   - PSTRenderer (PST boxes and interactions)
   - AnnotationRenderer (notes, annotations, methods)

2. **Extract ElementGrouping component**
   - Group related elements by type
   - Optimize rendering order
   - Shared element processing

3. **Simplify props interface**
   - Consolidate related props into configuration objects
   - Use composition pattern for optional features
   - Reduce prop drilling

### Phase 6: ContextMenuProvider.tsx Refactoring (776 → <300 lines)
**Target: Break into state, actions, and UI**

1. **Extract useContextMenuState hook**
   - Menu visibility and positioning
   - Item states and availability
   - Context detection logic

2. **Extract MenuActions service**
   - Action handlers (edit, delete, clone, etc.)
   - Business logic separation
   - Framework-agnostic implementation

3. **Extract MenuItems component**
   - Dynamic menu generation
   - Item rendering and styling
   - Keyboard navigation

## Implementation Guidelines

### Commit Strategy
- **Small, atomic commits** after each extraction
- **Test before and after** each refactoring step
- **Build verification** after each major change
- **Descriptive commit messages** explaining the refactoring step

### Testing Approach
- Maintain existing test coverage during refactoring
- Add tests for extracted hooks and services
- Focus on integration tests over unit tests
- Manual testing of critical user workflows

### File Organization
```
src/components/map/
├── hooks/
│   ├── useMapPersistence.ts
│   ├── useMapDimensions.ts
│   ├── useMapParsing.ts
│   ├── usePSTInteractions.ts
│   ├── useCanvasState.ts
│   └── useToolbarState.ts
├── components/
│   ├── MapLayout.tsx
│   ├── CanvasEventCoordinator.tsx
│   ├── ToolbarItems.tsx
│   ├── ElementRenderers.tsx
│   └── MenuItems.tsx
├── services/
│   ├── ToolbarPositioning.ts
│   └── MenuActions.ts
└── [refactored core files]
```

### Success Criteria
- **File sizes**: All target files under 400 lines (stretch goal: under 300)
- **Functionality**: No regressions in existing features
- **Performance**: No degradation in map rendering or interactions
- **Maintainability**: Clear separation of concerns and single responsibility
- **Testability**: Improved test coverage for extracted modules

### Risk Mitigation
- **Feature branches** for each major refactoring
- **Regular integration** with main branch
- **Rollback plan** using git history
- **Progressive enhancement** rather than big-bang changes

## Execution Commands

```bash
# Navigate to frontend directory
cd frontend

# Run tests before refactoring
yarn test

# Build verification
yarn build

# Start development server for manual testing
yarn dev

# After each refactoring step
git add .
git commit -m "refactor: extract [component/hook name] from [source file]"

# Final verification
yarn test
yarn build
```

## Expected Outcomes

1. **Reduced Complexity**: Each file focused on a single responsibility
2. **Improved Maintainability**: Easier to understand and modify
3. **Better Testability**: Isolated units for focused testing
4. **Enhanced Reusability**: Extracted hooks can be reused across components
5. **Clearer Architecture**: Service-oriented design with clear boundaries

This refactoring will transform the codebase from large, monolithic components to a well-structured, maintainable architecture while preserving all existing functionality.