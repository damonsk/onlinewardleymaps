#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

console.log('Checking key usage for actively used translation keys...\n');

// Keys we know are used based on our analysis
const activeKeys = [
    // NewHeader.tsx
    'header.getCloneUrl',
    'export.png',
    'export.svg',
    'header.hideLineNumbers',
    'header.showLineNumbers',
    'header.hideEvolvedLinks',
    'header.showEvolvedLinks',
    'header.usageGuide',
    'header.becomePatron',
    'header.editorMode',
    'header.presentationMode',
    'header.exampleMap',
    'common.new',
    'common.save',
    'sharing.cloneUrl',
    'sharing.url',
    'sharing.copy',
    'common.cancel',
    'map.saveMap',

    // Breadcrumb.tsx
    'map.yourMap',
    'map.unsaved',

    // Footer.tsx
    'footer.downloadExtension',
    'footer.twitter',
    'footer.wardleyMapping',
    'footer.wardleyMappingLink',
    'footer.createdBy',

    // MapEnvironment.tsx
    'map.saving',
    'editor.usage',
    'common.close',

    // Usage.tsx
    'editor.example',

    'components.type',
    'components.text',
    'common.add',

    // MapIterations.tsx
    'common.back',
    'common.delete',
    'common.rename',
    'common.next',
    'common.update',
    'iterations.renamePrompt',
    'iterations.iterationName',
    'dialogs.areYouSure',
    'iterations.deleteConfirmation',

    // LanguageSelector.tsx
    'navigation.language',

    // MapCanvasToolbar.tsx
    'map.toolbar.group',
    'map.toolbar.select',
    'map.toolbar.pan',
    'map.toolbar.zoomIn',
    'map.toolbar.zoomOut',
    'map.toolbar.fit',
    'map.toolbar.exitFullscreen',
    'map.toolbar.fullscreen',
];

console.log(`Checking ${activeKeys.length} known active keys...\n`);

let foundCount = 0;
let notFoundCount = 0;

activeKeys.forEach(key => {
    try {
        const result = execSync(`grep -r "t('${key}'" src/components/ || true`, {
            encoding: 'utf8',
            cwd: path.join(__dirname, '..'),
        });

        if (result.trim()) {
            foundCount++;
            console.log(`✓ ${key} - Found in: ${result.trim().split('\n')[0].split(':')[0]}`);
        } else {
            notFoundCount++;
            console.log(`✗ ${key} - NOT FOUND`);
        }
    } catch (error) {
        notFoundCount++;
        console.log(`✗ ${key} - ERROR checking`);
    }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Keys checked: ${activeKeys.length}`);
console.log(`Found: ${foundCount}`);
console.log(`Not found: ${notFoundCount}`);

if (notFoundCount === 0) {
    console.log(`\n✅ All known active translation keys are being used!`);
} else {
    console.log(`\n❌ Some keys may not be in use or have different patterns.`);
}

// Also check for some additional patterns used
console.log(`\nChecking additional patterns...`);

// Check for common: prefix usage (MapIterations.tsx)
const commonPrefix = execSync(`grep -r "t('common:" src/components/ || true`, {
    encoding: 'utf8',
    cwd: path.join(__dirname, '..'),
});

if (commonPrefix.trim()) {
    console.log(`✓ Found common: prefix usage in MapIterations.tsx`);
}

// Check for dynamic usage patterns
const dynamicUsage = execSync(`grep -r "editor.usages" src/components/ || true`, {
    encoding: 'utf8',
    cwd: path.join(__dirname, '..'),
});

if (dynamicUsage.trim()) {
    console.log(`✓ Found dynamic editor.usages pattern in Usage.tsx`);
}
