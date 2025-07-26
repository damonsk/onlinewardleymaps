import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import Note from '../../../components/map/Note';

// Mock navigator.userAgent for browser detection
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

describe('Note Positioning Tests', () => {
    const defaultProps = {
        note: {
            id: 'note1',
            text: 'Test Note',
            visibility: 0.5,
            maturity: 0.5,
            line: 1,
        },
        mapDimensions: {width: 800, height: 600},
        mapText: 'note Test Note [0.5, 0.5]',
        mutateMapText: jest.fn(),
        mapStyleDefs: {
            note: {
                fontSize: '14px',
                fontWeight: 'normal',
                textColor: '#000000',
            },
            fontFamily: 'Arial, sans-serif',
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

    it('should position editor correctly in Chrome at center of map', () => {
        mockUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        );
        mockVendor('Google Inc.');

        const {container} = render(
            <svg>
                <Note {...defaultProps} />
            </svg>,
        );

        const noteText = screen.getByTestId('modern_note_text_note1');
        fireEvent.doubleClick(noteText);

        const foreignObject = container.querySelector('foreignObject');
        expect(foreignObject).toBeInTheDocument();

        // Chrome uses local coordinates relative to the Movable transform
        // Editor centered at local origin: x = -70, y = -40
        expect(foreignObject).toHaveAttribute('x', '-70');
        expect(foreignObject).toHaveAttribute('y', '-40');
    });

    it('should position editor correctly in Chrome at top-left corner', () => {
        mockUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        );
        mockVendor('Google Inc.');

        const propsTopLeft = {
            ...defaultProps,
            note: {
                ...defaultProps.note,
                visibility: 1.0, // Top
                maturity: 0.0, // Left
            },
        };

        const {container} = render(
            <svg>
                <Note {...propsTopLeft} />
            </svg>,
        );

        const noteText = screen.getByTestId('modern_note_text_note1');
        fireEvent.doubleClick(noteText);

        const foreignObject = container.querySelector('foreignObject');
        expect(foreignObject).toBeInTheDocument();

        // Chrome uses local coordinates - same positioning regardless of note location
        // Editor centered at local origin: x = -70, y = -40
        expect(foreignObject).toHaveAttribute('x', '-70');
        expect(foreignObject).toHaveAttribute('y', '-40');
    });

    it('should position editor correctly in Chrome at bottom-right corner', () => {
        mockUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        );
        mockVendor('Google Inc.');

        const propsBottomRight = {
            ...defaultProps,
            note: {
                ...defaultProps.note,
                visibility: 0.0, // Bottom
                maturity: 1.0, // Right
            },
        };

        const {container} = render(
            <svg>
                <Note {...propsBottomRight} />
            </svg>,
        );

        const noteText = screen.getByTestId('modern_note_text_note1');
        fireEvent.doubleClick(noteText);

        const foreignObject = container.querySelector('foreignObject');
        expect(foreignObject).toBeInTheDocument();

        // Chrome uses local coordinates - same positioning regardless of note location
        // Editor centered at local origin: x = -70, y = -40
        expect(foreignObject).toHaveAttribute('x', '-70');
        expect(foreignObject).toHaveAttribute('y', '-40');
    });

    it('should use different coordinate systems for Chrome vs Safari', () => {
        const testPosition = {
            visibility: 0.3,
            maturity: 0.7,
        };

        const propsWithPosition = {
            ...defaultProps,
            note: {
                ...defaultProps.note,
                ...testPosition,
            },
        };

        // Test Chrome positioning (local coordinates)
        mockUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        );
        mockVendor('Google Inc.');

        const {container: chromeContainer} = render(
            <svg>
                <Note {...propsWithPosition} />
            </svg>,
        );

        const chromeNoteText = screen.getByTestId('modern_note_text_note1');
        fireEvent.doubleClick(chromeNoteText);

        const chromeForeignObject = chromeContainer.querySelector('foreignObject');
        const chromeX = chromeForeignObject?.getAttribute('x');
        const chromeY = chromeForeignObject?.getAttribute('y');

        // Chrome uses local coordinates
        expect(chromeX).toBe('-70');
        expect(chromeY).toBe('-40');

        // Clean up Chrome render
        chromeContainer.remove();

        // Test Safari positioning (global coordinates)
        mockUserAgent(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        );
        mockVendor('Apple Computer, Inc.');

        const {container: safariContainer} = render(
            <svg>
                <Note {...propsWithPosition} />
            </svg>,
        );

        const safariNoteText = screen.getByTestId('modern_note_text_note1');
        fireEvent.doubleClick(safariNoteText);

        const safariForeignObject = safariContainer.querySelector('foreignObject');
        const safariX = safariForeignObject?.getAttribute('x');
        const safariY = safariForeignObject?.getAttribute('y');

        // Safari uses global coordinates
        // Note position: x = 0.7 * 800 = 560, y = (1 - 0.3) * 600 = 420
        // Editor position: x = 560 - 70 = 490, y = 420 - 40 = 380
        expect(safariX).toBe('490');
        expect(safariY).toBe('380');

        // Different coordinate systems but both should visually appear in the same place
        expect(chromeX).not.toBe(safariX);
        expect(chromeY).not.toBe(safariY);
    });

    it('should apply Chrome-specific transform fixes', () => {
        mockUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        );
        mockVendor('Google Inc.');

        const {container} = render(
            <svg>
                <Note {...defaultProps} />
            </svg>,
        );

        const noteText = screen.getByTestId('modern_note_text_note1');
        fireEvent.doubleClick(noteText);

        const foreignObject = container.querySelector('foreignObject');
        expect(foreignObject).toBeInTheDocument();

        // Check that Chrome-specific styles are applied via style attribute
        const foreignObjectStyle = foreignObject?.getAttribute('style');
        expect(foreignObjectStyle).toContain('transform: translateZ(0)');
    });

    it('should not apply Chrome-specific transform fixes in Safari', () => {
        mockUserAgent(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        );
        mockVendor('Apple Computer, Inc.');

        const {container} = render(
            <svg>
                <Note {...defaultProps} />
            </svg>,
        );

        const noteText = screen.getByTestId('modern_note_text_note1');
        fireEvent.doubleClick(noteText);

        const foreignObject = container.querySelector('foreignObject');
        expect(foreignObject).toBeInTheDocument();

        // Check that Chrome-specific styles are NOT applied in Safari
        const foreignObjectStyle = foreignObject?.getAttribute('style');
        expect(foreignObjectStyle).not.toContain('transform: translateZ(0)');
    });
});
