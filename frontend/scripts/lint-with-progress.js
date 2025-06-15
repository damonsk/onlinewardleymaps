#!/usr/bin/env node

const {spawn} = require('child_process');
const fs = require('fs');
const path = require('path');

function countFiles(dir, extensions) {
    let count = 0;
    function walk(currentPath) {
        const items = fs.readdirSync(currentPath);
        for (const item of items) {
            const fullPath = path.join(currentPath, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                walk(fullPath);
            } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                count++;
            }
        }
    }
    try {
        walk(dir);
    } catch (e) {
        // Ignore errors for inaccessible directories
    }
    return count;
}

const shouldFix = process.argv.includes('--fix');
const totalFiles = countFiles('.', ['.js', '.jsx', '.ts', '.tsx']);

console.log(`🔍 Found ${totalFiles} TypeScript/JavaScript files to check...`);
console.log(`${shouldFix ? '🔧 Running ESLint with auto-fix' : '📋 Running ESLint check-only'}...`);

const args = ['.', '--ext', '.js,.jsx,.ts,.tsx', '--format=stylish'];

if (shouldFix) {
    args.push('--fix');
}

const eslint = spawn('npx', ['eslint', ...args], {
    stdio: 'inherit',
    shell: true,
});

eslint.on('close', code => {
    if (code === 0) {
        console.log(`✅ ESLint completed successfully! Processed ${totalFiles} files.`);
    } else {
        console.log(`❌ ESLint found issues. Exit code: ${code}`);
    }
    process.exit(code);
});

eslint.on('error', err => {
    console.error('❌ Failed to run ESLint:', err);
    process.exit(1);
});
