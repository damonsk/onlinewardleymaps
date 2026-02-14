import LinksExtractionStrategy from '../../conversion/LinksExtractionStrategy';

describe('LinksExtractionStrategy with Multi-line Component Names', () => {
    describe('basic link extraction', () => {
        it('should extract simple component links', () => {
            const mapText = 'Source Component->Target Component';
            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('Source Component');
            expect(result.links[0].end).toBe('Target Component');
            expect(result.links[0].flow).toBe(false);
            expect(result.errors).toHaveLength(0);
        });

        it('should extract quoted single-line component links', () => {
            const mapText = '"Source Component"->"Target Component"';
            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('Source Component');
            expect(result.links[0].end).toBe('Target Component');
        });
    });

    describe('multi-line component link extraction', () => {
        it('should extract and unescape multi-line component links', () => {
            const mapText = '"Multi-line\\nSource\\nComponent"->"Target Component"';
            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('Multi-line\nSource\nComponent');
            expect(result.links[0].end).toBe('Target Component');
            expect(result.errors).toHaveLength(0);
        });

        it('should extract links with both components multi-line', () => {
            const mapText = '"Database\\nService"->"API\\nGateway"';
            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('Database\nService');
            expect(result.links[0].end).toBe('API\nGateway');
        });

        it('should extract multi-line components with quotes in names', () => {
            const mapText = '"Component with \\"quotes\\"\\nand line breaks"->"Simple Target"';
            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('Component with "quotes"\nand line breaks');
            expect(result.links[0].end).toBe('Simple Target');
        });

        it('should extract multi-line components with backslashes', () => {
            const mapText = '"Component with \\\\backslash\\nand line breaks"->"Target"';
            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('Component with \\backslash\nand line breaks');
            expect(result.links[0].end).toBe('Target');
        });

        it('should handle complex multi-line components with all escape sequences', () => {
            const mapText = '"Complex \\"quoted\\"\\nWith \\\\backslash\\nAnd line breaks"->"Target\\nComponent"';
            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('Complex "quoted"\nWith \\backslash\nAnd line breaks');
            expect(result.links[0].end).toBe('Target\nComponent');
        });
    });

    describe('flow links with multi-line components', () => {
        it('should extract multi-line components in flow links', () => {
            const mapText = '"Database\\nService"+>"API\\nGateway"';
            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('Database\nService');
            expect(result.links[0].end).toBe('API\nGateway');
            expect(result.links[0].flow).toBe(true);
            expect(result.links[0].future).toBe(false);
            expect(result.links[0].past).toBe(false);
        });

        it('should extract multi-line components in future flow links', () => {
            const mapText = '"Database\\nService"+<"API\\nGateway"';
            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('Database\nService');
            expect(result.links[0].end).toBe('API\nGateway');
            expect(result.links[0].flow).toBe(true);
            expect(result.links[0].future).toBe(true);
        });

        it('should extract multi-line components in past flow links', () => {
            const mapText = '"Database\\nService"+<>"API\\nGateway"';
            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('Database\nService');
            expect(result.links[0].end).toBe('API\nGateway');
            expect(result.links[0].past).toBe(true);
        });
    });

    describe('links with context', () => {
        it('should extract multi-line component links with context', () => {
            const mapText = '"Database\\nService"->"API\\nGateway"; HTTP requests';
            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('Database\nService');
            expect(result.links[0].end).toBe('API\nGateway');
            expect(result.links[0].context).toBe('HTTP requests');
        });
    });

    describe('multiple links', () => {
        it('should extract multiple links including multi-line components', () => {
            const mapText = ['Simple A->Simple B', '"Multi-line\\nSource"->"Multi-line\\nTarget"', 'Another->Connection'].join('\n');

            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(3);

            expect(result.links[0].start).toBe('Simple A');
            expect(result.links[0].end).toBe('Simple B');

            expect(result.links[1].start).toBe('Multi-line\nSource');
            expect(result.links[1].end).toBe('Multi-line\nTarget');

            expect(result.links[2].start).toBe('Another');
            expect(result.links[2].end).toBe('Connection');
        });
    });

    describe('edge cases and error handling', () => {
        it('should handle empty quoted strings', () => {
            const mapText = '""->Target';
            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('');
            expect(result.links[0].end).toBe('Target');
        });

        it('should ignore component definitions and other non-link lines', () => {
            const mapText = [
                'component "Multi-line\\nComponent" [0.5, 0.5]',
                '"Multi-line\\nComponent"->Target',
                'note Example note [0.1, 0.1]',
            ].join('\n');

            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('Multi-line\nComponent');
            expect(result.links[0].end).toBe('Target');
        });

        it('should handle malformed links gracefully', () => {
            const mapText = [
                'ValidLink->Target',
                '->', // Malformed link
                'Another->Valid',
            ].join('\n');

            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links.length).toBeGreaterThanOrEqual(2); // Valid links should still work
            expect(result.errors.length).toBeGreaterThanOrEqual(1); // Should have error for malformed link
        });
    });

    describe('real-world examples', () => {
        it('should handle documentation-style multi-line components', () => {
            const mapText = '"User Authentication\\nService\\n(OAuth 2.0)"->"Database\\nPostgreSQL 13\\n(Primary)"';
            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('User Authentication\nService\n(OAuth 2.0)');
            expect(result.links[0].end).toBe('Database\nPostgreSQL 13\n(Primary)');
        });

        it('should handle API-style multi-line components', () => {
            const mapText = '"API Gateway\\nv2.1.0\\n(Load Balanced)"+>"Backend\\nMicroservice\\n(Node.js)"';
            const extractor = new LinksExtractionStrategy(mapText);
            const result = extractor.apply();

            expect(result.links).toHaveLength(1);
            expect(result.links[0].start).toBe('API Gateway\nv2.1.0\n(Load Balanced)');
            expect(result.links[0].end).toBe('Backend\nMicroservice\n(Node.js)');
            expect(result.links[0].flow).toBe(true);
        });
    });
});
