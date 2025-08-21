import {setMethod} from '../../constants/extractionFunctions';

describe('Method Decorator Multi-line Component Name Support', () => {
    describe('buy decorator with multi-line component names', () => {
        it('should parse single-line component names for buy decorator', () => {
            const baseElement: any = {};
            const element = 'buy Simple Component';
            const config = {keyword: 'buy'};

            setMethod(baseElement, element, config);

            expect(baseElement.name).toBe('Simple Component');
            expect(baseElement.buy).toBe(true);
            expect(baseElement.build).toBe(false);
            expect(baseElement.outsource).toBe(false);
        });

        it('should parse multi-line quoted component names for buy decorator', () => {
            const baseElement: any = {};
            const element = 'buy "Multi-line\\nComponent\\nName"';
            const config = {keyword: 'buy'};

            setMethod(baseElement, element, config);

            expect(baseElement.name).toBe('Multi-line\nComponent\nName');
            expect(baseElement.buy).toBe(true);
            expect(baseElement.build).toBe(false);
            expect(baseElement.outsource).toBe(false);
        });

        it('should handle escaped quotes in multi-line component names for buy decorator with validation recovery', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            const baseElement: any = {};
            const element = 'buy "Component with \\"quotes\\" and\\nline breaks"';
            const config = {keyword: 'buy'};

            setMethod(baseElement, element, config);

            // Name gets recovered due to quotes being syntax-breaking characters
            expect(baseElement.name).toBe('Component');
            expect(baseElement.buy).toBe(true);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Method decorator component name recovery'), expect.anything());

            consoleSpy.mockRestore();
        });

        it('should handle complex escaping for buy decorator', () => {
            const baseElement: any = {};
            const element = 'buy "Complex\\nName\\nWith\\\\Backslashes"';
            const config = {keyword: 'buy'};

            setMethod(baseElement, element, config);

            expect(baseElement.name).toBe('Complex\nName\nWith\\Backslashes');
            expect(baseElement.buy).toBe(true);
        });
    });

    describe('build decorator with multi-line component names', () => {
        it('should parse single-line component names for build decorator', () => {
            const baseElement: any = {};
            const element = 'build Another Component';
            const config = {keyword: 'build'};

            setMethod(baseElement, element, config);

            expect(baseElement.name).toBe('Another Component');
            expect(baseElement.buy).toBe(false);
            expect(baseElement.build).toBe(true);
            expect(baseElement.outsource).toBe(false);
        });

        it('should parse multi-line quoted component names for build decorator', () => {
            const baseElement: any = {};
            const element = 'build "Database\\nConnection\\nPool"';
            const config = {keyword: 'build'};

            setMethod(baseElement, element, config);

            expect(baseElement.name).toBe('Database\nConnection\nPool');
            expect(baseElement.build).toBe(true);
            expect(baseElement.buy).toBe(false);
            expect(baseElement.outsource).toBe(false);
        });

        it('should handle documentation-style multi-line names for build decorator', () => {
            const baseElement: any = {};
            const element = 'build "API Gateway\\nVersion 2.1\\nInternal Service"';
            const config = {keyword: 'build'};

            setMethod(baseElement, element, config);

            expect(baseElement.name).toBe('API Gateway\nVersion 2.1\nInternal Service');
            expect(baseElement.build).toBe(true);
        });
    });

    describe('outsource decorator with multi-line component names', () => {
        it('should parse single-line component names for outsource decorator', () => {
            const baseElement: any = {};
            const element = 'outsource Payment Gateway';
            const config = {keyword: 'outsource'};

            setMethod(baseElement, element, config);

            expect(baseElement.name).toBe('Payment Gateway');
            expect(baseElement.buy).toBe(false);
            expect(baseElement.build).toBe(false);
            expect(baseElement.outsource).toBe(true);
        });

        it('should parse multi-line quoted component names for outsource decorator', () => {
            const baseElement: any = {};
            const element = 'outsource "Third Party\\nAuthentication\\nService"';
            const config = {keyword: 'outsource'};

            setMethod(baseElement, element, config);

            expect(baseElement.name).toBe('Third Party\nAuthentication\nService');
            expect(baseElement.outsource).toBe(true);
            expect(baseElement.buy).toBe(false);
            expect(baseElement.build).toBe(false);
        });

        it('should handle complex multi-line service descriptions for outsource', () => {
            const baseElement: any = {};
            const element = 'outsource "Email Service\\nSendGrid Integration\\nTransactional Emails"';
            const config = {keyword: 'outsource'};

            setMethod(baseElement, element, config);

            expect(baseElement.name).toBe('Email Service\nSendGrid Integration\nTransactional Emails');
            expect(baseElement.outsource).toBe(true);
        });
    });

    describe('malformed quoted strings and error recovery', () => {
        it('should handle malformed quoted strings gracefully for buy decorator', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            const baseElement: any = {};
            const element = 'buy "Malformed quote without closing';
            const config = {keyword: 'buy'};

            setMethod(baseElement, element, config);

            // Should extract what it can and apply validation/recovery
            expect(baseElement.name).toBeTruthy();
            expect(baseElement.buy).toBe(true);

            consoleSpy.mockRestore();
        });

        it('should recover from empty component names in decorators', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            const baseElement: any = {};
            const element = 'build ""';
            const config = {keyword: 'build'};

            setMethod(baseElement, element, config);

            // Should recover to a default name
            expect(baseElement.name).toBe('Recovered Component Name');
            expect(baseElement.build).toBe(true);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Method decorator component name recovery'), expect.anything());

            consoleSpy.mockRestore();
        });

        it('should sanitize problematic characters in decorator component names', () => {
            const baseElement: any = {};
            const nameWithControlChars = `Component${String.fromCharCode(0)}WithNull`;
            const element = `outsource "${nameWithControlChars}"`;
            const config = {keyword: 'outsource'};

            setMethod(baseElement, element, config);

            // Control characters should be removed by validation
            expect(baseElement.name).toBe('ComponentWithNull');
            expect(baseElement.outsource).toBe(true);
        });
    });

    describe('backward compatibility', () => {
        it('should maintain compatibility with existing single-line decorator syntax', () => {
            const testCases = [
                {decorator: 'buy', element: 'buy Simple Service', expected: 'Simple Service'},
                {decorator: 'build', element: 'build Internal API', expected: 'Internal API'},
                {decorator: 'outsource', element: 'outsource External Provider', expected: 'External Provider'},
            ];

            testCases.forEach(({decorator, element, expected}) => {
                const baseElement: any = {};
                const config = {keyword: decorator};

                setMethod(baseElement, element, config);

                expect(baseElement.name).toBe(expected);
                expect(baseElement[decorator]).toBe(true);
                // Verify other decorators are false
                ['buy', 'build', 'outsource'].forEach(d => {
                    if (d !== decorator) {
                        expect(baseElement[d]).toBe(false);
                    }
                });
            });
        });

        it('should handle edge cases with whitespace and empty strings', () => {
            const testCases = [
                {element: 'buy   Component with spaces   ', expected: 'Component with spaces'},
                {element: 'build\t\tTabbed Component  ', expected: 'Component'}, // Gets recovered due to validation
            ];

            testCases.forEach(({element, expected}) => {
                const baseElement: any = {};
                const keyword = element.split(' ')[0];
                const config = {keyword};

                setMethod(baseElement, element, config);

                expect(baseElement.name).toBe(expected);
                expect(baseElement[keyword]).toBe(true);
            });
        });
    });

    describe('validation integration', () => {
        it('should apply validation rules to decorator component names', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            const baseElement: any = {};
            const longName = 'A'.repeat(600); // Exceeds validation limits
            const element = `buy "${longName}"`;
            const config = {keyword: 'buy'};

            setMethod(baseElement, element, config);

            // Should recover from invalid name
            expect(baseElement.name).toBe('Recovered Component Name');
            expect(baseElement.buy).toBe(true);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Method decorator component name recovery'), expect.anything());

            consoleSpy.mockRestore();
        });

        it('should handle syntax-breaking characters in decorator names', () => {
            const baseElement: any = {};
            const element = 'build "Component [with] brackets"';
            const config = {keyword: 'build'};

            setMethod(baseElement, element, config);

            // Should be recovered due to syntax-breaking characters
            expect(baseElement.name).toBe('Component');
            expect(baseElement.build).toBe(true);
        });
    });

    describe('real-world decorator scenarios', () => {
        it('should handle technical service descriptions with buy decorator', () => {
            const baseElement: any = {};
            const element = 'buy "Cloud Storage\\nAWS S3\\nFile Management"';
            const config = {keyword: 'buy'};

            setMethod(baseElement, element, config);

            expect(baseElement.name).toBe('Cloud Storage\nAWS S3\nFile Management');
            expect(baseElement.buy).toBe(true);
        });

        it('should handle business process descriptions with build decorator', () => {
            const baseElement: any = {};
            const element = 'build "User Management\\nAuthentication System\\nRole-Based Access"';
            const config = {keyword: 'build'};

            setMethod(baseElement, element, config);

            expect(baseElement.name).toBe('User Management\nAuthentication System\nRole-Based Access');
            expect(baseElement.build).toBe(true);
        });

        it('should handle vendor service descriptions with outsource decorator', () => {
            const baseElement: any = {};
            const element = 'outsource "Payment Processing\\nStripe Integration\\nPCI Compliance"';
            const config = {keyword: 'outsource'};

            setMethod(baseElement, element, config);

            expect(baseElement.name).toBe('Payment Processing\nStripe Integration\nPCI Compliance');
            expect(baseElement.outsource).toBe(true);
        });
    });
});
