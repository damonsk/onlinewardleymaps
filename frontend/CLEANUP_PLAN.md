# Comprehensive Code Cleanup Plan

## Overview

This document outlines the comprehensive cleanup strategy for removing unused code, duplicate interfaces, orphaned files, and legacy artifacts from the OnlineWardleyMaps frontend codebase.

## Identified Unused Code Categories

### 1. Duplicate Interface Definitions

**Problem**: Multiple definitions of the same interfaces across different files.

**Files to Archive**:

- `conversion/IParseStrategy.ts` - Duplicate of interface in `types/base.ts`
- `conversion/IProvideDefaultAttributes.ts` - Duplicate of interface in `types/base.ts`
- `conversion/BaseStrategyRunnerConfig.ts` - Redundant configuration interface
- `linkStrategies/LinkStrategiesInterfaces.ts` - Just re-exports base types

**Impact**: These files contain interfaces that are already defined in the main type files.

### 2. Duplicate Extraction Functions

**Files to Archive**:

- `extractionFunctions.ts` (root level) - Duplicate of `constants/extractionFunctions.ts`

**Impact**: Same functions defined in multiple locations.

### 3. Legacy Backup Files

**Files to Archive**:

- `setupTests.js.bak`
- `extractionFunctions.ts.bak`
- `MapElements.ts.bak`
- `__tests__/GivenAcceleratora.js.bak`

**Impact**: Old backup files that are no longer needed.

### 4. Unused Type Definitions

**Files to Archive**:

- `types/conversion/strategies.ts` - Duplicates `base.ts` interfaces
- `types/components/ComponentLink.ts` - Likely unused specific types
- `types/components/MethodElement.ts`
- `types/components/FluidLink.ts`
- `types/map/ClickContext.ts` - Possibly unused
- `types/map/MapObject.ts` - Possibly unused

**Impact**: These type files may contain definitions that are either duplicated elsewhere or no longer used.

### 5. One-Time Fix Scripts

**Files to Archive**:

- `scripts/fixAllLinkStrategies.js`
- `scripts/updateLinkStrategies.js`
- `scripts/fixDefensiveCoding.js`
- `scripts/fixRedundantOptionalChaining.js`
- `scripts/fixLintingIssues.js`
- `scripts/fixLinkStrategies.js`
- `scripts/finalJSDocFix.js`
- `scripts/fixConstructorSyntaxError.js`
- `scripts/fixReturnStatements.js`
- `scripts/fixLinkStrategyTypes.js`
- `__tests__/updateGoldenMaster.js`
- `__tests__/updateAllGoldenMasterFiles.js`

**Impact**: These scripts were used for one-time migrations and fixes and are no longer needed.

### 6. Modern\* Component Duplicates

**Files to Review**:

- `components/symbols/ModernPipelineBoxSymbol.tsx`
- `components/symbols/ModernAnnotationElementSymbol.tsx`

**Note**: Only archive if regular versions exist and are being used.

### 7. Potentially Orphaned Extraction Strategies

**Files to Review**:

- `conversion/XAxisLabelsExtractionStrategy.ts` - May be legacy

**Impact**: These strategies might not be used in the current conversion pipeline.

## Cleanup Script Features

The `comprehensive-cleanup.js` script provides:

### Automated Detection

- **Import Analysis**: Scans all TypeScript/JavaScript files to find unused imports
- **Export Analysis**: Identifies exports that are never imported
- **Cross-reference Checking**: Maps dependencies between files
- **Modern\* File Detection**: Finds any remaining Modern-prefixed files

### Safe Archiving

- **Backup Creation**: Creates timestamped backups before modifications
- **Archive Directory**: Moves deleted files to `archived_unused_code` instead of permanent deletion
- **Test Mode**: Dry-run capability with `TEST_MODE = true`

### Comprehensive Cleanup

1. **Orphaned Interface Files**: Archives duplicate interface definitions
2. **Duplicate Extraction Files**: Removes duplicate extraction functions
3. **Legacy Backup Files**: Cleans up old .bak files
4. **Duplicate Type Files**: Archives redundant type definitions
5. **Unused Scripts**: Archives one-time fix scripts
6. **Cross-Directory Duplicates**: Handles files duplicated across directories
7. **Import Cleaning**: Removes unused import statements
8. **Modern\* File Detection**: Reports any remaining Modern-prefixed files

### Progress Tracking

- **Detailed Logging**: Color-coded output with progress indicators
- **Summary Reports**: Comprehensive summary of all changes
- **File Counts**: Statistics on processed, archived, and modified files
- **Recommendations**: Guidance for manual review and next steps

## Usage Instructions

### Running the Cleanup Script

1. **Navigate to frontend directory**:

    ```bash
    cd frontend
    ```

2. **Test run first** (recommended):

    ```bash
    node src/scripts/comprehensive-cleanup.js
    ```

    The script runs in TEST_MODE by default, showing what would be changed without making actual modifications.

3. **Review the output** and ensure the proposed changes are correct.

4. **Run for real** (edit the script to set `TEST_MODE = false`):
    ```bash
    node src/scripts/comprehensive-cleanup.js
    ```

### Post-Cleanup Verification

1. **Run Build**:

    ```bash
    npm run build
    ```

2. **Run Tests**:

    ```bash
    npm test
    ```

3. **Review Archived Files**:
   Check `archived_unused_code` directory to ensure no important files were mistakenly archived.

4. **Manual Review**:
   Review any files listed as "potentially unused" in the script output.

## Benefits

### Code Quality

- **Reduced Complexity**: Fewer files and imports to maintain
- **Clearer Structure**: Elimination of duplicate and conflicting definitions
- **Better Performance**: Smaller bundle size and faster builds

### Developer Experience

- **Less Confusion**: Clear, single source of truth for types and interfaces
- **Easier Navigation**: Fewer duplicate files to search through
- **Cleaner Git History**: Removal of legacy artifacts

### Maintenance

- **Reduced Technical Debt**: Elimination of unused and duplicate code
- **Easier Refactoring**: Clearer dependencies and relationships
- **Better Type Safety**: Consistent type definitions across the codebase

## Risk Mitigation

### Safety Measures

- **Archive Instead of Delete**: All files are moved to archive directory
- **Backup Creation**: Timestamped backups of modified files
- **Test Mode**: Dry-run capability for safe testing
- **Detailed Logging**: Complete audit trail of all changes

### Recovery Process

If anything goes wrong:

1. Files can be restored from `archived_unused_code` directory
2. Individual file backups available with timestamps
3. Git history provides additional recovery options

## Future Maintenance

### Preventing Code Accumulation

1. **Regular Reviews**: Schedule periodic cleanup reviews
2. **Import Linting**: Use ESLint rules to prevent unused imports
3. **Type Consolidation**: Prefer central type definitions over scattered interfaces
4. **Migration Cleanup**: Clean up migration artifacts promptly after completing migrations

### Monitoring

1. **Bundle Analysis**: Regularly check bundle size for unused code
2. **Dependency Tracking**: Monitor import/export relationships
3. **Legacy Detection**: Watch for accumulation of temporary fixes and legacy code

This comprehensive cleanup plan ensures the codebase remains lean, maintainable, and free from technical debt while preserving all important functionality.
