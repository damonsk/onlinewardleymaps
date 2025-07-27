import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToolbarDropdown } from '../../../components/map/ToolbarDropdown';
import { ToolbarSubItem } from '../../../types/toolbar';
import { MapTheme } from '../../../constants/mapstyles';

// Mock map style definitions
const mockMapStyleDefs: MapTheme = {
    component: {
        stroke: '#000000',
        fill: '#ffffff',
    },
} as MapTheme;

// Mock PST sub-items
const mockPSTItems: ToolbarSubItem[] = [
    {
        id: 'pioneers',
        label: 'Pioneers',
        color: '#FF6B6B',
        template: (x1, y1, x2, y2) => `pioneers [${y1}, ${x1}] [${y2}, ${x2}]`
    },
    {
        id: 'settlers',
        label: 'Settlers',
        color: '#4ECDC4',
        template: (x1, y1, x2, y2) => `settlers [${y1}, ${x1}] [${y2}, ${x2}]`
    },
    {
        id: 'townplanners',
        label: 'Town Planners',
        color: '#45B7D1',
        template: (x1, y1, x2, y2) => `townplanners [${y1}, ${x1}] [${y2}, ${x2}]`
    }
];

describe('ToolbarDropdown', () => {
    const mockOnSelect = jest.fn();
    const mockOnClose = jest.fn();
    const mockPosition = { x: 100, y: 200 };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders dropdown when open', () => {
        render(
            <ToolbarDropdown
                items={mockPSTItems}
                isOpen={true}
                onSelect={mockOnSelect}
                onClose={mockOnClose}
                position={mockPosition}
                mapStyleDefs={mockMapStyleDefs}
            />
        );

        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByText('Pioneers')).toBeInTheDocument();
        expect(screen.getByText('Settlers')).toBeInTheDocument();
        expect(screen.getByText('Town Planners')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <ToolbarDropdown
                items={mockPSTItems}
                isOpen={false}
                onSelect={mockOnSelect}
                onClose={mockOnClose}
                position={mockPosition}
                mapStyleDefs={mockMapStyleDefs}
            />
        );

        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('calls onSelect when item is clicked', () => {
        render(
            <ToolbarDropdown
                items={mockPSTItems}
                isOpen={true}
                onSelect={mockOnSelect}
                onClose={mockOnClose}
                position={mockPosition}
                mapStyleDefs={mockMapStyleDefs}
            />
        );

        fireEvent.click(screen.getByText('Pioneers'));

        expect(mockOnSelect).toHaveBeenCalledWith(mockPSTItems[0]);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
        render(
            <ToolbarDropdown
                items={mockPSTItems}
                isOpen={true}
                onSelect={mockOnSelect}
                onClose={mockOnClose}
                position={mockPosition}
                mapStyleDefs={mockMapStyleDefs}
            />
        );

        fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('renders color indicators for each item', () => {
        render(
            <ToolbarDropdown
                items={mockPSTItems}
                isOpen={true}
                onSelect={mockOnSelect}
                onClose={mockOnClose}
                position={mockPosition}
                mapStyleDefs={mockMapStyleDefs}
            />
        );

        const dropdownItems = screen.getAllByRole('menuitem');
        expect(dropdownItems).toHaveLength(3);

        // Check that each item has the correct test id
        expect(screen.getByTestId('dropdown-item-pioneers')).toBeInTheDocument();
        expect(screen.getByTestId('dropdown-item-settlers')).toBeInTheDocument();
        expect(screen.getByTestId('dropdown-item-townplanners')).toBeInTheDocument();
    });

    it('positions dropdown correctly', () => {
        const { container } = render(
            <ToolbarDropdown
                items={mockPSTItems}
                isOpen={true}
                onSelect={mockOnSelect}
                onClose={mockOnClose}
                position={mockPosition}
                mapStyleDefs={mockMapStyleDefs}
            />
        );

        const dropdown = container.firstChild as HTMLElement;
        expect(dropdown).toHaveStyle({
            left: '100px',
            top: '200px',
        });
    });
});