import {renderHook, act} from '@testing-library/react';
import React from 'react';
import {useMapComponentSelector} from '../../hooks/useMapComponentSelector';
import {ComponentSelectionProvider} from '../../components/ComponentSelectionContext';
import {UseMapStateResult} from '../../hooks/useUnifiedMapState';
import {UnifiedComponent, createUnifiedComponent} from '../../types/unified/components';

// Mock map state
const createMockMapState = (components: UnifiedComponent[]): UseMapStateResult => ({
    state: {} as any,
    actions: {} as any,
    renderState: {} as any,
    groupedComponents: {} as any,
    getAllComponents: () => components,
    getComponentsByType: () => [],
    findComponentByName: (name: string) => components.find(c => c.name === name),
    getUnifiedMap: () => ({} as any),
    resetToDefaults: () => {},
});

const wrapper = ({children}: {children: React.ReactNode}) => (
    React.createElement(ComponentSelectionProvider, {}, children)
);

describe('useMapComponentSelector', () => {
    const testComponent1 = createUnifiedComponent({
        id: 'comp1',
        name: 'Component 1',
        type: 'component',
    });

    const testComponent2 = createUnifiedComponent({
        id: 'comp2',
        name: 'Component 2',
        type: 'component',
    });

    const mockMapState = createMockMapState([testComponent1, testComponent2]);

    it('should initialize with no selection', () => {
        const {result} = renderHook(() => useMapComponentSelector(mockMapState), {wrapper});

        expect(result.current.selectedComponentId).toBeNull();
        expect(result.current.getSelectedComponent()).toBeNull();
    });

    it('should select a component by ID', () => {
        const {result} = renderHook(() => useMapComponentSelector(mockMapState), {wrapper});

        act(() => {
            result.current.selectComponent('comp1');
        });

        expect(result.current.selectedComponentId).toBe('comp1');
        expect(result.current.isSelected('comp1')).toBe(true);
        expect(result.current.isSelected('comp2')).toBe(false);
        expect(result.current.getSelectedComponent()).toEqual(testComponent1);
    });

    it('should clear selection', () => {
        const {result} = renderHook(() => useMapComponentSelector(mockMapState), {wrapper});

        act(() => {
            result.current.selectComponent('comp1');
        });

        expect(result.current.selectedComponentId).toBe('comp1');

        act(() => {
            result.current.clearSelection();
        });

        expect(result.current.selectedComponentId).toBeNull();
        expect(result.current.getSelectedComponent()).toBeNull();
    });

    it('should validate component existence before selection', () => {
        const {result} = renderHook(() => useMapComponentSelector(mockMapState), {wrapper});

        expect(result.current.canSelectComponent('comp1')).toBe(true);
        expect(result.current.canSelectComponent('nonexistent')).toBe(false);

        act(() => {
            result.current.selectComponent('nonexistent');
        });

        expect(result.current.selectedComponentId).toBeNull();
    });

    it('should find component by name as fallback', () => {
        const {result} = renderHook(() => useMapComponentSelector(mockMapState), {wrapper});

        act(() => {
            result.current.selectComponent('Component 1');
        });

        expect(result.current.selectedComponentId).toBe('Component 1');
        expect(result.current.getSelectedComponent()).toEqual(testComponent1);
    });
});