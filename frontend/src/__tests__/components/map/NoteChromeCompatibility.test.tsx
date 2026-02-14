import {fireEvent, render, screen} from '@testing-library/react';
import {ComponentSelectionProvider} from '../../../components/ComponentSelectionContext';
import {EditingProvider} from '../../../components/EditingContext';
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

    it('should render InlineEditor when Chrome is detected', () => {
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

        // Chrome now uses the same InlineEditor path as other browsers
        expect(screen.getByTestId('inline-editor')).toBeInTheDocument();
        expect(screen.getByTestId('inline-editor-input').tagName).toBe('INPUT');
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

    it('should apply Chrome-specific foreignObject styling correctly', () => {
        // Mock Chrome user agent
        mockUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        );
        mockVendor('Google Inc.');

        const {container} = render(
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

        const foreignObject = container.querySelector('foreignObject');
        expect(foreignObject).toBeInTheDocument();
        const foreignObjectStyle = foreignObject?.getAttribute('style');
        expect(foreignObjectStyle).toContain('transform: translateZ(0)');
        expect(foreignObjectStyle).toContain('-webkit-transform: translateZ(0)');
    });

    it('should render InlineEditor consistently in both Chrome and Safari', () => {
        // Chrome
        mockUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        );
        mockVendor('Google Inc.');

        const {unmount: chromeUnmount} = render(
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
        expect(screen.getByTestId('inline-editor')).toBeInTheDocument();

        // Clean up Chrome render completely
        chromeUnmount();

        // Safari
        mockUserAgent(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        );
        mockVendor('Apple Computer, Inc.');

        const {unmount: safariUnmount} = render(
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

        expect(screen.getByTestId('inline-editor')).toBeInTheDocument();

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
