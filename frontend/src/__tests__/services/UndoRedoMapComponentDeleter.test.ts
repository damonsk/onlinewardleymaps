/**
 * Tests for UndoRedoMapComponentDeleter service
 */

import {UndoRedoMapComponentDeleter, UndoRedoContext} from '../../services/UndoRedoMapComponentDeleter';
import {MapComponentDeleter} from '../../services/MapComponentDeleter';
import {ActionType} from '../../types/undo-redo';

describe('UndoRedoMapComponentDeleter', () => {
    let deleter: UndoRedoMapComponentDeleter;
    let mockUndoRedoContext: jest.Mocked<UndoRedoContext>;
    let mockMapComponentDeleter: jest.Mocked<MapComponentDeleter>;

    beforeEach(() => {
        // Create mock MapComponentDeleter
        mockMapComponentDeleter = {
            deleteComponent: jest.fn(),
            canDelete: jest.fn(),
            validateDeletionParams: jest.fn(),
            deletePSTComponent: jest.fn(),
        } as any;

        // Create mock UndoRedoContext
        mockUndoRedoContext = {
            mutateMapText: jest.fn(),
            isUndoRedoOperation: false,
        };

        deleter = new UndoRedoMapComponentDeleter(mockMapComponentDeleter);
    });

    describe('deleteComponentWithUndo', () => {
        it('should delete component and record in undo history', () => {
            const mapText = `title Test Map
component User [0.9, 0.1]
component System [0.5, 0.5]`;

            const updatedMapText = `title Test Map
component User [0.9, 0.1]`;

            const deletionResult = {
                updatedMapText,
                deletedComponent: {
                    id: 'component-system-2',
                    type: 'component',
                    line: 2,
                    originalText: 'component System [0.5, 0.5]',
                },
            };

            // Mock validation
            mockMapComponentDeleter.validateDeletionParams.mockReturnValue({
                isValid: true,
                errors: [],
            });

            // Mock deletion
            mockMapComponentDeleter.deleteComponent.mockReturnValue(deletionResult);

            const params = {
                mapText,
                componentId: 'component-system-2',
                componentName: 'System',
            };

            const result = deleter.deleteComponentWithUndo(params, mockUndoRedoContext);

            // Verify deletion was performed
            expect(mockMapComponentDeleter.deleteComponent).toHaveBeenCalledWith(params);

            // Verify undo/redo was recorded
            expect(mockUndoRedoContext.mutateMapText).toHaveBeenCalledWith(updatedMapText, 'canvas-delete', 'Delete System');

            // Verify result is returned
            expect(result).toEqual(deletionResult);
        });

        it('should use componentId as name when componentName is not provided', () => {
            const mapText = `title Test Map
component User [0.9, 0.1]`;

            const deletionResult = {
                updatedMapText: 'title Test Map',
                deletedComponent: {
                    id: 'component-user-1',
                    type: 'component',
                    line: 1,
                    originalText: 'component User [0.9, 0.1]',
                },
            };

            mockMapComponentDeleter.validateDeletionParams.mockReturnValue({
                isValid: true,
                errors: [],
            });

            mockMapComponentDeleter.deleteComponent.mockReturnValue(deletionResult);

            const params = {
                mapText,
                componentId: 'component-user-1',
            };

            deleter.deleteComponentWithUndo(params, mockUndoRedoContext);

            expect(mockUndoRedoContext.mutateMapText).toHaveBeenCalledWith('title Test Map', 'canvas-delete', 'Delete component-user-1');
        });

        it('should throw error for invalid deletion parameters', () => {
            mockMapComponentDeleter.validateDeletionParams.mockReturnValue({
                isValid: false,
                errors: ['Map text must be a non-empty string'],
            });

            const params = {
                mapText: '',
                componentId: 'test-component',
            };

            expect(() => {
                deleter.deleteComponentWithUndo(params, mockUndoRedoContext);
            }).toThrow('Invalid deletion parameters: Map text must be a non-empty string');

            expect(mockMapComponentDeleter.deleteComponent).not.toHaveBeenCalled();
            expect(mockUndoRedoContext.mutateMapText).not.toHaveBeenCalled();
        });

        it('should propagate deletion errors', () => {
            mockMapComponentDeleter.validateDeletionParams.mockReturnValue({
                isValid: true,
                errors: [],
            });

            mockMapComponentDeleter.deleteComponent.mockImplementation(() => {
                throw new Error('Component not found');
            });

            const params = {
                mapText: 'title Test Map',
                componentId: 'non-existent-component',
            };

            expect(() => {
                deleter.deleteComponentWithUndo(params, mockUndoRedoContext);
            }).toThrow('Component not found');

            expect(mockUndoRedoContext.mutateMapText).not.toHaveBeenCalled();
        });
    });

    describe('canDelete', () => {
        it('should delegate to underlying deleter', () => {
            mockMapComponentDeleter.canDelete.mockReturnValue(true);

            const result = deleter.canDelete('test-component', 'component');

            expect(mockMapComponentDeleter.canDelete).toHaveBeenCalledWith('test-component', 'component');
            expect(result).toBe(true);
        });
    });

    describe('validateDeletionParams', () => {
        it('should delegate to underlying deleter', () => {
            const validation = {
                isValid: true,
                errors: [],
            };

            mockMapComponentDeleter.validateDeletionParams.mockReturnValue(validation);

            const params = {
                mapText: 'title Test Map',
                componentId: 'test-component',
            };

            const result = deleter.validateDeletionParams(params);

            expect(mockMapComponentDeleter.validateDeletionParams).toHaveBeenCalledWith(params);
            expect(result).toEqual(validation);
        });
    });

    describe('getDeleter', () => {
        it('should return the underlying deleter instance', () => {
            const result = deleter.getDeleter();
            expect(result).toBe(mockMapComponentDeleter);
        });
    });
});
