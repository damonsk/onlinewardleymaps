import { MapTitleManager } from '../../services/MapTitleManager';

describe('MapTitleManager', () => {
    describe('getCurrentTitle', () => {
        it('returns title from map text', () => {
            const mapText = 'title My Test Map\ncomponent A [0.5, 0.5]';
            expect(MapTitleManager.getCurrentTitle(mapText)).toBe('My Test Map');
        });

        it('returns default title when no title in map text', () => {
            const mapText = 'component A [0.5, 0.5]';
            expect(MapTitleManager.getCurrentTitle(mapText)).toBe('Untitled Map');
        });

        it('handles empty map text', () => {
            expect(MapTitleManager.getCurrentTitle('')).toBe('Untitled Map');
        });

        it('trims whitespace from title', () => {
            const mapText = 'title   My Test Map   \ncomponent A [0.5, 0.5]';
            expect(MapTitleManager.getCurrentTitle(mapText)).toBe('My Test Map');
        });
    });

    describe('updateMapTitle', () => {
        it('updates existing title', () => {
            const mapText = 'title Old Title\ncomponent A [0.5, 0.5]';
            const result = MapTitleManager.updateMapTitle(mapText, 'New Title');

            expect(result.updatedMapText).toBe('title New Title\ncomponent A [0.5, 0.5]');
            expect(result.titleUpdated).toBe(true);
            expect(result.titleAdded).toBe(false);
            expect(result.lineNumber).toBe(1);
        });

        it('adds title when none exists', () => {
            const mapText = 'component A [0.5, 0.5]';
            const result = MapTitleManager.updateMapTitle(mapText, 'New Title');

            expect(result.updatedMapText).toBe('title New Title\ncomponent A [0.5, 0.5]');
            expect(result.titleAdded).toBe(true);
            expect(result.titleUpdated).toBe(false);
            expect(result.lineNumber).toBe(1);
        });

        it('throws error for empty title', () => {
            const mapText = 'component A [0.5, 0.5]';
            expect(() => MapTitleManager.updateMapTitle(mapText, '')).toThrow(
                'Invalid title: title cannot be empty and must be less than 200 characters',
            );
        });

        it('throws error for title too long', () => {
            const mapText = 'component A [0.5, 0.5]';
            const longTitle = 'A'.repeat(201);
            expect(() => MapTitleManager.updateMapTitle(mapText, longTitle)).toThrow(
                'Invalid title: title cannot be empty and must be less than 200 characters',
            );
        });

        it('handles whitespace-only title', () => {
            const mapText = 'component A [0.5, 0.5]';
            expect(() => MapTitleManager.updateMapTitle(mapText, '   ')).toThrow(
                'Invalid title: title cannot be empty and must be less than 200 characters',
            );
        });
    });

    describe('generateTitleDSL', () => {
        it('generates correct DSL syntax', () => {
            expect(MapTitleManager.generateTitleDSL('My Map')).toBe('title My Map');
        });

        it('handles titles with special characters', () => {
            expect(MapTitleManager.generateTitleDSL('My Map: Version 2.0')).toBe('title My Map: Version 2.0');
        });
    });

    describe('hasCustomTitle', () => {
        it('returns true for custom title', () => {
            const mapText = 'title My Custom Map\ncomponent A [0.5, 0.5]';
            expect(MapTitleManager.hasCustomTitle(mapText)).toBe(true);
        });

        it('returns false for default title', () => {
            const mapText = 'title Untitled Map\ncomponent A [0.5, 0.5]';
            expect(MapTitleManager.hasCustomTitle(mapText)).toBe(false);
        });

        it('returns false when no title exists', () => {
            const mapText = 'component A [0.5, 0.5]';
            expect(MapTitleManager.hasCustomTitle(mapText)).toBe(false);
        });
    });

    describe('getTitleLineNumber', () => {
        it('returns correct line number for title', () => {
            const mapText = 'title My Map\ncomponent A [0.5, 0.5]';
            expect(MapTitleManager.getTitleLineNumber(mapText)).toBe(1);
        });

        it('returns null when no title exists', () => {
            const mapText = 'component A [0.5, 0.5]';
            expect(MapTitleManager.getTitleLineNumber(mapText)).toBe(null);
        });

        it('finds title in middle of map text', () => {
            const mapText = 'component A [0.5, 0.5]\ntitle My Map\ncomponent B [0.3, 0.7]';
            expect(MapTitleManager.getTitleLineNumber(mapText)).toBe(2);
        });
    });

    describe('removeTitle', () => {
        it('removes existing title', () => {
            const mapText = 'title My Map\ncomponent A [0.5, 0.5]';
            const result = MapTitleManager.removeTitle(mapText);

            expect(result.updatedMapText).toBe('component A [0.5, 0.5]');
            expect(result.titleUpdated).toBe(true);
            expect(result.lineNumber).toBe(1);
        });

        it('returns unchanged text when no title exists', () => {
            const mapText = 'component A [0.5, 0.5]';
            const result = MapTitleManager.removeTitle(mapText);

            expect(result.updatedMapText).toBe(mapText);
            expect(result.titleUpdated).toBe(false);
            expect(result.titleAdded).toBe(false);
        });
    });
});
