import {rename} from '../../constants/rename';

describe('rename function with multi-line components', () => {
    let mockMutateMapMethod: jest.Mock;

    beforeEach(() => {
        mockMutateMapMethod = jest.fn();
    });

    describe('basic rename functionality', () => {
        it('should rename a simple component', () => {
            const mapText = 'component Simple Component [0.6, 0.4]';
            const result = rename(1, 'Simple Component', 'New Component', mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            expect(mockMutateMapMethod).toHaveBeenCalledWith('component New Component [0.6, 0.4]');
        });

        it('should rename a multi-line component', () => {
            const mapText = 'component "Multi-line\\nComponent" [0.6, 0.4]';
            const result = rename(1, 'Multi-line\nComponent', '"New Multi-line\\nComponent"', mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            expect(mockMutateMapMethod).toHaveBeenCalledWith('component "New Multi-line\\nComponent" [0.6, 0.4]');
        });
    });

    describe('link updates for multi-line components', () => {
        it('should update link targets when link line has semicolon metadata', () => {
            const mapText = [
                'component Kettle [0.43, 0.35] label [-57.00, 20.00]',
                'evolve Kettle->Electric Kettle 0.62 label [16, 5]',
                'sasasasa->Kettle; limited by',
                'Kettle->Power',
            ].join('\n');

            const result = rename(1, 'Kettle', 'FooBar', mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            const updatedText = mockMutateMapMethod.mock.calls[0][0];
            const lines = updatedText.split('\n');

            expect(lines[0]).toBe('component FooBar [0.43, 0.35] label [-57.00, 20.00]');
            expect(lines[1]).toBe('evolve FooBar->Electric FooBar 0.62 label [16, 5]');
            expect(lines[2]).toBe('sasasasa->FooBar; limited by');
            expect(lines[3]).toBe('FooBar->Power');
        });

        it('should update links when renaming a multi-line component', () => {
            const mapText = [
                'component "Multi-line\\nSource" [0.3, 0.7]',
                'component "Target\\nComponent" [0.8, 0.5]',
                '"Multi-line\\nSource"->"Target\\nComponent"',
            ].join('\n');

            const result = rename(1, 'Multi-line\nSource', 'Renamed Multiline\nSource', mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            const updatedText = mockMutateMapMethod.mock.calls[0][0];

            // Check that the component definition was updated (should be quoted with actual newlines)
            expect(updatedText).toContain('component "Renamed Multiline\nSource" [0.3, 0.7]');

            // Check that the link reference was updated
            expect(updatedText).toContain('"Renamed Multiline\\nSource"->"Target\\nComponent"');
        });

        it('should update multiple links when renaming a multi-line component', () => {
            const mapText = [
                'component "Database\\nService" [0.2, 0.8]',
                'component "API\\nGateway" [0.7, 0.6]',
                'component "Frontend\\nApp" [0.9, 0.4]',
                '"Database\\nService"->"API\\nGateway"',
                '"API\\nGateway"->"Frontend\\nApp"',
                '"Frontend\\nApp"->"Database\\nService"',
            ].join('\n');

            const result = rename(1, 'Database\nService', 'Updated Database\nService', mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            const updatedText = mockMutateMapMethod.mock.calls[0][0];

            // Check that the component definition was updated (should be quoted with actual newlines)
            expect(updatedText).toContain('component "Updated Database\nService" [0.2, 0.8]');

            // Check that all link references were updated
            expect(updatedText).toContain('"Updated Database\\nService"->"API\\nGateway"');
            expect(updatedText).toContain('"Frontend\\nApp"->"Updated Database\\nService"');

            // Check that other links were not affected
            expect(updatedText).toContain('"API\\nGateway"->"Frontend\\nApp"');
        });

        it('should update evolve statements when renaming multi-line components', () => {
            const mapText = [
                'component "Database\\nService" [0.2, 0.8]',
                'evolve "Database\\nService" 0.6',
                '"Database\\nService"->SomeTarget',
            ].join('\n');

            const result = rename(1, 'Database\nService', 'Evolved Database\nService', mapText, mockMutateMapMethod);

            expect(result.success).toBe(true);
            const updatedText = mockMutateMapMethod.mock.calls[0][0];

            // Check that the component definition was updated (should be quoted with actual newlines)
            expect(updatedText).toContain('component "Evolved Database\nService" [0.2, 0.8]');

            // Check that the evolve statement was updated
            expect(updatedText).toContain('evolve "Evolved Database\\nService" 0.6');

            // Check that the link reference was updated
            expect(updatedText).toContain('"Evolved Database\\nService"->SomeTarget');
        });
    });

    describe('error handling', () => {
        it('should handle invalid line numbers', () => {
            const mapText = 'component Test [0.5, 0.5]';
            const result = rename(5, 'Test', 'New Test', mapText, mockMutateMapMethod);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Line number 5 is out of bounds');
            expect(mockMutateMapMethod).not.toHaveBeenCalled();
        });

        it('should handle concurrent modifications', () => {
            const mapText = 'component "Original\\nComponent" [0.5, 0.5]';
            const result = rename(1, 'Different\nComponent', 'New Component', mapText, mockMutateMapMethod);

            expect(result.success).toBe(false);
            expect(result.error).toContain('modified by another operation');
            expect(mockMutateMapMethod).not.toHaveBeenCalled();
        });

        it('should validate empty component names', () => {
            const mapText = 'component Test [0.5, 0.5]';
            const result = rename(1, 'Test', '', mapText, mockMutateMapMethod);

            expect(result.success).toBe(false);
            expect(result.error).toContain('cannot be empty');
            expect(mockMutateMapMethod).not.toHaveBeenCalled();
        });
    });
});
