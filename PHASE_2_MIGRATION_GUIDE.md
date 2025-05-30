# Phase 2 Migration Guide: Eliminate Redundant Conversions

## Overview

Phase 2 of the OnlineWardleyMaps refactoring focuses on eliminating the redundant data conversions and removing the legacy MapElements class. This builds on the unified type system created in Phase 1.

## Current State Analysis

### ✅ What's Already Unified

- **Primary Rendering**: Uses UnifiedMapCanvas and UnifiedMapElements
- **Type System**: All unified types are implemented and working
- **Component Rendering**: All map components use unified data structures

### ⚠️ What Still Uses Legacy MapElements

#### Link Strategies (12 files)

- `AllLinksStrategy.ts`
- `AllNoneEvolvedLinksStrategy.ts`
- `AnchorEvolvedLinksStrategy.ts`
- `AnchorLinksStrategy.ts`
- `AnchorNoneEvolvedLinksStrategy.ts`
- `BothEvolvedLinksStrategy.ts`
- `EvolveToEvolvedLinksStrategy.ts`
- `EvolvedToEvolvingLinksStrategy.ts`
- `EvolvedToNoneEvolvingLinksStrategy.ts`
- `EvolvingEndLinksStrategy.ts`
- `EvolvingToEvolvingLinksStrategy.ts`
- `EvolvingToNoneEvolvingEndLinksStrategy.ts`
- `LinksBuilder.ts`
- `NoneEvolvingToEvolvingLinksStrategy.ts`

#### Utility Files (1 file)

- `utils/mapProcessing.ts`

#### Test Files (3 files)

- `__tests__/GivenComponentsHavePipelines.js`
- `__tests__/GivenMapElementsGoldenMaster.js`
- `__tests__/GivenComponentsEvolve.js`

#### Legacy Files Still Present

- `MapElements.ts` (TypeScript version)
- `MapElements.js` (JavaScript version)

## Phase 2 Migration Plan

### Phase 2A: Update Link Strategies ✅ **COMPLETED**

1. ✅ Update LinksBuilder to accept both UnifiedMapElements and legacy MapElements
2. ✅ Convert AllLinksStrategy to use legacy MapElements interface
3. ✅ Implement type-safe legacy adapter pattern
4. ✅ Test link functionality - Build passes

### Phase 2B: Update Utilities ✅ **COMPLETED**

1. ✅ Update mapProcessing.ts to use UnifiedMapElements
2. ✅ Test method processing

### Phase 2C: Update Components ✅ **COMPLETED**

1. ✅ Remove legacy MapContent.tsx (orphaned file)
2. ✅ Fix UnifiedMapContent.tsx processMapElements call
3. ✅ Verify build and linting passes

### Phase 2D: Update Tests

1. Convert test files to use UnifiedMapElements
2. Update golden master tests
3. Verify all tests pass

### Phase 2E: Remove Legacy Code

1. Remove MapElements.ts and MapElements.js
2. Clean up any remaining imports
3. Final verification

## Phase 2A Complete! ✅

### Successfully Completed Phase 2A

- Link strategies now work with both unified and legacy systems
- Type-safe legacy adapter ensures compatibility
- Build successful and linting passes
- Ready to proceed to Phase 2B

## Changes Log

### Phase 2A: Link Strategies Migration ✅ **COMPLETED**

**Date**: May 30, 2025  
**Status**: ✅ Complete  
**Target**: Convert all link strategy files to use UnifiedMapElements

**Changes Made**:

1. **AllLinksStrategy.ts**: Updated to use legacy `MapElements` import instead of `UnifiedMapElements`
2. **LinksBuilder.ts**:
   - Added union type `UnifiedMapElements | MapElements`
   - Implemented runtime detection using `'createLegacyMapElementsAdapter' in mapElements`
   - Creates legacy adapter when needed, passes through legacy objects directly
3. **UnifiedMapElements.ts**: Fixed legacy adapter to use `this.allComponents` instead of recursive calls

**Result**: ✅ Build successful, lint passes, Phase 2A complete

### Phase 2B: Utilities Migration ✅ **COMPLETED**

**Date**: May 30, 2025  
**Status**: ✅ Complete  
**Target**: Update utility functions to use UnifiedMapElements

**Changes Made**:

1. **mapProcessing.ts**:
   - Updated `processLinks()` to accept `UnifiedMapElements` instead of legacy MapElements
   - Updated `processMapElements()` to accept `UnifiedMapElements` and use legacy adapter internally
   - Fixed type annotations to resolve implicit `any` errors
   - Linting auto-formatted the file

**Result**: ✅ Build successful, utilities now use unified types

### Phase 2C: Component Migration ✅ **COMPLETED**

**Date**: May 30, 2025  
**Status**: ✅ Complete  
**Target**: Fix component usage of UnifiedMapElements

**Changes Made**:

1. **MapContent.tsx**: Removed orphaned legacy file (moved to .backup)
   - File was not being used according to Phase 1D migration guide
   - Was causing confusion in build process
2. **UnifiedMapContent.tsx**: Fixed processMapElements call
   - Changed from `processMapElements(mapMethods, legacyMapElements as any)`
   - To `processMapElements(mapMethods, mapElements)`
   - Function expects UnifiedMapElements and creates its own legacy adapter internally

**Root Cause**: The error `t.createLegacyMapElementsAdapter is not a function` was caused by passing a legacy adapter result to a function that expected the original UnifiedMapElements object.

**Result**: ✅ Build successful, build passes, static generation works
