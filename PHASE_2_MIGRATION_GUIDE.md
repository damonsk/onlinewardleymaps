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

### Phase 2A: Update Link Strategies ✋ **Current Phase**
1. Update LinksBuilder to accept UnifiedMapElements
2. Convert individual link strategy files
3. Test link functionality

### Phase 2B: Update Utilities  
1. Update mapProcessing.ts to use UnifiedMapElements
2. Test method processing

### Phase 2C: Update Tests
1. Convert test files to use UnifiedMapElements 
2. Update golden master tests
3. Verify all tests pass

### Phase 2D: Remove Legacy Code
1. Remove MapElements.ts and MapElements.js
2. Clean up any remaining imports
3. Final verification

## Ready to Start Phase 2A

**Next Step**: Update link strategies to use UnifiedMapElements instead of legacy MapElements.

## Changes Log

### Phase 2A: Link Strategies Migration

**Date**: Phase 2A Start
**Status**: Planning
**Target**: Convert all link strategy files to use UnifiedMapElements
