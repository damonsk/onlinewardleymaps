import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react';
import {ComponentSelectionProvider} from '../../../components/ComponentSelectionContext';
import {UndoRedoProvider} from '../../../components/UndoRedoProvider';
import {EditingProvider} from '../../../components/EditingContext';
import {FeatureSwitchesProvider} from '../../../components/FeatureSwitchesContext';
import ComponentText from '../../../components/map/ComponentText';
import {UnifiedComponent} from '../../../types/unified';

// Mock the RelativeMovable component to simulate drag operations
jest.mock('../../../components/map/RelativeMovable', () => {
    const MockRelativeMovable = ({children, onMove, x, y}: any) => (
        <g data-testid="relative-movable" data-x={x} data-y={y} onClick={() => onMove && onMove({x: 10, y: 20})}>
            {children}
        </g>
    );
    MockRelativeMovable.displayName = 'RelativeMovable';
    return MockRelativeMovable;
});

// Mock the ComponentTextSymbol
jest.mock('../../../components/symbols/ComponentTextSymbol', () => {
    const MockComponentTextSymbol = ({text, onClick}: any) => (
        <text data-testid="component-text-symbol" onClick={onClick}>
            {text}
        </text>
    );
    MockComponentTextSymbol.displayName = 'ComponentTextSymbol';
    return MockComponentTextSymbol;
});

// Mock the InlineEditor
jest.mock('../../../components/map/InlineEditor', () => {
    const MockInlineEditor = ({value, onSave, onCancel}: any) => (
        <div data-testid="inline-editor">
            <input data-testid="editor-input" value={value} readOnly />
            <button data-testid="save-button" onClick={onSave}>
                Save
            </button>
            <button data-testid="cancel-button" onClick={onCancel}>
                Cancel
            </button>
        </div>
    );
    MockInlineEditor.displayName = 'InlineEditor';
    return MockInlineEditor;
});

describe('ComponentText Drag Fix for Multi-line Components', () => {
    const mockMapStyleDefs = {
        component: {
            fontSize: '14px',
            text: '#000000',
            evolvedText: '#666666',
        },
    };

    const renderComponentText = (component: UnifiedComponent, mapText: string, mutateMapText: jest.Mock) => {
        return render(
            <UndoRedoProvider mapText={mapText} mutateMapText={mutateMapText}>
                <ComponentSelectionProvider>
                    <EditingProvider>
                        <FeatureSwitchesProvider value={{enableDoubleClickRename: true}}>
                            <svg>
                                <ComponentText
                                    component={component}
                                    cx={100}
                                    cy={200}
                                    styles={{fontSize: '14px', text: '#000000'}}
                                    mutateMapText={mutateMapText}
                                    mapText={mapText}
                                    mapStyleDefs={mockMapStyleDefs}
                                    scaleFactor={1}
                                />
                            </svg>
                        </FeatureSwitchesProvider>
                    </EditingProvider>
                </ComponentSelectionProvider>
            </UndoRedoProvider>,
        );
    };

    describe('Normal components', () => {
        it('should update label position for simple component names', () => {
            const component: UnifiedComponent = {
                id: 'comp1',
                name: 'Simple Component',
                type: 'component',
                maturity: 0.4,
                visibility: 0.6,
                line: 1,
            };

            const mapText = 'component Simple Component [0.6, 0.4]';
            const mutateMapText = jest.fn();

            renderComponentText(component, mapText, mutateMapText);

            // Trigger label drag by clicking the RelativeMovable
            const movable = screen.getByTestId('relative-movable');
            fireEvent.click(movable);

            // Verify the mapText was updated with label coordinates
            expect(mutateMapText).toHaveBeenCalledWith('component Simple Component [0.6, 0.4] label [10.00, 20.00]');
        });

        it('should update label position for quoted multi-line component names', () => {
            const component: UnifiedComponent = {
                id: 'comp2',
                name: 'Multi-line\nComponent\nName',
                type: 'component',
                maturity: 0.4,
                visibility: 0.6,
                line: 1,
            };

            const mapText = 'component "Multi-line\\nComponent\\nName" [0.6, 0.4]';
            const mutateMapText = jest.fn();

            renderComponentText(component, mapText, mutateMapText);

            // Trigger label drag
            const movable = screen.getByTestId('relative-movable');
            fireEvent.click(movable);

            // Verify the mapText was updated with label coordinates
            expect(mutateMapText).toHaveBeenCalledWith('component "Multi-line\\nComponent\\nName" [0.6, 0.4] label [10.00, 20.00]');
        });

        it('should update existing label position for multi-line components', () => {
            const component: UnifiedComponent = {
                id: 'comp3',
                name: 'Database\nService',
                type: 'component',
                maturity: 0.3,
                visibility: 0.8,
                line: 1,
            };

            const mapText = 'component "Database\\nService" [0.8, 0.3] label [5.00, 15.00]';
            const mutateMapText = jest.fn();

            renderComponentText(component, mapText, mutateMapText);

            // Trigger label drag
            const movable = screen.getByTestId('relative-movable');
            fireEvent.click(movable);

            // Verify the existing label was updated
            expect(mutateMapText).toHaveBeenCalledWith('component "Database\\nService" [0.8, 0.3] label [10.00, 20.00]');
        });

        it('should handle multi-line components with escaped quotes', () => {
            const component: UnifiedComponent = {
                id: 'comp4',
                name: 'Component with "quotes"\nand line breaks',
                type: 'component',
                maturity: 0.5,
                visibility: 0.5,
                line: 1,
            };

            const mapText = 'component "Component with \\"quotes\\"\\nand line breaks" [0.5, 0.5]';
            const mutateMapText = jest.fn();

            renderComponentText(component, mapText, mutateMapText);

            // Trigger label drag
            const movable = screen.getByTestId('relative-movable');
            fireEvent.click(movable);

            // Verify the mapText was updated
            expect(mutateMapText).toHaveBeenCalledWith(
                'component "Component with \\"quotes\\"\\nand line breaks" [0.5, 0.5] label [10.00, 20.00]',
            );
        });
    });

    describe('Evolved components', () => {
        it('should update label position for simple evolved component names', () => {
            const component: UnifiedComponent = {
                id: 'comp5',
                name: 'Evolved Component',
                type: 'component',
                maturity: 0.6,
                visibility: 0.4,
                evolved: true,
                line: 2,
            };

            const mapText = 'component Evolved Component [0.4, 0.3]\nevolve Evolved Component 0.6';
            const mutateMapText = jest.fn();

            renderComponentText(component, mapText, mutateMapText);

            // Trigger label drag
            const movable = screen.getByTestId('relative-movable');
            fireEvent.click(movable);

            // Verify the evolve line was updated with label coordinates
            expect(mutateMapText).toHaveBeenCalledWith(
                'component Evolved Component [0.4, 0.3]\nevolve Evolved Component 0.6 label [10.00, 20.00]',
            );
        });

        it('should update label position for quoted multi-line evolved component names', () => {
            const component: UnifiedComponent = {
                id: 'comp6',
                name: 'Multi-line\nEvolved\nComponent',
                type: 'component',
                maturity: 0.7,
                visibility: 0.5,
                evolved: true,
                line: 2,
            };

            const mapText = 'component "Multi-line\\nEvolved\\nComponent" [0.5, 0.4]\nevolve "Multi-line\\nEvolved\\nComponent" 0.7';
            const mutateMapText = jest.fn();

            renderComponentText(component, mapText, mutateMapText);

            // Trigger label drag
            const movable = screen.getByTestId('relative-movable');
            fireEvent.click(movable);

            // Verify the evolve line was updated with label coordinates
            expect(mutateMapText).toHaveBeenCalledWith(
                'component "Multi-line\\nEvolved\\nComponent" [0.5, 0.4]\nevolve "Multi-line\\nEvolved\\nComponent" 0.7 label [10.00, 20.00]',
            );
        });

        it('should update existing evolved label position', () => {
            const component: UnifiedComponent = {
                id: 'comp7',
                name: 'Database\nAPI',
                type: 'component',
                maturity: 0.8,
                visibility: 0.6,
                evolved: true,
                line: 2,
            };

            const mapText = 'component "Database\\nAPI" [0.6, 0.5]\nevolve "Database\\nAPI" 0.8 label [1.00, 2.00]';
            const mutateMapText = jest.fn();

            renderComponentText(component, mapText, mutateMapText);

            // Trigger label drag
            const movable = screen.getByTestId('relative-movable');
            fireEvent.click(movable);

            // Verify the existing evolved label was updated
            expect(mutateMapText).toHaveBeenCalledWith(
                'component "Database\\nAPI" [0.6, 0.5]\nevolve "Database\\nAPI" 0.8 label [10.00, 20.00]',
            );
        });
    });

    describe('Edge cases', () => {
        it('should not update if required props are missing', () => {
            const component: UnifiedComponent = {
                id: 'comp8',
                name: 'No Line Component',
                type: 'component',
                maturity: 0.5,
                visibility: 0.5,
                // No line property
            };

            const mapText = 'component No Line Component [0.5, 0.5]';
            const mutateMapText = jest.fn();

            renderComponentText(component, mapText, mutateMapText);

            // Trigger label drag
            const movable = screen.getByTestId('relative-movable');
            fireEvent.click(movable);

            // Verify the mapText was not updated
            expect(mutateMapText).not.toHaveBeenCalled();
        });

        it('should handle complex documentation-style multi-line components', () => {
            const component: UnifiedComponent = {
                id: 'comp9',
                name: 'User Authentication\nService\n(OAuth 2.0)',
                type: 'component',
                maturity: 0.2,
                visibility: 0.9,
                line: 1,
            };

            const mapText = 'component "User Authentication\\nService\\n(OAuth 2.0)" [0.9, 0.2]';
            const mutateMapText = jest.fn();

            renderComponentText(component, mapText, mutateMapText);

            // Trigger label drag
            const movable = screen.getByTestId('relative-movable');
            fireEvent.click(movable);

            // Verify the mapText was updated
            expect(mutateMapText).toHaveBeenCalledWith(
                'component "User Authentication\\nService\\n(OAuth 2.0)" [0.9, 0.2] label [10.00, 20.00]',
            );
        });

        it('should handle normalized matching for different case and spacing', () => {
            const component: UnifiedComponent = {
                id: 'comp10',
                name: 'database service', // lowercase
                type: 'component',
                maturity: 0.4,
                visibility: 0.6,
                line: 1,
            };

            const mapText = 'component "Database\\nService" [0.6, 0.4]'; // Different case and line break
            const mutateMapText = jest.fn();

            renderComponentText(component, mapText, mutateMapText);

            // Trigger label drag
            const movable = screen.getByTestId('relative-movable');
            fireEvent.click(movable);

            // Verify the mapText was updated using normalized matching
            expect(mutateMapText).toHaveBeenCalledWith('component "Database\\nService" [0.6, 0.4] label [10.00, 20.00]');
        });
    });
});
