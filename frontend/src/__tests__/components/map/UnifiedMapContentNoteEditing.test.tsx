import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import UnifiedMapContent from '../../../components/map/UnifiedMapContent';
import {FeatureSwitchesProvider} from '../../../components/FeatureSwitchesContext';
import {MapElements} from '../../../processing/MapElements';

// Mock the MapElements class
jest.mock('../../../processing/MapElements');

describe('UnifiedMapContent Note Editing Integration', () => {
    const mockMapElements = {
        getAllComponents: jest.fn(() => []),
        getMergedComponents: jest.fn(() => []),
        getEvolvingComponents: jest.fn(() => []),
        getEvolvedComponents: jest.fn(() => []),
        getPipelineComponents: jest.fn(() => []),
    };

    const defaultProps = {
        mapAttitudes: [],
        mapDimensions: {width: 800, height: 600},
        mapStyleDefs: {
            className: 'wardley',
            note: {
                fontSize: '14px',
                fontWeight: 'normal',
                textColor: '#000000',
            },
        },
        mapText: 'note Test Note [0.5, 0.5]',
        mutateMapText: jest.fn(),
        scaleFactor: 1,
        mapElementsClicked: [],
        links: [],
        mapElements: mockMapElements as any,
        evolutionOffsets: {commodity: 0, product: 0, custom: 0},
        enableNewPipelines: false,
        setHighlightLine: jest.fn(),
        clicked: jest.fn(),
        enableAccelerators: false,
        mapAccelerators: [],
        mapNotes: [
            {
                id: 'note1',
                text: 'Test Note Content',
                visibility: 0.5,
                maturity: 0.5,
                line: 1,
            },
        ],
        mapAnnotations: [],
        mapAnnotationsPresentation: {},
        mapMethods: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (MapElements as jest.MockedClass<typeof MapElements>).mockImplementation(() => mockMapElements as any);
    });

    const renderWithFeatureSwitches = (enableNoteInlineEditing: boolean) => {
        const featureSwitches = {
            enableDashboard: false,
            enableNewPipelines: false,
            enableLinkContext: false,
            enableAccelerators: false,
            enableDoubleClickRename: false,
            enableNoteInlineEditing,
            showToggleFullscreen: false,
            showMapToolbar: false,
            showMiniMap: false,
            allowMapZoomMouseWheel: false,
            enableModernComponents: false,
            enableQuickAdd: false,
        };

        return render(
            <FeatureSwitchesProvider value={featureSwitches}>
                <svg>
                    <UnifiedMapContent {...defaultProps} />
                </svg>
            </FeatureSwitchesProvider>,
        );
    };

    describe('Feature Switch Integration', () => {
        it('should enable note inline editing when feature switch is true', () => {
            renderWithFeatureSwitches(true);

            const noteText = screen.getByText('Test Note Content');
            expect(noteText).toBeInTheDocument();

            // Double-click should enter edit mode when feature is enabled
            fireEvent.doubleClick(noteText);

            // Should show the inline editor
            expect(screen.getByTestId('inline-editor')).toBeInTheDocument();
        });

        it('should disable note inline editing when feature switch is false', () => {
            renderWithFeatureSwitches(false);

            const noteText = screen.getByText('Test Note Content');
            expect(noteText).toBeInTheDocument();

            // Double-click should NOT enter edit mode when feature is disabled
            fireEvent.doubleClick(noteText);

            // Should NOT show the inline editor
            expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
        });

        it('should disable note inline editing when feature switch is undefined', () => {
            const featureSwitches = {
                enableDashboard: false,
                enableNewPipelines: false,
                enableLinkContext: false,
                enableAccelerators: false,
                enableDoubleClickRename: false,
                // enableNoteInlineEditing is undefined
                showToggleFullscreen: false,
                showMapToolbar: false,
                showMiniMap: false,
                allowMapZoomMouseWheel: false,
                enableModernComponents: false,
                enableQuickAdd: false,
            };

            render(
                <FeatureSwitchesProvider value={featureSwitches}>
                    <svg>
                        <UnifiedMapContent {...defaultProps} />
                    </svg>
                </FeatureSwitchesProvider>,
            );

            const noteText = screen.getByText('Test Note Content');
            expect(noteText).toBeInTheDocument();

            // Double-click should NOT enter edit mode when feature is undefined
            fireEvent.doubleClick(noteText);

            // Should NOT show the inline editor
            expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
        });
    });
});
