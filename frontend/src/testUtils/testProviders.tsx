/**
 * Test utility for providing all necessary React contexts for component testing
 */

import {render} from '@testing-library/react';
import React from 'react';
import {ComponentSelectionProvider} from '../components/ComponentSelectionContext';
import {ContextMenuProvider} from '../components/map/ContextMenuProvider';
import {UndoRedoProvider} from '../components/UndoRedoProvider';
import {FeatureSwitchesProvider} from '../components/FeatureSwitchesContext';
import {EditingProvider} from '../components/EditingContext';

interface TestProviderWrapperProps {
    children: React.ReactNode;
    mutateMapText?: (mapText: string) => void;
    mapText?: string;
}

const mockFeatureSwitches = {
    enableDashboard: false,
    enableNewPipelines: false,
    enableLinkContext: false,
    enableAccelerators: false,
    enableDoubleClickRename: true,
    enableNoteInlineEditing: false,
    showToggleFullscreen: false,
    showMapToolbar: false,
    showMiniMap: false,
    allowMapZoomMouseWheel: false,
    enableModernComponents: false,
};

/**
 * Wrapper component that provides all necessary contexts for testing components
 * that require ComponentSelection, ContextMenu, UndoRedo, FeatureSwitches, and Editing providers
 */
export const TestProviderWrapper: React.FC<TestProviderWrapperProps> = ({
    children,
    mutateMapText = jest.fn(),
    mapText = 'test map text',
}) => {
    return (
        <FeatureSwitchesProvider value={mockFeatureSwitches}>
            <EditingProvider>
                <UndoRedoProvider mutateMapText={mutateMapText} mapText={mapText}>
                    <ComponentSelectionProvider>
                        <ContextMenuProvider mapText={mapText}>{children}</ContextMenuProvider>
                    </ComponentSelectionProvider>
                </UndoRedoProvider>
            </EditingProvider>
        </FeatureSwitchesProvider>
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
