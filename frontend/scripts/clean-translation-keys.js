#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ko', 'ru'];

languages.forEach(lang => {
    const filePath = path.join(__dirname, '..', 'public', 'locales', lang, 'common.json');

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Remove the incorrectly formatted common: entries
        if (data['common:back']) delete data['common:back'];
        if (data['common:delete']) delete data['common:delete'];
        if (data['common:rename']) delete data['common:rename'];
        if (data['common:add']) delete data['common:add'];
        if (data['common:next']) delete data['common:next'];
        if (data['common:cancel']) delete data['common:cancel'];
        if (data['common:update']) delete data['common:update'];
        if (data['common:dialogs']) delete data['common:dialogs'];
        if (data['common:iterations']) delete data['common:iterations'];

        // Ensure proper nested structure exists
        if (!data.iterations) {
            data.iterations = {};
        }
        if (!data.dialogs) {
            data.dialogs = {
                areYouSure: 'Are you sure?',
                deleteConfirmation: 'This action cannot be undone.',
                unsavedChanges: 'You have unsaved changes. Do you want to save them?',
                invalidInput: 'Please enter a valid input.',
                networkError: 'Network error. Please try again.',
                saveError: 'Error saving. Please try again.',
                loadError: 'Error loading. Please try again.',
            };
        }

        // Add specific iteration keys if missing
        const iterationKeys = {
            en: {
                renamePrompt: 'Enter a new name for the current iteration.',
                iterationName: 'Iteration Name',
                deleteConfirmation: "Are you sure you want to delete iteration '{{name}}'? This cannot be undone.",
            },
            es: {
                renamePrompt: 'Ingresa un nuevo nombre para la iteración actual.',
                iterationName: 'Nombre de Iteración',
                deleteConfirmation: "¿Estás seguro de que quieres eliminar la iteración '{{name}}'? Esto no se puede deshacer.",
            },
            fr: {
                renamePrompt: "Entrez un nouveau nom pour l'itération actuelle.",
                iterationName: "Nom d'Itération",
                deleteConfirmation: "Êtes-vous sûr de vouloir supprimer l'itération '{{name}}' ? Cela ne peut pas être annulé.",
            },
            de: {
                renamePrompt: 'Geben Sie einen neuen Namen für die aktuelle Iteration ein.',
                iterationName: 'Iterationsname',
                deleteConfirmation:
                    "Sind Sie sicher, dass Sie die Iteration '{{name}}' löschen möchten? Dies kann nicht rückgängig gemacht werden.",
            },
            it: {
                renamePrompt: "Inserisci un nuovo nome per l'iterazione corrente.",
                iterationName: 'Nome Iterazione',
                deleteConfirmation: "Sei sicuro di voler eliminare l'iterazione '{{name}}'? Questa azione non può essere annullata.",
            },
            pt: {
                renamePrompt: 'Insira um novo nome para a iteração actual.',
                iterationName: 'Nome da Iteração',
                deleteConfirmation: "Tem a certeza de que quer eliminar a iteração '{{name}}'? Isto não pode ser desfeito.",
            },
            ja: {
                renamePrompt: '現在のイテレーションの新しい名前を入力してください。',
                iterationName: 'イテレーション名',
                deleteConfirmation: "イテレーション '{{name}}' を削除してもよろしいですか？この操作は元に戻せません。",
            },
            zh: {
                renamePrompt: '為當前迭代輸入新名稱。',
                iterationName: '迭代名稱',
                deleteConfirmation: "您確定要刪除迭代 '{{name}}' 嗎？此操作無法撤銷。",
            },
            ko: {
                renamePrompt: '현재 반복에 대한 새 이름을 입력하세요.',
                iterationName: '반복 이름',
                deleteConfirmation: "반복 '{{name}}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
            },
            ru: {
                renamePrompt: 'Введите новое имя для текущей итерации.',
                iterationName: 'Имя итерации',
                deleteConfirmation: "Вы уверены, что хотите удалить итерацию '{{name}}'? Это действие нельзя отменить.",
            },
        };

        if (iterationKeys[lang]) {
            Object.assign(data.iterations, iterationKeys[lang]);
        }

        // Write back cleaned data
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
        console.log(`✅ Cleaned ${lang}/common.json`);
    } catch (error) {
        console.error(`❌ Error processing ${lang}/common.json:`, error.message);
    }
});

console.log('\n🎉 All language files cleaned!');
