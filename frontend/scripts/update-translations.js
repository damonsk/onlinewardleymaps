#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define the new translation keys to add
const newMapKeys = {
    yourMap: {
        de: 'Ihre Karte',
        it: 'La Vostra Mappa',
        pt: 'Seu Mapa',
        ja: 'あなたのマップ',
        zh: '您的地图',
        ko: '귀하의 지도',
        ru: 'Ваша карта',
    },
    unsaved: {
        de: 'nicht gespeichert',
        it: 'non salvato',
        pt: 'não salvo',
        ja: '未保存',
        zh: '未保存',
        ko: '저장되지 않음',
        ru: 'не сохранено',
    },
    saving: {
        de: 'speichern...',
        it: 'salvando...',
        pt: 'salvando...',
        ja: '保存中...',
        zh: '保存中...',
        ko: '저장 중...',
        ru: 'сохранение...',
    },
};

const newFooterKeys = {
    createdBy: {
        de: 'Erstellt von',
        it: 'Creato da',
        pt: 'Criado por',
        ja: '作成者',
        zh: '创建者',
        ko: '제작자',
        ru: 'Создано',
    },
};

// Languages to update
const languages = ['de', 'it', 'pt', 'ja', 'zh', 'ko', 'ru'];

// Update each language file
languages.forEach(lang => {
    const filePath = path.join(__dirname, `../public/locales/${lang}/common.json`);

    try {
        // Read existing translation file
        const content = fs.readFileSync(filePath, 'utf8');
        const translations = JSON.parse(content);

        // Add new map keys
        Object.keys(newMapKeys).forEach(key => {
            if (newMapKeys[key][lang]) {
                translations.map[key] = newMapKeys[key][lang];
            }
        });

        // Add new footer keys
        Object.keys(newFooterKeys).forEach(key => {
            if (newFooterKeys[key][lang]) {
                translations.footer[key] = newFooterKeys[key][lang];
            }
        });

        // Write updated content back to file
        fs.writeFileSync(filePath, JSON.stringify(translations, null, 4));
        console.log(`Updated ${lang}/common.json`);
    } catch (error) {
        console.error(`Error updating ${lang}/common.json:`, error.message);
    }
});

console.log('Translation update complete!');
