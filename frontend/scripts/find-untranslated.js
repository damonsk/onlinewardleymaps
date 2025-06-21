#!/usr/bin/env node

/**
 * This script helps identify potentially untranslated strings in the React components
 * It searches for common patterns where text is likely to be displayed to users
 * but may not be wrapped in the t() translation function.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to look for
const patterns = [
    {
        name: 'JSX text content',
        regex: />([A-Z][a-z]+(\s+[a-z]+)+)</g,
        description: 'Text directly within JSX tags',
    },
    {
        name: 'Button text',
        regex: /<Button[^>]*>([^<{]+)<\/Button>/g,
        description: 'Text in Button components',
    },
    {
        name: 'Dialog titles',
        regex: /<DialogTitle[^>]*>([^<{]+)<\/DialogTitle>/g,
        description: 'Text in DialogTitle components',
    },
    {
        name: 'Menu items',
        regex: /<MenuItem[^>]*>([^<{]+)<\/MenuItem>/g,
        description: 'Text in MenuItem components',
    },
    {
        name: 'Typography',
        regex: /<Typography[^>]*>([^<{]+)<\/Typography>/g,
        description: 'Text in Typography components',
    },
    {
        name: 'Labels',
        regex: /label=["']([^"']+)["']/g,
        description: 'Text in label props',
    },
    {
        name: 'Aria labels',
        regex: /aria-label=["']([^"']+)["']/g,
        description: 'Text in aria-label props',
    },
    {
        name: 'Placeholders',
        regex: /placeholder=["']([^"']+)["']/g,
        description: 'Text in placeholder props',
    },
    {
        name: 'Titles',
        regex: /title=["']([^"']+)["']/g,
        description: 'Text in title props',
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

function shouldExcludeFile(filePath) {
    return excludedPaths.some(excluded => filePath.includes(excluded));
}

function findUntranslatedStrings(filePath) {
    if (shouldExcludeFile(filePath)) return [];

    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    totalFilesScanned++;

    // Check for each pattern
    patterns.forEach(pattern => {
        const matches = [...content.matchAll(pattern.regex)];

        matches.forEach(match => {
            const text = match[1].trim();
            // Skip very short strings, they're unlikely to need translation
            if (text.length < 3) return;

            // Skip strings that are already translated
            const lineContext = content.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50);
            if (lineContext.includes('t(') || lineContext.includes('useTranslation')) return;

            issues.push({
                type: pattern.name,
                text,
                description: pattern.description,
            });
        });
    });

    return issues;
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

                console.log(`\n\x1b[1m${file.replace(path.join(__dirname, '..'), '')}\x1b[0m`);
                console.log('-'.repeat(80));

                issues.forEach(issue => {
                    console.log(`- \x1b[33m${issue.type}:\x1b[0m "${issue.text}"`);
                });
            }
        });
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\x1b[1mSummary:\x1b[0m`);
    console.log(`- Scanned ${totalFilesScanned} files`);
    console.log(`- Found ${totalIssues} potentially untranslated strings in ${totalFilesWithIssues} files`);
    console.log(`\n\x1b[36mTo translate, use the t() function from the useI18n hook:\x1b[0m`);
    console.log(`  const { t } = useI18n();`);
    console.log(`  return <Button>{t('common.save', 'Save')}</Button>;`);
}

// Run the script
console.log('Scanning for potentially untranslated strings...\n');
scanDirectory();
