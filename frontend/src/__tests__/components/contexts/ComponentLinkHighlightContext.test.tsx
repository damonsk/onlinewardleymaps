// ComponentLinkHighlightContext.test.tsx
import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import {act, renderHook} from '@testing-library/react';
import React from 'react';
import {
    ComponentLinkHighlightProvider,
    useComponentLinkHighlight,
} from '../../../components/contexts/ComponentLinkHighlightContext';
import {ProcessedLinkGroup} from '../../../utils/mapProcessing';

describe('ComponentLinkHighlightContext', () => {
    const mockProcessedLinks: ProcessedLinkGroup[] = [
        {
            name: 'links',
            links: [
                {
                    link: {start: 'Business', end: 'Cup of Tea', flow: false, future: false, past: false, context: '', flowValue: ''},
                    startElement: {name: 'Business', id: 'business', type: 'anchor'} as any,
                    endElement: {name: 'Cup of Tea', id: 'cup-of-tea', type: 'component'} as any,
                },
                {
                    link: {start: 'Cup of Tea', end: 'Tea', flow: false, future: false, past: false, context: '', flowValue: ''},
                    startElement: {name: 'Cup of Tea', id: 'cup-of-tea', type: 'component'} as any,
                    endElement: {name: 'Tea', id: 'tea', type: 'component'} as any,
                },
                {
                    link: {start: 'Tea', end: 'Hot Water', flow: false, future: false, past: false, context: '', flowValue: ''},
                    startElement: {name: 'Tea', id: 'tea', type: 'component'} as any,
                    endElement: {name: 'Hot Water', id: 'hot-water', type: 'component'} as any,
                },
            ],
        },
    ] as any;

    const TestWrapper: React.FC<{children: React.ReactNode; processedLinks?: ProcessedLinkGroup[]}> = ({
        children,
        processedLinks = mockProcessedLinks,
    }) => <ComponentLinkHighlightProvider processedLinks={processedLinks}>{children}</ComponentLinkHighlightProvider>;

    describe('ComponentLinkHighlightProvider', () => {
        it('should render children without crashing', () => {
            render(
                <TestWrapper>
                    <div data-testid="test-child">Test Content</div>
                </TestWrapper>,
            );

            expect(screen.getByTestId('test-child')).toBeInTheDocument();
        });

        it('should provide context value to children', () => {
            const TestComponent = () => {
                const context = useComponentLinkHighlight();
                return <div data-testid="context-available">{context ? 'Context Available' : 'No Context'}</div>;
            };

            render(
                <TestWrapper>
                    <TestComponent />
                </TestWrapper>,
            );

            expect(screen.getByTestId('context-available')).toHaveTextContent('Context Available');
        });

        it('should handle empty processed links', () => {
            const TestComponent = () => {
                const {linkHighlightState} = useComponentLinkHighlight();
                return (
                    <div data-testid="empty-state">
                        {linkHighlightState.highlightedLinks.size === 0 ? 'Empty' : 'Has Links'}
                    </div>
                );
            };

            render(
                <TestWrapper processedLinks={[]}>
                    <TestComponent />
                </TestWrapper>,
            );

            expect(screen.getByTestId('empty-state')).toHaveTextContent('Empty');
        });
    });

    describe('useComponentLinkHighlight hook', () => {
        it('should throw error when used outside provider', () => {
            // Suppress console error for this test
            const originalError = console.error;
            console.error = jest.fn();

            expect(() => {
                renderHook(() => useComponentLinkHighlight());
            }).toThrow('useComponentLinkHighlight must be used within a ComponentLinkHighlightProvider');

            console.error = originalError;
        });

        it('should provide initial state with no hovered component', () => {
            const {result} = renderHook(() => useComponentLinkHighlight(), {
                wrapper: TestWrapper,
            });

            expect(result.current.linkHighlightState.hoveredComponent).toBeNull();
            expect(result.current.linkHighlightState.highlightedLinks.size).toBe(0);
            expect(result.current.linkHighlightState.highlightedComponents.size).toBe(0);
        });

        it('should update highlighted state when component is hovered', () => {
            const {result} = renderHook(() => useComponentLinkHighlight(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.setHoveredComponent('Business');
            });

            expect(result.current.linkHighlightState.hoveredComponent).toBe('Business');
            expect(result.current.linkHighlightState.highlightedComponents.has('Business')).toBe(true);
            expect(result.current.linkHighlightState.highlightedComponents.has('Cup of Tea')).toBe(true);
            expect(result.current.linkHighlightState.highlightedComponents.has('Tea')).toBe(true);
            expect(result.current.linkHighlightState.highlightedComponents.has('Hot Water')).toBe(true);
        });

        it('should update highlighted links when component is hovered', () => {
            const {result} = renderHook(() => useComponentLinkHighlight(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.setHoveredComponent('Business');
            });

            expect(result.current.linkHighlightState.highlightedLinks.has('Business->Cup of Tea')).toBe(true);
            expect(result.current.linkHighlightState.highlightedLinks.has('Cup of Tea->Tea')).toBe(true);
            expect(result.current.linkHighlightState.highlightedLinks.has('Tea->Hot Water')).toBe(true);
        });

        it('should clear highlighted state when hovered component is set to null', () => {
            const {result} = renderHook(() => useComponentLinkHighlight(), {
                wrapper: TestWrapper,
            });

            // First hover over a component
            act(() => {
                result.current.setHoveredComponent('Business');
            });

            expect(result.current.linkHighlightState.highlightedLinks.size).toBeGreaterThan(0);

            // Then clear the hover
            act(() => {
                result.current.setHoveredComponent(null);
            });

            expect(result.current.linkHighlightState.hoveredComponent).toBeNull();
            expect(result.current.linkHighlightState.highlightedLinks.size).toBe(0);
            expect(result.current.linkHighlightState.highlightedComponents.size).toBe(0);
        });

        it('should handle different components with different descendant counts', () => {
            const {result} = renderHook(() => useComponentLinkHighlight(), {
                wrapper: TestWrapper,
            });

            // Test Business (should have 3 descendants)
            act(() => {
                result.current.setHoveredComponent('Business');
            });

            const businessHighlightedComponents = result.current.linkHighlightState.highlightedComponents;
            expect(businessHighlightedComponents.size).toBe(4); // Business + 3 descendants

            // Test Cup of Tea (should have 2 descendants)
            act(() => {
                result.current.setHoveredComponent('Cup of Tea');
            });

            const cupOfTeaHighlightedComponents = result.current.linkHighlightState.highlightedComponents;
            expect(cupOfTeaHighlightedComponents.size).toBe(3); // Cup of Tea + 2 descendants

            // Test Tea (should have 1 descendant)
            act(() => {
                result.current.setHoveredComponent('Tea');
            });

            const teaHighlightedComponents = result.current.linkHighlightState.highlightedComponents;
            expect(teaHighlightedComponents.size).toBe(2); // Tea + 1 descendant

            // Test Hot Water (should have no descendants)
            act(() => {
                result.current.setHoveredComponent('Hot Water');
            });

            const hotWaterHighlightedComponents = result.current.linkHighlightState.highlightedComponents;
            expect(hotWaterHighlightedComponents.size).toBe(1); // Only Hot Water itself
        });

        it('should provide correct isLinkHighlighted function', () => {
            const {result} = renderHook(() => useComponentLinkHighlight(), {
                wrapper: TestWrapper,
            });

            // Initially no links should be highlighted
            expect(result.current.isLinkHighlighted('Business->Cup of Tea')).toBe(false);
            expect(result.current.isLinkHighlighted('Cup of Tea->Tea')).toBe(false);

            // Hover over Business
            act(() => {
                result.current.setHoveredComponent('Business');
            });

            // Now Business links should be highlighted
            expect(result.current.isLinkHighlighted('Business->Cup of Tea')).toBe(true);
            expect(result.current.isLinkHighlighted('Cup of Tea->Tea')).toBe(true);
            expect(result.current.isLinkHighlighted('Tea->Hot Water')).toBe(true);

            // Non-existent links should not be highlighted
            expect(result.current.isLinkHighlighted('NonExistent->Link')).toBe(false);
        });

        it('should provide correct isComponentHighlighted function', () => {
            const {result} = renderHook(() => useComponentLinkHighlight(), {
                wrapper: TestWrapper,
            });

            // Initially no components should be highlighted
            expect(result.current.isComponentHighlighted('Business')).toBe(false);
            expect(result.current.isComponentHighlighted('Cup of Tea')).toBe(false);

            // Hover over Business
            act(() => {
                result.current.setHoveredComponent('Business');
            });

            // Now Business and its descendants should be highlighted
            expect(result.current.isComponentHighlighted('Business')).toBe(true);
            expect(result.current.isComponentHighlighted('Cup of Tea')).toBe(true);
            expect(result.current.isComponentHighlighted('Tea')).toBe(true);
            expect(result.current.isComponentHighlighted('Hot Water')).toBe(true);

            // Components not in the chain should not be highlighted
            expect(result.current.isComponentHighlighted('Public')).toBe(false);
            expect(result.current.isComponentHighlighted('foobar')).toBe(false);
        });

        it('should handle non-existent components gracefully', () => {
            const {result} = renderHook(() => useComponentLinkHighlight(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.setHoveredComponent('NonExistentComponent');
            });

            expect(result.current.linkHighlightState.hoveredComponent).toBe('NonExistentComponent');
            expect(result.current.linkHighlightState.highlightedLinks.size).toBe(0);
            expect(result.current.linkHighlightState.highlightedComponents.size).toBe(1); // Only the component itself
            expect(result.current.linkHighlightState.highlightedComponents.has('NonExistentComponent')).toBe(true);
        });
    });

    describe('integration with real-world scenarios', () => {
        it('should handle the complete Tea Shop example correctly', () => {
            const teaShopLinks: ProcessedLinkGroup[] = [
                {
                    name: 'links',
                    links: [
                        {
                            link: {start: 'Business', end: 'Cup of Tea', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'Business', id: 'business', type: 'anchor'} as any,
                            endElement: {name: 'Cup of Tea', id: 'cup-of-tea', type: 'component'} as any,
                        },
                        {
                            link: {start: 'Cup of Tea', end: 'Tea', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'Cup of Tea', id: 'cup-of-tea', type: 'component'} as any,
                            endElement: {name: 'Tea', id: 'tea', type: 'component'} as any,
                        },
                        {
                            link: {start: 'Cup of Tea', end: 'Cup', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'Cup of Tea', id: 'cup-of-tea', type: 'component'} as any,
                            endElement: {name: 'Cup', id: 'cup', type: 'component'} as any,
                        },
                        {
                            link: {start: 'Tea', end: 'Hot Water', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'Tea', id: 'tea', type: 'component'} as any,
                            endElement: {name: 'Hot Water', id: 'hot-water', type: 'component'} as any,
                        },
                    ],
                },
            ] as any;

            const {result} = renderHook(() => useComponentLinkHighlight(), {
                wrapper: ({children}) => (
                    <ComponentLinkHighlightProvider processedLinks={teaShopLinks}>{children}</ComponentLinkHighlightProvider>
                ),
            });

            // Test the exact user scenario: hovering over Business should highlight entire chain
            act(() => {
                result.current.setHoveredComponent('Business');
            });

            // Verify all components in the chain are highlighted
            const highlightedComponents = result.current.linkHighlightState.highlightedComponents;
            expect(highlightedComponents.has('Business')).toBe(true);
            expect(highlightedComponents.has('Cup of Tea')).toBe(true);
            expect(highlightedComponents.has('Tea')).toBe(true);
            expect(highlightedComponents.has('Hot Water')).toBe(true);
            expect(highlightedComponents.has('Cup')).toBe(true);

            // Verify all links in the chain are highlighted
            const highlightedLinks = result.current.linkHighlightState.highlightedLinks;
            expect(highlightedLinks.has('Business->Cup of Tea')).toBe(true);
            expect(highlightedLinks.has('Cup of Tea->Tea')).toBe(true);
            expect(highlightedLinks.has('Cup of Tea->Cup')).toBe(true);
            expect(highlightedLinks.has('Tea->Hot Water')).toBe(true);

            // Test the second scenario: hovering over Cup of Tea should highlight only downstream
            act(() => {
                result.current.setHoveredComponent('Cup of Tea');
            });

            const cupOfTeaHighlighted = result.current.linkHighlightState.highlightedComponents;
            expect(cupOfTeaHighlighted.has('Cup of Tea')).toBe(true);
            expect(cupOfTeaHighlighted.has('Tea')).toBe(true);
            expect(cupOfTeaHighlighted.has('Hot Water')).toBe(true);
            expect(cupOfTeaHighlighted.has('Cup')).toBe(true);
            // Business should NOT be highlighted when hovering Cup of Tea
            expect(cupOfTeaHighlighted.has('Business')).toBe(false);
        });
    });
});