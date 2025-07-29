import {TOOLBAR_ITEMS, getToolbarItemById, KEYBOARD_SHORTCUTS} from '../../constants/toolbarItems';

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

        test('should have all method tools in the method category', () => {
            const methodTools = TOOLBAR_ITEMS.filter(item => item.category === 'method');

            expect(methodTools).toHaveLength(3);
            expect(methodTools.map(tool => tool.id)).toEqual(expect.arrayContaining(['method-build', 'method-buy', 'method-outsource']));
        });

        test('should have method-application toolType for all method tools', () => {
            const methodTools = TOOLBAR_ITEMS.filter(item => item.category === 'method');

            methodTools.forEach(tool => {
                expect(tool.toolType).toBe('method-application');
                expect(tool.methodName).toBeDefined();
            });
        });
    });
});
