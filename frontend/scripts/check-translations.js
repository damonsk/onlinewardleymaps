#!/usr/bin/env node

/**
 * Translation Check & Fix Script
 *
 * Compares all locale files against the English reference file to find:
 *  - Missing translation keys
 *  - Potentially untranslated strings (identical to English)
 *
 * Results are color-coded and organized by category for easy review.
 *
 * Usage:
 *   yarn check-translations
 *   yarn fix-translations
 *
 * Options:
 *   --fix          Automatically copy missing keys from English file
 *   --locale=xx    Only check specific locale (e.g. --locale=es)
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m',
};

// Helper function to colorize text
const colorize = {
    red: text => `${colors.red}${text}${colors.reset}`,
    green: text => `${colors.green}${text}${colors.reset}`,
    yellow: text => `${colors.yellow}${text}${colors.reset}`,
    blue: text => `${colors.blue}${text}${colors.reset}`,
    gray: text => `${colors.gray}${text}${colors.reset}`,
};

// Parse command line arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
let specificLocale = null;

args.forEach(arg => {
    if (arg.startsWith('--locale=')) {
        specificLocale = arg.split('=')[1];
    }
});

// Paths
const LOCALES_DIR = path.join(__dirname, '../public/locales');
const REFERENCE_LOCALE = 'en';
const REFERENCE_FILE = path.join(LOCALES_DIR, REFERENCE_LOCALE, 'common.json');

// Load the reference (English) locale file
let referenceData;
try {
    referenceData = JSON.parse(fs.readFileSync(REFERENCE_FILE, 'utf8'));
} catch (err) {
    console.error(colorize.red(`Error loading reference file: ${err.message}`));
    process.exit(1);
}

// Get all locale directories
let locales = fs
    .readdirSync(LOCALES_DIR)
    .filter(
        dir =>
            fs.statSync(path.join(LOCALES_DIR, dir)).isDirectory() &&
            dir !== REFERENCE_LOCALE &&
            (!specificLocale || dir === specificLocale),
    );

if (specificLocale && !locales.length) {
    console.error(colorize.red(`Locale '${specificLocale}' not found`));
    process.exit(1);
}

console.log(colorize.blue('Checking translations against reference file:'), colorize.gray(REFERENCE_FILE));
console.log(colorize.blue(`Comparing ${locales.length} locales: ${locales.join(', ')}\n`));

// Track statistics
const stats = {
    totalLocales: locales.length,
    localesWithIssues: 0,
    totalMissingKeys: 0,
    totalKeysFailed: 0,
    fixedKeys: 0,
};

/**
 * Recursively compare nested objects to find missing or identical keys
 */
function compareObjects(refObj, transObj, path = '') {
    let issues = [];

    // Check for missing or identical keys
    for (const key in refObj) {
        const currentPath = path ? `${path}.${key}` : key;

        if (!(key in transObj)) {
            issues.push({
                type: 'missing',
                path: currentPath,
                refValue: refObj[key],
            });
        } else if (typeof refObj[key] === 'object' && refObj[key] !== null) {
            // Recursively check nested objects
            if (typeof transObj[key] === 'object' && transObj[key] !== null) {
                issues = [...issues, ...compareObjects(refObj[key], transObj[key], currentPath)];
            } else {
                issues.push({
                    type: 'type_mismatch',
                    path: currentPath,
                    refValue: refObj[key],
                    transValue: transObj[key],
                });
            }
        } else if (typeof refObj[key] === 'string' && refObj[key] === transObj[key]) {
            // Check if the string is identical (potentially untranslated)
            issues.push({
                type: 'identical',
                path: currentPath,
                value: refObj[key],
            });
        }
    }

    return issues;
}

/**
 * Set a nested value in an object using a path string
 */
function setNestedValue(obj, path, value) {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current) || typeof current[part] !== 'object') {
            current[part] = {};
        }
        current = current[part];
    }

    current[parts[parts.length - 1]] = value;
}

/**
 * Apply fixes for missing keys by copying from the reference locale
 */
function fixTranslation(localeCode, issues) {
    const filePath = path.join(LOCALES_DIR, localeCode, 'common.json');
    let translationData;

    try {
        translationData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        console.error(colorize.red(`Error loading ${localeCode}/common.json: ${err.message}`));
        return 0;
    }

    let fixedCount = 0;

    // Fix only missing keys, not identical ones
    const missingKeys = issues.filter(issue => issue.type === 'missing');
    missingKeys.forEach(issue => {
        setNestedValue(translationData, issue.path, issue.refValue);
        fixedCount++;
    });

    // Save the updated file
    if (fixedCount > 0) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(translationData, null, 4), 'utf8');
            console.log(colorize.green(`✓ Fixed ${fixedCount} keys in ${localeCode}/common.json`));
        } catch (err) {
            console.error(colorize.red(`Error saving ${localeCode}/common.json: ${err.message}`));
            return 0;
        }
    }

    return fixedCount;
}

// Process each locale file
locales.forEach(localeCode => {
    const filePath = path.join(LOCALES_DIR, localeCode, 'common.json');
    let translationData;

    try {
        translationData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        console.error(colorize.red(`Error loading ${localeCode}/common.json: ${err.message}`));
        stats.localesWithIssues++;
        return;
    }

    // Compare against reference
    const issues = compareObjects(referenceData, translationData);

    if (issues.length > 0) {
        stats.localesWithIssues++;

        console.log(colorize.yellow(`Issues in ${localeCode}/common.json:`));

        // Group issues by type for better readability
        const missingKeys = issues.filter(i => i.type === 'missing');
        const identicalKeys = issues.filter(i => i.type === 'identical');
        const typeMismatches = issues.filter(i => i.type === 'type_mismatch');

        // Print missing keys
        if (missingKeys.length > 0) {
            console.log(colorize.red(`  Missing keys: ${missingKeys.length}`));
            missingKeys.forEach(issue => {
                console.log(`    - ${issue.path}`);
            });
            stats.totalMissingKeys += missingKeys.length;
        }

        // Print identical (potentially untranslated) keys
        if (identicalKeys.length > 0) {
            console.log(colorize.yellow(`  Potentially untranslated keys: ${identicalKeys.length}`));
            identicalKeys.forEach(issue => {
                console.log(`    - ${issue.path}: "${issue.value}"`);
            });
            stats.totalKeysFailed += identicalKeys.length;
        }

        // Print type mismatches
        if (typeMismatches.length > 0) {
            console.log(colorize.red(`  Type mismatches: ${typeMismatches.length}`));
            typeMismatches.forEach(issue => {
                console.log(`    - ${issue.path}: Expected object, got ${typeof issue.transValue}`);
            });
            stats.totalKeysFailed += typeMismatches.length;
        }

        // Fix issues if requested
        if (shouldFix) {
            const fixedCount = fixTranslation(localeCode, issues);
            stats.fixedKeys += fixedCount;
        }

        console.log('');
    } else {
        console.log(colorize.green(`✓ No issues in ${localeCode}/common.json`));
    }
});

// Print summary
console.log(colorize.blue('\n--- Summary ---'));
console.log(`Total locales checked: ${stats.totalLocales}`);
console.log(`Locales with issues: ${stats.localesWithIssues}`);
console.log(`Total missing keys: ${stats.totalMissingKeys}`);
console.log(`Total potentially untranslated keys: ${stats.totalKeysFailed}`);

if (shouldFix) {
    console.log(colorize.green(`Total fixed keys: ${stats.fixedKeys}`));
}

if (stats.localesWithIssues > 0) {
    console.log(colorize.yellow('\nTo fix missing keys automatically, run:'));
    console.log('  node scripts/check-translations.js --fix');

    if (!shouldFix) {
        process.exit(1);
    }
}
