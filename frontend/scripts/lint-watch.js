#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('👀 Starting ESLint file watcher...');
console.log('🔍 Watching for changes in .js, .jsx, .ts, .tsx files');
console.log('💡 Press Ctrl+C to stop watching\n');

let isLinting = false;
let pendingFiles = new Set();

function runLint(files = []) {
    if (isLinting) {
        files.forEach(file => pendingFiles.add(file));
        return;
    }

    isLinting = true;
    const filesToLint = files.length > 0 ? files : ['.'];
    
    console.log(`🔧 Running ESLint on ${files.length > 0 ? files.join(', ') : 'all files'}...`);
    
    const eslint = spawn('npx', [
        'eslint',
        ...filesToLint,
        '--ext', '.js,.jsx,.ts,.tsx',
        '--fix',
        '--format=stylish',
        '--cache',
        '--cache-location', '.eslintcache'
    ], {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd()
    });

    eslint.on('close', (code) => {
        isLinting = false;
        if (code === 0) {
            console.log('✅ ESLint completed successfully\n');
        } else {
            console.log(`❌ ESLint found issues (exit code: ${code})\n`);
        }

        // Process any pending files
        if (pendingFiles.size > 0) {
            const pending = Array.from(pendingFiles);
            pendingFiles.clear();
            setTimeout(() => runLint(pending), 500);
        }
    });

    eslint.on('error', (err) => {
        console.error('❌ Failed to run ESLint:', err);
        isLinting = false;
    });
}

function shouldWatch(filePath) {
    // Ignore node_modules, .git, build directories, etc.
    if (filePath.includes('node_modules') || 
        filePath.includes('.git') || 
        filePath.includes('.next') || 
        filePath.includes('build') ||
        filePath.includes('dist') ||
        filePath.includes('.eslintcache')) {
        return false;
    }
    
    // Only watch js, jsx, ts, tsx files
    return /\.(js|jsx|ts|tsx)$/.test(filePath);
}

function watchDirectory(dir) {
    try {
        fs.watch(dir, { recursive: true }, (eventType, filename) => {
            if (!filename) return;
            
            const fullPath = path.join(dir, filename);
            
            if (!shouldWatch(fullPath)) return;
            
            if (eventType === 'change') {
                console.log(`📝 File changed: ${filename}`);
                setTimeout(() => runLint([fullPath]), 100);
            }
        });
    } catch (error) {
        console.error('❌ Error watching directory:', error.message);
    }
}

// Initial lint run
runLint();

// Start watching
watchDirectory('./src');

// Keep the process alive
process.on('SIGINT', () => {
    console.log('\n👋 Stopping ESLint watcher...');
    process.exit(0);
});

console.log('🎯 ESLint watcher is running. Watching src/ directory for changes...');
