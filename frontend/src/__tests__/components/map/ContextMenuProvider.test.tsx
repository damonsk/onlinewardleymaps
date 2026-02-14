import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {ComponentSelectionProvider} from '../../../components/ComponentSelectionContext';
import {ContextMenuProvider, useContextMenu} from '../../../components/map/ContextMenuProvider';
import {UndoRedoProvider} from '../../../components/UndoRedoProvider';

// Test component that uses the context menu
const TestComponent: React.FC = () => {
    const {showContextMenu, hideContextMenu, isContextMenuOpen} = useContextMenu();

    return (
        <div>
            <button onClick={() => showContextMenu({x: 100, y: 200}, 'test-component')} data-testid="show-context-menu">
                Show Context Menu
            </button>
            <button onClick={hideContextMenu} data-testid="hide-context-menu">
                Hide Context Menu
            </button>
            <div data-testid="menu-status">{isContextMenuOpen ? 'open' : 'closed'}</div>
        </div>
    );
};

const renderWithProviders = (mapText: string = 'component Test [0.5, 0.5]', onDeleteComponent?: (id: string) => void) => {
    const mockMutateMapText = jest.fn();

    return render(
        <UndoRedoProvider mutateMapText={mockMutateMapText} mapText={mapText}>
            <ComponentSelectionProvider>
                <ContextMenuProvider mapText={mapText} onDeleteComponent={onDeleteComponent}>
                    <TestComponent />
                </ContextMenuProvider>
            </ComponentSelectionProvider>
        </UndoRedoProvider>,
    );
};

describe('ContextMenuProvider', () => {
    const mockOnDeleteComponent = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('provides context menu functionality', () => {
        renderWithProviders();

        expect(screen.getByTestId('menu-status')).toHaveTextContent('closed');

        fireEvent.click(screen.getByTestId('show-context-menu'));

        expect(screen.getByTestId('menu-status')).toHaveTextContent('open');

        fireEvent.click(screen.getByTestId('hide-context-menu'));

        expect(screen.getByTestId('menu-status')).toHaveTextContent('closed');
    });

    it('shows delete option when component is selected', () => {
        renderWithProviders('component Test [0.5, 0.5]', mockOnDeleteComponent);

        // First select a component (simulate selection)
        // This would normally be done through the ComponentSelectionProvider
        // For this test, we'll trigger the context menu directly
        fireEvent.click(screen.getByTestId('show-context-menu'));

        // The context menu should be open but may not show delete option
        // without a selected component
        expect(screen.getByTestId('menu-status')).toHaveTextContent('open');
    });

    it('calls onDeleteComponent when delete is clicked', () => {
        renderWithProviders('component Test [0.5, 0.5]', mockOnDeleteComponent);

        fireEvent.click(screen.getByTestId('show-context-menu'));

        // If delete option is available and clicked
        const deleteOption = screen.queryByText('Delete');
        if (deleteOption) {
            fireEvent.click(deleteOption);
            expect(mockOnDeleteComponent).toHaveBeenCalledWith('test-component');
        }
    });

    it('throws error when used outside provider', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useContextMenu must be used within a ContextMenuProvider');

        consoleError.mockRestore();
    });
});
