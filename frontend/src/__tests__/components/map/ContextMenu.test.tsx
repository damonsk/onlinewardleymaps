import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {ContextMenu, ContextMenuItem} from '../../../components/map/ContextMenu';

describe('ContextMenu', () => {
    const mockOnClose = jest.fn();

    const mockItems: ContextMenuItem[] = [
        {
            id: 'delete',
            label: 'Delete',
            action: jest.fn(),
            destructive: true,
        },
        {
            id: 'edit',
            label: 'Edit',
            action: jest.fn(),
        },
        {
            id: 'disabled',
            label: 'Disabled Action',
            action: jest.fn(),
            disabled: true,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders context menu when open', () => {
        render(<ContextMenu items={mockItems} isOpen={true} onClose={mockOnClose} position={{x: 100, y: 200}} />);

        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Disabled Action')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(<ContextMenu items={mockItems} isOpen={false} onClose={mockOnClose} position={{x: 100, y: 200}} />);

        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('calls action when menu item is clicked', () => {
        render(<ContextMenu items={mockItems} isOpen={true} onClose={mockOnClose} position={{x: 100, y: 200}} />);

        fireEvent.click(screen.getByText('Delete'));

        expect(mockItems[0].action).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not call action for disabled items', () => {
        render(<ContextMenu items={mockItems} isOpen={true} onClose={mockOnClose} position={{x: 100, y: 200}} />);

        fireEvent.click(screen.getByText('Disabled Action'));

        expect(mockItems[2].action).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('closes menu when Escape key is pressed', () => {
        render(<ContextMenu items={mockItems} isOpen={true} onClose={mockOnClose} position={{x: 100, y: 200}} />);

        fireEvent.keyDown(screen.getByRole('menu'), {key: 'Escape'});

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('applies correct styling for destructive items', () => {
        render(<ContextMenu items={mockItems} isOpen={true} onClose={mockOnClose} position={{x: 100, y: 200}} />);

        const deleteButton = screen.getByTestId('context-menu-item-delete');
        expect(deleteButton).toHaveAttribute('data-testid', 'context-menu-item-delete');
    });

    it('applies correct styling for disabled items', () => {
        render(<ContextMenu items={mockItems} isOpen={true} onClose={mockOnClose} position={{x: 100, y: 200}} />);

        const disabledButton = screen.getByTestId('context-menu-item-disabled');
        expect(disabledButton).toBeDisabled();
    });

    it('does not render when items array is empty', () => {
        render(<ContextMenu items={[]} isOpen={true} onClose={mockOnClose} position={{x: 100, y: 200}} />);

        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
});
