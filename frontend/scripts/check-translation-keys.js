#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Languages to check
const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ko', 'ru'];

// Check that all language files have the required keys
const requiredKeys = {
    'map.yourMap': true,
    'map.unsaved': true,
    'map.saving': true,
    'footer.createdBy': true,
};

console.log('Checking translation files for required keys...\n');

let allValid = true;

languages.forEach(lang => {
    const filePath = path.join(__dirname, `../public/locales/${lang}/common.json`);

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const translations = JSON.parse(content);

        console.log(`Checking ${lang}/common.json:`);

        // Check map keys
        if (translations.map?.yourMap) {
            console.log(`  ✓ map.yourMap: "${translations.map.yourMap}"`);
        } else {
            console.log(`  ✗ map.yourMap: MISSING`);
            allValid = false;
        }

        if (translations.map?.unsaved) {
            console.log(`  ✓ map.unsaved: "${translations.map.unsaved}"`);
        } else {
            console.log(`  ✗ map.unsaved: MISSING`);
            allValid = false;
        }

        if (translations.map?.saving) {
            console.log(`  ✓ map.saving: "${translations.map.saving}"`);
        } else {
            console.log(`  ✗ map.saving: MISSING`);
            allValid = false;
        }

        // Check footer keys
        if (translations.footer?.createdBy) {
            console.log(`  ✓ footer.createdBy: "${translations.footer.createdBy}"`);
        } else {
            console.log(`  ✗ footer.createdBy: MISSING`);
            allValid = false;
        }

        console.log('');
    } catch (error) {
        console.error(`Error checking ${lang}/common.json:`, error.message);
        allValid = false;
    }
});

if (allValid) {
    console.log('✅ All translation files have the required keys!');
} else {
    console.log('❌ Some translation files are missing required keys.');
    process.exit(1);
}
