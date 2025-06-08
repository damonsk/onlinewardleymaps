# Bug Fix Plan for Remaining Issues

This document outlines the plan for addressing the issues listed in "things to fix.md" after the completion of Phase 4C modernization.

## Priority Issues

### 1. Method Visual Appearance Issues [FIXED]
**Problem:** Build, buy, outsource visual appearance not correct - colors
**Plan:**
- Review the current styling in ModernMethodElement component
- Check color definitions in theme constants
- Ensure correct color is applied to each method type
- Test with different method types to verify visual consistency

### 2. Buy Component DSL Rendering Issue [FIXED]
**Problem:** Using `buy component` DSL renders on the map but loses its MapComponent
**Plan:**
- Debug component extraction in MethodExtractionStrategy
- Verify component creation in ModernMapElements
- Check method decoration properties in component
- Ensure method components are properly processed in ModernUnifiedMapContent

### 3. Font Issues [FIXED]
**Problem:** Wardley font has reverted to something else
**Plan:**
- Check font definitions in CSS/styling
- Verify font loading and application
- Ensure font is properly applied to all text elements
- Check for any font overrides in component styles

### 4. React-ACE Editor Styling Issues [FIXED]
**Problem:** Mode-owm format doesn't style quoted parts in component labels and evolve statements
**Plan:**
- Review mode-owm syntax highlighting rules
- Update token patterns to recognize quoted label strings
- Add proper highlighting for evolution labels
- Test with various syntax patterns

### 5. Moveable Annotations Positioning Bug [FIXED]
**Problem:** Moveable annotations with many coordinates sets both to the same moved position
**Plan:**
- Identify which annotation is being moved
- Maintain separate position state for each annotation point
- Implement unique identifiers for each coordinate point
- Update position logic to track which point was actually moved

### 6. Evolved Component Fluid Linking Issue [FIXED]
**Problem:** Evolved component included in modkey + click fluid linking incorrectly
**Plan:**
- Add condition to check if component is evolved before allowing fluid linking
- Update mod key handler to filter out evolved components
- Add defensive check in link creation logic
- Test with various component combinations

## Secondary Issues

### 7. Method Decorator Improvement [FIXED]
**Problem:** Need explicit boolean properties for build, buy, outsource instead of strings
**Plan:**
- Update component decorator interface to use boolean flags
- Update extraction strategy to set boolean values
- Update rendering components to use boolean flags
- Maintain backward compatibility with existing maps

### 8. Broken Backgrounds [FIXED]
**Problem:** Backgrounds are broken
**Plan:**
- Investigate rendering of background elements
- Check z-order of rendering layers
- Verify background styling and positioning
- Test with different background configurations

### 9. Method Label Dragging Issues [FIXED]
**Problem:** Dragging method label seems to use increaseLabelSpacing when updating the mapText, the further away the label is moved, the updated coords are exponentially bigger, which is why we assume the multiplier of increaseLabelSpacing is causing this.
**Plan:**
- Review label movement calculation logic
- Fix position calculation to account for increaseLabelSpacing correctly
- Update position updater to handle method labels properly
- Test with various label positions

### 10. Evolved Component Dragging Update Issue [FIXED]
**Problem:** Dragging evolved components doesn't update coords properly. These only move on the maturitiy axis. 
**Plan:**
- Review position updating for evolved components
- Fix event handler for evolved component movement
- Ensure position updates are applied to both components
- Test with different evolved component configurations

## Implementation Approach

1. Create individual fix branches for each issue
2. Write tests to reproduce each issue
3. Implement fixes with proper type safety
4. Verify fixes don't create regression issues
5. Document fixes in commit messages and update documentation

## Timeline

- Priority Issues (1-6): Complete within 1 week
- Secondary Issues (7-10): Complete within 2 weeks

## Code Cleanup Plan

Now that the modernization phases are complete, there's considerable technical debt in the form of duplicate components (legacy and "Modern" versions) and transitional files. This cleanup will help reduce confusion and make bug fixing more straightforward.

> **Important:** It's recommended to perform the code cleanup BEFORE attempting to fix the remaining bugs. This will make the bugs easier to locate and fix by reducing the noise in the codebase. A detailed implementation plan is available in `CODE_CLEANUP_PLAN.md`, and a cleanup script has been created at `src/scripts/cleanup-modern-files.js`.

### 1. Component Consolidation

**Problem:** Duplicate component implementations ("Modern" versions alongside legacy versions)
**Plan:**
- Rename all "Modern" components to remove the "Modern" prefix
- Example: Change `ModernMapComponent.tsx` to `MapComponent.tsx`
- Archive legacy component files in a separate branch for reference
- Update all imports to reference the new consolidated components

### 2. Remove Transitional Code

**Problem:** Transitional code, adapters, and helpers from the migration phases
**Plan:**
- Remove the `getLegacyAdapter` method from ModernMapElements
- Clean up any remaining legacy conversion helpers
- Remove unused type conversions and adapter functions
- Delete transitional interfaces that are no longer needed

### 3. Directory Structure Optimization

**Problem:** Files are scattered and related files may be in different locations
**Plan:**
- Organize component files by feature rather than type
- Create dedicated directories for major features (components, pipelines, etc.)
- Move utility functions closer to where they are used
- Standardize naming conventions across the codebase

### 4. Documentation Cleanup

**Problem:** Documentation refers to both legacy and "Modern" components
**Plan:**
- Update all documentation to refer to the consolidated component names
- Remove transitional documentation that's no longer relevant
- Create clear architectural documentation reflecting the final structure
- Add component relationship diagrams to aid in understanding the codebase

### 5. Test Consolidation

**Problem:** Tests may be testing both legacy and modern components
**Plan:**
- Update tests to use the consolidated component names
- Remove tests for legacy components that have been removed
- Ensure test coverage remains high after consolidation
- Add missing tests for components that may have been under-tested

### Implementation Approach

1. Create a dedicated branch for the cleanup effort
2. Start with component consolidation as the highest priority
3. Use a step-by-step approach, testing after each major change
4. Use automated scripts where possible to handle repetitive rename tasks
5. Create a detailed log of all changes for easier review

### Expected Benefits

- Reduced cognitive load when working with the codebase
- Easier bug identification and fixing
- Better maintainability through consistent naming
- Smaller bundle size by removing redundant code
- Clearer architecture for future development
- Integration testing: 2-3 days

## Documentation

For each fixed issue:
1. Document the root cause
2. Explain the solution implemented
3. Add test cases to prevent regression
4. Update any affected documentation
