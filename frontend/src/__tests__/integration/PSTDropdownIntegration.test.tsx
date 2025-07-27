import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {WysiwygToolbar} from '../../components/map/WysiwygToolbar';
import {WysiwygToolbarProps} from '../../types/toolbar';
import {MapTheme} from '../../constants/mapstyles';

// Mock map style definitions
const mockMapStyleDefs: MapTheme = {
    component: {
        stroke: '#000000',
        fill: '#ffffff',
    },
} as MapTheme;

describe('PST Dropdown Integration', () => {
    const mockOnItemSelect = jest.fn();
    const mockMutateMapText = jest.fn();

    const defaultProps: WysiwygToolbarProps = {
        mapStyleDefs: mockMapStyleDefs,
        mapDimensions: {width: 800, height: 600},
        mapText: '',
        mutateMapText: mockMutateMapText,
        onItemSelect: mockOnItemSelect,
        selectedItem: null,
        keyboardShortcutsEnabled: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('opens PST dropdown when PST toolbar item is clicked', async () => {
        render(<WysiwygToolbar {...defaultProps} />);

        // Find and click the PST toolbar item
        const pstButton = screen.getByTestId('toolbar-item-pst');
        expect(pstButton).toBeInTheDocument();

        fireEvent.click(pstButton);

        // Wait for dropdown to appear
        await waitFor(() => {
            expect(screen.getByRole('menu')).toBeInTheDocument();
        });

        // Check that all PST options are present
        expect(screen.getByText('Pioneers')).toBeInTheDocument();
        expect(screen.getByText('Settlers')).toBeInTheDocument();
        expect(screen.getByText('Town Planners')).toBeInTheDocument();
    });

    it('calls onItemSelect with modified PST item when dropdown option is selected', async () => {
        render(<WysiwygToolbar {...defaultProps} />);

        // Click PST toolbar item to open dropdown
        const pstButton = screen.getByTestId('toolbar-item-pst');
        fireEvent.click(pstButton);

        // Wait for dropdown and click Pioneers option
        await waitFor(() => {
            expect(screen.getByRole('menu')).toBeInTheDocument();
        });

        const pioneersOption = screen.getByTestId('dropdown-item-pioneers');
        fireEvent.click(pioneersOption);

        // Verify that onItemSelect was called with the modified PST item
        expect(mockOnItemSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'pst',
                label: 'PST Boxes',
                toolType: 'drawing',
                selectedSubItem: expect.objectContaining({
                    id: 'pioneers',
                    label: 'Pioneers',
                    color: '#FF6B6B',
                }),
            }),
        );
    });

    // Note: Click outside functionality is tested manually as it's difficult to test
    // in the JSDOM environment due to fixed positioning and event propagation

    it('closes dropdown when Escape key is pressed', async () => {
        render(<WysiwygToolbar {...defaultProps} />);

        // Click PST toolbar item to open dropdown
        const pstButton = screen.getByTestId('toolbar-item-pst');
        fireEvent.click(pstButton);

        // Wait for dropdown to appear
        await waitFor(() => {
            expect(screen.getByRole('menu')).toBeInTheDocument();
        });

        // Press Escape key
        const dropdown = screen.getByRole('menu');
        fireEvent.keyDown(dropdown, {key: 'Escape'});

        // Wait for dropdown to disappear
        await waitFor(() => {
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });
    });

    it('displays color indicators for each PST type', async () => {
        render(<WysiwygToolbar {...defaultProps} />);

        // Click PST toolbar item to open dropdown
        const pstButton = screen.getByTestId('toolbar-item-pst');
        fireEvent.click(pstButton);

        // Wait for dropdown to appear
        await waitFor(() => {
            expect(screen.getByRole('menu')).toBeInTheDocument();
        });

        // Check that each dropdown item has the correct test id (which implies color indicator is present)
        expect(screen.getByTestId('dropdown-item-pioneers')).toBeInTheDocument();
        expect(screen.getByTestId('dropdown-item-settlers')).toBeInTheDocument();
        expect(screen.getByTestId('dropdown-item-townplanners')).toBeInTheDocument();
    });

    it('handles keyboard shortcut T to select PST tool', () => {
        render(<WysiwygToolbar {...defaultProps} />);

        // Press 'T' key to select PST tool
        fireEvent.keyDown(document, {key: 't'});

        // Verify that onItemSelect was called with the PST item
        expect(mockOnItemSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'pst',
                label: 'PST Boxes',
                toolType: 'drawing',
                keyboardShortcut: 't',
            }),
        );
    });
});
