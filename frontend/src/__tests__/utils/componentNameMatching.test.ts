import {
    normalizeComponentName,
    componentNamesMatch,
    findComponentByName,
    isValidComponentName,
    getComponentNameDisplayFormat,
    needsQuotes,
    escapeComponentNameForMapText,
    unescapeComponentNameFromMapText,
} from '../../utils/componentNameMatching';

describe('Component Name Matching Utilities', () => {
    describe('normalizeComponentName', () => {
        it('should convert line breaks to spaces', () => {
            expect(normalizeComponentName('Line1\nLine2')).toBe('line1 line2');
            expect(normalizeComponentName('Multi\nLine\nComponent')).toBe('multi line component');
        });

        it('should trim extra whitespace', () => {
            expect(normalizeComponentName('  Component  ')).toBe('component');
            expect(normalizeComponentName('\n  Component  \n')).toBe('component');
        });

        it('should convert to lowercase', () => {
            expect(normalizeComponentName('DATABASE')).toBe('database');
            expect(normalizeComponentName('CamelCase')).toBe('camelcase');
        });

        it('should normalize multiple spaces', () => {
            expect(normalizeComponentName('Component    Name')).toBe('component name');
            expect(normalizeComponentName('A\n\n\nB')).toBe('a b');
        });

        it('should handle empty or invalid input', () => {
            expect(normalizeComponentName('')).toBe('');
            expect(normalizeComponentName('   ')).toBe('');
            expect(normalizeComponentName(null as any)).toBe('');
            expect(normalizeComponentName(undefined as any)).toBe('');
        });

        it('should handle complex multi-line names', () => {
            const input = 'User Authentication\nService\n(OAuth 2.0)';
            const expected = 'user authentication service (oauth 2.0)';
            expect(normalizeComponentName(input)).toBe(expected);
        });
    });

    describe('componentNamesMatch', () => {
        it('should match identical names', () => {
            expect(componentNamesMatch('Component', 'Component')).toBe(true);
            expect(componentNamesMatch('Multi\nLine', 'Multi\nLine')).toBe(true);
        });

        it('should match normalized names', () => {
            expect(componentNamesMatch('Multi\nLine', 'Multi Line')).toBe(true);
            expect(componentNamesMatch('DATABASE', 'database')).toBe(true);
            expect(componentNamesMatch('  API Gateway  \n  v2.0  ', 'API Gateway v2.0')).toBe(true);
        });

        it('should not match different names', () => {
            expect(componentNamesMatch('Component1', 'Component2')).toBe(false);
            expect(componentNamesMatch('Database', 'API Gateway')).toBe(false);
        });

        it('should handle empty or invalid input', () => {
            expect(componentNamesMatch('', 'Component')).toBe(false);
            expect(componentNamesMatch('Component', '')).toBe(false);
            expect(componentNamesMatch('', '')).toBe(false);
            expect(componentNamesMatch(null as any, 'Component')).toBe(false);
        });

        it('should handle special characters and escaping', () => {
            const name1 = 'Component with "quotes"\nand backslashes\\';
            const name2 = 'Component with "quotes" and backslashes\\';
            expect(componentNamesMatch(name1, name2)).toBe(true);
        });

        it('should be case insensitive', () => {
            expect(componentNamesMatch('API Gateway', 'api gateway')).toBe(true);
            expect(componentNamesMatch('Database\nService', 'DATABASE\nSERVICE')).toBe(true);
        });
    });

    describe('findComponentByName', () => {
        const components = [
            {name: 'Simple Component', id: 'simple'},
            {name: 'Multi-line\nComponent', id: 'multiline'},
            {name: 'Database\nService', id: 'database'},
            {name: 'API Gateway\nv2.1.0', id: 'api'},
        ];

        it('should find components by exact name', () => {
            const result = findComponentByName(components, 'Simple Component');
            expect(result?.id).toBe('simple');
        });

        it('should find components by normalized name', () => {
            let result = findComponentByName(components, 'Multi-line Component');
            expect(result?.id).toBe('multiline');

            result = findComponentByName(components, 'database\nservice');
            expect(result?.id).toBe('database');

            result = findComponentByName(components, '  API Gateway  \n  v2.1.0  ');
            expect(result?.id).toBe('api');
        });

        it('should return undefined for non-existent components', () => {
            const result = findComponentByName(components, 'Non-existent Component');
            expect(result).toBeUndefined();
        });

        it('should handle empty arrays and invalid input', () => {
            expect(findComponentByName([], 'Component')).toBeUndefined();
            expect(findComponentByName(components, '')).toBeUndefined();
            expect(findComponentByName(null as any, 'Component')).toBeUndefined();
        });

        it('should prioritize exact matches over normalized matches', () => {
            const componentsWithDuplicates = [
                {name: 'Component Name', id: 'exact'},
                {name: 'component\nname', id: 'normalized'},
            ];

            const result = findComponentByName(componentsWithDuplicates, 'Component Name');
            expect(result?.id).toBe('exact'); // Should find exact match first
        });
    });

    describe('isValidComponentName', () => {
        it('should validate valid names', () => {
            expect(isValidComponentName('Valid Component')).toBe(true);
            expect(isValidComponentName('Multi\nLine')).toBe(true);
            expect(isValidComponentName('A')).toBe(true);
        });

        it('should reject invalid names', () => {
            expect(isValidComponentName('')).toBe(false);
            expect(isValidComponentName('   ')).toBe(false);
            expect(isValidComponentName(null as any)).toBe(false);
            expect(isValidComponentName(undefined as any)).toBe(false);
        });
    });

    describe('getComponentNameDisplayFormat', () => {
        it('should format component names for display', () => {
            expect(getComponentNameDisplayFormat('Multi\nLine')).toBe('Multi\\nLine');
            expect(getComponentNameDisplayFormat('Tab\tSeparated')).toBe('Tab\\tSeparated');
            expect(getComponentNameDisplayFormat('Carriage\rReturn')).toBe('Carriage\\rReturn');
        });

        it('should handle empty names', () => {
            expect(getComponentNameDisplayFormat('')).toBe('<empty>');
            expect(getComponentNameDisplayFormat(null as any)).toBe('<empty>');
        });

        it('should handle complex formatting', () => {
            const input = 'Complex\nWith\tTabs\rAnd\nBreaks';
            const expected = 'Complex\\nWith\\tTabs\\rAnd\\nBreaks';
            expect(getComponentNameDisplayFormat(input)).toBe(expected);
        });
    });

    describe('needsQuotes', () => {
        it('should identify names that need quotes', () => {
            expect(needsQuotes('Multi\nLine')).toBe(true);
            expect(needsQuotes('Component with "quotes"')).toBe(true);
            expect(needsQuotes('Component->Arrow')).toBe(true);
            expect(needsQuotes(' Leading Space')).toBe(true);
            expect(needsQuotes('Trailing Space ')).toBe(true);
            expect(needsQuotes('Component[bracket]')).toBe(true);
            expect(needsQuotes('Component]bracket[')).toBe(true);
        });

        it('should identify names that do not need quotes', () => {
            expect(needsQuotes('Simple Component')).toBe(false);
            expect(needsQuotes('Component_Name')).toBe(false);
            expect(needsQuotes('Component-Name')).toBe(false);
            expect(needsQuotes('123 Component')).toBe(false);
        });

        it('should handle edge cases', () => {
            expect(needsQuotes('')).toBe(false);
            expect(needsQuotes(null as any)).toBe(false);
            expect(needsQuotes(undefined as any)).toBe(false);
        });
    });

    describe('escapeComponentNameForMapText', () => {
        it('should leave simple names unchanged', () => {
            expect(escapeComponentNameForMapText('Simple Component')).toBe('Simple Component');
            expect(escapeComponentNameForMapText('Database')).toBe('Database');
        });

        it('should quote and escape multi-line names', () => {
            expect(escapeComponentNameForMapText('Multi\nLine')).toBe('"Multi\\nLine"');
            expect(escapeComponentNameForMapText('Three\nLine\nComponent')).toBe('"Three\\nLine\\nComponent"');
        });

        it('should escape quotes in component names', () => {
            expect(escapeComponentNameForMapText('Component with "quotes"')).toBe('"Component with \\"quotes\\""');
        });

        it('should escape backslashes', () => {
            expect(escapeComponentNameForMapText('Component with \\backslash')).toBe('"Component with \\\\backslash"');
        });

        it('should escape arrows', () => {
            expect(escapeComponentNameForMapText('Component->Arrow')).toBe('"Component->Arrow"');
        });

        it('should handle complex escaping', () => {
            const input = 'Complex "quoted"\nWith \\backslash\nAnd line breaks';
            const expected = '"Complex \\"quoted\\"\\nWith \\\\backslash\\nAnd line breaks"';
            expect(escapeComponentNameForMapText(input)).toBe(expected);
        });

        it('should quote names with leading/trailing spaces', () => {
            expect(escapeComponentNameForMapText(' Leading Space')).toBe('" Leading Space"');
            expect(escapeComponentNameForMapText('Trailing Space ')).toBe('"Trailing Space "');
        });

        it('should handle brackets', () => {
            expect(escapeComponentNameForMapText('Component[bracket]')).toBe('"Component[bracket]"');
        });

        it('should handle carriage returns and tabs', () => {
            expect(escapeComponentNameForMapText('Component\rWith\tSpecial')).toBe('"Component\\rWith\\tSpecial"');
        });

        it('should handle empty names gracefully', () => {
            expect(escapeComponentNameForMapText('')).toBe('');
            expect(escapeComponentNameForMapText(null as any)).toBe(null);
            expect(escapeComponentNameForMapText(undefined as any)).toBe(undefined);
        });

        it('should handle real-world examples', () => {
            // Documentation style component
            const doc = 'User Authentication\nService\n(OAuth 2.0)';
            const expectedDoc = '"User Authentication\\nService\\n(OAuth 2.0)"';
            expect(escapeComponentNameForMapText(doc)).toBe(expectedDoc);

            // Technical component with details
            const tech = 'Database\nPostgreSQL 13\n(Primary)';
            const expectedTech = '"Database\\nPostgreSQL 13\\n(Primary)"';
            expect(escapeComponentNameForMapText(tech)).toBe(expectedTech);

            // API with version
            const api = 'API Gateway\nv2.1.0\n(Load Balanced)';
            const expectedApi = '"API Gateway\\nv2.1.0\\n(Load Balanced)"';
            expect(escapeComponentNameForMapText(api)).toBe(expectedApi);
        });
    });

    describe('unescapeComponentNameFromMapText', () => {
        it('should leave simple names unchanged', () => {
            expect(unescapeComponentNameFromMapText('Simple Component')).toBe('Simple Component');
            expect(unescapeComponentNameFromMapText('Database')).toBe('Database');
        });

        it('should remove quotes and unescape multi-line names', () => {
            expect(unescapeComponentNameFromMapText('"Multi\\nLine"')).toBe('Multi\nLine');
            expect(unescapeComponentNameFromMapText('"Three\\nLine\\nComponent"')).toBe('Three\nLine\nComponent');
        });

        it('should unescape quotes in component names', () => {
            expect(unescapeComponentNameFromMapText('"Component with \\"quotes\\""')).toBe('Component with "quotes"');
        });

        it('should unescape backslashes', () => {
            expect(unescapeComponentNameFromMapText('"Component with \\\\backslash"')).toBe('Component with \\backslash');
        });

        it('should handle complex unescaping', () => {
            const input = '"Complex \\"quoted\\"\\nWith \\\\backslash\\nAnd line breaks"';
            const expected = 'Complex "quoted"\nWith \\backslash\nAnd line breaks';
            expect(unescapeComponentNameFromMapText(input)).toBe(expected);
        });

        it('should unescape carriage returns and tabs', () => {
            expect(unescapeComponentNameFromMapText('"Component\\rWith\\tSpecial"')).toBe('Component\rWith\tSpecial');
        });

        it('should handle names without quotes', () => {
            expect(unescapeComponentNameFromMapText('Multi\\nLine')).toBe('Multi\nLine');
            expect(unescapeComponentNameFromMapText('Component\\nWith\\nEscapes')).toBe('Component\nWith\nEscapes');
        });

        it('should handle empty names gracefully', () => {
            expect(unescapeComponentNameFromMapText('')).toBe('');
            expect(unescapeComponentNameFromMapText(null as any)).toBe(null);
            expect(unescapeComponentNameFromMapText(undefined as any)).toBe(undefined);
        });

        it('should be the inverse of escapeComponentNameForMapText', () => {
            const testCases = [
                'Multi\nLine Component',
                'Component with "quotes"',
                'Component with \\backslash',
                'Complex "quoted"\nWith \\backslash\nAnd line breaks',
                'Component\rWith\tSpecial',
                'User Authentication\nService\n(OAuth 2.0)',
                'Database\nPostgreSQL 13\n(Primary)',
                'API Gateway\nv2.1.0\n(Load Balanced)',
            ];

            testCases.forEach(testCase => {
                const escaped = escapeComponentNameForMapText(testCase);
                const unescaped = unescapeComponentNameFromMapText(escaped);
                expect(unescaped).toBe(testCase);
            });
        });

        it('should handle real-world link parsing examples', () => {
            // Simulate what the link parser receives
            expect(unescapeComponentNameFromMapText('"Database\\nService"')).toBe('Database\nService');
            expect(unescapeComponentNameFromMapText('"API\\nGateway"')).toBe('API\nGateway');
            expect(unescapeComponentNameFromMapText('Simple Component')).toBe('Simple Component');
        });
    });
});
