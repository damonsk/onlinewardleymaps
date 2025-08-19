import NoteExtractionStrategy from '../../conversion/NoteExtractionStrategy';

describe('Multi-line Note Extraction Integration', () => {
    describe('backward compatibility', () => {
        it('should extract single-line unquoted notes correctly', () => {
            const mapText = 'note Simple note text [0.5, 0.7]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Simple note text');
            expect(result.notes[0].visibility).toBe(0.5);
            expect(result.notes[0].maturity).toBe(0.7);
        });

        it('should extract notes with special characters', () => {
            const mapText = 'note Note with +special &chars! [0.4, 0.6]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Note with +special &chars!');
            expect(result.notes[0].visibility).toBe(0.4);
            expect(result.notes[0].maturity).toBe(0.6);
        });

        it('should handle empty note text', () => {
            const mapText = 'note [0.5, 0.5]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('');
            expect(result.notes[0].visibility).toBe(0.5);
            expect(result.notes[0].maturity).toBe(0.5);
        });
    });

    describe('new multi-line functionality', () => {
        it('should extract simple quoted single-line notes', () => {
            const mapText = 'note "Simple quoted note" [0.5, 0.7]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Simple quoted note');
            expect(result.notes[0].visibility).toBe(0.5);
            expect(result.notes[0].maturity).toBe(0.7);
        });

        it('should extract multi-line quoted notes with line breaks', () => {
            const mapText = 'note "Multi-line\\nnote content\\nwith breaks" [0.3, 0.8]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Multi-line\nnote content\nwith breaks');
            expect(result.notes[0].visibility).toBe(0.3);
            expect(result.notes[0].maturity).toBe(0.8);
        });

        it('should handle escaped quotes within quoted strings', () => {
            const mapText = 'note "Note with \\"escaped quotes\\" inside" [0.4, 0.6]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Note with "escaped quotes" inside');
            expect(result.notes[0].visibility).toBe(0.4);
            expect(result.notes[0].maturity).toBe(0.6);
        });

        it('should handle complex escaping combinations', () => {
            const mapText = 'note "Complex \\"quote\\" and \\n newline and \\\\ backslash" [0.1, 0.9]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Complex "quote" and \n newline and \\ backslash');
            expect(result.notes[0].visibility).toBe(0.1);
            expect(result.notes[0].maturity).toBe(0.9);
        });

        it('should handle empty quoted strings', () => {
            const mapText = 'note "" [0.5, 0.5]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('');
            expect(result.notes[0].visibility).toBe(0.5);
            expect(result.notes[0].maturity).toBe(0.5);
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
            expect(result.notes[0].visibility).toBe(0.3);
            expect(result.notes[0].maturity).toBe(0.7);

            // Second note (quoted single-line)
            expect(result.notes[1].text).toBe('Quoted single-line note');
            expect(result.notes[1].visibility).toBe(0.6);
            expect(result.notes[1].maturity).toBe(0.4);

            // Third note (quoted multi-line)
            expect(result.notes[2].text).toBe('Multi-line\nquoted note\nwith breaks');
            expect(result.notes[2].visibility).toBe(0.2);
            expect(result.notes[2].maturity).toBe(0.8);
        });
    });

    describe('edge cases', () => {
        it('should handle malformed quoted strings gracefully', () => {
            const mapText = 'note "Unclosed quote [0.5, 0.5]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Unclosed quote');
            expect(result.notes[0].visibility).toBe(0.5);
            expect(result.notes[0].maturity).toBe(0.5);
        });

        it('should handle notes without coordinates', () => {
            const mapText = 'note "Quoted without coordinates"';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Quoted without coordinates');
            // Should use default coordinates
            expect(result.notes[0].visibility).toBe(0.9);
            expect(result.notes[0].maturity).toBe(0.1);
        });
    });

    describe('real-world examples', () => {
        it('should handle documentation-style multi-line notes', () => {
            const mapText =
                'note "This is a documentation note\\nwith multiple lines\\nfor detailed explanation\\n\\nIncludes paragraphs and formatting" [0.2, 0.8]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe(
                'This is a documentation note\nwith multiple lines\nfor detailed explanation\n\nIncludes paragraphs and formatting',
            );
            expect(result.notes[0].visibility).toBe(0.2);
            expect(result.notes[0].maturity).toBe(0.8);
        });

        it('should handle code snippet notes', () => {
            const mapText = 'note "Code example:\\nfunction test() {\\n  return \\"hello\\";\\n}" [0.6, 0.4]';
            const strategy = new NoteExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.notes).toHaveLength(1);
            expect(result.notes[0].text).toBe('Code example:\nfunction test() {\n  return "hello";\n}');
            expect(result.notes[0].visibility).toBe(0.6);
            expect(result.notes[0].maturity).toBe(0.4);
        });
    });
});
