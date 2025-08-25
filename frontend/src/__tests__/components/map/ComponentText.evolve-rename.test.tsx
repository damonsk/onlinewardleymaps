import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import ComponentText from '../../../components/map/ComponentText';
import {UnifiedComponent} from '../../../types/unified';
import {FeatureSwitchesProvider} from '../../../components/FeatureSwitchesContext';
import {EditingProvider} from '../../../components/EditingContext';

// Mock the rename function
jest.mock('../../../constants/rename', () => ({
    rename: jest.fn(),
}));

describe('ComponentText Evolved Component Rename', () => {
    const mockMutateMapText = jest.fn();
    const mockMapStyleDefs = {
        component: {
            fontSize: '14px',
            text: '#000000',
            evolvedText: '#666666',
        },
    };

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

    const renderComponentText = (component: UnifiedComponent, mapText: string) => {
        return render(
            <FeatureSwitchesProvider value={mockFeatureSwitches}>
                <EditingProvider>
                    <svg>
                        <ComponentText
                            component={component}
                            cx={100}
                            cy={50}
                            styles={{text: 'black', evolvedText: 'gray', fontSize: '14px'}}
                            mutateMapText={mockMutateMapText}
                            mapText={mapText}
                            mapStyleDefs={mockMapStyleDefs}
                        />
                    </svg>
                </EditingProvider>
            </FeatureSwitchesProvider>,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Evolved component without override name', () => {
        it('should add override syntax when renaming an evolved component without existing override', async () => {
            const evolvedComponent: UnifiedComponent = {
                id: 'component-1_evolved',
                name: 'foo',
                override: '', // No override name
                evolved: true,
                maturity: 0.5,
                visibility: 0.7,
                line: 2,
            };

            const mapText = `component foo [0.5, 0.7]
evolve foo 0.9`;

            renderComponentText(evolvedComponent, mapText);

            // Double-click to enter edit mode
            const textElement = screen.getByTestId('component-1_evolved-text');
            fireEvent.doubleClick(textElement);

            await waitFor(() => {
                const input = screen.getByTestId('inline-editor-input');
                expect(input).toBeInTheDocument();
            });

            // Change the text to a new name
            const input = screen.getByTestId('inline-editor-input');
            fireEvent.change(input, {target: {value: 'barbaz'}});
            fireEvent.keyDown(input, {key: 'Enter', ctrlKey: true});

            await waitFor(() => {
                expect(mockMutateMapText).toHaveBeenCalledWith(`component foo [0.5, 0.7]
evolve foo->barbaz 0.9`);
            });
        });

        it('should add override syntax with quoted names for multi-line evolved components', async () => {
            const evolvedComponent: UnifiedComponent = {
                id: 'component-1_evolved',
                name: 'foo',
                override: '', // No override name
                evolved: true,
                maturity: 0.5,
                visibility: 0.7,
                line: 2,
            };

            const mapText = `component foo [0.5, 0.7]
evolve foo 0.9`;

            renderComponentText(evolvedComponent, mapText);

            // Double-click to enter edit mode
            const textElement = screen.getByTestId('component-1_evolved-text');
            fireEvent.doubleClick(textElement);

            await waitFor(() => {
                const input = screen.getByTestId('inline-editor-input');
                expect(input).toBeInTheDocument();
            });

            // Change the text to a multi-line name
            const input = screen.getByTestId('inline-editor-input');
            fireEvent.change(input, {target: {value: 'bar\\nbaz'}});
            fireEvent.keyDown(input, {key: 'Enter', ctrlKey: true});

            await waitFor(() => {
                expect(mockMutateMapText).toHaveBeenCalledWith(`component foo [0.5, 0.7]
evolve foo->"bar\\nbaz" 0.9`);
            });
        });

        it('should handle evolve statements with labels when adding override', async () => {
            const evolvedComponent: UnifiedComponent = {
                id: 'component-1_evolved',
                name: 'Database',
                override: '', // No override name
                evolved: true,
                maturity: 0.3,
                visibility: 0.4,
                line: 2,
            };

            const mapText = `component Database [0.3, 0.4]
evolve Database 0.8 label [10, 5]`;

            renderComponentText(evolvedComponent, mapText);

            // Double-click to enter edit mode
            const textElement = screen.getByTestId('component-1_evolved-text');
            fireEvent.doubleClick(textElement);

            await waitFor(() => {
                const input = screen.getByTestId('inline-editor-input');
                expect(input).toBeInTheDocument();
            });

            // Change the text to a new name
            const input = screen.getByTestId('inline-editor-input');
            fireEvent.change(input, {target: {value: 'Evolved Database'}});
            fireEvent.keyDown(input, {key: 'Enter', ctrlKey: true});

            await waitFor(() => {
                expect(mockMutateMapText).toHaveBeenCalledWith(`component Database [0.3, 0.4]
evolve Database->"Evolved Database" 0.8 label [10, 5]`);
            });
        });

        it('should handle quoted source component names when adding override', async () => {
            const evolvedComponent: UnifiedComponent = {
                id: 'component-1_evolved',
                name: 'Multi Line\\nComponent',
                override: '', // No override name
                evolved: true,
                maturity: 0.5,
                visibility: 0.7,
                line: 2,
            };

            const mapText = `component "Multi Line\\nComponent" [0.5, 0.7]
evolve "Multi Line\\nComponent" 0.9`;

            renderComponentText(evolvedComponent, mapText);

            // Double-click to enter edit mode
            const textElement = screen.getByTestId('component-1_evolved-text');
            fireEvent.doubleClick(textElement);

            await waitFor(() => {
                const input = screen.getByTestId('inline-editor-input');
                expect(input).toBeInTheDocument();
            });

            // Change the text to a new name
            const input = screen.getByTestId('inline-editor-input');
            fireEvent.change(input, {target: {value: 'Evolved Multi Line Component'}});
            fireEvent.keyDown(input, {key: 'Enter', ctrlKey: true});

            await waitFor(() => {
                expect(mockMutateMapText).toHaveBeenCalledWith(`component "Multi Line\\nComponent" [0.5, 0.7]
evolve "Multi Line\\nComponent"->"Evolved Multi Line Component" 0.9`);
            });
        });
    });

    describe('Evolved component with existing override name', () => {
        it('should update existing override syntax when renaming', async () => {
            const evolvedComponent: UnifiedComponent = {
                id: 'component-1_evolved',
                name: 'foo',
                override: 'bar', // Existing override name
                evolved: true,
                maturity: 0.5,
                visibility: 0.7,
                line: 2,
            };

            const mapText = `component foo [0.5, 0.7]
evolve foo->bar 0.9`;

            renderComponentText(evolvedComponent, mapText);

            // Double-click to enter edit mode
            const textElement = screen.getByTestId('component-1_evolved-text');
            fireEvent.doubleClick(textElement);

            await waitFor(() => {
                const input = screen.getByTestId('inline-editor-input');
                expect(input).toBeInTheDocument();
            });

            // Change the text to a new name
            const input = screen.getByTestId('inline-editor-input');
            fireEvent.change(input, {target: {value: 'baz'}});
            fireEvent.keyDown(input, {key: 'Enter', ctrlKey: true});

            await waitFor(() => {
                expect(mockMutateMapText).toHaveBeenCalledWith(`component foo [0.5, 0.7]
evolve foo->baz 0.9`);
            });
        });

        it('should update existing quoted override syntax when renaming', async () => {
            const evolvedComponent: UnifiedComponent = {
                id: 'component-1_evolved',
                name: 'Original Name',
                override: 'Old Evolved Name',
                evolved: true,
                maturity: 0.6,
                visibility: 0.8,
                line: 2,
            };

            const mapText = `component "Original Name" [0.6, 0.8]
evolve "Original Name"->"Old Evolved Name" 0.95`;

            renderComponentText(evolvedComponent, mapText);

            // Double-click to enter edit mode
            const textElement = screen.getByTestId('component-1_evolved-text');
            fireEvent.doubleClick(textElement);

            await waitFor(() => {
                const input = screen.getByTestId('inline-editor-input');
                expect(input).toBeInTheDocument();
            });

            // Change the text to a new multi-line name
            const input = screen.getByTestId('inline-editor-input');
            fireEvent.change(input, {target: {value: 'New Evolved\\nName'}});
            fireEvent.keyDown(input, {key: 'Enter', ctrlKey: true});

            await waitFor(() => {
                expect(mockMutateMapText).toHaveBeenCalledWith(`component "Original Name" [0.6, 0.8]
evolve "Original Name"->"New Evolved\\nName" 0.95`);
            });
        });
    });

    describe('Error handling', () => {
        it('should show error when evolved component is not found', async () => {
            // Mock window.alert
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

            const evolvedComponent: UnifiedComponent = {
                id: 'component-1_evolved',
                name: 'NonExistent',
                override: '',
                evolved: true,
                maturity: 0.5,
                visibility: 0.7,
                line: 2,
            };

            const mapText = `component foo [0.5, 0.7]
evolve foo 0.9`;

            renderComponentText(evolvedComponent, mapText);

            // Double-click to enter edit mode
            const textElement = screen.getByTestId('component-1_evolved-text');
            fireEvent.doubleClick(textElement);

            await waitFor(() => {
                const input = screen.getByTestId('inline-editor-input');
                expect(input).toBeInTheDocument();
            });

            // Change the text to a new name
            const input = screen.getByTestId('inline-editor-input');
            fireEvent.change(input, {target: {value: 'NewName'}});
            fireEvent.keyDown(input, {key: 'Enter', ctrlKey: true});

            await waitFor(() => {
                expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Could not find evolved component "NonExistent"'));
            });

            alertSpy.mockRestore();
        });
    });
});
