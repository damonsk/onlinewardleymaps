#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ko', 'ru'];

languages.forEach(lang => {
    const filePath = path.join(__dirname, '..', 'public', 'locales', lang, 'common.json');

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Check if hideUsage and showUsage are at the wrong level
        if (data.editor && (data.editor.hideUsage || data.editor.showUsage)) {
            // Remove them from the wrong location
            const hideUsageValue = data.editor.hideUsage;
            const showUsageValue = data.editor.showUsage;

            delete data.editor.hideUsage;
            delete data.editor.showUsage;

            // Add them to the correct location within editor
            if (hideUsageValue) data.editor.hideUsage = hideUsageValue;
            if (showUsageValue) data.editor.showUsage = showUsageValue;

            console.log(`✅ Fixed structure for ${lang}/common.json - keys were already in editor section`);
        } else if (data.hideUsage || data.showUsage) {
            // They're at the root level, move them to editor section
            const hideUsageValue = data.hideUsage;
            const showUsageValue = data.showUsage;

            // Remove from root level
            delete data.hideUsage;
            delete data.showUsage;

            // Ensure editor section exists
            if (!data.editor) {
                data.editor = {};
            }

            // Add to editor section
            if (hideUsageValue) data.editor.hideUsage = hideUsageValue;
            if (showUsageValue) data.editor.showUsage = showUsageValue;

            console.log(`✅ Moved keys to editor section for ${lang}/common.json`);
        } else {
            // Keys don't exist, add them to editor section
            if (!data.editor) {
                data.editor = {};
            }

            const translations = {
                en: {hideUsage: 'Hide Usage', showUsage: 'Show Usage'},
                es: {hideUsage: 'Ocultar Uso', showUsage: 'Mostrar Uso'},
                fr: {hideUsage: "Masquer l'Utilisation", showUsage: "Afficher l'Utilisation"},
                de: {hideUsage: 'Verwendung Ausblenden', showUsage: 'Verwendung Anzeigen'},
                it: {hideUsage: 'Nascondi Utilizzo', showUsage: 'Mostra Utilizzo'},
                pt: {hideUsage: 'Ocultar Utilização', showUsage: 'Mostrar Utilização'},
                ja: {hideUsage: '使用法を非表示', showUsage: '使用法を表示'},
                zh: {hideUsage: '隐藏用法', showUsage: '显示用法'},
                ko: {hideUsage: '사용법 숨기기', showUsage: '사용법 보기'},
                ru: {hideUsage: 'Скрыть Использование', showUsage: 'Показать Использование'},
            };

            if (translations[lang]) {
                data.editor.hideUsage = translations[lang].hideUsage;
                data.editor.showUsage = translations[lang].showUsage;
                console.log(`✅ Added missing keys to editor section for ${lang}/common.json`);
            }
        }

        // Write back cleaned data
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    } catch (error) {
        console.error(`❌ Error processing ${lang}/common.json:`, error.message);
    }
});

console.log('\n🎉 All language files have correct editor usage key structure!');
