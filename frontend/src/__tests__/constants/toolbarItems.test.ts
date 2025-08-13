import {TOOLBAR_ITEMS, TOOLBAR_CATEGORIES, getToolbarItemById, KEYBOARD_SHORTCUTS} from '../../constants/toolbarItems';

describe('Toolbar Items Configuration', () => {
    describe('Method Application Tools', () => {
        test('should have method-build tool with correct configuration', () => {
            const buildTool = getToolbarItemById('method-build');

            expect(buildTool).toBeDefined();
            expect(buildTool?.id).toBe('method-build');
            expect(buildTool?.label).toBe('Build Method');
            expect(buildTool?.category).toBe('method');
            expect(buildTool?.toolType).toBe('method-application');
            expect(buildTool?.methodName).toBe('build');
            expect(buildTool?.keyboardShortcut).toBe('b');
        });

        test('should have method-buy tool with correct configuration', () => {
            const buyTool = getToolbarItemById('method-buy');

            expect(buyTool).toBeDefined();
            expect(buyTool?.id).toBe('method-buy');
            expect(buyTool?.label).toBe('Buy Method');
            expect(buyTool?.category).toBe('method');
            expect(buyTool?.toolType).toBe('method-application');
            expect(buyTool?.methodName).toBe('buy');
            expect(buyTool?.keyboardShortcut).toBe('u');
        });

        test('should have method-outsource tool with correct configuration', () => {
            const outsourceTool = getToolbarItemById('method-outsource');

            expect(outsourceTool).toBeDefined();
            expect(outsourceTool?.id).toBe('method-outsource');
            expect(outsourceTool?.label).toBe('Outsource Method');
            expect(outsourceTool?.category).toBe('method');
            expect(outsourceTool?.toolType).toBe('method-application');
            expect(outsourceTool?.methodName).toBe('outsource');
            expect(outsourceTool?.keyboardShortcut).toBe('o');
        });

        test('should have correct keyboard shortcuts mapping for method tools', () => {
            expect(KEYBOARD_SHORTCUTS['b']).toBe('method-build');
            expect(KEYBOARD_SHORTCUTS['u']).toBe('method-buy');
            expect(KEYBOARD_SHORTCUTS['o']).toBe('method-outsource');
        });
    });

    describe('Component Tools', () => {
        test('should have method-market tool with correct keyboard shortcut', () => {
            const marketTool = getToolbarItemById('method-market');

            expect(marketTool).toBeDefined();
            expect(marketTool?.id).toBe('method-market');
            expect(marketTool?.label).toBe('Market');
            expect(marketTool?.keyboardShortcut).toBe('m');
            expect(marketTool?.toolType).toBe('method-application');
            expect(marketTool?.methodName).toBe('market');
            expect(KEYBOARD_SHORTCUTS['m']).toBe('method-market');
        });

        test('should have method-ecosystem tool with correct keyboard shortcut', () => {
            const ecosystemTool = getToolbarItemById('method-ecosystem');

            expect(ecosystemTool).toBeDefined();
            expect(ecosystemTool?.id).toBe('method-ecosystem');
            expect(ecosystemTool?.label).toBe('Ecosystem');
            expect(ecosystemTool?.keyboardShortcut).toBe('e');
            expect(ecosystemTool?.toolType).toBe('method-application');
            expect(ecosystemTool?.methodName).toBe('ecosystem');
            expect(KEYBOARD_SHORTCUTS['e']).toBe('method-ecosystem');
        });

        test('should have method-inertia tool with correct keyboard shortcut', () => {
            const inertiaTool = getToolbarItemById('method-inertia');

            expect(inertiaTool).toBeDefined();
            expect(inertiaTool?.id).toBe('method-inertia');
            expect(inertiaTool?.label).toBe('Inertia');
            expect(inertiaTool?.keyboardShortcut).toBe('i');
            expect(inertiaTool?.toolType).toBe('method-application');
            expect(inertiaTool?.methodName).toBe('inertia');
            expect(KEYBOARD_SHORTCUTS['i']).toBe('method-inertia');
        });

        test('should have all method tools in the method category', () => {
            const methodTools = TOOLBAR_ITEMS.filter(item => item.category === 'method');

            expect(methodTools).toHaveLength(6);
            expect(methodTools.map(tool => tool.id)).toEqual(
                expect.arrayContaining([
                    'method-build',
                    'method-buy',
                    'method-outsource',
                    'method-inertia',
                    'method-market',
                    'method-ecosystem',
                ]),
            );
        });

        test('should have method-application toolType for all method tools', () => {
            const methodTools = TOOLBAR_ITEMS.filter(item => item.category === 'method');

            methodTools.forEach(tool => {
                expect(tool.toolType).toBe('method-application');
                expect(tool.methodName).toBeDefined();
            });
        });
    });

    describe('Action Tools', () => {
        test('should have undo tool with correct configuration', () => {
            const undoTool = getToolbarItemById('undo');

            expect(undoTool).toBeDefined();
            expect(undoTool?.id).toBe('undo');
            expect(undoTool?.label).toBe('Undo');
            expect(undoTool?.category).toBe('action');
            expect(undoTool?.toolType).toBe('action');
            expect(undoTool?.action).toBe('undo');
            expect(undoTool?.keyboardShortcut).toBe('ctrl+z');
        });

        test('should have redo tool with correct configuration', () => {
            const redoTool = getToolbarItemById('redo');

            expect(redoTool).toBeDefined();
            expect(redoTool?.id).toBe('redo');
            expect(redoTool?.label).toBe('Redo');
            expect(redoTool?.category).toBe('action');
            expect(redoTool?.toolType).toBe('action');
            expect(redoTool?.action).toBe('redo');
            expect(redoTool?.keyboardShortcut).toBe('ctrl+y');
        });

        test('should have correct keyboard shortcuts mapping for action tools', () => {
            expect(KEYBOARD_SHORTCUTS['ctrl+z']).toBe('undo');
            expect(KEYBOARD_SHORTCUTS['ctrl+y']).toBe('redo');
        });

        test('should have all action tools in the action category', () => {
            const actionTools = TOOLBAR_ITEMS.filter(item => item.category === 'action');

            expect(actionTools).toHaveLength(2);
            expect(actionTools.map(tool => tool.id)).toEqual(expect.arrayContaining(['undo', 'redo']));
        });

        test('should have action toolType for all action tools', () => {
            const actionTools = TOOLBAR_ITEMS.filter(item => item.category === 'action');

            actionTools.forEach(tool => {
                expect(tool.toolType).toBe('action');
                expect(tool.action).toBeDefined();
            });
        });

        test('should not have template or defaultName for action tools', () => {
            const actionTools = TOOLBAR_ITEMS.filter(item => item.category === 'action');

            actionTools.forEach(tool => {
                expect(tool.template).toBeUndefined();
                expect(tool.defaultName).toBeUndefined();
                expect(tool.methodName).toBeUndefined();
                expect(tool.subItems).toBeUndefined();
            });
        });
    });

    describe('Toolbar Categories', () => {
        test('should have action category with correct items', () => {
            const actionCategory = TOOLBAR_CATEGORIES.find(cat => cat.id === 'action');

            expect(actionCategory).toBeDefined();
            expect(actionCategory?.id).toBe('action');
            expect(actionCategory?.label).toBe('Actions');
            expect(actionCategory?.items).toEqual(['undo', 'redo']);
        });

        test('should include all action tools in action category', () => {
            const actionCategory = TOOLBAR_CATEGORIES.find(cat => cat.id === 'action');
            const actionTools = TOOLBAR_ITEMS.filter(item => item.category === 'action');

            expect(actionCategory?.items).toHaveLength(actionTools.length);
            actionTools.forEach(tool => {
                expect(actionCategory?.items).toContain(tool.id);
            });
        });
    });
});
