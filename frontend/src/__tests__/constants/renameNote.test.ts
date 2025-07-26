import {renameNote} from '../../constants/renameNote';

describe('renameNote', () => {
    let mockMutateMapMethod: jest.Mock;

    beforeEach(() => {
        mockMutateMapMethod = jest.fn();
    });

    describe('basic note text mutation', () => {
        it('should update note text while preserving coordinates', () => {
            const mapText = `title Test Map
component A [0.5, 0.5]
note Original Note Text [0.3, 0.7]
component B [0.8, 0.2]`;

            renameNote(3, 'Original Note Text', 'Updated Note Text', mapText, mockMutateMapMethod);

            const expectedMapText = `title Test Map
component A [0.5, 0.5]
note Updated Note Text [0.3, 0.7]
component B [0.8, 0.2]`;

            expect(mockMutateMapMethod).toHaveBeenCalledWith(expectedMapText);
        });

        it('should handle notes with different coordinate formats', () => {
            const mapText = `note Test Note [0.23, 0.33]`;

            renameNote(1, 'Test Note', 'New Note', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note New Note [0.23, 0.33]');
        });

        it('should preserve whitespace formatting around coordinates', () => {
            const mapText = `note   Spaced Note   [0.1, 0.9]   `;

            renameNote(1, 'Spaced Note', 'New Spaced Note', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note   New Spaced Note   [0.1, 0.9]   ');
        });
    });

    describe('multi-line note content support', () => {
        it('should handle single-line notes correctly', () => {
            const mapText = `note Single line note [0.5, 0.5]`;

            renameNote(1, 'Single line note', 'Updated single line', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note Updated single line [0.5, 0.5]');
        });

        it('should handle notes with special characters', () => {
            const mapText = `note Note with +special &chars! [0.4, 0.6]`;

            renameNote(1, 'Note with +special &chars!', 'Note with @new #chars$', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note Note with @new #chars$ [0.4, 0.6]');
        });

        it('should handle notes with numbers and symbols', () => {
            const mapText = `note Note 123 with symbols: @#$% [0.2, 0.8]`;

            renameNote(1, 'Note 123 with symbols: @#$%', 'Updated note 456', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note Updated note 456 [0.2, 0.8]');
        });
    });

    describe('edge cases and error handling', () => {
        it('should not mutate when new text equals original text', () => {
            const mapText = `note Same Text [0.5, 0.5]`;

            renameNote(1, 'Same Text', 'Same Text', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).not.toHaveBeenCalled();
        });

        it('should not mutate when new text is empty', () => {
            const mapText = `note Original Text [0.5, 0.5]`;

            renameNote(1, 'Original Text', '', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).not.toHaveBeenCalled();
        });

        it('should not mutate when new text is only whitespace', () => {
            const mapText = `note Original Text [0.5, 0.5]`;

            renameNote(1, 'Original Text', '   ', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).not.toHaveBeenCalled();
        });

        it('should trim whitespace from new text', () => {
            const mapText = `note Original Text [0.5, 0.5]`;

            renameNote(1, 'Original Text', '  New Text  ', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note New Text [0.5, 0.5]');
        });

        it('should handle malformed note lines with fallback', () => {
            const mapText = `note Malformed note without coordinates`;

            renameNote(1, 'Malformed note without coordinates', 'Fixed note', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note Fixed note');
        });

        it('should handle notes with missing closing bracket', () => {
            const mapText = `note Broken note [0.5, 0.5`;

            renameNote(1, 'Broken note', 'Fixed note', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note Fixed note [0.5, 0.5');
        });

        it('should handle line numbers that are out of bounds gracefully', () => {
            const mapText = `note Only Note [0.5, 0.5]`;

            // This should not throw an error, but also shouldn't call mutateMapMethod
            expect(() => {
                renameNote(5, 'Only Note', 'New Note', mapText, mockMutateMapMethod);
            }).not.toThrow();

            expect(mockMutateMapMethod).not.toHaveBeenCalled();
        });
    });

    describe('syntax preservation', () => {
        it('should preserve exact coordinate formatting', () => {
            const mapText = `note Test [0.123, 0.456]`;

            renameNote(1, 'Test', 'Updated', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note Updated [0.123, 0.456]');
        });

        it('should preserve coordinate formatting with different decimal places', () => {
            const mapText = `note Test [0.1, 0.99999]`;

            renameNote(1, 'Test', 'Updated', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note Updated [0.1, 0.99999]');
        });

        it('should handle notes with indentation', () => {
            const mapText = `    note Indented Note [0.5, 0.5]`;

            renameNote(1, 'Indented Note', 'Updated Indented', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('    note Updated Indented [0.5, 0.5]');
        });

        it('should handle notes with tabs', () => {
            const mapText = `\tnote Tabbed Note [0.5, 0.5]`;

            renameNote(1, 'Tabbed Note', 'Updated Tabbed', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('\tnote Updated Tabbed [0.5, 0.5]');
        });
    });

    describe('complex map text scenarios', () => {
        it('should only modify the specified line in a complex map', () => {
            const mapText = `title Complex Map
component A [0.1, 0.1]
note First Note [0.2, 0.2]
component B [0.3, 0.3]
note Second Note [0.4, 0.4]
note Third Note [0.5, 0.5]
component C [0.6, 0.6]`;

            renameNote(5, 'Second Note', 'Updated Second Note', mapText, mockMutateMapMethod);

            const expectedMapText = `title Complex Map
component A [0.1, 0.1]
note First Note [0.2, 0.2]
component B [0.3, 0.3]
note Updated Second Note [0.4, 0.4]
note Third Note [0.5, 0.5]
component C [0.6, 0.6]`;

            expect(mockMutateMapMethod).toHaveBeenCalledWith(expectedMapText);
        });

        it('should handle notes mixed with other elements', () => {
            const mapText = `title Test
component A [0.1, 0.1]
A->B
note Important note [0.3, 0.3]
pipeline Test Pipeline [0.4, 0.5]
anchor Test Anchor [0.6, 0.7]`;

            renameNote(4, 'Important note', 'Very important note', mapText, mockMutateMapMethod);

            const expectedMapText = `title Test
component A [0.1, 0.1]
A->B
note Very important note [0.3, 0.3]
pipeline Test Pipeline [0.4, 0.5]
anchor Test Anchor [0.6, 0.7]`;

            expect(mockMutateMapMethod).toHaveBeenCalledWith(expectedMapText);
        });
    });

    describe('real-world note examples', () => {
        it('should handle the default note from constants', () => {
            const mapText = `note +a generic note appeared [0.23, 0.33]`;

            renameNote(1, '+a generic note appeared', 'Updated generic note', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note Updated generic note [0.23, 0.33]');
        });

        it('should handle notes with descriptive text', () => {
            const mapText = `note This is a longer descriptive note about the system [0.15, 0.85]`;

            renameNote(1, 'This is a longer descriptive note about the system', 'Updated system description', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note Updated system description [0.15, 0.85]');
        });
    });

    describe('multi-line content handling in DSL', () => {
        it('should handle notes that conceptually represent multi-line content', () => {
            // In the map DSL, notes are single lines, but the content can represent multi-line concepts
            const mapText = `note This note represents\\nmulti-line content [0.4, 0.6]`;

            renameNote(1, 'This note represents\\nmulti-line content', 'Updated multi-line note', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note Updated multi-line note [0.4, 0.6]');
        });

        it('should handle notes with line break characters in text', () => {
            const mapText = `note Note with \\n line breaks [0.3, 0.7]`;

            renameNote(1, 'Note with \\n line breaks', 'Note with actual line breaks', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note Note with actual line breaks [0.3, 0.7]');
        });
    });

    describe('coordinate format variations', () => {
        it('should handle coordinates with extra spaces', () => {
            const mapText = `note Test Note [ 0.5 , 0.5 ]`;

            renameNote(1, 'Test Note', 'Updated Note', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note Updated Note [ 0.5 , 0.5 ]');
        });

        it('should handle coordinates with no spaces', () => {
            const mapText = `note Test Note [0.5,0.5]`;

            renameNote(1, 'Test Note', 'Updated Note', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note Updated Note [0.5,0.5]');
        });

        it('should handle integer coordinates', () => {
            const mapText = `note Test Note [1, 0]`;

            renameNote(1, 'Test Note', 'Updated Note', mapText, mockMutateMapMethod);

            expect(mockMutateMapMethod).toHaveBeenCalledWith('note Updated Note [1, 0]');
        });
    });
});
