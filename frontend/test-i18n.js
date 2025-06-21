// Simple test to verify translation files are correctly structured
const fs = require('fs');
const path = require('path');

const localesDir = path.resolve('./public/locales');
const languages = ['en', 'es', 'fr', 'de', 'it', 'pt'];

console.log('Testing translation files...\n');

languages.forEach(lang => {
    const filePath = path.join(localesDir, lang, 'common.json');

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const translations = JSON.parse(content);

        console.log(`✓ ${lang}/common.json is valid JSON`);

        // Check for required keys
        const requiredKeys = ['common'];
        requiredKeys.forEach(key => {
            if (translations[key]) {
                console.log(`  ✓ Has '${key}' section`);

                // Check for specific keys we're using
                const commonKeys = ['back', 'next', 'add', 'delete', 'rename', 'cancel', 'update'];
                commonKeys.forEach(commonKey => {
                    if (translations[key][commonKey]) {
                        console.log(`    ✓ Has '${key}.${commonKey}': "${translations[key][commonKey]}"`);
                    } else {
                        console.log(`    ✗ Missing '${key}.${commonKey}'`);
                    }
                });
            } else {
                console.log(`  ✗ Missing '${key}' section`);
            }
        });
    } catch (error) {
        console.log(`✗ ${lang}/common.json failed:`, error.message);
    }

    console.log('');
});

console.log('Test completed.');
