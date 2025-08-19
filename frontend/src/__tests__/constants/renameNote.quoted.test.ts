import {renameNote} from '../../constants/renameNote';

describe('renameNote - Quoted Syntax Support', () => {
    let mockMutateMapText: jest.Mock;

    beforeEach(() => {
        mockMutateMapText = jest.fn();
    });

    describe('quoted note syntax parsing', () => {
        it('should handle simple quoted notes', () => {
            const mapText = 'note "Simple quoted note" [0.5, 0.7]';
            const result = renameNote(1, 'Simple quoted note', 'Updated note', mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note Updated note [0.5, 0.7]');
        });

        it('should handle quoted notes with escaped quotes', () => {
            const mapText = 'note "Note with \\"escaped quotes\\"" [0.4, 0.6]';
            const originalText = 'Note with "escaped quotes"';
            const result = renameNote(1, originalText, 'Updated note', mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note Updated note [0.4, 0.6]');
        });

        it('should handle quoted notes with line breaks', () => {
            const mapText = 'note "Multi-line\\nnote content\\nwith breaks" [0.3, 0.8]';
            const originalText = 'Multi-line\nnote content\nwith breaks';
            const result = renameNote(1, originalText, 'Updated note', mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note Updated note [0.3, 0.8]');
        });

        it('should handle quoted notes with escaped backslashes', () => {
            const mapText = 'note "Path: C:\\\\Users\\\\test" [0.2, 0.9]';
            const originalText = 'Path: C:\\Users\\test';
            const result = renameNote(1, originalText, 'Updated path', mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note Updated path [0.2, 0.9]');
        });

        it('should handle complex escaping combinations', () => {
            const mapText = 'note "Complex \\"quote\\" and \\n newline and \\\\ backslash" [0.1, 0.9]';
            const originalText = 'Complex "quote" and \n newline and \\ backslash';
            const result = renameNote(1, originalText, 'Simplified text', mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note Simplified text [0.1, 0.9]');
        });
    });

    describe('automatic quoting for multi-line content', () => {
        it('should convert unquoted to quoted when adding line breaks', () => {
            const mapText = 'note Simple note [0.5, 0.7]';
            const newText = 'Multi-line\nnote content';
            const result = renameNote(1, 'Simple note', newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note "Multi-line\\nnote content" [0.5, 0.7]');
        });

        it('should convert unquoted to quoted when adding quotes', () => {
            const mapText = 'note Simple note [0.5, 0.7]';
            const newText = 'Note with "quotes" inside';
            const result = renameNote(1, 'Simple note', newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note "Note with \\"quotes\\" inside" [0.5, 0.7]');
        });

        it('should convert unquoted to quoted when adding backslashes', () => {
            const mapText = 'note Simple note [0.5, 0.7]';
            const newText = 'Path: C:\\Users\\test';
            const result = renameNote(1, 'Simple note', newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note "Path: C:\\\\Users\\\\test" [0.5, 0.7]');
        });

        it('should keep quoted syntax when updating multi-line content', () => {
            const mapText = 'note "Multi-line\\nnote content" [0.3, 0.8]';
            const originalText = 'Multi-line\nnote content';
            const newText = 'Updated\nmulti-line\ncontent';
            const result = renameNote(1, originalText, newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note "Updated\\nmulti-line\\ncontent" [0.3, 0.8]');
        });

        it('should convert quoted to unquoted when simplifying content', () => {
            const mapText = 'note "Multi-line\\nnote content" [0.3, 0.8]';
            const originalText = 'Multi-line\nnote content';
            const newText = 'Simple note';
            const result = renameNote(1, originalText, newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note Simple note [0.3, 0.8]');
        });
    });

    describe('mixed syntax scenarios', () => {
        it('should handle maps with both quoted and unquoted notes', () => {
            const mapText = `title Test Map
component A [0.5, 0.5]
note Simple note [0.3, 0.7]
note "Multi-line\\nnote content" [0.6, 0.4]
component B [0.8, 0.2]`;

            // Update the unquoted note
            const result1 = renameNote(3, 'Simple note', 'Updated simple note', mapText, mockMutateMapText);
            expect(result1.success).toBe(true);

            // Update the quoted note
            const result2 = renameNote(4, 'Multi-line\nnote content', 'Updated\nmulti-line\nnote', mapText, mockMutateMapText);
            expect(result2.success).toBe(true);
        });

        it('should preserve formatting and indentation', () => {
            const mapText = '  note "Indented\\nmulti-line note" [0.5, 0.7]  ';
            const originalText = 'Indented\nmulti-line note';
            const newText = 'Updated\nindented note';
            const result = renameNote(1, originalText, newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('  note "Updated\\nindented note" [0.5, 0.7]  ');
        });
    });

    describe('error handling with quoted syntax', () => {
        it('should detect content changes in quoted notes', () => {
            const mapText = 'note "Original content" [0.5, 0.7]';
            const result = renameNote(1, 'Different content', 'New content', mapText, mockMutateMapText);

            expect(result.success).toBe(false);
            expect(result.error).toContain('modified by another operation');
            expect(mockMutateMapText).not.toHaveBeenCalled();
        });

        it('should handle malformed quoted strings gracefully', () => {
            const mapText = 'note "Unclosed quote [0.5, 0.7]';
            const result = renameNote(1, '"Unclosed quote', 'New content', mapText, mockMutateMapText);

            // Should fall back to the general fallback mechanism
            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note "Unclosed quote [0.5, 0.7]'.replace('"Unclosed quote', 'New content'));
        });

        it('should validate line content for quoted notes', () => {
            const mapText = 'note "Multi-line\\nnote content" [0.3, 0.8]';
            const originalText = 'Wrong content';
            const result = renameNote(1, originalText, 'New content', mapText, mockMutateMapText);

            expect(result.success).toBe(false);
            expect(result.error).toContain('modified by another operation');
            expect(mockMutateMapText).not.toHaveBeenCalled();
        });
    });

    describe('real-world scenarios', () => {
        it('should handle documentation-style notes', () => {
            const mapText =
                'note "Documentation:\\nThis component handles user authentication\\n\\nSee \\"auth.js\\" for implementation details" [0.5, 0.7]';
            const originalText = 'Documentation:\nThis component handles user authentication\n\nSee "auth.js" for implementation details';
            const newText = 'Updated Documentation:\nThis component handles user login\n\nSee "login.js" for details';
            const result = renameNote(1, originalText, newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith(
                'note "Updated Documentation:\\nThis component handles user login\\n\\nSee \\"login.js\\" for details" [0.5, 0.7]',
            );
        });

        it('should handle code snippet notes', () => {
            const mapText = 'note "Code example:\\nfunction test() {\\n  return \\"hello\\";\\n}" [0.6, 0.4]';
            const originalText = 'Code example:\nfunction test() {\n  return "hello";\n}';
            const newText = 'Updated code:\nfunction greet() {\n  return "hi";\n}';
            const result = renameNote(1, originalText, newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note "Updated code:\\nfunction greet() {\\n  return \\"hi\\";\\n}" [0.6, 0.4]');
        });

        it('should handle conversion from simple to complex content', () => {
            const mapText = 'note Simple note [0.5, 0.7]';
            const newText = 'Complex note:\n- Point 1\n- Point 2\n- "Important" note';
            const result = renameNote(1, 'Simple note', newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith(
                'note "Complex note:\\n- Point 1\\n- Point 2\\n- \\"Important\\" note" [0.5, 0.7]',
            );
        });

        it('should handle conversion from complex to simple content', () => {
            const mapText = 'note "Complex note:\\n- Point 1\\n- Point 2\\n- \\"Important\\" note" [0.5, 0.7]';
            const originalText = 'Complex note:\n- Point 1\n- Point 2\n- "Important" note';
            const newText = 'Simple note';
            const result = renameNote(1, originalText, newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note Simple note [0.5, 0.7]');
        });
    });

    describe('coordinate format preservation', () => {
        it('should preserve coordinate formatting with quoted syntax', () => {
            const mapText = 'note "Multi-line\\ncontent" [ 0.50 , 0.70 ]';
            const originalText = 'Multi-line\ncontent';
            const newText = 'Updated\ncontent';
            const result = renameNote(1, originalText, newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note "Updated\\ncontent" [ 0.50 , 0.70 ]');
        });

        it('should preserve integer coordinates', () => {
            const mapText = 'note "Test content" [1, 0]';
            const originalText = 'Test content';
            const newText = 'Multi-line\ntest content';
            const result = renameNote(1, originalText, newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note "Multi-line\\ntest content" [1, 0]');
        });
    });

    describe('edge cases with special characters', () => {
        it('should handle notes with only quotes', () => {
            const mapText = 'note Simple note [0.5, 0.7]';
            const newText = '""';
            const result = renameNote(1, 'Simple note', newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note "\\"\\"" [0.5, 0.7]');
        });

        it('should handle notes with only backslashes', () => {
            const mapText = 'note Simple note [0.5, 0.7]';
            const newText = '\\\\';
            const result = renameNote(1, 'Simple note', newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note "\\\\\\\\" [0.5, 0.7]');
        });

        it('should handle notes with only line breaks', () => {
            const mapText = 'note Simple note [0.5, 0.7]';
            const newText = '\n\n';
            const result = renameNote(1, 'Simple note', newText, mapText, mockMutateMapText);

            expect(result.success).toBe(false); // Should fail because newText.trim() is empty
            expect(result.error).toContain('cannot be empty');
        });

        it('should handle empty quoted strings', () => {
            const mapText = 'note "" [0.5, 0.7]';
            const originalText = '';
            const newText = 'New content';
            const result = renameNote(1, originalText, newText, mapText, mockMutateMapText);

            expect(result.success).toBe(true);
            expect(mockMutateMapText).toHaveBeenCalledWith('note New content [0.5, 0.7]');
        });
    });
});
