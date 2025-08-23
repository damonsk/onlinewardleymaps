#!/usr/bin/env node

/**
 * Comprehensive Translation Completeness Validator
 *
 * This script verifies that all translation keys exist in all language files,
 * validates interpolation variables match across languages, detects orphaned keys,
 * and generates detailed reports with completion percentages.
 *
 * Usage:
 *   node check-translation-completeness.js [options]
 *
 * Options:
 *   --json                Output results in JSON format
 *   --locale=<code>       Check specific locale only
 *   --show-orphaned       Include orphaned keys in output
 *   --verbose             Show detailed information
 *   --help                Show this help message
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    json: args.includes('--json'),
    verbose: args.includes('--verbose'),
    showOrphaned: args.includes('--show-orphaned'),
    help: args.includes('--help'),
    locale: args.find(arg => arg.startsWith('--locale='))?.split('=')[1] || null,
};

if (options.help) {
    console.log(`
Comprehensive Translation Completeness Validator

Usage: node check-translation-completeness.js [options]

Options:
  --json                Output results in JSON format
  --locale=<code>       Check specific locale only (e.g., --locale=es)
  --show-orphaned       Include orphaned keys in output
  --verbose             Show detailed information
  --help                Show this help message

Examples:
  node check-translation-completeness.js --json
  node check-translation-completeness.js --locale=es --verbose
  node check-translation-completeness.js --show-orphaned
`);
    process.exit(0);
}

// Configuration
const LOCALES_DIR = path.join(__dirname, '../public/locales');
const REFERENCE_LOCALE = 'en';
const SRC_DIR = path.join(__dirname, '../src');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m',
    bold: '\x1b[1m',
};

const colorize = {
    red: text => `${colors.red}${text}${colors.reset}`,
    green: text => `${colors.green}${text}${colors.reset}`,
    yellow: text => `${colors.yellow}${text}${colors.reset}`,
    blue: text => `${colors.blue}${text}${colors.reset}`,
    gray: text => `${colors.gray}${text}${colors.reset}`,
    bold: text => `${colors.bold}${text}${colors.reset}`,
};

// Results structure
const results = {
    timestamp: new Date().toISOString(),
    summary: {},
    locales: {},
    orphanedKeys: [],
    usedKeys: new Set(),
};

/**
 * Load and parse a translation file
 */
function loadTranslationFile(locale) {
    const filePath = path.join(LOCALES_DIR, locale, 'common.json');

    if (!fs.existsSync(filePath)) {
        throw new Error(`Translation file not found: ${filePath}`);
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        throw new Error(`Failed to parse ${filePath}: ${error.message}`);
    }
}

/**
 * Get all available locales
 */
function getAvailableLocales() {
    if (!fs.existsSync(LOCALES_DIR)) {
        throw new Error(`Locales directory not found: ${LOCALES_DIR}`);
    }

    const locales = fs.readdirSync(LOCALES_DIR).filter(dir => {
        const dirPath = path.join(LOCALES_DIR, dir);
        return fs.statSync(dirPath).isDirectory() && fs.existsSync(path.join(dirPath, 'common.json'));
    });

    if (options.locale) {
        if (!locales.includes(options.locale)) {
            throw new Error(`Locale '${options.locale}' not found`);
        }
        return locales.filter(locale => locale === options.locale || locale === REFERENCE_LOCALE);
    }

    return locales;
}

/**
 * Recursively flatten nested object keys
 */
function flattenKeys(obj, prefix = '') {
    const keys = [];

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            keys.push(...flattenKeys(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }

    return keys;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Extract interpolation variables from a translation string
 */
function extractInterpolationVars(text) {
    if (typeof text !== 'string') return [];

    const vars = [];

    // Match {{variable}} patterns
    const doubleBraceMatches = text.match(/\{\{([^}]+)\}\}/g);
    if (doubleBraceMatches) {
        vars.push(...doubleBraceMatches.map(match => match.slice(2, -2).trim()));
    }

    // Match {variable} patterns
    const singleBraceMatches = text.match(/\{([^}]+)\}/g);
    if (singleBraceMatches) {
        vars.push(...singleBraceMatches.map(match => match.slice(1, -1).trim()));
    }

    return [...new Set(vars)]; // Remove duplicates
}

/**
 * Validate interpolation variables consistency
 */
function validateInterpolationVars(referenceText, translatedText, key) {
    const refVars = extractInterpolationVars(referenceText);
    const transVars = extractInterpolationVars(translatedText);

    const issues = [];

    // Check for missing variables
    const missingVars = refVars.filter(v => !transVars.includes(v));
    if (missingVars.length > 0) {
        issues.push({
            type: 'missing_variables',
            variables: missingVars,
            key,
        });
    }

    // Check for extra variables
    const extraVars = transVars.filter(v => !refVars.includes(v));
    if (extraVars.length > 0) {
        issues.push({
            type: 'extra_variables',
            variables: extraVars,
            key,
        });
    }

    return issues;
}

/**
 * Find translation keys used in source code
 */
function findUsedKeys() {
    const usedKeys = new Set();
    const sourceFiles = glob.sync(path.join(SRC_DIR, '**/*.{ts,tsx,js,jsx}'), {nodir: true});

    sourceFiles.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');

            // Match t('key') and t("key") patterns
            const tFunctionMatches = content.match(/t\s*\(\s*['"`]([^'"`]+)['"`]/g);
            if (tFunctionMatches) {
                tFunctionMatches.forEach(match => {
                    const keyMatch = match.match(/['"`]([^'"`]+)['"`]/);
                    if (keyMatch) {
                        usedKeys.add(keyMatch[1]);
                    }
                });
            }

            // Match useI18n().t('key') patterns
            const hookMatches = content.match(/\.t\s*\(\s*['"`]([^'"`]+)['"`]/g);
            if (hookMatches) {
                hookMatches.forEach(match => {
                    const keyMatch = match.match(/['"`]([^'"`]+)['"`]/);
                    if (keyMatch) {
                        usedKeys.add(keyMatch[1]);
                    }
                });
            }
        } catch (error) {
            if (options.verbose) {
                console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
            }
        }
    });

    return usedKeys;
}

/**
 * Analyze a single locale
 */
function analyzeLocale(locale, referenceData, referenceKeys) {
    const localeData = loadTranslationFile(locale);
    const localeKeys = flattenKeys(localeData);

    const analysis = {
        locale,
        totalKeys: referenceKeys.length,
        translatedKeys: 0,
        missingKeys: [],
        interpolationIssues: [],
        completionRate: 0,
    };

    // Check each reference key
    referenceKeys.forEach(key => {
        const referenceValue = getNestedValue(referenceData, key);
        const translatedValue = getNestedValue(localeData, key);

        if (translatedValue === undefined) {
            analysis.missingKeys.push(key);
        } else {
            analysis.translatedKeys++;

            // Validate interpolation variables
            if (typeof referenceValue === 'string' && typeof translatedValue === 'string') {
                const interpolationIssues = validateInterpolationVars(referenceValue, translatedValue, key);
                analysis.interpolationIssues.push(...interpolationIssues);
            }
        }
    });

    analysis.completionRate = Math.round((analysis.translatedKeys / analysis.totalKeys) * 100);

    return analysis;
}

/**
 * Find orphaned keys (exist in translations but not used in code)
 */
function findOrphanedKeys(allKeys, usedKeys) {
    return allKeys.filter(key => !usedKeys.has(key));
}

/**
 * Main analysis function
 */
function analyzeTranslations() {
    try {
        const locales = getAvailableLocales();
        const referenceData = loadTranslationFile(REFERENCE_LOCALE);
        const referenceKeys = flattenKeys(referenceData);

        // Find used keys in source code
        results.usedKeys = findUsedKeys();

        // Find orphaned keys
        results.orphanedKeys = findOrphanedKeys(referenceKeys, results.usedKeys);

        // Analyze each locale
        locales.forEach(locale => {
            if (locale === REFERENCE_LOCALE) return;

            try {
                results.locales[locale] = analyzeLocale(locale, referenceData, referenceKeys);
            } catch (error) {
                results.locales[locale] = {
                    locale,
                    error: error.message,
                    completionRate: 0,
                };
            }
        });

        // Calculate summary statistics
        const localeAnalyses = Object.values(results.locales).filter(l => !l.error);
        results.summary = {
            totalLocales: locales.length - 1, // Exclude reference locale
            totalKeys: referenceKeys.length,
            usedKeysCount: results.usedKeys.size,
            orphanedKeysCount: results.orphanedKeys.length,
            averageCompletionRate:
                localeAnalyses.length > 0
                    ? Math.round(localeAnalyses.reduce((sum, l) => sum + l.completionRate, 0) / localeAnalyses.length)
                    : 0,
            localesWithIssues: localeAnalyses.filter(l => l.missingKeys.length > 0 || l.interpolationIssues.length > 0).length,
        };
    } catch (error) {
        console.error(colorize.red(`Error: ${error.message}`));
        process.exit(1);
    }
}

/**
 * Display results in console format
 */
function displayResults() {
    console.log(colorize.bold('\n=== TRANSLATION COMPLETENESS REPORT ===\n'));

    // Summary
    console.log(colorize.blue('SUMMARY:'));
    console.log(`  Total translation keys: ${results.summary.totalKeys}`);
    console.log(`  Keys used in code: ${results.summary.usedKeysCount}`);
    console.log(`  Orphaned keys: ${results.summary.orphanedKeysCount}`);
    console.log(`  Locales analyzed: ${results.summary.totalLocales}`);
    console.log(`  Average completion rate: ${results.summary.averageCompletionRate}%`);
    console.log(`  Locales with issues: ${results.summary.localesWithIssues}`);

    // Locale details
    Object.values(results.locales).forEach(locale => {
        if (locale.error) {
            console.log(colorize.red(`\n${locale.locale.toUpperCase()}: ERROR - ${locale.error}`));
            return;
        }

        const statusColor = locale.completionRate === 100 ? colorize.green : locale.completionRate >= 90 ? colorize.yellow : colorize.red;

        console.log(statusColor(`\n${locale.locale.toUpperCase()}: ${locale.completionRate}% complete`));
        console.log(`  Translated: ${locale.translatedKeys}/${locale.totalKeys}`);

        if (locale.missingKeys.length > 0) {
            console.log(colorize.red(`  Missing keys: ${locale.missingKeys.length}`));
            if (options.verbose) {
                locale.missingKeys.slice(0, 10).forEach(key => {
                    console.log(`    - ${key}`);
                });
                if (locale.missingKeys.length > 10) {
                    console.log(colorize.gray(`    ... and ${locale.missingKeys.length - 10} more`));
                }
            }
        }

        if (locale.interpolationIssues.length > 0) {
            console.log(colorize.yellow(`  Interpolation issues: ${locale.interpolationIssues.length}`));
            if (options.verbose) {
                locale.interpolationIssues.slice(0, 5).forEach(issue => {
                    console.log(`    - ${issue.key}: ${issue.type} (${issue.variables.join(', ')})`);
                });
            }
        }
    });

    // Orphaned keys
    if (options.showOrphaned && results.orphanedKeys.length > 0) {
        console.log(colorize.yellow(`\nORPHANED KEYS (${results.orphanedKeys.length}):`));
        results.orphanedKeys.slice(0, 20).forEach(key => {
            console.log(`  - ${key}`);
        });
        if (results.orphanedKeys.length > 20) {
            console.log(colorize.gray(`  ... and ${results.orphanedKeys.length - 20} more`));
        }
    }

    console.log('');
}

// Main execution
if (!options.json) {
    console.log('Analyzing translation completeness...');
}

analyzeTranslations();

if (options.json) {
    // Convert Set to Array for JSON serialization
    const jsonResults = {
        ...results,
        usedKeys: Array.from(results.usedKeys),
    };
    console.log(JSON.stringify(jsonResults, null, 2));
} else {
    displayResults();
}

// Exit with error code if there are issues
const hasIssues = results.summary.localesWithIssues > 0;
if (hasIssues) {
    process.exit(1);
}
