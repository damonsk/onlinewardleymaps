import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import ComponentText from '../../../components/map/ComponentText';
import {FeatureSwitchesProvider} from '../../../components/FeatureSwitchesContext';
import {UnifiedComponent} from '../../../types/unified';

// Mock the InlineEditor component
jest.mock('../../../components/map/InlineEditor', () => {
    return function MockInlineEditor({value, onChange, onSave, onCancel, ...props}: any) {
        return (
            <div data-testid="inline-editor">
                <input data-testid="inline-editor-input" value={value} onChange={e => onChange(e.target.value)} />
                <button data-testid="save-button" onClick={onSave}>
                    Save
                </button>
                <button data-testid="cancel-button" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        );
    };
});

// Mock ComponentTextSymbol
jest.mock('../../../components/symbols/ComponentTextSymbol', () => {
    return function MockComponentTextSymbol({text, onClick}: any) {
        return (
            <text data-testid="component-text-symbol" onClick={onClick}>
                {text}
            </text>
        );
    };
});

// Mock RelativeMovable
jest.mock('../../../components/map/RelativeMovable', () => {
    return function MockRelativeMovable({children}: any) {
        return <div data-testid="relative-movable">{children}</div>;
    };
});

describe('ComponentText Integration with InlineEditor', () => {
    const mockComponent: UnifiedComponent = {
        id: 'test-component',
        name: 'Test Component',
        type: 'component',
        maturity: 0.5,
        visibility: 0.6,
        line: 1,
        evolved: false,
        inertia: false,
        increaseLabelSpacing: 0,
        pseudoComponent: false,
        offsetY: 0,
        evolving: false,
        label: {x: 0, y: 0},
        decorators: {
            accelerate: false,
            build: false,
            buy: false,
            outsource: false,
            pioneer: false,
            settler: false,
            townplanner: false,
        },
    };

    const mockMapStyleDefs = {
        component: {
            fill: '#fff',
            stroke: '#000',
            strokeWidth: 1,
            fontSize: '14px',
            fontWeight: 'normal',
            textColor: '#000',
            evolvedTextColor: '#666',
        },
        attitudes: {},
        methods: {},
        annotation: {
            fill: '#fff',
            stroke: '#000',
            strokeWidth: 1,
            text: {fill: '#000'},
            boxStroke: '#000',
            boxStrokeWidth: 1,
            boxFill: '#fff',
        },
        note: {
            fill: '#fff',
            textColor: '#000',
        },
    };

    const defaultProps = {
        component: mockComponent,
        cx: 100,
        cy: 100,
        styles: {text: '#000', evolvedText: '#666', fontSize: '14px'},
        mutateMapText: jest.fn(),
        mapText: 'component Test Component [0.5, 0.6]',
        mapStyleDefs: mockMapStyleDefs,
    };

    const renderWithFeatureSwitches = (props: any, enableDoubleClickRename = true) => {
        return render(
            <FeatureSwitchesProvider value={{enableDoubleClickRename}}>
                <svg>
                    <ComponentText {...props} />
                </svg>
            </FeatureSwitchesProvider>,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render ComponentTextSymbol in normal mode', () => {
        renderWithFeatureSwitches(defaultProps);

        expect(screen.getByTestId('component-text-symbol')).toBeInTheDocument();
        expect(screen.getByText('Test Component')).toBeInTheDocument();
        expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
    });

    it('should switch to InlineEditor when double-clicked with feature enabled', async () => {
        renderWithFeatureSwitches(defaultProps);

        const textSymbol = screen.getByTestId('component-text-symbol');
        fireEvent.click(textSymbol);

        await waitFor(() => {
            expect(screen.getByTestId('inline-editor')).toBeInTheDocument();
            expect(screen.getByTestId('inline-editor-input')).toHaveValue('Test Component');
        });
    });

    it('should not switch to edit mode when feature is disabled', () => {
        renderWithFeatureSwitches(defaultProps, false);

        const textSymbol = screen.getByTestId('component-text-symbol');
        fireEvent.click(textSymbol);

        expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
    });

    it('should call mutateMapText when saving changes', async () => {
        const mutateMapText = jest.fn();
        const props = {...defaultProps, mutateMapText};

        renderWithFeatureSwitches(props);

        // Enter edit mode
        const textSymbol = screen.getByTestId('component-text-symbol');
        fireEvent.click(textSymbol);

        await waitFor(() => {
            expect(screen.getByTestId('inline-editor')).toBeInTheDocument();
        });

        // Change the text
        const input = screen.getByTestId('inline-editor-input');
        fireEvent.change(input, {target: {value: 'Updated Component'}});

        // Save the changes
        const saveButton = screen.getByTestId('save-button');
        fireEvent.click(saveButton);

        expect(mutateMapText).toHaveBeenCalled();
    });

    it('should revert text when canceling', async () => {
        renderWithFeatureSwitches(defaultProps);

        // Enter edit mode
        const textSymbol = screen.getByTestId('component-text-symbol');
        fireEvent.click(textSymbol);

        await waitFor(() => {
            expect(screen.getByTestId('inline-editor')).toBeInTheDocument();
        });

        // Change the text
        const input = screen.getByTestId('inline-editor-input');
        fireEvent.change(input, {target: {value: 'Changed Text'}});
        expect(input).toHaveValue('Changed Text');

        // Cancel the changes
        const cancelButton = screen.getByTestId('cancel-button');
        fireEvent.click(cancelButton);

        // Should exit edit mode and revert to original text
        await waitFor(() => {
            expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
            expect(screen.getByText('Test Component')).toBeInTheDocument();
        });
    });

    it('should pass correct props to InlineEditor', async () => {
        renderWithFeatureSwitches(defaultProps);

        // Enter edit mode
        const textSymbol = screen.getByTestId('component-text-symbol');
        fireEvent.click(textSymbol);

        await waitFor(() => {
            const inlineEditor = screen.getByTestId('inline-editor');
            expect(inlineEditor).toBeInTheDocument();
        });

        // Verify the input has the correct initial value
        const input = screen.getByTestId('inline-editor-input');
        expect(input).toHaveValue('Test Component');
    });

    it('should render with Safari-compatible wrapper in edit mode', async () => {
        renderWithFeatureSwitches(defaultProps);

        // Enter edit mode
        const textSymbol = screen.getByTestId('component-text-symbol');
        fireEvent.click(textSymbol);

        await waitFor(() => {
            // In test environment (not Safari), should use InlineEditor
            expect(screen.getByTestId('inline-editor')).toBeInTheDocument();
        });

        // Check that the foreignObject exists
        const foreignObject = document.querySelector('foreignObject');
        expect(foreignObject).toBeInTheDocument();
        expect(foreignObject).toHaveAttribute('width', '140');
    });

    it('should use native input for Safari browser', async () => {
        // Mock Safari user agent
        const originalUserAgent = navigator.userAgent;
        Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
            configurable: true,
        });

        renderWithFeatureSwitches(defaultProps);

        // Enter edit mode
        const textSymbol = screen.getByTestId('component-text-symbol');
        fireEvent.click(textSymbol);

        await waitFor(() => {
            // Should use native input instead of InlineEditor for Safari
            const nativeInput = document.querySelector('input[type="text"]');
            expect(nativeInput).toBeInTheDocument();
            expect(nativeInput).toHaveValue('Test Component');
        });

        // Restore original user agent
        Object.defineProperty(navigator, 'userAgent', {
            value: originalUserAgent,
            configurable: true,
        });
    });
});
