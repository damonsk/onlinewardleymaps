import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react';
import {ComponentSelectionProvider} from '../../../components/ComponentSelectionContext';
import {ContextMenuProvider} from '../../../components/map/ContextMenuProvider';
import {UndoRedoProvider} from '../../../components/UndoRedoProvider';
import {ComponentLinkHighlightProvider} from '../../../components/contexts/ComponentLinkHighlightContext';
import MapComponent from '../../../components/map/MapComponent';
import {UnifiedComponent} from '../../../types/unified';
import {MapDimensions} from '../../../constants/defaults';

// Mock the dependencies
jest.mock('../../../components/map/ModernPositionCalculator', () => {
    return jest.fn().mockImplementation(() => ({
        maturityToX: jest.fn().mockReturnValue(100),
        visibilityToY: jest.fn().mockReturnValue(200),
        xToMaturity: jest.fn().mockReturnValue(0.5),
        yToVisibility: jest.fn().mockReturnValue(0.7),
    }));
});

jest.mock('../../../components/map/Movable', () => {
    const MockMovable = ({children, onMove, x, y}: any) => (
        <div data-testid="movable" data-x={x} data-y={y} onClick={() => onMove && onMove({x: 150, y: 250})}>
            {children}
        </div>
    );
    MockMovable.displayName = 'Movable';
    return MockMovable;
});

jest.mock('../../../components/map/ComponentText', () => {
    const MockComponentText = ({component}: any) => <text data-testid={`component-text-${component.id}`}>{component.name}</text>;
    MockComponentText.displayName = 'ComponentText';
    return MockComponentText;
});

jest.mock('../../../components/map/Inertia', () => {
    const MockInertia = () => <g data-testid="inertia" />;
    MockInertia.displayName = 'Inertia';
    return MockInertia;
});

describe('Multi-line Component Positioning', () => {
    const mockMapDimensions: MapDimensions = {
        width: 800,
        height: 600,
    };

    const mockMapStyleDefs = {
        component: {},
    };

    const renderMapComponent = (component: UnifiedComponent, mapText: string, mutateMapText: jest.Mock) => {
        return render(
            <UndoRedoProvider mapText={mapText} mutateMapText={mutateMapText}>
                <ComponentSelectionProvider>
                    <ComponentLinkHighlightProvider>
                        <ContextMenuProvider>
                            <svg>
                                <MapComponent
                                    mapDimensions={mockMapDimensions}
                                    component={component}
                                    mapText={mapText}
                                    mutateMapText={mutateMapText}
                                    mapStyleDefs={mockMapStyleDefs}
                                    setHighlightLine={jest.fn()}
                                    scaleFactor={1}
                                />
                            </svg>
                        </ContextMenuProvider>
                    </ComponentLinkHighlightProvider>
                </ComponentSelectionProvider>
            </UndoRedoProvider>,
        );
    };

    describe('Regular components', () => {
        it('should update coordinates for simple component names', () => {
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

            renderMapComponent(component, mapText, mutateMapText);

            // Trigger position update by clicking movable
            const movable = screen.getByTestId('movable');
            fireEvent.click(movable);

            // Verify the mapText was updated with new coordinates
            expect(mutateMapText).toHaveBeenCalledWith('component Simple Component [0.70, 0.50]');
        });

        it('should update coordinates for quoted multi-line component names', () => {
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

            renderMapComponent(component, mapText, mutateMapText);

            // Trigger position update by clicking movable
            const movable = screen.getByTestId('movable');
            fireEvent.click(movable);

            // Verify the mapText was updated with new coordinates
            expect(mutateMapText).toHaveBeenCalledWith('component "Multi-line\\nComponent\\nName" [0.70, 0.50]');
        });

        it('should update coordinates for multi-line components with labels', () => {
            const component: UnifiedComponent = {
                id: 'comp3',
                name: 'Database\nService',
                type: 'component',
                maturity: 0.3,
                visibility: 0.8,
                line: 1,
            };

            const mapText = 'component "Database\\nService" [0.8, 0.3] label Database API';
            const mutateMapText = jest.fn();

            renderMapComponent(component, mapText, mutateMapText);

            // Trigger position update by clicking movable
            const movable = screen.getByTestId('movable');
            fireEvent.click(movable);

            // Verify the mapText was updated with new coordinates but preserved label
            expect(mutateMapText).toHaveBeenCalledWith('component "Database\\nService" [0.70, 0.50] label Database API');
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

            renderMapComponent(component, mapText, mutateMapText);

            // Trigger position update by clicking movable
            const movable = screen.getByTestId('movable');
            fireEvent.click(movable);

            // Verify the mapText was updated with new coordinates
            expect(mutateMapText).toHaveBeenCalledWith('component "Component with \\"quotes\\"\\nand line breaks" [0.70, 0.50]');
        });
    });

    describe('Evolved components', () => {
        it('should update maturity for simple evolved component names', () => {
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

            renderMapComponent(component, mapText, mutateMapText);

            // Trigger position update by clicking movable
            const movable = screen.getByTestId('movable');
            fireEvent.click(movable);

            // Verify the mapText was updated with new maturity in evolve statement
            expect(mutateMapText).toHaveBeenCalledWith('component Evolved Component [0.4, 0.3]\nevolve Evolved Component 0.50');
        });

        it('should update maturity for quoted multi-line evolved component names', () => {
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

            renderMapComponent(component, mapText, mutateMapText);

            // Trigger position update by clicking movable
            const movable = screen.getByTestId('movable');
            fireEvent.click(movable);

            // Verify the mapText was updated with new maturity in evolve statement
            expect(mutateMapText).toHaveBeenCalledWith(
                'component "Multi-line\\nEvolved\\nComponent" [0.5, 0.4]\nevolve "Multi-line\\nEvolved\\nComponent" 0.50',
            );
        });
    });

    describe('Edge cases', () => {
        it('should not update if component has no line number', () => {
            const component: UnifiedComponent = {
                id: 'comp7',
                name: 'No Line Component',
                type: 'component',
                maturity: 0.5,
                visibility: 0.5,
                // No line property
            };

            const mapText = 'component No Line Component [0.5, 0.5]';
            const mutateMapText = jest.fn();

            renderMapComponent(component, mapText, mutateMapText);

            // Trigger position update by clicking movable
            const movable = screen.getByTestId('movable');
            fireEvent.click(movable);

            // Verify the mapText was not updated
            expect(mutateMapText).not.toHaveBeenCalled();
        });

        it('should handle components with complex formatting', () => {
            const component: UnifiedComponent = {
                id: 'comp8',
                name: 'User Authentication\nService\n(OAuth 2.0)',
                type: 'component',
                maturity: 0.2,
                visibility: 0.9,
                line: 1,
            };

            const mapText = 'component "User Authentication\\nService\\n(OAuth 2.0)" [0.9, 0.2]';
            const mutateMapText = jest.fn();

            renderMapComponent(component, mapText, mutateMapText);

            // Trigger position update by clicking movable
            const movable = screen.getByTestId('movable');
            fireEvent.click(movable);

            // Verify the mapText was updated with new coordinates
            expect(mutateMapText).toHaveBeenCalledWith('component "User Authentication\\nService\\n(OAuth 2.0)" [0.70, 0.50]');
        });
    });
});
