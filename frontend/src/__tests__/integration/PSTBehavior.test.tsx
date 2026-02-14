import '@testing-library/jest-dom';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import PSTBox from '../../components/map/PSTBox';
import {WysiwygToolbar} from '../../components/map/WysiwygToolbar';
import {createMockMapDimensions, createMockMapStyleDefs} from '../../testUtils/mockData';
import {renderWithProviders, renderWithProvidersNoSVG} from '../../testUtils/testProviders';
import {PSTElement} from '../../types/map/pst';
import {WysiwygToolbarProps} from '../../types/toolbar';

describe('PST Element User Behavior', () => {
    const mockOnItemSelect = jest.fn();
    const mockMutateMapText = jest.fn();
    const mockOnResizeStart = jest.fn();
    const mockOnResizeMove = jest.fn();
    const mockOnResizeEnd = jest.fn();
    const mockOnHover = jest.fn();

    const mapDimensions = createMockMapDimensions();
    const mapStyleDefs = createMockMapStyleDefs();

    const defaultToolbarProps: WysiwygToolbarProps = {
        mapStyleDefs,
        mapDimensions,
        mapText: 'title Test Map\ncomponent A [0.5, 0.5]',
        mutateMapText: mockMutateMapText,
        onItemSelect: mockOnItemSelect,
        selectedItem: null,
        keyboardShortcutsEnabled: true,
    };

    const mockPSTElement: PSTElement = {
        id: 'test-pst-1',
        type: 'pioneers',
        coordinates: {
            maturity1: 0.2,
            visibility1: 0.8,
            maturity2: 0.4,
            visibility2: 0.6,
        },
        line: 2,
        name: 'Test PST',
    };

    const defaultPSTProps = {
        pstElement: mockPSTElement,
        mapDimensions,
        mapStyleDefs,
        scaleFactor: 1,
        isHovered: false,
        isResizing: false,
        onResizeStart: mockOnResizeStart,
        onResizeMove: mockOnResizeMove,
        onResizeEnd: mockOnResizeEnd,
        onHover: mockOnHover,
        mutateMapText: mockMutateMapText,
        mapText: 'title Test Map\npioneers [0.8, 0.2, 0.6, 0.4]',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('PST Creation via Toolbar', () => {
        it('should provide PST selection dropdown when PST toolbar item is clicked', async () => {
            renderWithProvidersNoSVG(<WysiwygToolbar {...defaultToolbarProps} />);

            const pstButton = screen.getByTestId('toolbar-item-pst');
            fireEvent.click(pstButton);

            await waitFor(() => {
                expect(screen.getByRole('menu')).toBeInTheDocument();
            });

            // Should show all three PST types
            expect(screen.getByText('Pioneers')).toBeInTheDocument();
            expect(screen.getByText('Settlers')).toBeInTheDocument();
            expect(screen.getByText('Town Planners')).toBeInTheDocument();
        });
    });

    describe('PST Visual Feedback', () => {
        it('should show resize handles when PST element is being resized', () => {
            renderWithProviders(<PSTBox {...defaultPSTProps} isHovered={true} isResizing={true} />);

            // Should show all 8 resize handles (using actual test IDs from component)
            expect(screen.getByTestId('resize-handle-top-left')).toBeInTheDocument();
            expect(screen.getByTestId('resize-handle-top-right')).toBeInTheDocument();
            expect(screen.getByTestId('resize-handle-bottom-left')).toBeInTheDocument();
            expect(screen.getByTestId('resize-handle-bottom-right')).toBeInTheDocument();
            expect(screen.getByTestId('resize-handle-top-center')).toBeInTheDocument();
            expect(screen.getByTestId('resize-handle-bottom-center')).toBeInTheDocument();
            expect(screen.getByTestId('resize-handle-middle-left')).toBeInTheDocument();
            expect(screen.getByTestId('resize-handle-middle-right')).toBeInTheDocument();
        });

        it('should provide keyboard modifier visual feedback', () => {
            renderWithProviders(
                <PSTBox {...defaultPSTProps} isHovered={true} keyboardModifiers={{maintainAspectRatio: true, resizeFromCenter: false}} />,
            );

            // Should show modifier indicator
            expect(screen.getByText('Shift: Aspect Ratio')).toBeInTheDocument();
        });
    });

    describe('PST User Interactions', () => {
        it('should trigger resize callbacks when user drags resize handle', () => {
            renderWithProviders(<PSTBox {...defaultPSTProps} isHovered={true} />);

            const resizeHandle = screen.getByTestId('resize-handle-bottom-right');

            fireEvent.mouseDown(resizeHandle, {clientX: 100, clientY: 100});
            expect(mockOnResizeStart).toHaveBeenCalledWith(
                expect.objectContaining({id: 'test-pst-1'}),
                'bottom-right',
                expect.objectContaining({x: 100, y: 100}),
            );
        });

        it('should trigger hover callbacks on mouse interactions', () => {
            renderWithProviders(<PSTBox {...defaultPSTProps} />);

            const pstRect = screen.getByTestId('pst-box-test-pst-1');

            fireEvent.mouseEnter(pstRect);
            expect(mockOnHover).toHaveBeenCalledWith(expect.objectContaining({id: 'test-pst-1'}));
        });

        it('should handle keyboard modifiers during resize', () => {
            renderWithProviders(
                <PSTBox {...defaultPSTProps} isHovered={true} keyboardModifiers={{maintainAspectRatio: true, resizeFromCenter: true}} />,
            );

            // Should show both modifier indicators
            expect(screen.getByText('Shift: Aspect Ratio')).toBeInTheDocument();
            expect(screen.getByText('Alt: Resize from Center')).toBeInTheDocument();

            // Resize handles should show modified styling
            const resizeHandle = screen.getByTestId('resize-handle-bottom-right');
            expect(resizeHandle).toHaveAttribute('fill', '#FFC107');
        });
    });

    describe('PST Types and Styling', () => {
        it('should render with different scale factors', () => {
            renderWithProviders(<PSTBox {...defaultPSTProps} scaleFactor={2} />);

            const pstRect = screen.getByTestId('pst-box-rect-test-pst-1');
            expect(pstRect).toBeInTheDocument();

            // Just verify it renders with a scale factor - implementation details may vary
            expect(pstRect).toHaveAttribute('width');
            expect(pstRect).toHaveAttribute('height');
        });
    });
});
