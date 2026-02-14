import {
    requiresQuoting,
    escapeNoteText,
    generateNoteText,
    createFallbackTemplate,
    generateComponentMapText,
} from '../../utils/mapTextGeneration';
import {ToolbarItem} from '../../types/toolbar';

describe('Map Text Generation - Multi-line Note Support', () => {
    describe('requiresQuoting', () => {
        it('should return false for simple text', () => {
            expect(requiresQuoting('Simple note')).toBe(false);
            expect(requiresQuoting('Note with spaces')).toBe(false);
            expect(requiresQuoting('Note123')).toBe(false);
            expect(requiresQuoting('')).toBe(false);
        });

        it('should return true for text with line breaks', () => {
            expect(requiresQuoting('Line 1\nLine 2')).toBe(true);
            expect(requiresQuoting('Single line\n')).toBe(true);
            expect(requiresQuoting('\nStarting with newline')).toBe(true);
            expect(requiresQuoting('Multiple\n\nline\nbreaks')).toBe(true);
        });

        it('should return true for text with quotes', () => {
            expect(requiresQuoting('Text with "quotes"')).toBe(true);
            expect(requiresQuoting('"Starting with quote')).toBe(true);
            expect(requiresQuoting('Ending with quote"')).toBe(true);
            expect(requiresQuoting('Multiple "quotes" in "text"')).toBe(true);
        });

        it('should return true for text with backslashes', () => {
            expect(requiresQuoting('Path: C:\\Users')).toBe(true);
            expect(requiresQuoting('Escaped \\n sequence')).toBe(true);
            expect(requiresQuoting('Multiple \\ backslashes \\')).toBe(true);
        });

        it('should return true for text with combinations', () => {
            expect(requiresQuoting('Multi-line\nwith "quotes"')).toBe(true);
            expect(requiresQuoting('Path: C:\\Users\nWith newline')).toBe(true);
            expect(requiresQuoting('Complex "text" with\nlines and \\ backslashes')).toBe(true);
        });
    });

    describe('escapeNoteText', () => {
        it('should escape quotes', () => {
            expect(escapeNoteText('Text with "quotes"')).toBe('Text with \\"quotes\\"');
            expect(escapeNoteText('"Starting quote')).toBe('\\"Starting quote');
            expect(escapeNoteText('Ending quote"')).toBe('Ending quote\\"');
        });

        it('should escape backslashes', () => {
            expect(escapeNoteText('Path: C:\\Users')).toBe('Path: C:\\\\Users');
            expect(escapeNoteText('Multiple \\ backslashes')).toBe('Multiple \\\\ backslashes');
            expect(escapeNoteText('\\\\')).toBe('\\\\\\\\');
        });

        it('should convert line breaks to \\n', () => {
            expect(escapeNoteText('Line 1\nLine 2')).toBe('Line 1\\nLine 2');
            expect(escapeNoteText('Multiple\n\nlines')).toBe('Multiple\\n\\nlines');
            expect(escapeNoteText('\nStarting newline')).toBe('\\nStarting newline');
        });

        it('should handle complex combinations', () => {
            const input = 'Multi-line\nwith "quotes" and \\ backslashes';
            const expected = 'Multi-line\\nwith \\"quotes\\" and \\\\ backslashes';
            expect(escapeNoteText(input)).toBe(expected);
        });

        it('should handle edge cases', () => {
            expect(escapeNoteText('')).toBe('');
            expect(escapeNoteText('   ')).toBe('   ');
            expect(escapeNoteText('Simple text')).toBe('Simple text');
        });
    });

    describe('generateNoteText', () => {
        it('should generate unquoted syntax for simple text', () => {
            expect(generateNoteText('Simple note', '0.50', '0.70')).toBe('note Simple note [0.50, 0.70]');
            expect(generateNoteText('Note with spaces', '0.30', '0.80')).toBe('note Note with spaces [0.30, 0.80]');
            expect(generateNoteText('Note123', '1.00', '0.00')).toBe('note Note123 [1.00, 0.00]');
        });

        it('should generate quoted syntax for multi-line text', () => {
            expect(generateNoteText('Line 1\nLine 2', '0.50', '0.70')).toBe('note "Line 1\\nLine 2" [0.50, 0.70]');
            expect(generateNoteText('Multi\nline\nnote', '0.30', '0.80')).toBe('note "Multi\\nline\\nnote" [0.30, 0.80]');
        });

        it('should generate quoted syntax for text with quotes', () => {
            expect(generateNoteText('Text with "quotes"', '0.50', '0.70')).toBe('note "Text with \\"quotes\\"" [0.50, 0.70]');
            expect(generateNoteText('"Important" note', '0.30', '0.80')).toBe('note "\\"Important\\" note" [0.30, 0.80]');
        });

        it('should generate quoted syntax for text with backslashes', () => {
            expect(generateNoteText('Path: C:\\Users', '0.50', '0.70')).toBe('note "Path: C:\\\\Users" [0.50, 0.70]');
            expect(generateNoteText('Escaped \\n sequence', '0.30', '0.80')).toBe('note "Escaped \\\\n sequence" [0.30, 0.80]');
        });

        it('should handle complex combinations', () => {
            const input = 'Documentation:\nThis handles "auth"\n\nSee C:\\auth.js';
            const expected = 'note "Documentation:\\nThis handles \\"auth\\"\\n\\nSee C:\\\\auth.js" [0.50, 0.70]';
            expect(generateNoteText(input, '0.50', '0.70')).toBe(expected);
        });

        it('should trim whitespace', () => {
            expect(generateNoteText('  Simple note  ', '0.50', '0.70')).toBe('note Simple note [0.50, 0.70]');
            expect(generateNoteText('  Multi-line\nnote  ', '0.50', '0.70')).toBe('note "Multi-line\\nnote" [0.50, 0.70]');
        });

        it('should sanitize brackets in unquoted text', () => {
            expect(generateNoteText('Note with [brackets]', '0.50', '0.70')).toBe('note Note with brackets [0.50, 0.70]');
            expect(generateNoteText('Note with ] bracket', '0.50', '0.70')).toBe('note Note with  bracket [0.50, 0.70]');
        });

        it('should handle empty and whitespace-only text', () => {
            expect(generateNoteText('', '0.50', '0.70')).toBe('note  [0.50, 0.70]');
            expect(generateNoteText('   ', '0.50', '0.70')).toBe('note  [0.50, 0.70]');
        });
    });

    describe('createFallbackTemplate integration', () => {
        it('should use enhanced note generation for note category', () => {
            const template = createFallbackTemplate('note', 'note');

            // Simple text
            expect(template('Simple note', '0.50', '0.70')).toBe('note Simple note [0.50, 0.70]');

            // Multi-line text
            expect(template('Line 1\nLine 2', '0.50', '0.70')).toBe('note "Line 1\\nLine 2" [0.50, 0.70]');

            // Text with quotes
            expect(template('Note with "quotes"', '0.50', '0.70')).toBe('note "Note with \\"quotes\\"" [0.50, 0.70]');
        });

        it('should handle other categories normally', () => {
            const componentTemplate = createFallbackTemplate('component', 'component');
            expect(componentTemplate('Test Component', '0.50', '0.70')).toBe('component Test Component [0.50, 0.70]');

            const pipelineTemplate = createFallbackTemplate('pipeline', 'pipeline');
            const result = pipelineTemplate('Test Pipeline', '0.50', '0.70');
            // Enhanced pipeline template creates full pipeline structure
            expect(result).toContain('component Test Pipeline [0.50, 0.70]');
            expect(result).toContain('pipeline Test Pipeline');
            expect(result).toContain('Pipeline Component 1');
            expect(result).toContain('Pipeline Component 2');
        });
    });

    describe('generateComponentMapText integration', () => {
        const mockNoteItem: ToolbarItem = {
            id: 'note',
            label: 'Note',
            category: 'note',
            defaultName: 'New Note',
            toolType: 'placement',
            template: (name: string, y: string, x: string) => generateNoteText(name, y, x),
        };

        it('should generate simple notes correctly', () => {
            const result = generateComponentMapText(mockNoteItem, 'Simple note', {x: 0.7, y: 0.5});
            expect(result).toBe('note Simple note [0.50, 0.70]');
        });

        it('should generate multi-line notes correctly', () => {
            const result = generateComponentMapText(mockNoteItem, 'Line 1\nLine 2', {x: 0.7, y: 0.5});
            expect(result).toBe('note "Line 1\\nLine 2" [0.50, 0.70]');
        });

        it('should generate notes with quotes correctly', () => {
            const result = generateComponentMapText(mockNoteItem, 'Note with "quotes"', {x: 0.7, y: 0.5});
            expect(result).toBe('note "Note with \\"quotes\\"" [0.50, 0.70]');
        });

        it('should handle complex note content', () => {
            const complexNote = 'Documentation:\nThis component handles "user auth"\n\nSee C:\\auth\\login.js for details';
            const result = generateComponentMapText(mockNoteItem, complexNote, {x: 0.7, y: 0.5});
            const expected =
                'note "Documentation:\\nThis component handles \\"user auth\\"\\n\\nSee C:\\\\auth\\\\login.js for details" [0.50, 0.70]';
            expect(result).toBe(expected);
        });

        it('should preserve line breaks in note names', () => {
            // Note names with line breaks should be preserved and quoted
            const result = generateComponentMapText(mockNoteItem, 'Multi\nline\nname', {x: 0.7, y: 0.5});
            expect(result).toBe('note "Multi\\nline\\nname" [0.50, 0.70]');
        });
    });

    describe('real-world scenarios', () => {
        it('should handle documentation notes', () => {
            const docNote = `API Documentation:
This endpoint handles user authentication and session management.

Parameters:
- username: string
- password: string

Returns:
- token: JWT token
- expires: timestamp

Example:
POST /api/auth
{
  "username": "user@example.com",
  "password": "secret123"
}

See "auth.md" for more details.`;

            const result = generateNoteText(docNote, '0.50', '0.70');
            expect(result).toContain('note "');
            expect(result).toContain('API Documentation:\\n');
            expect(result).toContain('\\"auth.md\\"');
            expect(result).toContain('" [0.50, 0.70]');
        });

        it('should handle code snippet notes', () => {
            const codeNote = `Implementation:
function authenticate(user) {
  if (!user.email) {
    throw new Error("Email required");
  }
  return jwt.sign(user, "secret");
}`;

            const result = generateNoteText(codeNote, '0.30', '0.80');
            expect(result).toContain('note "');
            expect(result).toContain('Implementation:\\n');
            expect(result).toContain('\\"Email required\\"');
            expect(result).toContain('\\"secret\\"');
            expect(result).toContain('" [0.30, 0.80]');
        });

        it('should handle file path notes', () => {
            const pathNote = `File Locations:
Config: C:\\app\\config\\database.json
Logs: C:\\app\\logs\\error.log
Backup: \\\\server\\backup\\daily`;

            const result = generateNoteText(pathNote, '0.60', '0.40');
            expect(result).toContain('note "');
            expect(result).toContain('File Locations:\\n');
            expect(result).toContain('C:\\\\app\\\\config\\\\database.json');
            expect(result).toContain('\\\\\\\\server\\\\backup\\\\daily');
            expect(result).toContain('" [0.60, 0.40]');
        });

        it('should handle mixed content notes', () => {
            const mixedNote = `Status: "In Progress"
Next Steps:
1. Review code in "src\\components"
2. Update documentation
3. Deploy to staging

Notes:
- Check with team lead
- Ensure tests pass`;

            const result = generateNoteText(mixedNote, '0.40', '0.60');
            expect(result).toContain('note "');
            expect(result).toContain('Status: \\"In Progress\\"');
            expect(result).toContain('src\\\\components');
            expect(result).toContain('" [0.40, 0.60]');
        });
    });

    describe('edge cases and error handling', () => {
        it('should handle very long notes', () => {
            const longNote = 'A'.repeat(500) + '\n' + 'B'.repeat(500);
            const result = generateNoteText(longNote, '0.50', '0.70');
            expect(result).toContain('note "');
            expect(result).toContain('\\n');
            expect(result).toContain('" [0.50, 0.70]');
            expect(result.length).toBeGreaterThan(1000);
        });

        it('should handle notes with only special characters', () => {
            expect(generateNoteText('"""', '0.50', '0.70')).toBe('note "\\"\\"\\"" [0.50, 0.70]');
            expect(generateNoteText('\\\\\\', '0.50', '0.70')).toBe('note "\\\\\\\\\\\\" [0.50, 0.70]');
            expect(generateNoteText('\n\n\n', '0.50', '0.70')).toBe('note  [0.50, 0.70]'); // Trimmed to empty
        });

        it('should handle unicode characters', () => {
            const unicodeNote = 'Unicode: 🚀 → 📊\nEmoji note with "quotes"';
            const result = generateNoteText(unicodeNote, '0.50', '0.70');
            expect(result).toBe('note "Unicode: 🚀 → 📊\\nEmoji note with \\"quotes\\"" [0.50, 0.70]');
        });

        it('should handle tabs and other whitespace', () => {
            const tabNote = 'Line 1\n\tIndented line\n  Spaced line';
            const result = generateNoteText(tabNote, '0.50', '0.70');
            expect(result).toBe('note "Line 1\\n\tIndented line\\n  Spaced line" [0.50, 0.70]');
        });
    });
});
