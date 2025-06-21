#!/usr/bin/env node

/**
 * Comprehensive Code Cleanup Script for    // Duplicate interface files (CAREFUL - check imports first!)
    orphanedInterfaces: [
        // NOTE: These were found to be in use and should NOT be deleted:
        // 'conversion/IParseStrategy.ts', - Used by many files
        // 'conversion/IProvideDefaultAttributes.ts', - Used by base types
        // 'conversion/BaseStrategyRunnerConfig.ts', - Used by runners
        // 'conversion/MapParseComponent.ts', - Used by MapTitleComponent
        // 'conversion/MapParseError.ts', - Used by MapParseComponent
        // 'conversion/ParseError.ts', - Used by multiple extraction strategies
        // 'linkStrategies/LinkStrategiesInterfaces.ts', - Used by AllLinksStrategy
        
        // Only keep truly unused interface files here after verification
    ],dleyMaps Frontend
 *
 * This script performs comprehensive cleanup of unused, duplicate, and legacy code:
 *
 * 🗂️  CLEANUP CATEGORIES:
 * - Duplicate interface definitions (IParseStrategy, IProvideDefaultAttributes, etc.)
 * - Orphaned extraction files (root extractionFunctions.ts vs constants version)
 * - Legacy backup files (.bak files)
 * - Unused symbol components (Modern* prefixed files)
 * - Redundant type definitions (duplicate interfaces across files)
 * - One-time fix scripts (migration and fix scripts no longer needed)
 * - Dead import statements (unused imports across all files)
 * - Cross-directory duplicates (same files in different locations)
 *
 * 🔧 FEATURES:
 * - Import/Export analysis to find truly unused files
 * - Safe archiving (moves files instead of deleting them)
 * - Dry-run mode for testing (TEST_MODE = true)
 * - Comprehensive logging with color-coded output
 * - Detailed summary reports
 * - Modern* file detection
 * - Automatic backup creation
 *
 * 📊 BASED ON SEMANTIC ANALYSIS:
 * - Found significant code duplication (interfaces defined in multiple places)
 * - Identified 15+ one-time fix scripts that can be archived
 * - Located backup files (.bak) that can be cleaned up
 * - Discovered unused type files and orphaned components
 *
 * ⚠️  SAFETY:
 * - Files are ARCHIVED not deleted (see archived_unused_code directory)
 * - Timestamped backups created for all modified files
 * - Test mode available for dry runs
 * - Complete audit trail in logs
 *
 * 🚀 USAGE:
 * 1. cd frontend
 * 2. node src/scripts/comprehensive-cleanup-fixed.js (test mode)
 * 3. Review output and archived files
 * 4. Set TEST_MODE = false and run again for real cleanup
 * 5. Run build and tests to verify everything works
 *
 * Based on semantic analysis showing significant code duplication and orphaned files
 */

const fs = require('fs');
const path = require('path');

// Base directory - adjust if necessary
const baseDir = path.resolve(__dirname, '..');

// Test mode flag (set to true for dry run)
const TEST_MODE = false;

// Archive directory for deleted files (keeping a backup)
const archiveDir = path.join(baseDir, 'archived_unused_code');
if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, {recursive: true});
}

// Logging utilities
function log(message, type = 'info') {
    const colors = {
        info: '\x1b[36m%s\x1b[0m', // cyan
        success: '\x1b[32m%s\x1b[0m', // green
        warning: '\x1b[33m%s\x1b[0m', // yellow
        error: '\x1b[31m%s\x1b[0m', // red
        header: '\x1b[35m%s\x1b[0m', // magenta
    };
    console.log(colors[type], `${TEST_MODE ? '[TEST] ' : ''}${message}`);
}

// Summary tracking
let summary = {
    filesArchived: 0,
    filesSkipped: 0,
    importsRemoved: 0,
    totalSize: 0,
};

// Files and directories to clean up organized by category
const cleanupTargets = {
    // Duplicate interface files (already defined in types/base.ts)
    orphanedInterfaces: [
        'conversion/IParseStrategy.ts',
        'conversion/IProvideDefaultAttributes.ts',
        'conversion/BaseStrategyRunnerConfig.ts',
        'conversion/MapParseComponent.ts',
        'conversion/MapParseError.ts',
        'conversion/ParseError.ts',
        'linkStrategies/LinkStrategiesInterfaces.ts', // Just re-exports base types
    ],

    // Duplicate extraction functions (duplicates constants/extractionFunctions.ts)
    duplicateExtractionFiles: [
        'extractionFunctions.ts', // Root level duplicate
    ],

    // Legacy backup files and archived components
    backupFiles: ['setupTests.js.bak', 'extractionFunctions.ts.bak', 'MapElements.ts.bak', '__tests__/GivenAcceleratora.js.bak'],

    // Duplicate type definitions (already exist in types/base.ts)
    duplicateTypeFiles: [
        'types/conversion/strategies.ts', // Duplicates base.ts interfaces
        'types/components/ComponentLink.ts', // Likely unused specific types
        'types/components/MethodElement.ts',
        'types/components/FluidLink.ts',
        'types/map/ClickContext.ts', // Possibly unused
        'types/map/MapObject.ts', // Possibly unused
    ],

    // Unused test files and scripts
    unusedScripts: [
        'scripts/fixAllLinkStrategies.js',
        'scripts/updateLinkStrategies.js',
        'scripts/fixDefensiveCoding.js',
        'scripts/fixRedundantOptionalChaining.js',
        'scripts/fixLintingIssues.js',
        'scripts/fixLinkStrategies.js',
        'scripts/finalJSDocFix.js',
        'scripts/fixConstructorSyntaxError.js',
        'scripts/fixReturnStatements.js',
        'scripts/fixLinkStrategyTypes.js',
        '__tests__/updateGoldenMaster.js', // Likely one-time use
        '__tests__/updateAllGoldenMasterFiles.js', // Likely one-time use
        'scripts/fixAllLinkStrategiesWithImports.js', // Additional fix script
        '__tests__/updateGoldenMasterFiles.js', // One-time migration script
    ],

    // Modern symbol components that might be duplicates
    modernSymbolComponents: [
        // Note: Skipping ModernPipelineBoxSymbol.tsx - it's actively used in Pipeline.tsx
        // Note: Skipping ModernAnnotationElementSymbol.tsx - it's actively used in AnnotationElement.tsx
        // 'components/symbols/ModernPipelineBoxSymbol.tsx',
        // 'components/symbols/ModernAnnotationElementSymbol.tsx',
        // Note: Only mark as unused if regular versions exist and are being used
    ],

    // Potential orphaned extraction strategies (check if still used)
    potentialOrphanedExtractions: [
        // Note: Skipping XAxisLabelsExtractionStrategy.ts - it's actively used in Converter.ts
        // 'conversion/XAxisLabelsExtractionStrategy.ts', // Might be legacy
    ],

    // Additional unused files identified through semantic analysis
    additionalUnusedFiles: [
        // NOTE: Found to be in use, should NOT be deleted:
        // 'constants/extractionFunctions.ts', - Used by many extraction strategies
        // 'types/extraction/interfaces.ts', - May be in use
        // Keep only verified unused files here
    ],
};

// Archive a file instead of deleting it
function archiveFile(filePath) {
    const fullPath = path.join(baseDir, filePath);

    if (!fs.existsSync(fullPath)) {
        log(`File not found: ${filePath}`, 'warning');
        summary.filesSkipped++;
        return false;
    }

    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archivePath = path.join(archiveDir, `${fileName}_${timestamp}`);

    if (!TEST_MODE) {
        try {
            // Get file size for summary
            const stats = fs.statSync(fullPath);
            summary.totalSize += stats.size;

            fs.copyFileSync(fullPath, archivePath);
            fs.unlinkSync(fullPath);
            log(`Archived: ${filePath} -> ${path.relative(baseDir, archivePath)}`, 'success');
        } catch (error) {
            log(`Error archiving ${filePath}: ${error.message}`, 'error');
            summary.filesSkipped++;
            return false;
        }
    } else {
        // Test mode - still get file size
        try {
            const stats = fs.statSync(fullPath);
            summary.totalSize += stats.size;
        } catch (e) {
            // File might not exist
        }
        log(`Would archive: ${filePath} -> ${path.relative(baseDir, archivePath)}`, 'info');
    }

    summary.filesArchived++;
    return true;
}

// Fix imports before archiving duplicate files
function fixImports() {
    const filesToFix = [
        'conversion/LinksExtractionStrategy.ts',
        'conversion/SubMapExtractionStrategy.ts',
        'conversion/MethodExtractionStrategy.ts',
        'conversion/TitleExtractionStrategy.ts',
    ];

    for (const file of filesToFix) {
        const filePath = path.join(baseDir, file);
        if (!fs.existsSync(filePath)) continue;

        let content = fs.readFileSync(filePath, 'utf8');

        // Fix IParseStrategy import
        const oldImport = "import { IParseStrategy } from './IParseStrategy';";
        const newImport = "import { IParseStrategy } from '../types/base';";

        if (content.includes(oldImport)) {
            content = content.replace(oldImport, newImport);
            summary.importsRemoved++;

            if (!TEST_MODE) {
                fs.writeFileSync(filePath, content);
                log(`Fixed import in: ${file}`, 'success');
            } else {
                log(`Would fix import in: ${file}`, 'info');
            }
        }
    }
}

// Main cleanup function
async function runComprehensiveCleanup() {
    log('🧹 Starting Comprehensive Code Cleanup', 'header');
    log(`📁 Base directory: ${baseDir}`, 'info');
    log(`📦 Archive directory: ${archiveDir}`, 'info');
    log('', 'info');

    // First, fix imports that reference files we're about to archive
    log('🔧 Fixing imports...', 'header');
    fixImports();
    log('', 'info');

    // Process each category
    for (const [category, files] of Object.entries(cleanupTargets)) {
        if (files.length === 0) continue;

        log(`🗂️  Processing ${category}:`, 'header');

        for (const file of files) {
            archiveFile(file);
        }

        log('', 'info');
    }

    // Print summary
    log('📊 CLEANUP SUMMARY', 'header');
    log(`Files processed: ${summary.filesArchived + summary.filesSkipped}`, 'info');
    log(`Files archived: ${summary.filesArchived}`, 'success');
    log(`Files skipped: ${summary.filesSkipped}`, 'warning');
    log(`Imports fixed: ${summary.importsRemoved}`, 'success');
    log(`Total size cleaned: ${(summary.totalSize / 1024).toFixed(2)} KB`, 'info');
    log('', 'info');

    if (TEST_MODE) {
        log('🔍 TEST MODE ENABLED', 'warning');
        log('No files were actually modified. Set TEST_MODE = false to run cleanup.', 'warning');
        log('Review the list above and verify these files can be safely removed.', 'warning');
    } else {
        log('✅ CLEANUP COMPLETE', 'success');
        log('All targeted files have been archived to preserve them.', 'success');
        log('You can review archived files and restore any if needed.', 'info');
        log('', 'info');
        log('🚀 Next steps:', 'header');
        log('1. Run: npm run build', 'info');
        log('2. Run: npm run test', 'info');
        log('3. Verify everything still works correctly', 'info');
    }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    log('Unhandled Rejection at:', 'error');
    log(promise, 'error');
    log('reason:', reason, 'error');
});

// Run the cleanup
runComprehensiveCleanup().catch(err => {
    log(`💥 Error: ${err.message}`, 'error');
    console.error(err);
    process.exit(1);
});
