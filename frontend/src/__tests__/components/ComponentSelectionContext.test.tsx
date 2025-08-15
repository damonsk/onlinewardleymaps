import {renderHook, act} from '@testing-library/react';
import React from 'react';
import {ComponentSelectionProvider, useComponentSelection} from '../../components/ComponentSelectionContext';

const wrapper = ({children}: {children: React.ReactNode}) => React.createElement(ComponentSelectionProvider, {}, children);

describe('ComponentSelectionContext', () => {
    it('should initialize with no selection', () => {
        const {result} = renderHook(() => useComponentSelection(), {wrapper});

        expect(result.current.selectionState.selectedComponentId).toBeNull();
        expect(result.current.getSelectedComponentId()).toBeNull();
    });

    it('should select a component', () => {
        const {result} = renderHook(() => useComponentSelection(), {wrapper});

        act(() => {
            result.current.selectComponent('test-component');
        });

        expect(result.current.selectionState.selectedComponentId).toBe('test-component');
        expect(result.current.getSelectedComponentId()).toBe('test-component');
        expect(result.current.isSelected('test-component')).toBe(true);
        expect(result.current.isSelected('other-component')).toBe(false);
    });

    it('should clear selection', () => {
        const {result} = renderHook(() => useComponentSelection(), {wrapper});

        act(() => {
            result.current.selectComponent('test-component');
        });

        expect(result.current.getSelectedComponentId()).toBe('test-component');

        act(() => {
            result.current.clearSelection();
        });

        expect(result.current.selectionState.selectedComponentId).toBeNull();
        expect(result.current.getSelectedComponentId()).toBeNull();
        expect(result.current.isSelected('test-component')).toBe(false);
    });

    it('should replace previous selection when selecting new component', () => {
        const {result} = renderHook(() => useComponentSelection(), {wrapper});

        act(() => {
            result.current.selectComponent('component1');
        });

        expect(result.current.getSelectedComponentId()).toBe('component1');

        act(() => {
            result.current.selectComponent('component2');
        });

        expect(result.current.getSelectedComponentId()).toBe('component2');
        expect(result.current.isSelected('component1')).toBe(false);
        expect(result.current.isSelected('component2')).toBe(true);
    });

    it('should throw error when used outside provider', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            renderHook(() => useComponentSelection());
        }).toThrow('useComponentSelection must be used within a ComponentSelectionProvider');

        consoleError.mockRestore();
    });
});
