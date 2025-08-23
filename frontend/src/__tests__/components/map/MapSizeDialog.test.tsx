import {fireEvent, render, screen} from '@testing-library/react';
import MapSizeDialog from '../../../components/map/MapSizeDialog';

// Mock the useI18n hook
jest.mock('../../../hooks/useI18n', () => ({
    useI18n: () => ({
        t: (key: string, fallback: string) => fallback,
    }),
}));

describe('MapSizeDialog', () => {
    const mockOnConfirm = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders dialog when open', () => {
        render(<MapSizeDialog isOpen={true} currentSize={{width: 800, height: 600}} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

        expect(screen.getByText('Set Map Size')).toBeInTheDocument();
        expect(screen.getByDisplayValue('800')).toBeInTheDocument();
        expect(screen.getByDisplayValue('600')).toBeInTheDocument();
    });

    it('does not render dialog when closed', () => {
        render(<MapSizeDialog isOpen={false} currentSize={{width: 800, height: 600}} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

        expect(screen.queryByText('Set Map Size')).not.toBeInTheDocument();
    });

    it('calls onConfirm with valid size values', () => {
        render(<MapSizeDialog isOpen={true} currentSize={{width: 800, height: 600}} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        expect(mockOnConfirm).toHaveBeenCalledWith({width: 800, height: 600});
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<MapSizeDialog isOpen={true} currentSize={{width: 800, height: 600}} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalled();
    });

    it('validates size inputs and shows errors', () => {
        render(<MapSizeDialog isOpen={true} currentSize={null} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

        const widthInput = screen.getByLabelText('Width');
        const heightInput = screen.getByLabelText('Height');

        // Test invalid width
        fireEvent.change(widthInput, {target: {value: '50'}});
        expect(screen.getByText('Width must be at least 100')).toBeInTheDocument();

        // Test invalid height
        fireEvent.change(heightInput, {target: {value: '6000'}});
        expect(screen.getByText('Height must be no more than 5000')).toBeInTheDocument();
    });
});
