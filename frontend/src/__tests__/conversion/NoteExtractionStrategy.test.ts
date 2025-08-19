import NoteExtractionStrategy from '../../conversion/NoteExtractionStrategy';

describe('NoteExtractionStrategy', () => {
    describe('class structure and basic functionality', () => {
        it('should initialize with correct properties', () => {
            const mapText = 'note Test [0.5, 0.5]';
            const strategy = new NoteExtractionStrategy(mapText);
            
            expect(strategy.data).toBe(mapText);
            expect(strategy.keyword).toBe('note');
            expect(strategy.containerName).toBe('notes');
            expect(strategy.baseRunner).toBeDefined();
        });

        it('should return result with notes container', () => {
            const mapText = 'note Test [0.5, 0.5]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result).toHaveProperty('notes');
            expect(result).toHaveProperty('errors');
            expect(Array.isArray(result.notes)).toBe(true);
            expect(Array.isArray(result.errors)).toBe(true);
        });
    });

    describe('backward compatibility with existing note syntax', () => {
        it('should extract single unquoted note', () => {
            const mapText = 'note Simple note [0.5, 0.7]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Simple note');
            expect(result.notes[0].visibility).toBe(0.5);
            expect(result.notes[0].maturity).toBe(0.7);
            expect(result.notes[0].line).toBe(1);
            expect(result.notes[0].id).toBe(1);
        });

        it('should extract multiple unquoted notes', () => {
            const mapText = `note First note [0.3, 0.2]
note Second note [0.7, 0.8]
note Third note [0.5, 0.5]`;
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(3);
            
            expect(result.notes[0].text).toBe('First note');
            expect(result.notes[0].line).toBe(1);
            expect(result.notes[0].id).toBe(1);
            
            expect(result.notes[1].text).toBe('Second note');
            expect(result.notes[1].line).toBe(2);
            expect(result.notes[1].id).toBe(2);
            
            expect(result.notes[2].text).toBe('Third note');
            expect(result.notes[2].line).toBe(3);
            expect(result.notes[2].id).toBe(3);
        });

        it('should handle notes with special characters', () => {
            const mapText = 'note Note with +special &chars! [0.4, 0.6]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Note with +special &chars!');
        });

        it('should handle notes with indentation', () => {
            const mapText = '    note Indented note [0.5, 0.5]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Indented note');
        });

        it('should handle empty note text', () => {
            const mapText = 'note [0.5, 0.5]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('');
        });
    });

    describe('new multi-line functionality', () => {
        it('should extract simple quoted note', () => {
            const mapText = 'note "Simple quoted note" [0.5, 0.7]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Simple quoted note');
            expect(result.notes[0].visibility).toBe(0.5);
            expect(result.notes[0].maturity).toBe(0.7);
        });

        it('should extract multi-line quoted note', () => {
            const mapText = 'note "Multi-line\\nnote content\\nwith breaks" [0.3, 0.8]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Multi-line\nnote content\nwith breaks');
            expect(result.notes[0].visibility).toBe(0.3);
            expect(result.notes[0].maturity).toBe(0.8);
        });

        it('should handle escaped quotes in quoted notes', () => {
            const mapText = 'note "Note with \\"escaped quotes\\" inside" [0.4, 0.6]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Note with "escaped quotes" inside');
        });

        it('should handle complex escaping', () => {
            const mapText = 'note "Complex \\"quote\\" and \\n newline and \\\\ backslash" [0.1, 0.9]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Complex "quote" and \n newline and \\ backslash');
        });

        it('should handle empty quoted strings', () => {
            const mapText = 'note "" [0.5, 0.5]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('');
        });
    });

    describe('mixed content scenarios', () => {
        it('should handle maps with both quoted and unquoted notes', () => {
            const mapText = `title Test Map
component A [0.5, 0.5]
note Simple unquoted note [0.3, 0.7]
note "Quoted single-line note" [0.6, 0.4]
note "Multi-line\\nquoted note\\nwith breaks" [0.2, 0.8]
component B [0.8, 0.2]`;

            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(3);
            
            // First note (unquoted)
            expect(result.notes[0].text).toBe('Simple unquoted note');
            expect(result.notes[0].line).toBe(3);
            
            // Second note (quoted single-line)
            expect(result.notes[1].text).toBe('Quoted single-line note');
            expect(result.notes[1].line).toBe(4);
            
            // Third note (quoted multi-line)
            expect(result.notes[2].text).toBe('Multi-line\nquoted note\nwith breaks');
            expect(result.notes[2].line).toBe(5);
        });

        it('should ignore non-note lines', () => {
            const mapText = `title Test Map
component A [0.5, 0.5]
note Valid note [0.3, 0.7]
// This is a comment
anchor Some anchor [0.4, 0.6]
note "Another valid note" [0.2, 0.8]`;

            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(2);
            expect(result.notes[0].text).toBe('Valid note');
            expect(result.notes[1].text).toBe('Another valid note');
        });
    });

    describe('error handling and edge cases', () => {
        it('should handle malformed quoted strings gracefully', () => {
            const mapText = 'note "Unclosed quote [0.5, 0.5]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Unclosed quote');
            expect(result.errors).toHaveLength(0); // Should not error, just fallback
        });

        it('should handle notes without coordinates', () => {
            const mapText = 'note "Note without coordinates"';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Note without coordinates');
            // Should use default coordinates from setCoords
            expect(result.notes[0].visibility).toBe(0.9);
            expect(result.notes[0].maturity).toBe(0.1);
        });

        it('should handle empty map text', () => {
            const mapText = '';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(0);
            expect(result.errors).toHaveLength(0);
        });

        it('should handle map text with no notes', () => {
            const mapText = `title Test Map
component A [0.5, 0.5]
component B [0.8, 0.2]`;
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(0);
            expect(result.errors).toHaveLength(0);
        });

        it('should handle lines that start with note but are not notes', () => {
            const mapText = `notebook entry [0.5, 0.5]
note Valid note [0.3, 0.7]
noted observation [0.4, 0.6]`;
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Valid note');
        });
    });

    describe('default attributes and configuration', () => {
        it('should apply default attributes to extracted notes', () => {
            const mapText = 'note Test note [0.5, 0.5]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].increaseLabelSpacing).toBe(0);
        });

        it('should set correct line numbers for multiple notes', () => {
            const mapText = `
note First note [0.3, 0.2]

note Second note [0.7, 0.8]


note Third note [0.5, 0.5]`;
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(3);
            expect(result.notes[0].line).toBe(2); // Line 2 (1-indexed)
            expect(result.notes[1].line).toBe(4); // Line 4
            expect(result.notes[2].line).toBe(7); // Line 7
        });

        it('should set unique IDs for multiple notes', () => {
            const mapText = `note First note [0.3, 0.2]
note Second note [0.7, 0.8]
note Third note [0.5, 0.5]`;
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(3);
            expect(result.notes[0].id).toBe(1);
            expect(result.notes[1].id).toBe(2);
            expect(result.notes[2].id).toBe(3);
        });
    });

    describe('real-world scenarios', () => {
        it('should handle documentation-style notes', () => {
            const mapText = 'note "Documentation:\\nThis component handles user authentication\\n\\nSee \\"auth.js\\" for implementation details" [0.5, 0.7]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Documentation:\nThis component handles user authentication\n\nSee "auth.js" for implementation details');
        });

        it('should handle code snippet notes', () => {
            const mapText = 'note "Code example:\\nfunction test() {\\n  return \\"hello\\";\\n}" [0.6, 0.4]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Code example:\nfunction test() {\n  return "hello";\n}');
        });

        it('should handle large multi-line notes', () => {
            const longNote = Array(10).fill('This is line').map((line, i) => `${line} ${i + 1}`).join('\\n');
            const mapText = `note "${longNote}" [0.3, 0.8]`;
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();
            
            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text.split('\n')).toHaveLength(10);
            expect(result.notes[0].text).toContain('This is line 1');
            expect(result.notes[0].text).toContain('This is line 10');
        });
    });
});