import React from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react';
import LinkingPreview from '../../../components/map/LinkingPreview';
import {MapTheme} from '../../../constants/mapstyles';
import {UnifiedComponent} from '../../../types/unified/components';

describe('LinkingPreview', () => {
    let container: HTMLDivElement;
    let root: any;

    const mockMapStyleDefs: MapTheme = {
        component: {
            stroke: '#000000',
            fill: '#ffffff',
        },
    } as MapTheme;

    const mockMapDimensions = {
        width: 800,
        height: 600,
    };

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        document.body.removeChild(container);
    });

    const mockSourceComponent: UnifiedComponent = {
        id: 'source',
        name: 'Source Component',
        type: 'component',
        maturity: 0.5,
        visibility: 0.7,
        line: 1,
        label: {x: 0, y: 0},
        evolved: false,
        inertia: false,
        increaseLabelSpacing: 0,
        pseudoComponent: false,
        offsetY: 0,
        evolving: false,
        decorators: {
            buy: false,
            build: false,
            outsource: false,
            ecosystem: false,
            market: false,
        },
    };

    const mockHighlightedComponent: UnifiedComponent = {
        id: 'target',
        name: 'Target Component',
        type: 'component',
        maturity: 0.8,
        visibility: 0.3,
        line: 2,
        label: {x: 0, y: 0},
        evolved: false,
        inertia: false,
        increaseLabelSpacing: 0,
        pseudoComponent: false,
        offsetY: 0,
        evolving: false,
        decorators: {
            buy: false,
            build: false,
            outsource: false,
            ecosystem: false,
            market: false,
        },
    };

    it('renders nothing when linking state is idle', () => {
        act(() => {
            root.render(
                <svg>
                    <LinkingPreview
                        linkingState="idle"
                        sourceComponent={null}
                        mousePosition={{x: 0, y: 0}}
                        highlightedComponent={null}
                        mapStyleDefs={mockMapStyleDefs}
                        mapDimensions={mockMapDimensions}
                    />
                </svg>,
            );
        });

        expect(container.querySelector('.linking-preview')).toBeNull();
    });

    it('renders source component highlight when selecting source', () => {
        act(() => {
            root.render(
                <svg>
                    <LinkingPreview
                        linkingState="selecting-source"
                        sourceComponent={mockSourceComponent}
                        mousePosition={{x: 0.5, y: 0.5}}
                        highlightedComponent={null}
                        mapStyleDefs={mockMapStyleDefs}
                        mapDimensions={mockMapDimensions}
                    />
                </svg>,
            );
        });

        const linkingPreview = container.querySelector('.linking-preview');
        expect(linkingPreview).toBeTruthy();

        // Should have source component highlight (coordinates will be converted from maturity/visibility)
        const sourceHighlight = container.querySelector('circle[r="12"]');
        expect(sourceHighlight).toBeTruthy();
        expect(sourceHighlight?.getAttribute('r')).toBe('12');
    });

    it('renders preview line and highlights when selecting target', () => {
        act(() => {
            root.render(
                <svg>
                    <LinkingPreview
                        linkingState="selecting-target"
                        sourceComponent={mockSourceComponent}
                        mousePosition={{x: 0.6, y: 0.4}}
                        highlightedComponent={mockHighlightedComponent}
                        mapStyleDefs={mockMapStyleDefs}
                        mapDimensions={mockMapDimensions}
                    />
                </svg>,
            );
        });

        const linkingPreview = container.querySelector('.linking-preview');
        expect(linkingPreview).toBeTruthy();

        // Should have preview line from source to target (solid when snapped to component, dashed when following mouse)
        const previewLine = container.querySelector('line');
        expect(previewLine).toBeTruthy();

        // Should have source component highlight
        const sourceHighlight = container.querySelector('circle[r="12"]');
        expect(sourceHighlight).toBeTruthy();

        // Should have target component highlight
        const targetHighlight = container.querySelector('circle[r="10"]');
        expect(targetHighlight).toBeTruthy();
    });

    it('does not highlight source component as target', () => {
        act(() => {
            root.render(
                <svg>
                    <LinkingPreview
                        linkingState="selecting-target"
                        sourceComponent={mockSourceComponent}
                        mousePosition={{x: 0.6, y: 0.4}}
                        highlightedComponent={mockSourceComponent}
                        mapStyleDefs={mockMapStyleDefs}
                        mapDimensions={mockMapDimensions}
                    />
                </svg>,
            );
        });

        // Should only have one circle (source highlight), not target highlight
        const circles = container.querySelectorAll('circle');
        expect(circles).toHaveLength(1);
        expect(circles[0].getAttribute('r')).toBe('12'); // Source highlight
    });

    it('highlights potential source component when selecting source', () => {
        act(() => {
            root.render(
                <svg>
                    <LinkingPreview
                        linkingState="selecting-source"
                        sourceComponent={null}
                        mousePosition={{x: 0.5, y: 0.5}}
                        highlightedComponent={mockHighlightedComponent}
                        mapStyleDefs={mockMapStyleDefs}
                        mapDimensions={mockMapDimensions}
                    />
                </svg>,
            );
        });

        const linkingPreview = container.querySelector('.linking-preview');
        expect(linkingPreview).toBeTruthy();

        // Should have potential source component highlight with pulsing animation
        const sourceHighlight = container.querySelector('circle[r="12"]');
        expect(sourceHighlight).toBeTruthy();
        expect(sourceHighlight?.getAttribute('r')).toBe('12');

        // Should have animation elements
        const animations = container.querySelectorAll('animate');
        expect(animations.length).toBeGreaterThan(0);
    });

    it('snaps preview line to highlighted component when selecting target', () => {
        act(() => {
            root.render(
                <svg>
                    <LinkingPreview
                        linkingState="selecting-target"
                        sourceComponent={mockSourceComponent}
                        mousePosition={{x: 0.1, y: 0.1}}
                        highlightedComponent={mockHighlightedComponent}
                        mapStyleDefs={mockMapStyleDefs}
                        mapDimensions={mockMapDimensions}
                    />
                </svg>,
            );
        });

        const linkingPreview = container.querySelector('.linking-preview');
        expect(linkingPreview).toBeTruthy();

        // Should have preview line that snaps to highlighted component (solid line)
        const previewLine = container.querySelector('line');
        expect(previewLine).toBeTruthy();
        expect(previewLine?.getAttribute('stroke-dasharray')).toBe('none');
        expect(previewLine?.getAttribute('opacity')).toBe('0.8');
    });

    it('shows duplicate link warning when isDuplicateLink is true', () => {
        act(() => {
            root.render(
                <svg>
                    <LinkingPreview
                        linkingState="selecting-target"
                        sourceComponent={mockSourceComponent}
                        mousePosition={{x: 0.6, y: 0.4}}
                        highlightedComponent={mockHighlightedComponent}
                        mapStyleDefs={mockMapStyleDefs}
                        mapDimensions={mockMapDimensions}
                        isDuplicateLink={true}
                    />
                </svg>,
            );
        });

        const linkingPreview = container.querySelector('.linking-preview');
        expect(linkingPreview).toBeTruthy();

        // Should have warning-colored preview line (dashed)
        const previewLine = container.querySelector('line');
        expect(previewLine).toBeTruthy();
        expect(previewLine?.getAttribute('stroke-dasharray')).toBe('3,3');

        // Should have X mark for invalid link
        const xMarks = container.querySelectorAll('line[stroke="#ffc107"]');
        expect(xMarks.length).toBeGreaterThan(0);

        // Should show duplicate link warning text
        const warningText = container.querySelector('text');
        expect(warningText?.textContent).toBe('Link already exists');
    });

    it('shows error when source component is deleted', () => {
        act(() => {
            root.render(
                <svg>
                    <LinkingPreview
                        linkingState="selecting-target"
                        sourceComponent={mockSourceComponent}
                        mousePosition={{x: 0.6, y: 0.4}}
                        highlightedComponent={null}
                        mapStyleDefs={mockMapStyleDefs}
                        mapDimensions={mockMapDimensions}
                        isSourceDeleted={true}
                    />
                </svg>,
            );
        });

        const linkingPreview = container.querySelector('.linking-preview');
        expect(linkingPreview).toBeTruthy();

        // Should show error message for deleted source component
        const errorText = container.querySelector('text');
        expect(errorText?.textContent).toBe('Source component deleted');

        // Should have error-colored background
        const errorRect = container.querySelector('rect[fill="rgba(220, 53, 69, 0.9)"]');
        expect(errorRect).toBeTruthy();
    });

    it('shows error when target component is deleted', () => {
        act(() => {
            root.render(
                <svg>
                    <LinkingPreview
                        linkingState="selecting-target"
                        sourceComponent={mockSourceComponent}
                        mousePosition={{x: 0.6, y: 0.4}}
                        highlightedComponent={mockHighlightedComponent}
                        mapStyleDefs={mockMapStyleDefs}
                        mapDimensions={mockMapDimensions}
                        isTargetDeleted={true}
                    />
                </svg>,
            );
        });

        const linkingPreview = container.querySelector('.linking-preview');
        expect(linkingPreview).toBeTruthy();

        // Should show error message for deleted target component
        const errorText = container.querySelector('text');
        expect(errorText?.textContent).toBe('Target component deleted');

        // Should have error-colored background
        const errorRect = container.querySelector('rect[fill="rgba(220, 53, 69, 0.9)"]');
        expect(errorRect).toBeTruthy();
    });

    it('shows cancellation hint when showCancellationHint is true', () => {
        act(() => {
            root.render(
                <svg>
                    <LinkingPreview
                        linkingState="selecting-target"
                        sourceComponent={mockSourceComponent}
                        mousePosition={{x: 0.6, y: 0.4}}
                        highlightedComponent={null}
                        mapStyleDefs={mockMapStyleDefs}
                        mapDimensions={mockMapDimensions}
                        showCancellationHint={true}
                    />
                </svg>,
            );
        });

        const linkingPreview = container.querySelector('.linking-preview');
        expect(linkingPreview).toBeTruthy();

        // Should show cancellation hint text
        const hintText = container.querySelector('text');
        expect(hintText?.textContent).toBe('Click to cancel');

        // Should have dark background for hint
        const hintRect = container.querySelector('rect[fill="rgba(0, 0, 0, 0.8)"]');
        expect(hintRect).toBeTruthy();
    });

    it('uses error colors when components are deleted', () => {
        act(() => {
            root.render(
                <svg>
                    <LinkingPreview
                        linkingState="selecting-target"
                        sourceComponent={mockSourceComponent}
                        mousePosition={{x: 0.6, y: 0.4}}
                        highlightedComponent={mockHighlightedComponent}
                        mapStyleDefs={mockMapStyleDefs}
                        mapDimensions={mockMapDimensions}
                        isSourceDeleted={true}
                    />
                </svg>,
            );
        });

        const linkingPreview = container.querySelector('.linking-preview');
        expect(linkingPreview).toBeTruthy();

        // Should have error-colored preview line (dashed)
        const previewLine = container.querySelector('line');
        expect(previewLine).toBeTruthy();
        expect(previewLine?.getAttribute('stroke')).toBe('#dc3545'); // Error color
        expect(previewLine?.getAttribute('stroke-dasharray')).toBe('3,3');

        // Should have error-colored highlights
        const highlights = container.querySelectorAll('circle[stroke="#dc3545"]');
        expect(highlights.length).toBeGreaterThan(0);
    });
});
