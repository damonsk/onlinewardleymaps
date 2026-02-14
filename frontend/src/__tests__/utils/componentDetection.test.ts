import {generateLinkSyntax, addLinkToMapText, linkExists} from '../../utils/componentDetection';
import {UnifiedComponent} from '../../types/unified/components';

describe('Component Detection with Multi-line Names', () => {
    describe('generateLinkSyntax', () => {
        it('should generate correct syntax for simple component names', () => {
            const source: UnifiedComponent = {name: 'Source Component'} as UnifiedComponent;
            const target: UnifiedComponent = {name: 'Target Component'} as UnifiedComponent;

            const result = generateLinkSyntax(source, target);
            expect(result).toBe('Source Component->Target Component');
        });

        it('should escape multi-line component names with quotes', () => {
            const source: UnifiedComponent = {name: 'Multi-line\nSource\nComponent'} as UnifiedComponent;
            const target: UnifiedComponent = {name: 'Simple Target'} as UnifiedComponent;

            const result = generateLinkSyntax(source, target);
            expect(result).toBe('"Multi-line\\nSource\\nComponent"->Simple Target');
        });

        it('should escape both components if both are multi-line', () => {
            const source: UnifiedComponent = {name: 'Source\nComponent'} as UnifiedComponent;
            const target: UnifiedComponent = {name: 'Target\nComponent'} as UnifiedComponent;

            const result = generateLinkSyntax(source, target);
            expect(result).toBe('"Source\\nComponent"->"Target\\nComponent"');
        });

        it('should escape component names with quotes', () => {
            const source: UnifiedComponent = {name: 'Component with "quotes"'} as UnifiedComponent;
            const target: UnifiedComponent = {name: 'Simple Target'} as UnifiedComponent;

            const result = generateLinkSyntax(source, target);
            expect(result).toBe('"Component with \\"quotes\\""->Simple Target');
        });

        it('should escape component names with arrows', () => {
            const source: UnifiedComponent = {name: 'Component->with->arrows'} as UnifiedComponent;
            const target: UnifiedComponent = {name: 'Target'} as UnifiedComponent;

            const result = generateLinkSyntax(source, target);
            expect(result).toBe('"Component->with->arrows"->Target');
        });

        it('should escape complex multi-line names with quotes and backslashes', () => {
            const source: UnifiedComponent = {
                name: 'Complex "quoted"\nWith \\backslash\\nAnd line breaks',
            } as UnifiedComponent;
            const target: UnifiedComponent = {name: 'Target'} as UnifiedComponent;

            const result = generateLinkSyntax(source, target);
            expect(result).toBe('"Complex \\"quoted\\"\\nWith \\\\backslash\\\\nAnd line breaks"->Target');
        });

        it('should handle empty component names gracefully', () => {
            const source: UnifiedComponent = {name: ''} as UnifiedComponent;
            const target: UnifiedComponent = {name: 'Target'} as UnifiedComponent;

            const result = generateLinkSyntax(source, target);
            expect(result).toBe('->Target');
        });

        it('should preserve whitespace in simple names but quote names with leading/trailing spaces', () => {
            const source: UnifiedComponent = {name: 'Normal Name'} as UnifiedComponent;
            const target: UnifiedComponent = {name: ' Target With Spaces '} as UnifiedComponent;

            const result = generateLinkSyntax(source, target);
            expect(result).toBe('Normal Name->" Target With Spaces "');
        });
    });

    describe('addLinkToMapText', () => {
        it('should add simple component links to map text', () => {
            const mapText = 'component Source [0.1, 0.9]\ncomponent Target [0.9, 0.1]';
            const source: UnifiedComponent = {name: 'Source'} as UnifiedComponent;
            const target: UnifiedComponent = {name: 'Target'} as UnifiedComponent;

            const result = addLinkToMapText(mapText, source, target);

            const expected = 'component Source [0.1, 0.9]\ncomponent Target [0.9, 0.1]\nSource->Target';
            expect(result).toBe(expected);
        });

        it('should add escaped multi-line component links to map text', () => {
            const mapText = 'component "Multi-line\\nSource" [0.1, 0.9]\ncomponent Target [0.9, 0.1]';
            const source: UnifiedComponent = {name: 'Multi-line\nSource'} as UnifiedComponent;
            const target: UnifiedComponent = {name: 'Target'} as UnifiedComponent;

            const result = addLinkToMapText(mapText, source, target);

            const expected = 'component "Multi-line\\nSource" [0.1, 0.9]\ncomponent Target [0.9, 0.1]\n"Multi-line\\nSource"->Target';
            expect(result).toBe(expected);
        });

        it('should add complex multi-line links with proper escaping', () => {
            const mapText = 'component "Database\\nService" [0.3, 0.8]\ncomponent "API\\nGateway" [0.7, 0.9]';
            const source: UnifiedComponent = {name: 'Database\nService'} as UnifiedComponent;
            const target: UnifiedComponent = {name: 'API\nGateway'} as UnifiedComponent;

            const result = addLinkToMapText(mapText, source, target);

            const expected =
                'component "Database\\nService" [0.3, 0.8]\ncomponent "API\\nGateway" [0.7, 0.9]\n"Database\\nService"->"API\\nGateway"';
            expect(result).toBe(expected);
        });

        it('should insert links in the correct position after component definitions', () => {
            const mapText = [
                'title My Map',
                'component Source [0.1, 0.9]',
                'component Target [0.9, 0.1]',
                'note Example note [0.5, 0.5]',
                '',
            ].join('\n');

            const source: UnifiedComponent = {name: 'Source'} as UnifiedComponent;
            const target: UnifiedComponent = {name: 'Target'} as UnifiedComponent;

            const result = addLinkToMapText(mapText, source, target);

            const expected = [
                'title My Map',
                'component Source [0.1, 0.9]',
                'component Target [0.9, 0.1]',
                'note Example note [0.5, 0.5]',
                'Source->Target',
                '',
            ].join('\n');
            expect(result).toBe(expected);
        });
    });

    describe('linkExists with multi-line names', () => {
        it('should detect existing links between multi-line components', () => {
            const source: UnifiedComponent = {name: 'Database\nService'} as UnifiedComponent;
            const target: UnifiedComponent = {name: 'API Gateway'} as UnifiedComponent;

            const existingLinks = [{start: 'Database\nService', end: 'API Gateway'}];

            const result = linkExists(source, target, existingLinks);
            expect(result).toBe(true);
        });

        it('should detect existing links with normalized matching', () => {
            const source: UnifiedComponent = {name: 'Database\nService'} as UnifiedComponent;
            const target: UnifiedComponent = {name: 'API Gateway'} as UnifiedComponent;

            const existingLinks = [
                {start: 'Database Service', end: 'API Gateway'}, // Normalized format
            ];

            const result = linkExists(source, target, existingLinks);
            expect(result).toBe(true);
        });

        it('should detect bidirectional links', () => {
            const source: UnifiedComponent = {name: 'Database\nService'} as UnifiedComponent;
            const target: UnifiedComponent = {name: 'API Gateway'} as UnifiedComponent;

            const existingLinks = [
                {start: 'API Gateway', end: 'Database Service'}, // Reverse direction
            ];

            const result = linkExists(source, target, existingLinks);
            expect(result).toBe(true);
        });

        it('should not detect non-existent links', () => {
            const source: UnifiedComponent = {name: 'Database\nService'} as UnifiedComponent;
            const target: UnifiedComponent = {name: 'API Gateway'} as UnifiedComponent;

            const existingLinks = [{start: 'Other Component', end: 'Different Target'}];

            const result = linkExists(source, target, existingLinks);
            expect(result).toBe(false);
        });
    });
});
