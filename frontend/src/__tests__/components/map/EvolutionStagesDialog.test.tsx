import {fireEvent, render, screen} from '@testing-library/react';
import EvolutionStagesDialog from '../../../components/map/EvolutionStagesDialog';

// Mock the useI18n hook
jest.mock('../../../hooks/useI18n', () => ({
    useI18n: () => ({
        t: (key: string, fallback: string) => fallback,
    }),
}));

describe('EvolutionStagesDialog', () => {
    const mockOnConfirm = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders dialog when open', () => {
        render(
            <EvolutionStagesDialog
                isOpen={true}
                currentStages={{stage1: 'Genesis', stage2: 'Custom Built', stage3: 'Product', stage4: 'Commodity'}}
                showEvolutionAxis={true}
                showValueChainAxis={true}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );

        expect(screen.getByText('Edit Map Axis')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Genesis')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Custom Built')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Product')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Commodity')).toBeInTheDocument();
    });

    it('does not render dialog when closed', () => {
        render(
            <EvolutionStagesDialog
                isOpen={false}
                currentStages={null}
                showEvolutionAxis={true}
                showValueChainAxis={true}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );

        expect(screen.queryByText('Edit Map Axis')).not.toBeInTheDocument();
    });

    it('uses default stages when currentStages is null', () => {
        render(
            <EvolutionStagesDialog
                isOpen={true}
                currentStages={null}
                showEvolutionAxis={true}
                showValueChainAxis={true}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );

        expect(screen.getByDisplayValue('Genesis')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Custom Built')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Product')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Commodity')).toBeInTheDocument();
    });

    it('calls onConfirm with valid stage values', () => {
        render(
            <EvolutionStagesDialog
                isOpen={true}
                currentStages={{stage1: 'Genesis', stage2: 'Custom Built', stage3: 'Product', stage4: 'Commodity'}}
                showEvolutionAxis={true}
                showValueChainAxis={true}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );

        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        expect(mockOnConfirm).toHaveBeenCalledWith({
            stages: {
                stage1: 'Genesis',
                stage2: 'Custom Built',
                stage3: 'Product',
                stage4: 'Commodity',
            },
            showEvolutionAxis: true,
            showValueChainAxis: true,
        });
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(
            <EvolutionStagesDialog
                isOpen={true}
                currentStages={null}
                showEvolutionAxis={true}
                showValueChainAxis={true}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalled();
    });

    it('validates stage inputs and shows errors', () => {
        render(
            <EvolutionStagesDialog
                isOpen={true}
                currentStages={null}
                showEvolutionAxis={true}
                showValueChainAxis={true}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );

        const stage1Input = screen.getByLabelText('Stage 1 (Genesis)');

        // Test empty stage name
        fireEvent.change(stage1Input, {target: {value: ''}});
        expect(screen.getByText('Stage 1 name is required')).toBeInTheDocument();

        // Test too long stage name
        fireEvent.change(stage1Input, {target: {value: 'A'.repeat(51)}});
        expect(screen.getByText('Stage 1 name must be 50 characters or less')).toBeInTheDocument();
    });

    it('initializes and submits hidden evolution axis state', () => {
        render(
            <EvolutionStagesDialog
                isOpen={true}
                currentStages={{stage1: 'Genesis', stage2: 'Custom Built', stage3: 'Product', stage4: 'Commodity'}}
                showEvolutionAxis={false}
                showValueChainAxis={false}
                onConfirm={mockOnConfirm}
                onCancel={mockOnCancel}
            />,
        );

        const evolutionCheckbox = screen.getByLabelText('Show evolution axis') as HTMLInputElement;
        const valueChainCheckbox = screen.getByLabelText('Show value chain axis') as HTMLInputElement;
        expect(evolutionCheckbox.checked).toBe(false);
        expect(valueChainCheckbox.checked).toBe(false);

        fireEvent.click(evolutionCheckbox);
        fireEvent.click(valueChainCheckbox);
        fireEvent.click(screen.getByText('Confirm'));

        expect(mockOnConfirm).toHaveBeenCalledWith({
            stages: {
                stage1: 'Genesis',
                stage2: 'Custom Built',
                stage3: 'Product',
                stage4: 'Commodity',
            },
            showEvolutionAxis: true,
            showValueChainAxis: true,
        });
    });
});
