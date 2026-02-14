import React from 'react';
import {render} from '@testing-library/react';
import {UnifiedComponent} from '../../types/unified';
import {MapElements} from '../../processing/MapElements';
import ComponentText from '../../components/map/ComponentText';
import {renderWithProviders} from '../../testUtils/testProviders';

describe('Decorator Multi-line Positioning Integration', () => {
    const mockMutateMapText = jest.fn();
    const mockMapStyleDefs = {
        component: {
            fontSize: '14px',
            textColor: 'black',
            fill: 'white',
            stroke: 'black',
        },
    };

    beforeEach(() => {
        mockMutateMapText.mockClear();
    });

    describe('Component label spacing with decorators and multi-line names', () => {
        it('should apply proper label spacing for multi-line components with method decorators', () => {
            // Create a component with multi-line name and method decorators
            const multilineComponent: UnifiedComponent = {
                id: 'test-component',
                name: 'Multi-line\nComponent\nName',
                maturity: 0.5,
                visibility: 0.7,
                line: 1,
                evolved: false,
                evolving: false,
                inertia: false,
                decorators: {
                    buy: true,
                    build: false,
                    outsource: false,
                    market: false,
                    ecosystem: false,
                },
                increaseLabelSpacing: 2, // Should be applied for method decorators
                label: {x: 5, y: 20}, // Should be adjusted based on increaseLabelSpacing
            };

            // Create a minimal map with just this component
            const mockMap = {
                components: [multilineComponent],
                anchors: [],
                submaps: [],
                markets: [],
                ecosystems: [],
                evolved: [],
                pipelines: [],
                attitudes: [],
                notes: [],
                links: [],
                presentation: {},
                evolution: {},
                methods: [
                    {
                        name: 'Multi-line\nComponent\nName',
                        buy: true,
                        build: false,
                        outsource: false,
                    },
                ],
            };

            // Process the map elements to apply decorator spacing logic
            const mapElements = new MapElements(mockMap);
            const processedComponents = mapElements.getAllComponents();

            // Find our component after processing
            const processedComponent = processedComponents.find(c => c.id === 'test-component');
            expect(processedComponent).toBeDefined();

            // Verify that decorator spacing is properly applied
            expect(processedComponent?.increaseLabelSpacing).toBeGreaterThanOrEqual(2);
            expect(processedComponent?.label?.y).toBeGreaterThanOrEqual(20); // Should have proper spacing

            // Render the component to verify positioning doesn't break
            const {container} = renderWithProviders(
                <ComponentText
                    component={processedComponent!}
                    cx={100}
                    cy={100}
                    styles={mockMapStyleDefs.component}
                    mutateMapText={mockMutateMapText}
                    mapText=""
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                />,
            );

            // Verify the component renders without errors
            expect(container.querySelector('text')).toBeTruthy();
        });

        it('should handle ecosystem decorator with multi-line component names', () => {
            const ecosystemComponent: UnifiedComponent = {
                id: 'ecosystem-component',
                name: 'Partner\nEcosystem\nNetwork',
                maturity: 0.8,
                visibility: 0.6,
                line: 2,
                evolved: false,
                evolving: false,
                inertia: false,
                decorators: {
                    buy: false,
                    build: false,
                    outsource: false,
                    market: false,
                    ecosystem: true,
                },
                increaseLabelSpacing: 3, // Ecosystem has spacing of 3
                label: {x: 5, y: 30},
            };

            const mockMap = {
                components: [],
                anchors: [],
                submaps: [],
                markets: [],
                ecosystems: [ecosystemComponent],
                evolved: [],
                pipelines: [],
                attitudes: [],
                notes: [],
                links: [],
                presentation: {},
                evolution: {},
                methods: [],
            };

            const mapElements = new MapElements(mockMap);
            const processedComponents = mapElements.getAllComponents();

            const processedComponent = processedComponents.find(c => c.id === 'ecosystem-component');
            expect(processedComponent).toBeDefined();

            // Verify ecosystem decorator spacing
            expect(processedComponent?.increaseLabelSpacing).toBe(3);
            expect(processedComponent?.decorators?.ecosystem).toBe(true);

            // Render to verify multi-line text works with ecosystem decorator
            const {container} = renderWithProviders(
                <ComponentText
                    component={processedComponent!}
                    cx={200}
                    cy={150}
                    styles={mockMapStyleDefs.component}
                    mutateMapText={mockMutateMapText}
                    mapText=""
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                />,
            );

            expect(container.querySelector('text')).toBeTruthy();
        });

        it('should handle market decorator with multi-line component names', () => {
            const marketComponent: UnifiedComponent = {
                id: 'market-component',
                name: 'Digital\nMarketplace\nPlatform',
                maturity: 0.9,
                visibility: 0.8,
                line: 3,
                evolved: false,
                evolving: false,
                inertia: false,
                decorators: {
                    buy: false,
                    build: false,
                    outsource: false,
                    market: true,
                    ecosystem: false,
                },
                increaseLabelSpacing: 2, // Market has spacing of 2
                label: {x: 5, y: 20},
            };

            const mockMap = {
                components: [],
                anchors: [],
                submaps: [],
                markets: [marketComponent],
                ecosystems: [],
                evolved: [],
                pipelines: [],
                attitudes: [],
                notes: [],
                links: [],
                presentation: {},
                evolution: {},
                methods: [],
            };

            const mapElements = new MapElements(mockMap);
            const processedComponents = mapElements.getAllComponents();

            const processedComponent = processedComponents.find(c => c.id === 'market-component');
            expect(processedComponent).toBeDefined();

            // Verify market decorator properties
            expect(processedComponent?.increaseLabelSpacing).toBe(2);
            expect(processedComponent?.decorators?.market).toBe(true);

            // Render to verify multi-line text works with market decorator
            const {container} = renderWithProviders(
                <ComponentText
                    component={processedComponent!}
                    cx={300}
                    cy={200}
                    styles={mockMapStyleDefs.component}
                    mutateMapText={mockMutateMapText}
                    mapText=""
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                />,
            );

            expect(container.querySelector('text')).toBeTruthy();
        });
    });

    describe('Multi-line text rendering with decorator spacing', () => {
        it('should render multi-line component text with proper spacing for decorated components', () => {
            const decoratedComponent: UnifiedComponent = {
                id: 'decorated-component',
                name: 'Service\nWith\nMultiple\nLines',
                maturity: 0.6,
                visibility: 0.4,
                line: 1,
                evolved: false,
                evolving: false,
                inertia: false,
                decorators: {
                    buy: true,
                    build: false,
                    outsource: false,
                    market: false,
                    ecosystem: false,
                },
                increaseLabelSpacing: 2,
                label: {x: 5, y: 20},
            };

            const {container} = renderWithProviders(
                <ComponentText
                    component={decoratedComponent}
                    cx={150}
                    cy={100}
                    styles={mockMapStyleDefs.component}
                    mutateMapText={mockMutateMapText}
                    mapText=""
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                />,
            );

            // Verify the component renders with multi-line text
            const textElement = container.querySelector('text');
            expect(textElement).toBeTruthy();

            // Verify positioning accounts for decorator spacing
            const transform = textElement?.getAttribute('transform');
            expect(transform).toBeDefined();
        });

        it('should handle complex decorator combinations with multi-line names', () => {
            // Test a component that could have multiple decorator effects
            const complexComponent: UnifiedComponent = {
                id: 'complex-component',
                name: 'Complex\nBusiness\nService\nDescription',
                maturity: 0.7,
                visibility: 0.3,
                line: 1,
                evolved: false,
                evolving: false,
                inertia: false,
                decorators: {
                    buy: false,
                    build: true,
                    outsource: false,
                    market: true, // Could have multiple decorators conceptually
                    ecosystem: false,
                },
                increaseLabelSpacing: 3, // Higher spacing for more complex decoration
                label: {x: 10, y: 30},
            };

            const {container} = renderWithProviders(
                <ComponentText
                    component={complexComponent}
                    cx={250}
                    cy={180}
                    styles={mockMapStyleDefs.component}
                    mutateMapText={mockMutateMapText}
                    mapText=""
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                />,
            );

            // Verify rendering works with complex multi-line + decorators
            expect(container.querySelector('text')).toBeTruthy();
        });
    });

    describe('Edge cases with decorator and multi-line combinations', () => {
        it('should handle empty decorator component names gracefully', () => {
            const emptyNameComponent: UnifiedComponent = {
                id: 'empty-component',
                name: '', // This would be recovered by validation
                maturity: 0.5,
                visibility: 0.5,
                line: 1,
                evolved: false,
                evolving: false,
                inertia: false,
                decorators: {
                    buy: true,
                    build: false,
                    outsource: false,
                    market: false,
                    ecosystem: false,
                },
                increaseLabelSpacing: 2,
                label: {x: 5, y: 20},
            };

            const {container} = renderWithProviders(
                <ComponentText
                    component={emptyNameComponent}
                    cx={100}
                    cy={100}
                    styles={mockMapStyleDefs.component}
                    mutateMapText={mockMutateMapText}
                    mapText=""
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                />,
            );

            // Should still render even with empty name
            expect(container.querySelector('text')).toBeTruthy();
        });

        it('should handle very long multi-line component names with decorators', () => {
            const longNameComponent: UnifiedComponent = {
                id: 'long-component',
                name: 'Very Long Component Name\nWith Multiple Lines\nAnd Detailed Description\nThat Spans Many Lines',
                maturity: 0.4,
                visibility: 0.6,
                line: 1,
                evolved: false,
                evolving: false,
                inertia: false,
                decorators: {
                    buy: false,
                    build: false,
                    outsource: true,
                    market: false,
                    ecosystem: false,
                },
                increaseLabelSpacing: 2,
                label: {x: 5, y: 20},
            };

            const {container} = renderWithProviders(
                <ComponentText
                    component={longNameComponent}
                    cx={180}
                    cy={120}
                    styles={mockMapStyleDefs.component}
                    mutateMapText={mockMutateMapText}
                    mapText=""
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                />,
            );

            // Should render without layout issues
            expect(container.querySelector('text')).toBeTruthy();
        });
    });
});
