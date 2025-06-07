# Code Cleanup Plan: Consolidating Modern Components Across Frontend

## Overview

This document provides a detailed plan for cleaning up the codebase after the Phase 4 modernization effort. The primary goal is to consolidate the duplicate components (legacy and "Modern" versions) across the entire frontend and remove transitional code to create a cleaner, more maintainable codebase.

## Current State Analysis

The codebase currently contains:
- 50+ "Modern" component files (ModernMapComponent.tsx, ModernMapView.tsx, etc.)
- Legacy component files distributed across different directories
- Transitional utilities and adapters for backward compatibility
- Multiple versions of similar functionality spread across different directories

### Key Files to Consolidate

#### Components in Multiple Directories
| Modern Component | Legacy Component | Location |
|------------------|------------------|----------|
| components/map/ModernMapEnvironment.tsx | components/MapEnvironment.tsx | Different directories |
| processing/ModernMapElements.ts | processing/UnifiedMapElements.ts | Same directory |

#### Map Components
| Modern Component | Legacy Component |
|------------------|------------------|
| ModernMapView.tsx | MapView.tsx |
| ModernUnifiedMapCanvas.tsx | UnifiedMapCanvas.tsx |
| ModernUnifiedMapContent.tsx | UnifiedMapContent.tsx |
| ModernMapComponent.tsx | MapComponent.tsx |
| ModernComponentText.tsx | ComponentText.tsx |
| ModernAnchor.tsx | Anchor.tsx |
| ModernAnnotationBox.tsx | AnnotationBox.tsx |
| ModernAnnotationElement.tsx | AnnotationElement.tsx |
| ModernAttitude.tsx | Attitude.tsx |
| ModernComponentLink.tsx | ComponentLink.tsx |
| ModernEvolvingComponentLink.tsx | EvolvingComponentLink.tsx |
| ModernFluidLink.tsx | FluidLink.tsx |
| ModernInertia.tsx | Inertia.tsx |
| ModernMethodElement.tsx | (No legacy equivalent) |
| ModernMovable.tsx | (No legacy equivalent) |
| ModernNote.tsx | Note.tsx |
| ModernPipeline.tsx | Pipeline.tsx |
| ModernPipelineVersion2.tsx | PipelineVersion2.tsx |
| ModernRelativeMovable.tsx | RelativeMovable.tsx |

#### Symbol Components
| Modern Component | Legacy Component |
|------------------|------------------|
| ModernComponentSymbol.tsx | ComponentSymbol.tsx |
| ModernAcceleratorSymbol.tsx | AcceleratorSymbol.tsx |
| ModernAnchorSymbol.tsx | AnchorSymbol.tsx |
| ModernAnnotationBoxSymbol.tsx | AnnotationBoxSymbol.tsx |
| ModernAnnotationTextSymbol.tsx | AnnotationTextSymbol.tsx |
| ModernAttitudeSymbol.tsx | AttitudeSymbol.tsx |
| ModernEcosystemSymbol.tsx | EcosystemSymbol.tsx |
| ModernLinkSymbol.tsx | LinkSymbol.tsx |
| ModernMarketSymbol.tsx | MarketSymbol.tsx |
| ModernMethodSymbol.tsx | MethodSymbol.tsx |

#### Editor Components
| Modern Component | Legacy Component |
|------------------|------------------|
| ModernEditor.tsx | Editor.tsx |

#### Processing Files
| Modern File | Legacy File |
|-------------|-------------|
| ModernMapElements.ts | UnifiedMapElements.ts |
| ModernMapElements.test.ts | (No direct equivalent) |

## Consolidation Strategy

### Phase 1: Cross-Directory Component Cleanup

#### Step 1: Create Inventory of Special Cases
Identify components that are in different directories:

| Modern File Path | Legacy File Path | Target File Path |
|------------------|------------------|-----------------|
| src/components/map/ModernMapEnvironment.tsx | src/components/MapEnvironment.tsx | src/components/MapEnvironment.tsx |
| src/processing/ModernMapElements.ts | src/processing/UnifiedMapElements.ts | src/processing/MapElements.ts |

#### Step 2: Handle Import Path Differences
For cross-directory moves, adjust import paths:

1. Identify import path differences (e.g., from "../../components/X" to "../components/X")
2. Create a mapping of old to new import paths
3. Apply these changes during file migration

### Phase 2: Directory-Based Component Cleanup

#### Step 1: Create Complete Inventory by Directory
Organize component pairs by directory for methodical cleanup:

1. Map components in src/components/map/
2. Symbol components in src/components/symbols/
3. Editor components in src/components/editor/
4. Root components in src/components/

#### Step 2: Component Consolidation Process

For each component pair:

1. Keep the Modern implementation as the canonical version
2. Rename the file to remove "Modern" prefix
3. Archive the legacy implementation 
4. Update all imports in the codebase
5. Fix import paths for cross-directory moves
6. Update references in JSX (e.g., `<ModernMapView>` to `<MapView>`)

### Phase 3: Automated Cleanup Implementation

#### Step 1: Enhanced Cleanup Script
The cleanup-modern-files.js script has been updated to handle:

1. Special case components that cross directories
2. Import path fixes for cross-directory moves
3. Component renames organized by directory
4. Archiving legacy files instead of deleting them
5. Comprehensive import updates across the entire codebase
6. JSX reference updates

```javascript
// Key features of the enhanced script
const specialCases = [
  {
    modernPath: path.join(baseDir, 'src/components/map/ModernMapEnvironment.tsx'),
    legacyPath: path.join(baseDir, 'src/components/MapEnvironment.tsx'),
    newPath: path.join(baseDir, 'src/components/MapEnvironment.tsx'),
    modernName: 'ModernMapEnvironment',
    standardName: 'MapEnvironment',
    importFixes: { 
      "../../components/FeatureSwitchesContext": "../FeatureSwitchesContext",
      // Import path adjustments for cross-directory moves
    }
  }
];

// Function to update imports in all TypeScript files
function updateImportsInFile(filePath, oldName, newName) {
  // Replace import statements
  // Replace JSX tags
  // Replace other code references
}

// Main cleanup process
async function runCleanup() {
  // 1. Handle special cases first (cross-directory files)
  // 2. Process standard directory-based components 
  // 3. Update imports in all TypeScript files
}
```

#### Step 2: Safety Measures

The script includes several safety features:

1. TEST_MODE flag to simulate changes without applying them
2. Automatic backup creation for all modified files
3. Archiving legacy files instead of deleting them
4. Comprehensive logging of all operations

### Phase 4: Post-Cleanup Tasks
#### Step 1: Remove Legacy Adapters

1. Remove the `getLegacyAdapter` method from ModernMapElements
2. Remove any other adapter functions across the codebase
3. Replace imports of legacy MapElements with the consolidated version
4. Update the root MapElements.ts to use the consolidated version directly

#### Step 2: Update MapElements.ts Root File

Replace the transitional MapElements.ts file at the root level with a thin wrapper around the modern implementation:

```typescript
// MapElements.ts - Central class for managing map elements
// Updated to use the modern implementation directly

import { MapElements as ModernMapElements } from './processing/MapElements';
import { UnifiedWardleyMap } from './types/unified/map';

// Re-export the modern implementation
export { ModernMapElements as MapElements };

// Maintain backward compatibility for any code that might be using the old constructor signature
export class LegacyMapElements extends ModernMapElements {
  constructor(map: any) {
    // Ensure we're passing a UnifiedWardleyMap
    const unifiedMap = map.components ? map : convertLegacyMap(map);
    super(unifiedMap);
  }
}

// Convert legacy map format if needed
function convertLegacyMap(legacyMap: any): UnifiedWardleyMap {
  // Conversion logic if still needed
  return legacyMap as UnifiedWardleyMap;
}
```

#### Step 3: Remove Unused Types

1. Identify type definitions no longer in use after consolidation
2. Create a comprehensive list of types to be deprecated
3. Mark deprecated types with JSDoc comments before removal
4. Schedule removal in a future cleanup phase

### Phase 5: Testing and Verification

#### Step 1: Run Comprehensive Tests

**Example removal from ModernMapElements.ts**:
```typescript
// REMOVE THIS METHOD
getLegacyAdapter(): any {
    // Create an adapter object with methods that match UnifiedMapElements API
    return {
        getAllComponents: () => this.getAllComponents(),
        getComponentsByType: (type: string) =>
            this.getComponentsByType(type),
        getEvolvingComponents: () => this.getEvolvingComponents(),
        getEvolvedComponents: () => this.getEvolvedComponents(),
        // ... other adapter methods ...
    };
}
```

#### Step 2: Clean Up Legacy Types and Utilities
1. Remove unused type definitions
2. Clean up unused utility functions
3. Remove any transitional interfaces or type aliases

#### Step 3: Update Documentation
1. Update all documentation to remove references to legacy components
2. Document the new consolidated structure
3. Create clear component relationship diagrams

### Phase 3: Testing and Validation

#### Step 1: Update Test Files
1. Update all test files to use the consolidated component names
2. Remove tests for legacy components that have been removed
3. Add tests for any edge cases introduced during consolidation

#### Step 2: Comprehensive Testing
1. Run the full test suite to ensure all tests pass
2. Manually test critical application features
3. Verify all components render correctly
4. Test all interactive features
5. Verify evolved component rendering and behavior
6. Test pipeline components and their interactions

### Phase 6: Comprehensive Cleanup Review

After reviewing all migration phases (Phase 1-4C), these additional aspects must be addressed:

#### 1. Conversion Pipeline Cleanup

1. Review and update the `UnifiedConverter` to ensure it's using modern patterns
2. Consider consolidating extraction strategies that have modern equivalents
3. Verify all type imports use the unified type system

#### 2. Type System Cleanup

1. Identify types that can now be deprecated after full modernization
2. Ensure all components use UnifiedComponent and related types directly
3. Fix any remaining TypeScript errors in test files
4. Remove intermediate type adapters and type assertions

#### 3. Hooks and State Management

1. Consolidate `useLegacyMapState` and `useUnifiedMapState` into a single hook
2. Update all components to use the unified state hook directly
3. Remove any redundant state transformations

#### 4. Performance Optimization

As noted in PHASE_4_FINAL_CHECKLIST.md:
1. Implement selective re-rendering for components after cleanup
2. Add memoization for expensive operations
3. Verify rendering performance of complex maps

#### 5. Documentation Refresh

1. Update all technical documentation to reflect the consolidated codebase
2. Create new architecture diagrams showing the simplified component flow
3. Document the migration journey and technical debt elimination

#### Step 3: Performance Validation
1. Verify that the application performance remains good or improves
2. Check bundle size to ensure it hasn't increased
3. Profile the application to identify any new performance bottlenecks

## Implementation Plan

### Week 1: Planning and Preparation
- Create detailed component inventory
- Develop and test renaming scripts
- Set up testing framework for validation

### Week 2: Component Consolidation
- Execute component renaming
- Update import references
- Remove legacy component files
- Fix any immediate issues

### Week 3: Clean Up Transitional Code
- Remove adapter methods and utilities
- Clean up type definitions
- Update documentation

### Week 4: Testing and Finalization
- Run comprehensive tests
- Fix any issues found
- Final performance validation
- Documentation updates

## Success Criteria

1. All "Modern" prefix components are renamed to their standard names
2. All legacy components are removed
3. No references to legacy components remain in the codebase
4. All tests pass
5. Application functions correctly with no regressions
6. Documentation accurately reflects the new structure

## Risk Mitigation

1. Create backup branches before starting the cleanup
2. Implement changes incrementally with testing after each major step
3. Maintain a detailed log of all changes
4. Have a rollback plan in case of unforeseen issues
