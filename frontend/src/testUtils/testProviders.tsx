/**
 * Test utility for providing all necessary React contexts for component testing
 */

import React from 'react';
import {render} from '@testing-library/react';
import {ComponentSelectionProvider} from '../components/ComponentSelectionContext';
import {ContextMenuProvider} from '../components/map/ContextMenuProvider';
import {UndoRedoProvider} from '../components/UndoRedoProvider';

interface TestProviderWrapperProps {
    children: React.ReactNode;
    mutateMapText?: (mapText: string) => void;
    mapText?: string;
}

/**
 * Wrapper component that provides all necessary contexts for testing components
 * that require ComponentSelection, ContextMenu, and UndoRedo providers
 */
export const TestProviderWrapper: React.FC<TestProviderWrapperProps> = ({
    children,
    mutateMapText = jest.fn(),
    mapText = 'test map text',
}) => {
    return (
        <UndoRedoProvider mutateMapText={mutateMapText} mapText={mapText}>
            <ComponentSelectionProvider>
                <ContextMenuProvider>{children}</ContextMenuProvider>
            </ComponentSelectionProvider>
        </UndoRedoProvider>
    );
};

/**
 * Enhanced render function that automatically wraps components with necessary providers
 */
export const renderWithProviders = (
    component: React.ReactElement,
    options?: {
        mutateMapText?: (mapText: string) => void;
        mapText?: string;
    },
) => {
    return render(
        <TestProviderWrapper mutateMapText={options?.mutateMapText} mapText={options?.mapText}>
            <svg>{component}</svg>
        </TestProviderWrapper>,
    );
};

/**
 * Render function for components that don't need the SVG wrapper
 */
export const renderWithProvidersNoSVG = (
    component: React.ReactElement,
    options?: {
        mutateMapText?: (mapText: string) => void;
        mapText?: string;
    },
) => {
    return render(
        <TestProviderWrapper mutateMapText={options?.mutateMapText} mapText={options?.mapText}>
            {component}
        </TestProviderWrapper>,
    );
};
