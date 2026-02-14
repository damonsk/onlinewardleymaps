import '@testing-library/jest-dom';
import {LinkDeleter} from '../../services/LinkDeleter';
import {SelectionManager} from '../../services/SelectionManager';

describe('Link Selection Integration', () => {
    describe('LinkDeleter', () => {
        let linkDeleter: LinkDeleter;

        beforeEach(() => {
            linkDeleter = new LinkDeleter();
        });

        test('should delete regular link from map text', () => {
            const mapText = `title Test Map
component A [0.1, 0.9]
component B [0.5, 0.5]
A->B`;

            const linkInfo = {
                start: 'A',
                end: 'B',
                flow: false,
                line: 3,
            };

            const result = linkDeleter.deleteLink(mapText, linkInfo);

            expect(result).toBe(`title Test Map
component A [0.1, 0.9]
component B [0.5, 0.5]`);
        });

        test('should delete flow link from map text', () => {
            const mapText = `title Test Map
component A [0.1, 0.9]
component B [0.5, 0.5]
A->>B`;

            const linkInfo = {
                start: 'A',
                end: 'B',
                flow: true,
                line: 3,
            };

            const result = linkDeleter.deleteLink(mapText, linkInfo);

            expect(result).toBe(`title Test Map
component A [0.1, 0.9]
component B [0.5, 0.5]`);
        });

        test('should delete flow link with value from map text', () => {
            const mapText = `title Test Map
component A [0.1, 0.9]
component B [0.5, 0.5]
A->>B:data`;

            const linkInfo = {
                start: 'A',
                end: 'B',
                flow: true,
                flowValue: 'data',
                line: 3,
            };

            const result = linkDeleter.deleteLink(mapText, linkInfo);

            expect(result).toBe(`title Test Map
component A [0.1, 0.9]
component B [0.5, 0.5]`);
        });

        test('should delete bidirectional link from map text', () => {
            const mapText = `title Test Map
component A [0.1, 0.9]
component B [0.5, 0.5]
A<->B`;

            const linkInfo = {
                start: 'A',
                end: 'B',
                flow: false,
                line: 3,
            };

            const result = linkDeleter.deleteLink(mapText, linkInfo);

            expect(result).toBe(`title Test Map
component A [0.1, 0.9]
component B [0.5, 0.5]`);
        });
    });

    describe('SelectionManager', () => {
        let selectionManager: SelectionManager;
        let mockOnDeleteRequested: jest.fn;

        beforeEach(() => {
            mockOnDeleteRequested = jest.fn();
            selectionManager = new SelectionManager({
                onDeleteRequested: mockOnDeleteRequested,
            });
        });

        afterEach(() => {
            selectionManager.destroy();
        });

        test('should select and track link elements', () => {
            const linkElement = {
                id: 'A->B',
                type: 'link' as const,
                name: 'A → B',
                linkData: {
                    start: 'A',
                    end: 'B',
                    flow: false,
                    line: 3,
                },
            };

            selectionManager.selectElement(linkElement);

            expect(selectionManager.isSelected('A->B', 'link')).toBe(true);
            expect(selectionManager.getSelectedElement()).toEqual(linkElement);
        });

        test('should clear link selection', () => {
            const linkElement = {
                id: 'A->B',
                type: 'link' as const,
                name: 'A → B',
                linkData: {
                    start: 'A',
                    end: 'B',
                    flow: false,
                    line: 3,
                },
            };

            selectionManager.selectElement(linkElement);
            expect(selectionManager.isSelected('A->B', 'link')).toBe(true);

            selectionManager.clearSelection();
            expect(selectionManager.isSelected('A->B', 'link')).toBe(false);
            expect(selectionManager.getSelectedElement()).toBeNull();
        });

        test('should handle keyboard delete for selected links', () => {
            const linkElement = {
                id: 'A->B',
                type: 'link' as const,
                name: 'A → B',
                linkData: {
                    start: 'A',
                    end: 'B',
                    flow: false,
                    line: 3,
                },
            };

            selectionManager.selectElement(linkElement);
            selectionManager.attachKeyboardEvents();

            // Simulate Delete key press
            const deleteEvent = new KeyboardEvent('keydown', {key: 'Delete'});
            document.dispatchEvent(deleteEvent);

            expect(mockOnDeleteRequested).toHaveBeenCalledWith(linkElement);
        });

        test('should handle escape key to clear selection', () => {
            const linkElement = {
                id: 'A->B',
                type: 'link' as const,
                name: 'A → B',
                linkData: {
                    start: 'A',
                    end: 'B',
                    flow: false,
                    line: 3,
                },
            };

            selectionManager.selectElement(linkElement);
            selectionManager.attachKeyboardEvents();

            expect(selectionManager.isSelected('A->B', 'link')).toBe(true);

            // Simulate Escape key press
            const escapeEvent = new KeyboardEvent('keydown', {key: 'Escape'});
            document.dispatchEvent(escapeEvent);

            expect(selectionManager.isSelected('A->B', 'link')).toBe(false);
        });
    });
});
