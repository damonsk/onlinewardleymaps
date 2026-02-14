/**
 * Tests for useMapComponentDeletion hook
 */

import {renderHook} from '@testing-library/react';
import React from 'react';
import {UndoRedoProvider} from '../../components/UndoRedoProvider';
import {useMapComponentDeletion} from '../../hooks/useMapComponentDeletion';
import {UndoRedoMapComponentDeleter} from '../../services/UndoRedoMapComponentDeleter';

// Mock the UndoRedoMapComponentDeleter
jest.mock('../../services/UndoRedoMapComponentDeleter');

describe('useMapComponentDeletion', () => {
    let mockDeleter: jest.Mocked<UndoRedoMapComponentDeleter>;
    let mockMutateMapText: typeof jest.fn;

    const createWrapper = () => {
        return function Wrapper({children}: {children: React.ReactNode}) {
            return React.createElement(
                UndoRedoProvider,
                {
                    mutateMapText: mockMutateMapText,
                    mapText: 'title Test Map',
                    maxHistorySize: 50,
                    debounceMs: 300,
                },
                children,
            );
        };
    };

    beforeEach(() => {
        mockMutateMapText = jest.fn();

        mockDeleter = {
            deleteComponentWithUndo: jest.fn(),
            canDelete: jest.fn(),
            validateDeletionParams: jest.fn(),
            getDeleter: jest.fn(),
        } as any;

        (UndoRedoMapComponentDeleter as jest.Mock).mockImplementation(() => mockDeleter);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('deleteComponent', () => {
        it('should call deleteComponentWithUndo with correct parameters', () => {
            const wrapper = createWrapper();
            const {result} = renderHook(() => useMapComponentDeletion(mockDeleter), {wrapper});

            const params = {
                mapText: 'title Test Map\ncomponent User [0.9, 0.1]',
                componentId: 'component-user-1',
                componentName: 'User',
            };

            result.current.deleteComponent(params);

            expect(mockDeleter.deleteComponentWithUndo).toHaveBeenCalledWith(
                params,
                expect.objectContaining({
                    mutateMapText: expect.any(Function),
                    isUndoRedoOperation: expect.any(Boolean),
                }),
            );
        });

        it('should handle deletion errors gracefully', () => {
            const wrapper = createWrapper();
            const {result} = renderHook(() => useMapComponentDeletion(mockDeleter), {wrapper});

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            mockDeleter.deleteComponentWithUndo.mockImplementation(() => {
                throw new Error('Component not found');
            });

            const params = {
                mapText: 'title Test Map',
                componentId: 'non-existent-component',
            };

            expect(() => {
                result.current.deleteComponent(params);
            }).toThrow('Component not found');

            expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting component:', expect.any(Error));

            consoleErrorSpy.mockRestore();
        });
    });

    describe('with default deleter', () => {
        it('should create default deleter when none provided', () => {
            const wrapper = createWrapper();
            const {result} = renderHook(() => useMapComponentDeletion(), {wrapper});

            // Should not throw error and should provide both methods
            expect(typeof result.current.deleteComponent).toBe('function');
        });
    });
});
