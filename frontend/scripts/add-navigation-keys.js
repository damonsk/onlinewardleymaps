#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Language configurations with the new keys
const languages = [
    {
        code: 'en',
        keys: {
            'navigation.dashboard': 'Dashboard',
            'navigation.editor': 'Editor',
            'navigation.enableDarkTheme': 'Enable Dark Theme',
            'navigation.enableLightTheme': 'Enable Light Theme',
            'common:back': 'Back',
            'common:delete': 'Delete',
            'common:rename': 'Rename',
            'common:add': 'Add',
            'common:next': 'Next',
            'common:cancel': 'Cancel',
            'common:update': 'Update',
            'common:dialogs.areYouSure': 'Are you sure?',
            'common:iterations.renamePrompt': 'Enter a new name for the current iteration.',
            'common:iterations.iterationName': 'Iteration Name',
            'common:iterations.deleteConfirmation': "Are you sure you want to delete iteration '{{name}}'? This cannot be undone.",
        },
    },
    {
        code: 'es',
        keys: {
            'navigation.dashboard': 'Tablero',
            'navigation.editor': 'Editor',
            'navigation.enableDarkTheme': 'Activar Tema Oscuro',
            'navigation.enableLightTheme': 'Activar Tema Claro',
            'common:back': 'Atrás',
            'common:delete': 'Eliminar',
            'common:rename': 'Renombrar',
            'common:add': 'Agregar',
            'common:next': 'Siguiente',
            'common:cancel': 'Cancelar',
            'common:update': 'Actualizar',
            'common:dialogs.areYouSure': '¿Estás seguro?',
            'common:iterations.renamePrompt': 'Ingresa un nuevo nombre para la iteración actual.',
            'common:iterations.iterationName': 'Nombre de Iteración',
            'common:iterations.deleteConfirmation':
                "¿Estás seguro de que quieres eliminar la iteración '{{name}}'? Esto no se puede deshacer.",
        },
    },
    {
        code: 'fr',
        keys: {
            'navigation.dashboard': 'Tableau de Bord',
            'navigation.editor': 'Éditeur',
            'navigation.enableDarkTheme': 'Activer le Thème Sombre',
            'navigation.enableLightTheme': 'Activer le Thème Clair',
            'common:back': 'Retour',
            'common:delete': 'Supprimer',
            'common:rename': 'Renommer',
            'common:add': 'Ajouter',
            'common:next': 'Suivant',
            'common:cancel': 'Annuler',
            'common:update': 'Mettre à jour',
            'common:dialogs.areYouSure': 'Êtes-vous sûr ?',
            'common:iterations.renamePrompt': "Entrez un nouveau nom pour l'itération actuelle.",
            'common:iterations.iterationName': "Nom d'Itération",
            'common:iterations.deleteConfirmation':
                "Êtes-vous sûr de vouloir supprimer l'itération '{{name}}' ? Cela ne peut pas être annulé.",
        },
    },
    {
        code: 'de',
        keys: {
            'navigation.dashboard': 'Dashboard',
            'navigation.editor': 'Editor',
            'navigation.enableDarkTheme': 'Dunkles Theme aktivieren',
            'navigation.enableLightTheme': 'Helles Theme aktivieren',
            'common:back': 'Zurück',
            'common:delete': 'Löschen',
            'common:rename': 'Umbenennen',
            'common:add': 'Hinzufügen',
            'common:next': 'Weiter',
            'common:cancel': 'Abbrechen',
            'common:update': 'Aktualisieren',
            'common:dialogs.areYouSure': 'Sind Sie sicher?',
            'common:iterations.renamePrompt': 'Geben Sie einen neuen Namen für die aktuelle Iteration ein.',
            'common:iterations.iterationName': 'Iterationsname',
            'common:iterations.deleteConfirmation':
                "Sind Sie sicher, dass Sie die Iteration '{{name}}' löschen möchten? Dies kann nicht rückgängig gemacht werden.",
        },
    },
    {
        code: 'it',
        keys: {
            'navigation.dashboard': 'Dashboard',
            'navigation.editor': 'Editor',
            'navigation.enableDarkTheme': 'Attiva Tema Scuro',
            'navigation.enableLightTheme': 'Attiva Tema Chiaro',
            'common:back': 'Indietro',
            'common:delete': 'Elimina',
            'common:rename': 'Rinomina',
            'common:add': 'Aggiungi',
            'common:next': 'Avanti',
            'common:cancel': 'Annulla',
            'common:update': 'Aggiorna',
            'common:dialogs.areYouSure': 'Sei sicuro?',
            'common:iterations.renamePrompt': "Inserisci un nuovo nome per l'iterazione corrente.",
            'common:iterations.iterationName': 'Nome Iterazione',
            'common:iterations.deleteConfirmation':
                "Sei sicuro di voler eliminare l'iterazione '{{name}}'? Questa azione non può essere annullata.",
        },
    },
    {
        code: 'pt',
        keys: {
            'navigation.dashboard': 'Painel',
            'navigation.editor': 'Editor',
            'navigation.enableDarkTheme': 'Activar Tema Escuro',
            'navigation.enableLightTheme': 'Activar Tema Claro',
            'common:back': 'Voltar',
            'common:delete': 'Eliminar',
            'common:rename': 'Renomear',
            'common:add': 'Adicionar',
            'common:next': 'Próximo',
            'common:cancel': 'Cancelar',
            'common:update': 'Actualizar',
            'common:dialogs.areYouSure': 'Tem a certeza?',
            'common:iterations.renamePrompt': 'Insira um novo nome para a iteração actual.',
            'common:iterations.iterationName': 'Nome da Iteração',
            'common:iterations.deleteConfirmation': "Tem a certeza de que quer eliminar a iteração '{{name}}'? Isto não pode ser desfeito.",
        },
    },
    {
        code: 'ja',
        keys: {
            'navigation.dashboard': 'ダッシュボード',
            'navigation.editor': 'エディター',
            'navigation.enableDarkTheme': 'ダークテーマを有効にする',
            'navigation.enableLightTheme': 'ライトテーマを有効にする',
            'common:back': '戻る',
            'common:delete': '削除',
            'common:rename': '名前を変更',
            'common:add': '追加',
            'common:next': '次へ',
            'common:cancel': 'キャンセル',
            'common:update': '更新',
            'common:dialogs.areYouSure': '本当によろしいですか？',
            'common:iterations.renamePrompt': '現在のイテレーションの新しい名前を入力してください。',
            'common:iterations.iterationName': 'イテレーション名',
            'common:iterations.deleteConfirmation': "イテレーション '{{name}}' を削除してもよろしいですか？この操作は元に戻せません。",
        },
    },
    {
        code: 'zh',
        keys: {
            'navigation.dashboard': '仪表板',
            'navigation.editor': '编辑器',
            'navigation.enableDarkTheme': '启用深色主题',
            'navigation.enableLightTheme': '启用浅色主题',
            'common:back': '返回',
            'common:delete': '删除',
            'common:rename': '重命名',
            'common:add': '添加',
            'common:next': '下一步',
            'common:cancel': '取消',
            'common:update': '更新',
            'common:dialogs.areYouSure': '您确定吗？',
            'common:iterations.renamePrompt': '为当前迭代输入新名称。',
            'common:iterations.iterationName': '迭代名称',
            'common:iterations.deleteConfirmation': "您确定要删除迭代 '{{name}}' 吗？此操作无法撤销。",
        },
    },
    {
        code: 'ko',
        keys: {
            'navigation.dashboard': '대시보드',
            'navigation.editor': '편집기',
            'navigation.enableDarkTheme': '다크 테마 활성화',
            'navigation.enableLightTheme': '라이트 테마 활성화',
            'common:back': '뒤로',
            'common:delete': '삭제',
            'common:rename': '이름 바꾸기',
            'common:add': '추가',
            'common:next': '다음',
            'common:cancel': '취소',
            'common:update': '업데이트',
            'common:dialogs.areYouSure': '정말 확실합니까?',
            'common:iterations.renamePrompt': '현재 반복에 대한 새 이름을 입력하세요.',
            'common:iterations.iterationName': '반복 이름',
            'common:iterations.deleteConfirmation': "반복 '{{name}}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
        },
    },
    {
        code: 'ru',
        keys: {
            'navigation.dashboard': 'Панель управления',
            'navigation.editor': 'Редактор',
            'navigation.enableDarkTheme': 'Включить тёмную тему',
            'navigation.enableLightTheme': 'Включить светлую тему',
            'common:back': 'Назад',
            'common:delete': 'Удалить',
            'common:rename': 'Переименовать',
            'common:add': 'Добавить',
            'common:next': 'Далее',
            'common:cancel': 'Отмена',
            'common:update': 'Обновить',
            'common:dialogs.areYouSure': 'Вы уверены?',
            'common:iterations.renamePrompt': 'Введите новое имя для текущей итерации.',
            'common:iterations.iterationName': 'Имя итерации',
            'common:iterations.deleteConfirmation': "Вы уверены, что хотите удалить итерацию '{{name}}'? Это действие нельзя отменить.",
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
        } else if (key.includes(':')) {
            // Handle namespaced keys like common:back
            const parts = key.split(':');
            const namespace = parts[0];
            const keyName = parts[1];

            if (!result[namespace]) {
                result[namespace] = {};
            }

            // Handle nested keys within namespace
            if (keyName.includes('.')) {
                const keyParts = keyName.split('.');
                let current = result[namespace];

                for (let i = 0; i < keyParts.length - 1; i++) {
                    if (!current[keyParts[i]]) {
                        current[keyParts[i]] = {};
                    }
                    current = current[keyParts[i]];
                }

                current[keyParts[keyParts.length - 1]] = value;
            } else {
                result[namespace][keyName] = value;
            }
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

        console.log(`✅ Updated ${code}/common.json with navigation keys`);
    } catch (error) {
        console.error(`❌ Error updating ${code}/common.json:`, error.message);
    }
});

console.log('\n🎉 All language files updated with navigation keys!');
