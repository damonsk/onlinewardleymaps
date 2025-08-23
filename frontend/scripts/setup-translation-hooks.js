#!/usr/bin/env node

/**
 * Setup Translation Validation Hooks
 * 
 * This script sets up git hooks for translation validation
 */

const fs = require('fs');
const path = require('path');

const HOOKS_DIR = path.join(__dirname, '../../.git/hooks');
const PRE_COMMIT_HOOK = path.join(HOOKS_DIR, 'pre-commit');

const preCommitScript = `#!/bin/sh
# Translation validation pre-commit hook

echo "🌐 Validating translations..."

# Check if we're in the frontend directory or need to cd into it
if [ -f "package.json" ] && grep -q "online-wardley-maps" package.json; then
    # We're in the frontend directory
    FRONTEND_DIR="."
elif [ -f "frontend/package.json" ]; then
    # We're in the root directory
    FRONTEND_DIR="frontend"
else
    echo "❌ Could not find frontend directory"
    exit 1
fi

cd "$FRONTEND_DIR"

# Run translation validation
echo "Checking translation completeness..."
if ! yarn run check-translation-completeness; then
    echo "❌ Translation completeness check failed"
    echo "Run 'yarn fix-translations' to automatically fix missing keys"
    exit 1
fi

echo "Checking for untranslated strings..."
if ! yarn run find-untranslated:strict; then
    echo "❌ Found untranslated strings"
    echo "Please use the useI18n hook and t() function for all user-facing text"
    exit 1
fi

echo "✅ Translation validation passed"
`;

function setupPreCommitHook() {
    try {
        // Ensure hooks directory exists
        if (!fs.existsSync(HOOKS_DIR)) {
            console.log('Git hooks directory not found. Make sure you are in a git repository.');
            return false;
        }

        // Write pre-commit hook
        fs.writeFileSync(PRE_COMMIT_HOOK, preCommitScript);
        
        // Make it executable
        fs.chmodSync(PRE_COMMIT_HOOK, '755');
        
        console.log('✅ Pre-commit hook installed successfully');
        console.log('Translation validation will now run automatically before each commit');
        return true;
        
    } catch (error) {
        console.error('❌ Failed to install pre-commit hook:', error.message);
        return false;
    }
}

function main() {
    console.log('Setting up translation validation hooks...\n');
    
    const success = setupPreCommitHook();
    
    if (success) {
        console.log('\n🎉 Setup complete!');
        console.log('\nAvailable commands:');
        console.log('  yarn validate-translations     - Run full translation validation');
        console.log('  yarn check-translation-completeness - Check missing translations');
        console.log('  yarn find-untranslated:strict  - Find untranslated strings (strict mode)');
        console.log('  yarn fix-translations          - Auto-fix missing translation keys');
        console.log('\nThe pre-commit hook will automatically validate translations before each commit.');
    } else {
        console.log('\n❌ Setup failed. You may need to run this script from the project root.');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { setupPreCommitHook };