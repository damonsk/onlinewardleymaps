#!/usr/bin/env node

/**
 * Enhanced script to identify potentially untranslated strings in React components
 * Supports strict validation mode, improved detection accuracy, filtering capabilities,
 * and JSON output format for integration with other tools.
 * 
 * Usage:
 *   node find-untranslated.js [options]
 * 
 * Options:
 *   --strict              Exit with error code if untranslated strings found
 *   --filter=<pattern>    Filter by component type or directory (e.g., --filter=toolbar)
 *   --json                Output results in JSON format
 *   --help                Show this help message
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    strict: args.includes('--strict'),
    json: args.includes('--json'),
    help: args.includes('--help'),
    filter: args.find(arg => arg.startsWith('--filter='))?.split('=')[1] || null,
};

if (options.help) {
    console.log(`
Enhanced Find Untranslated Strings Script

Usage: node find-untranslated.js [options]

Options:
  --strict              Exit with error code if untranslated strings found
  --filter=<pattern>    Filter by component type or directory (e.g., --filter=toolbar)
  --json                Output results in JSON format
  --help                Show this help message

Examples:
  node find-untranslated.js --strict
  node find-untranslated.js --filter=toolbar --json
  node find-untranslated.js --strict --filter=map
`);
    process.exit(0);
}

// Enhanced patterns with improved detection accuracy
const patterns = [
    {
        name: 'JSX text content',
        regex: />([A-Z][a-z]+(?:\s+[a-z]+)*[.!?]?)</g,
        description: 'Text directly within JSX tags',
        priority: 'high',
    },
    {
        name: 'Button text',
        regex: /<(?:Button|IconButton)[^>]*>([^<{]+)<\/(?:Button|IconButton)>/g,
        description: 'Text in Button components',
        priority: 'high',
    },
    {
        name: 'Dialog titles',
        regex: /<(?:DialogTitle|ModalTitle)[^>]*>([^<{]+)<\/(?:DialogTitle|ModalTitle)>/g,
        description: 'Text in Dialog/Modal title components',
        priority: 'high',
    },
    {
        name: 'Menu items',
        regex: /<(?:MenuItem|ListItem)[^>]*>([^<{]+)<\/(?:MenuItem|ListItem)>/g,
        description: 'Text in Menu/List item components',
        priority: 'high',
    },
    {
        name: 'Typography',
        regex: /<Typography[^>]*>([^<{]+)<\/Typography>/g,
        description: 'Text in Typography components',
        priority: 'medium',
    },
    {
        name: 'Tooltip content',
        regex: /<Tooltip[^>]*title=["']([^"']+)["'][^>]*>/g,
        description: 'Text in Tooltip title props',
        priority: 'high',
    },
    {
        name: 'Labels',
        regex: /(?:label|inputLabel)=["']([^"']+)["']/g,
        description: 'Text in label props',
        priority: 'high',
    },
    {
        name: 'Aria labels',
        regex: /aria-label=["']([^"']+)["']/g,
        description: 'Text in aria-label props (accessibility)',
        priority: 'critical',
    },
    {
        name: 'Aria descriptions',
        regex: /aria-describedby=["']([^"']+)["']|aria-description=["']([^"']+)["']/g,
        description: 'Text in aria-description props (accessibility)',
        priority: 'critical',
    },
    {
        name: 'Placeholders',
        regex: /placeholder=["']([^"']+)["']/g,
        description: 'Text in placeholder props',
        priority: 'medium',
    },
    {
        name: 'Titles',
        regex: /title=["']([^"']+)["']/g,
        description: 'Text in title props',
        priority: 'medium',
    },
    {
        name: 'Alt text',
        regex: /alt=["']([^"']+)["']/g,
        description: 'Text in alt props (accessibility)',
        priority: 'critical',
    },
    {
        name: 'Error messages',
        regex: /(?:error|errorText|helperText)=["']([^"']+)["']/g,
        description: 'Text in error/helper text props',
        priority: 'high',
    },
];

// Directories to search
const searchDirs = [path.join(__dirname, '../src/components')];

// File types to examine
const fileTypes = ['tsx', 'jsx', 'js', 'ts'];

// Files to exclude
const excludedPaths = ['node_modules', 'dist', 'build', 'coverage', '.next'];

// Counter for statistics
let totalIssues = 0;
let totalFilesWithIssues = 0;
let totalFilesScanned = 0;
const results = {
    summary: {},
    files: [],
    timestamp: new Date().toISOString(),
};

function shouldExcludeFile(filePath) {
    return excludedPaths.some(excluded => filePath.includes(excluded));
}

function shouldIncludeByFilter(filePath, filter) {
    if (!filter) return true;
    return filePath.toLowerCase().includes(filter.toLowerCase());
}

function getLineNumber(content, matchIndex) {
    const beforeMatch = content.substring(0, matchIndex);
    return beforeMatch.split('\n').length;
}

function findUntranslatedStrings(filePath) {
    if (shouldExcludeFile(filePath) || !shouldIncludeByFilter(filePath, options.filter)) {
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    totalFilesScanned++;

    // Check for each pattern
    patterns.forEach(pattern => {
        const matches = [...content.matchAll(pattern.regex)];

        matches.forEach(match => {
            // Handle multiple capture groups (for aria-describedby pattern)
            const text = (match[1] || match[2] || '').trim();
            
            // Skip very short strings, they're unlikely to need translation
            if (text.length < 2) return;
            
            // Skip common non-translatable patterns
            if (isNonTranslatable(text)) return;

            // Enhanced context checking for translation usage
            const lineNumber = getLineNumber(content, match.index);
            const lineContext = getLineContext(content, match.index, 100);
            
            if (isAlreadyTranslated(lineContext, text)) return;

            // Generate suggested translation key
            const suggestedKey = generateTranslationKey(filePath, pattern.name, text);

            issues.push({
                type: pattern.name,
                text,
                description: pattern.description,
                priority: pattern.priority,
                line: lineNumber,
                suggestedKey,
                context: lineContext.trim(),
            });
        });
    });

    return issues;
}

function isNonTranslatable(text) {
    // Skip common non-translatable patterns
    const nonTranslatablePatterns = [
        /^[0-9]+$/, // Pure numbers
        /^[a-zA-Z0-9_-]+$/, // IDs, class names, etc.
        /^[A-Z_]+$/, // Constants
        /^\w+\.\w+/, // Property access
        /^https?:\/\//, // URLs
        /^\/[\/\w-]*/, // Paths
        /^#[a-fA-F0-9]{3,6}$/, // Hex colors
        /^rgb\(/, // RGB colors
        /^[{}[\]()]+$/, // Brackets only
        /^[.,;:!?]+$/, // Punctuation only
    ];
    
    return nonTranslatablePatterns.some(pattern => pattern.test(text));
}

function getLineContext(content, matchIndex, contextLength = 100) {
    const start = Math.max(0, matchIndex - contextLength);
    const end = Math.min(content.length, matchIndex + contextLength);
    return content.substring(start, end);
}

function isAlreadyTranslated(lineContext, text) {
    // Enhanced detection for translation usage
    const translationPatterns = [
        /t\s*\(/,                    // t( function call
        /useTranslation/,            // useTranslation hook
        /useI18n/,                   // useI18n hook
        /\$\{.*t\(/,                // Template literal with t(
        /i18n\./,                    // i18n object usage
        /Trans\s+/,                  // Trans component
        /Translation\s+/,            // Translation component
    ];
    
    return translationPatterns.some(pattern => pattern.test(lineContext));
}

function generateTranslationKey(filePath, patternType, text) {
    // Extract component name from file path
    const fileName = path.basename(filePath, path.extname(filePath));
    const componentName = fileName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Generate key based on pattern type and text
    const typeMap = {
        'JSX text content': 'text',
        'Button text': 'button',
        'Dialog titles': 'title',
        'Menu items': 'menu',
        'Typography': 'text',
        'Tooltip content': 'tooltip',
        'Labels': 'label',
        'Aria labels': 'aria',
        'Aria descriptions': 'aria',
        'Placeholders': 'placeholder',
        'Titles': 'title',
        'Alt text': 'alt',
        'Error messages': 'error',
    };
    
    const keyType = typeMap[patternType] || 'text';
    const textKey = text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 20);
    
    return `${componentName}.${keyType}.${textKey}`;
}

function scanDirectory() {
    searchDirs.forEach(dir => {
        const filesPattern = path.join(dir, `**/*.{${fileTypes.join(',')}}`);
        const files = glob.sync(filesPattern, {nodir: true});

        files.forEach(file => {
            const issues = findUntranslatedStrings(file);

            if (issues.length > 0) {
                totalFilesWithIssues++;
                totalIssues += issues.length;

                const relativePath = file.replace(path.join(__dirname, '..'), '');
                
                // Store results for JSON output
                results.files.push({
                    path: relativePath,
                    issues: issues,
                    issueCount: issues.length,
                });

                if (!options.json) {
                    displayFileIssues(relativePath, issues);
                }
            }
        });
    });

    // Prepare summary
    results.summary = {
        totalFilesScanned,
        totalFilesWithIssues,
        totalIssues,
        issuesByPriority: getIssuesByPriority(),
        filterApplied: options.filter || null,
    };

    if (options.json) {
        console.log(JSON.stringify(results, null, 2));
    } else {
        displaySummary();
    }

    // Exit with error code in strict mode if issues found
    if (options.strict && totalIssues > 0) {
        process.exit(1);
    }
}

function displayFileIssues(relativePath, issues) {
    console.log(`\n\x1b[1m${relativePath}\x1b[0m`);
    console.log('-'.repeat(80));

    // Group issues by priority
    const priorityGroups = {
        critical: issues.filter(i => i.priority === 'critical'),
        high: issues.filter(i => i.priority === 'high'),
        medium: issues.filter(i => i.priority === 'medium'),
    };

    Object.entries(priorityGroups).forEach(([priority, priorityIssues]) => {
        if (priorityIssues.length === 0) return;

        const color = priority === 'critical' ? '\x1b[31m' : priority === 'high' ? '\x1b[33m' : '\x1b[36m';
        console.log(`\n${color}${priority.toUpperCase()} PRIORITY:\x1b[0m`);

        priorityIssues.forEach(issue => {
            console.log(`  Line ${issue.line}: \x1b[33m${issue.type}\x1b[0m`);
            console.log(`    Text: "${issue.text}"`);
            console.log(`    Suggested key: ${issue.suggestedKey}`);
            console.log(`    Description: ${issue.description}`);
            console.log('');
        });
    });
}

function getIssuesByPriority() {
    const counts = { critical: 0, high: 0, medium: 0 };
    results.files.forEach(file => {
        file.issues.forEach(issue => {
            counts[issue.priority] = (counts[issue.priority] || 0) + 1;
        });
    });
    return counts;
}

function displaySummary() {
    console.log('\n' + '='.repeat(80));
    console.log(`\x1b[1mSUMMARY\x1b[0m`);
    console.log(`- Scanned ${totalFilesScanned} files`);
    console.log(`- Found ${totalIssues} potentially untranslated strings in ${totalFilesWithIssues} files`);
    
    if (options.filter) {
        console.log(`- Filter applied: "${options.filter}"`);
    }

    const priorityCounts = getIssuesByPriority();
    if (priorityCounts.critical > 0) {
        console.log(`- \x1b[31mCritical issues: ${priorityCounts.critical}\x1b[0m (accessibility-related)`);
    }
    if (priorityCounts.high > 0) {
        console.log(`- \x1b[33mHigh priority issues: ${priorityCounts.high}\x1b[0m`);
    }
    if (priorityCounts.medium > 0) {
        console.log(`- \x1b[36mMedium priority issues: ${priorityCounts.medium}\x1b[0m`);
    }

    console.log(`\n\x1b[36mTo translate, use the t() function from the useI18n hook:\x1b[0m`);
    console.log(`  const { t } = useI18n();`);
    console.log(`  return <Button>{t('button.save', 'Save')}</Button>;`);
    
    if (options.strict) {
        console.log(`\n\x1b[33mRunning in strict mode - will exit with error code if issues found\x1b[0m`);
    }
}

// Run the script
if (!options.json) {
    console.log('Scanning for potentially untranslated strings...\n');
    if (options.filter) {
        console.log(`Filtering by: "${options.filter}"\n`);
    }
}

scanDirectory();
