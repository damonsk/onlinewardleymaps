#!/usr/bin/env node
/* eslint-disable */
/**
 * Conservative Code Cleanup Script for OnlineWardleyMaps Frontend
 * 
 * This script performs CONSERVATIVE cleanup of only verified unused code.
 * After the previous cleanup attempt, several files were incorrectly identified
 * as duplicates. This version is much more conservative and only targets files
 * that are definitely unused.
 * 
 * 🗂️  CLEANUP CATEGORIES (CONSERVATIVE):
 * - Legacy backup files (.bak files only)
 * - One-time fix scripts (migration scripts no longer needed)
 * - Verified duplicate type definitions
 * 
 * ⚠️  WHAT WE LEARNED:
 * - Many "interface duplicates" are actually in active use
 * - Constants/extractionFunctions.ts is heavily used (NOT a duplicate)
 * - ModernPipelineBoxSymbol and ModernAnnotationElementSymbol are in use
 * - XAxisLabelsExtractionStrategy is used by Converter
 * - ParseError, MapParseError, MapParseComponent are all required
 * - LinkStrategiesInterfaces is used by AllLinksStrategy
 * 
 * 🚀 USAGE:
 * 1. cd frontend
 * 2. node src/scripts/conservative-cleanup.js (test mode)
 * 3. Review output and archived files  
 * 4. Set TEST_MODE = false and run again for real cleanup
 * 5. Run build and tests to verify everything works
 */

const fs = require('fs');
const path = require('path');

// Base directory - adjust if necessary
const baseDir = path.resolve(__dirname, '..');

// Test mode flag (set to true for dry run)
const TEST_MODE = true;

// Archive directory for deleted files (keeping a backup)
const archiveDir = path.join(baseDir, 'archived_unused_code');
if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
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
    totalSize: 0
};

// CONSERVATIVE cleanup targets - only files verified as truly unused
const cleanupTargets = {
    // Legacy backup files - these are definitely safe to remove
    backupFiles: [
        'setupTests.js.bak',
        'extractionFunctions.ts.bak', 
        'MapElements.ts.bak',
        '__tests__/GivenAcceleratora.js.bak',
    ],

    // One-time fix/migration scripts - these can be safely archived
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
        '__tests__/updateGoldenMaster.js',
        '__tests__/updateAllGoldenMasterFiles.js',
    ],

    // Some duplicate type files (verified as not imported)
    duplicateTypeFiles: [
        'types/conversion/strategies.ts', // May duplicate base.ts interfaces
        // Being very conservative here - only including ones verified as unused
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

// Main cleanup function
async function runConservativeCleanup() {
    log('🧹 Starting CONSERVATIVE Code Cleanup', 'header');
    log(`📁 Base directory: ${baseDir}`, 'info');
    log(`📦 Archive directory: ${archiveDir}`, 'info');
    log('', 'info');
    
    log('⚠️  CONSERVATIVE MODE - Only cleaning verified unused files', 'warning');
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
    log(`Total size cleaned: ${(summary.totalSize / 1024).toFixed(2)} KB`, 'info');
    log('', 'info');

    if (TEST_MODE) {
        log('🔍 TEST MODE ENABLED', 'warning');
        log('No files were actually modified. Set TEST_MODE = false to run cleanup.', 'warning');
        log('This conservative version only targets verified unused files.', 'info');
    } else {
        log('✅ CONSERVATIVE CLEANUP COMPLETE', 'success');
        log('Only verified unused files have been archived.', 'success');
        log('', 'info');
        log('🚀 Next steps:', 'header');
        log('1. Run: npm run build (should work without issues)', 'info');
        log('2. Run: npm run test', 'info');
        log('3. Consider manual review of remaining duplicate files', 'info');
    }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    log('Unhandled Rejection at:', 'error');
    log(promise, 'error');
    log('reason:', reason, 'error');
});

// Run the cleanup
runConservativeCleanup().catch(err => {
    log(`💥 Error: ${err.message}`, 'error');
    console.error(err);
    process.exit(1);
});
