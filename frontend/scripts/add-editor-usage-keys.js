#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Language configurations with the new editor keys
const languages = [
    {
        code: 'en',
        keys: {
            'editor.hideUsage': 'Hide Usage',
            'editor.showUsage': 'Show Usage',
        },
    },
    {
        code: 'es',
        keys: {
            'editor.hideUsage': 'Ocultar Uso',
            'editor.showUsage': 'Mostrar Uso',
        },
    },
    {
        code: 'fr',
        keys: {
            'editor.hideUsage': "Masquer l'Utilisation",
            'editor.showUsage': "Afficher l'Utilisation",
        },
    },
    {
        code: 'de',
        keys: {
            'editor.hideUsage': 'Verwendung Ausblenden',
            'editor.showUsage': 'Verwendung Anzeigen',
        },
    },
    {
        code: 'it',
        keys: {
            'editor.hideUsage': 'Nascondi Utilizzo',
            'editor.showUsage': 'Mostra Utilizzo',
        },
    },
    {
        code: 'pt',
        keys: {
            'editor.hideUsage': 'Ocultar Utilização',
            'editor.showUsage': 'Mostrar Utilização',
        },
    },
    {
        code: 'ja',
        keys: {
            'editor.hideUsage': '使用法を非表示',
            'editor.showUsage': '使用法を表示',
        },
    },
    {
        code: 'zh',
        keys: {
            'editor.hideUsage': '隐藏用法',
            'editor.showUsage': '显示用法',
        },
    },
    {
        code: 'ko',
        keys: {
            'editor.hideUsage': '사용법 숨기기',
            'editor.showUsage': '사용법 보기',
        },
    },
    {
        code: 'ru',
        keys: {
            'editor.hideUsage': 'Скрыть Использование',
            'editor.showUsage': 'Показать Использование',
        },
    },
];

// Function to add keys to a JSON object while preserving structure
function addKeysToObject(obj, keys) {
    const result = {...obj};

    for (const [key, value] of Object.entries(keys)) {
        // Handle nested keys with dots
        if (key.includes('.')) {
            const parts = key.split('.');
            let current = result;

            // Navigate/create nested structure
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }

            // Set the final value
            current[parts[parts.length - 1]] = value;
        } else {
            result[key] = value;
        }
    }

    return result;
}

// Update each language file
languages.forEach(({code, keys}) => {
    const filePath = path.join(__dirname, '..', 'public', 'locales', code, 'common.json');

    try {
        // Read existing content
        const existingContent = fs.readFileSync(filePath, 'utf8');
        const existingData = JSON.parse(existingContent);

        // Add new keys
        const updatedData = addKeysToObject(existingData, keys);

        // Write back to file with proper formatting
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2) + '\n', 'utf8');

        console.log(`✅ Updated ${code}/common.json with editor usage keys`);
    } catch (error) {
        console.error(`❌ Error updating ${code}/common.json:`, error.message);
    }
});

console.log('\n🎉 All language files updated with editor usage keys!');
