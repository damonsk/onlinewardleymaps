import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EditingProvider } from '../../../components/EditingContext';
import { FeatureSwitchesProvider } from '../../../components/FeatureSwitchesContext';
import ComponentText from '../../../components/map/ComponentText';
import { UnifiedComponent } from '../../../types/unified';

// Mock the rename function
jest.mock('../../../constants/rename', () => ({
    rename: jest.fn(),
}));

const mockRename = require('../../../constants/rename').rename;

describe('ComponentText Multi-line Editing', () => {
    const mockMapStyleDefs = {
        component: {
            fill: 'white',
            stroke: '#ccc',
            textColor: 'black',
            fontSize: '14px',
            fontWeight: 'normal',
        },
        fontFamily: 'Arial, sans-serif',
    };

    const mockMutateMapText = jest.fn();

    const createMockComponent = (name: string): UnifiedComponent => ({
        id: 'test-component',
        name,
        type: 'component',
        visibility: 0.5,
        maturity: 0.7,
        line: 1,
        evolved: false,
        label: {x: 0, y: 0},
        decorators: {
            buy: false,
            build: false,
            outsource: false,
            market: false,
            ecosystem: false,
        },
    });

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

    const renderComponentText = (component: UnifiedComponent, mapText = 'component Test [0.5, 0.7]') => {
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
        mockRename.mockReturnValue({success: true});
    });

    describe('multi-line component name detection', () => {
        it('should detect single-line component names and use single-line editor', async () => {
            const component = createMockComponent('Single Line Component');
            renderComponentText(component);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            await waitFor(() => {
                const input = screen.getByTestId('inline-editor-input');
                expect(input.tagName).toBe('INPUT');
                expect(input).toHaveValue('Single Line Component');
            });
        });

        it('should detect multi-line component names and use multi-line editor', async () => {
            const component = createMockComponent('Multi-line\nComponent\nName');
            renderComponentText(component);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            await waitFor(() => {
                const textarea = screen.getByTestId('inline-editor-input');
                expect(textarea.tagName).toBe('TEXTAREA');
                expect(textarea).toHaveValue('Multi-line\nComponent\nName');
            });
        });
    });

    describe('escape sequence handling', () => {
        it('should properly escape line breaks when saving', async () => {
            // Start with a multi-line component so it renders a textarea
            const component = createMockComponent('Original\nMulti-line\nComponent');
            renderComponentText(component, 'component "Original\\nMulti-line\\nComponent" [0.5, 0.7]');

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            await waitFor(() => {
                const textarea = screen.getByTestId('inline-editor-input');
                expect(textarea.tagName).toBe('TEXTAREA'); // Verify it's a textarea
                fireEvent.change(textarea, {target: {value: 'Line 1\nLine 2\nLine 3'}});
                fireEvent.keyDown(textarea, {key: 'Enter', ctrlKey: true});
            });

            await waitFor(() => {
                expect(mockRename).toHaveBeenCalledWith(
                    1,
                    'Original\nMulti-line\nComponent',
                    '"Line 1\\nLine 2\\nLine 3"',
                    'component "Original\\nMulti-line\\nComponent" [0.5, 0.7]',
                    mockMutateMapText,
                );
            });
        });

        it('should not quote simple single-line names', async () => {
            const component = createMockComponent('OldName');
            renderComponentText(component);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            await waitFor(() => {
                const input = screen.getByTestId('inline-editor-input');
                fireEvent.change(input, {target: {value: 'NewSimpleName'}});
                fireEvent.keyDown(input, {key: 'Enter'});
            });

            await waitFor(() => {
                expect(mockRename).toHaveBeenCalledWith(1, 'OldName', 'NewSimpleName', 'component Test [0.5, 0.7]', mockMutateMapText);
            });
        });
    });

    describe('keyboard shortcuts for multi-line editing', () => {
        it('should save on Ctrl+Enter in multi-line mode', async () => {
            const component = createMockComponent('Multi-line\nComponent');
            renderComponentText(component);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            await waitFor(() => {
                const textarea = screen.getByTestId('inline-editor-input');
                fireEvent.change(textarea, {target: {value: 'Updated\nMulti-line\nComponent'}});
                fireEvent.keyDown(textarea, {key: 'Enter', ctrlKey: true});
            });

            await waitFor(() => {
                expect(mockRename).toHaveBeenCalledWith(
                    1,
                    'Multi-line\nComponent',
                    '"Updated\\nMulti-line\\nComponent"',
                    'component Test [0.5, 0.7]',
                    mockMutateMapText,
                );
            });
        });

        it('should create new line on Enter in multi-line mode', async () => {
            const component = createMockComponent('Multi-line\nComponent');
            renderComponentText(component);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            await waitFor(() => {
                const textarea = screen.getByTestId('inline-editor-input');
                fireEvent.keyDown(textarea, {key: 'Enter'});
                expect(mockRename).not.toHaveBeenCalled();
                expect(textarea).toBeInTheDocument();
            });
        });
    });
});
