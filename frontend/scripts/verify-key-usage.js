#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

// Read the common.json to get all available keys
const commonJsonPath = path.join(__dirname, '../public/locales/en/common.json');
const commonJson = JSON.parse(fs.readFileSync(commonJsonPath, 'utf8'));

// Extract all translation keys recursively
function extractKeys(obj, prefix = '') {
    let keys = [];
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
            keys.push(...extractKeys(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

const allTranslationKeys = extractKeys(commonJson);
console.log(`Found ${allTranslationKeys.length} translation keys in common.json\n`);

// Search for usage of each key in the codebase
const usedKeys = new Set();
const unusedKeys = [];

console.log('Checking key usage in components...\n');

allTranslationKeys.forEach(key => {
    try {
        // Search for the key in TypeScript/TSX files
        const searchPattern = `t\\(['"\`]${key.replace('.', '\\.')}['"\`]`;
        const result = execSync(`grep -r "${searchPattern}" src/components/ || true`, {
            encoding: 'utf8',
            cwd: path.join(__dirname, '..'),
        });

        if (result.trim()) {
            usedKeys.add(key);
            console.log(`✓ ${key} - Used`);
        } else {
            // Also check for dynamic keys (like in Usage.tsx)
            const dynamicPattern = key.split('.').pop();
            const dynamicSearch = execSync(`grep -r "editor\\.usages\\." src/components/ || true`, {
                encoding: 'utf8',
                cwd: path.join(__dirname, '..'),
            });

            if (key.startsWith('editor.usages.') && dynamicSearch.trim()) {
                usedKeys.add(key);
                console.log(`✓ ${key} - Used (dynamic)`);
            } else {
                unusedKeys.push(key);
                console.log(`✗ ${key} - NOT USED`);
            }
        }
    } catch (error) {
        unusedKeys.push(key);
        console.log(`✗ ${key} - ERROR checking usage`);
    }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total keys: ${allTranslationKeys.length}`);
console.log(`Used keys: ${usedKeys.size}`);
console.log(`Unused keys: ${unusedKeys.length}`);

if (unusedKeys.length > 0) {
    console.log(`\n=== UNUSED KEYS ===`);
    unusedKeys.forEach(key => console.log(`- ${key}`));
} else {
    console.log(`\n✅ All translation keys are being used!`);
}
