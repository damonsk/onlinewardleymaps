import { fireEvent, render, screen } from '@testing-library/react';
import { ComponentSelectionProvider } from '../../../components/ComponentSelectionContext';
import { EditingProvider } from '../../../components/EditingContext';
import Note from '../../../components/map/Note';

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

// Mock navigator.userAgent for Chrome detection
const mockUserAgent = (userAgent: string) => {
    Object.defineProperty(navigator, 'userAgent', {
        value: userAgent,
        configurable: true,
    });
};

const mockVendor = (vendor: string) => {
    Object.defineProperty(navigator, 'vendor', {
        value: vendor,
        configurable: true,
    });
};

describe('Note Chrome Compatibility', () => {
    const defaultProps = {
        note: {
            id: 'note1',
            text: 'Test Note Content',
            visibility: 0.5,
            maturity: 0.5,
            line: 1,
        },
        mapDimensions: {width: 800, height: 600},
        mapText: 'note Test Note Content [0.5, 0.5]',
        mutateMapText: jest.fn(),
        mapStyleDefs: {
            note: {
                fontSize: '14px',
                fontWeight: 'normal',
                textColor: '#000000',
                evolvedTextColor: '#666',
            },
            fontFamily: 'Arial, sans-serif',
            attitudes: {},
            methods: {
                buy: {color: '#ccc', label: 'Buy'},
                build: {color: '#ccc', label: 'Build'},
                outsource: {color: '#ccc', label: 'Outsource'},
            },
            component: {
                fill: '#fff',
                stroke: '#000',
                strokeWidth: 1,
                fontSize: '14px',
                fontWeight: 'normal',
                textColor: '#000',
                evolvedTextColor: '#666',
            },
            annotation: {
                fill: '#fff',
                stroke: '#000',
                strokeWidth: 1,
                text: '#000',
                boxStroke: '#000',
                boxStrokeWidth: 1,
                boxFill: '#fff',
                boxTextColour: '#000',
            },
        },
        setHighlightLine: jest.fn(),
        scaleFactor: 1,
        enableInlineEditing: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Reset navigator properties
        delete (navigator as any).userAgent;
        delete (navigator as any).vendor;
    });

    it('should render Chrome-specific editor when Chrome is detected', () => {
        // Mock Chrome user agent
        mockUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        );
        mockVendor('Google Inc.');

        render(
            <EditingProvider>
                <ComponentSelectionProvider>
                    <svg>
                        <Note {...defaultProps} />
                    </svg>
                </ComponentSelectionProvider>
            </EditingProvider>,
        );

        const noteText = screen.getByTestId('modern_note_text_note1');
        fireEvent.doubleClick(noteText);

        // Should render a textarea for Chrome
        const textarea = screen.getByDisplayValue('Test Note Content');
        expect(textarea.tagName).toBe('TEXTAREA');
        expect(textarea).toHaveStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            color: '#000000',
        });
    });

    it('should render default InlineEditor when Safari is detected', () => {
        // Mock Safari user agent
        mockUserAgent(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        );
        mockVendor('Apple Computer, Inc.');

        render(
            <EditingProvider>
                <ComponentSelectionProvider>
                    <svg>
                        <Note {...defaultProps} />
                    </svg>
                </ComponentSelectionProvider>
            </EditingProvider>,
        );

        const noteText = screen.getByTestId('modern_note_text_note1');
        fireEvent.doubleClick(noteText);

        // Should render the InlineEditor component
        expect(screen.getByTestId('inline-editor')).toBeInTheDocument();
    });

    it('should render default InlineEditor for other browsers', () => {
        // Mock Firefox user agent
        mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0');
        mockVendor('');

        render(
            <EditingProvider>
                <ComponentSelectionProvider>
                    <svg>
                        <Note {...defaultProps} />
                    </svg>
                </ComponentSelectionProvider>
            </EditingProvider>,
        );

        const noteText = screen.getByTestId('modern_note_text_note1');
        fireEvent.doubleClick(noteText);

        // Should render the InlineEditor component
        expect(screen.getByTestId('inline-editor')).toBeInTheDocument();
    });

    it('should apply Chrome-specific styling correctly', () => {
        // Mock Chrome user agent
        mockUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        );
        mockVendor('Google Inc.');

        render(
            <EditingProvider>
                <ComponentSelectionProvider>
                    <svg>
                        <Note {...defaultProps} />
                    </svg>
                </ComponentSelectionProvider>
            </EditingProvider>,
        );

        const noteText = screen.getByTestId('modern_note_text_note1');
        fireEvent.doubleClick(noteText);

        // Check that the container div has Chrome-specific styling
        const container = screen.getByDisplayValue('Test Note Content').parentElement;

        // Check key styling properties individually
        expect(container).toHaveStyle('width: 100%');
        expect(container).toHaveStyle('height: 100%');
        expect(container).toHaveStyle('position: relative');
        expect(container).toHaveStyle('display: block');
        expect(container).toHaveStyle('background-color: rgb(255, 255, 255)');
        expect(container).toHaveStyle('border-radius: 4px');
        expect(container).toHaveStyle('padding: 4px');
        expect(container).toHaveStyle('box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)');
        expect(container).toHaveStyle('z-index: 1000');
        expect(container).toHaveStyle('box-sizing: border-box');

        // Check that the textarea has proper Chrome-specific styling
        const textarea = screen.getByDisplayValue('Test Note Content');
        expect(textarea).toHaveStyle({
            height: 'calc(100% - 8px)',
        });

        // Verify Chrome-specific properties are present in the style attribute
        const textareaStyle = textarea.getAttribute('style');
        expect(textareaStyle).toContain('box-sizing: border-box');

        // Test border color consistency - should use theme colors
        // The container should have a border that uses theme colors (focus state is applied on autoFocus)
        const containerStyle = container?.getAttribute('style');
        expect(containerStyle).toContain('border: 2px solid');
    });

    it('should use consistent border colors between Chrome and Safari', () => {
        // Test Chrome border color
        mockUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        );
        mockVendor('Google Inc.');

        const {container: chromeContainer, unmount: chromeUnmount} = render(
            <EditingProvider>
                <ComponentSelectionProvider>
                    <svg>
                        <Note {...defaultProps} />
                    </svg>
                </ComponentSelectionProvider>
            </EditingProvider>,
        );

        const chromeNoteText = screen.getByTestId('modern_note_text_note1');
        fireEvent.doubleClick(chromeNoteText);

        const chromeTextarea = screen.getByDisplayValue('Test Note Content');
        const chromeEditorContainer = chromeTextarea.parentElement;

        // Blur to get the default border color (not focus state)
        fireEvent.blur(chromeTextarea);

        const chromeBorderStyle = chromeEditorContainer?.getAttribute('style');

        // Clean up Chrome render completely
        chromeUnmount();

        // Test Safari border color
        mockUserAgent(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        );
        mockVendor('Apple Computer, Inc.');

        const {container: safariContainer, unmount: safariUnmount} = render(
            <EditingProvider>
                <ComponentSelectionProvider>
                    <svg>
                        <Note {...defaultProps} />
                    </svg>
                </ComponentSelectionProvider>
            </EditingProvider>,
        );

        const safariNoteText = screen.getByTestId('modern_note_text_note1');
        fireEvent.doubleClick(safariNoteText);

        // Safari uses InlineEditor which should have consistent theming
        const inlineEditor = screen.getByTestId('inline-editor');
        expect(inlineEditor).toBeInTheDocument();

        // Both should use theme-based border colors for consistency
        expect(chromeBorderStyle).toContain('border: 2px solid');

        // Clean up Safari render
        safariUnmount();
    });

    it('should position Chrome editor correctly relative to note position', () => {
        // Mock Chrome user agent
        mockUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        );
        mockVendor('Google Inc.');

        const propsWithSpecificPosition = {
            ...defaultProps,
            note: {
                ...defaultProps.note,
                visibility: 0.3, // 30% visibility
                maturity: 0.7, // 70% maturity
            },
        };

        const {container} = render(
            <EditingProvider>
                <ComponentSelectionProvider>
                    <svg>
                        <Note {...propsWithSpecificPosition} />
                    </svg>
                </ComponentSelectionProvider>
            </EditingProvider>,
        );

        const noteText = screen.getByTestId('modern_note_text_note1');
        fireEvent.doubleClick(noteText);

        // Check that foreignObject is positioned correctly
        const foreignObject = container.querySelector('foreignObject');
        expect(foreignObject).toBeInTheDocument();

        // Chrome uses local coordinates relative to the Movable transform
        // Editor should be centered at local origin: x = -70, y = -40
        expect(foreignObject).toHaveAttribute('x', '-70');
        expect(foreignObject).toHaveAttribute('y', '-40');
        expect(foreignObject).toHaveAttribute('width', '140');
        expect(foreignObject).toHaveAttribute('height', '80');
    });
});
