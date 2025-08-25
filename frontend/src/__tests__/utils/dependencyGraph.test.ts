// dependencyGraph.test.ts
import '@testing-library/jest-dom';
import {
    areComponentNamesEquivalent,
    ComponentDependencyGraph,
    createDependencyGraph,
    normalizeComponentName,
} from '../../utils/dependencyGraph';
import { ProcessedLinkGroup } from '../../utils/mapProcessing';

describe('Component Link Highlighting Dependency Graph', () => {
    describe('createDependencyGraph', () => {
        it('should create an empty dependency graph with no links', () => {
            const processedLinks: ProcessedLinkGroup[] = [] as any;
            const dependencyGraph = createDependencyGraph(processedLinks);

            expect(dependencyGraph.nodes.size).toBe(0);
            expect(dependencyGraph.getDescendants('NonExistent')).toEqual([]);
            expect(dependencyGraph.getDescendantLinks('NonExistent')).toEqual([]);
            expect(dependencyGraph.hasDescendants('NonExistent')).toBe(false);
        });

        it('should handle simple linear dependency chain (Business -> Cup of Tea -> Tea -> Hot Water)', () => {
            const processedLinks: ProcessedLinkGroup[] = [
                {
                    name: 'links',
                    links: [
                        {
                            key: 1,
                            link: {start: 'Business', end: 'Cup of Tea', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'Business', id: 'business', type: 'anchor'} as any,
                            endElement: {name: 'Cup of Tea', id: 'cup-of-tea', type: 'component'} as any,
                        },
                        {
                            key: 2,
                            link: {start: 'Cup of Tea', end: 'Tea', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'Cup of Tea', id: 'cup-of-tea', type: 'component'} as any,
                            endElement: {name: 'Tea', id: 'tea', type: 'component'} as any,
                        },
                        {
                            key: 3,
                            link: {start: 'Tea', end: 'Hot Water', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'Tea', id: 'tea', type: 'component'} as any,
                            endElement: {name: 'Hot Water', id: 'hot-water', type: 'component'} as any,
                        },
                    ] as any,
                },
            ] as any;

            const dependencyGraph = createDependencyGraph(processedLinks);

            // Business should have all downstream components as descendants
            const businessDescendants = dependencyGraph.getDescendants('Business');
            expect(businessDescendants).toEqual(expect.arrayContaining(['Cup of Tea', 'Tea', 'Hot Water']));
            expect(businessDescendants).toHaveLength(3);

            // Business should have all downstream links
            const businessLinks = dependencyGraph.getDescendantLinks('Business');
            expect(businessLinks).toEqual(
                expect.arrayContaining(['Business->Cup of Tea', 'Cup of Tea->Tea', 'Tea->Hot Water']),
            );

            // Cup of Tea should have Tea and Hot Water as descendants
            const cupOfTeaDescendants = dependencyGraph.getDescendants('Cup of Tea');
            expect(cupOfTeaDescendants).toEqual(expect.arrayContaining(['Tea', 'Hot Water']));
            expect(cupOfTeaDescendants).toHaveLength(2);

            // Cup of Tea should have downstream links
            const cupOfTeaLinks = dependencyGraph.getDescendantLinks('Cup of Tea');
            expect(cupOfTeaLinks).toEqual(expect.arrayContaining(['Cup of Tea->Tea', 'Tea->Hot Water']));

            // Tea should have only Hot Water as descendant
            const teaDescendants = dependencyGraph.getDescendants('Tea');
            expect(teaDescendants).toEqual(['Hot Water']);

            const teaLinks = dependencyGraph.getDescendantLinks('Tea');
            expect(teaLinks).toEqual(['Tea->Hot Water']);

            // Hot Water should have no descendants
            const hotWaterDescendants = dependencyGraph.getDescendants('Hot Water');
            expect(hotWaterDescendants).toEqual([]);
            expect(dependencyGraph.hasDescendants('Hot Water')).toBe(false);
        });

        it('should handle branching dependency chains (Cup of Tea -> Tea and Cup of Tea -> Cup)', () => {
            const processedLinks: ProcessedLinkGroup[] = [
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

            const dependencyGraph = createDependencyGraph(processedLinks);

            // Business should have all components in both branches
            const businessDescendants = dependencyGraph.getDescendants('Business');
            expect(businessDescendants).toEqual(expect.arrayContaining(['Cup of Tea', 'Tea', 'Cup', 'Hot Water']));
            expect(businessDescendants).toHaveLength(4);

            // Business should have all links in both branches
            const businessLinks = dependencyGraph.getDescendantLinks('Business');
            expect(businessLinks).toEqual(
                expect.arrayContaining([
                    'Business->Cup of Tea',
                    'Cup of Tea->Tea',
                    'Cup of Tea->Cup',
                    'Tea->Hot Water',
                ]),
            );

            // Cup of Tea should have both branches
            const cupOfTeaDescendants = dependencyGraph.getDescendants('Cup of Tea');
            expect(cupOfTeaDescendants).toEqual(expect.arrayContaining(['Tea', 'Cup', 'Hot Water']));
            expect(cupOfTeaDescendants).toHaveLength(3);

            // Cup should have no descendants (leaf node)
            expect(dependencyGraph.getDescendants('Cup')).toEqual([]);
            expect(dependencyGraph.hasDescendants('Cup')).toBe(false);
        });

        it('should handle isolated components (Public and foobar have no links)', () => {
            const processedLinks: ProcessedLinkGroup[] = [
                {
                    name: 'links',
                    links: [
                        {
                            link: {start: 'Business', end: 'Cup of Tea', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'Business', id: 'business', type: 'anchor'} as any,
                            endElement: {name: 'Cup of Tea', id: 'cup-of-tea', type: 'component'} as any,
                        },
                    ],
                },
            ] as any;

            const dependencyGraph = createDependencyGraph(processedLinks);

            // Public and foobar are not in the links, so they should have no descendants
            expect(dependencyGraph.getDescendants('Public')).toEqual([]);
            expect(dependencyGraph.getDescendantLinks('Public')).toEqual([]);
            expect(dependencyGraph.hasDescendants('Public')).toBe(false);

            expect(dependencyGraph.getDescendants('foobar')).toEqual([]);
            expect(dependencyGraph.getDescendantLinks('foobar')).toEqual([]);
            expect(dependencyGraph.hasDescendants('foobar')).toBe(false);

            // Business should still work correctly
            expect(dependencyGraph.getDescendants('Business')).toEqual(['Cup of Tea']);
            expect(dependencyGraph.getDescendantLinks('Business')).toEqual(['Business->Cup of Tea']);
        });

        it('should handle anchors as sources in dependency chains', () => {
            const processedLinks: ProcessedLinkGroup[] = [
                {
                    name: 'links',
                    links: [
                        {
                            link: {start: 'Business', end: 'Cup of Tea', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'Business', id: 'business', type: 'anchor'} as any,
                            endElement: {name: 'Cup of Tea', id: 'cup-of-tea', type: 'component'} as any,
                        },
                        {
                            link: {start: 'Public', end: 'Customer Service', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'Public', id: 'public', type: 'anchor'} as any,
                            endElement: {name: 'Customer Service', id: 'customer-service', type: 'component'} as any,
                        },
                    ],
                },
            ] as any;

            const dependencyGraph = createDependencyGraph(processedLinks);

            // Both anchors should be properly included as sources
            expect(dependencyGraph.nodes.has('Business')).toBe(true);
            expect(dependencyGraph.nodes.has('Public')).toBe(true);

            // Business anchor should have descendants
            expect(dependencyGraph.getDescendants('Business')).toEqual(['Cup of Tea']);
            expect(dependencyGraph.hasDescendants('Business')).toBe(true);

            // Public anchor should have descendants
            expect(dependencyGraph.getDescendants('Public')).toEqual(['Customer Service']);
            expect(dependencyGraph.hasDescendants('Public')).toBe(true);
        });

        it('should prevent infinite loops in circular dependencies', () => {
            const processedLinks: ProcessedLinkGroup[] = [
                {
                    name: 'links',
                    links: [
                        {
                            link: {start: 'A', end: 'B', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'A', id: 'a', type: 'component'} as any,
                            endElement: {name: 'B', id: 'b', type: 'component'} as any,
                        },
                        {
                            link: {start: 'B', end: 'C', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'B', id: 'b', type: 'component'} as any,
                            endElement: {name: 'C', id: 'c', type: 'component'} as any,
                        },
                        {
                            link: {start: 'C', end: 'A', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'C', id: 'c', type: 'component'} as any,
                            endElement: {name: 'A', id: 'a', type: 'component'} as any,
                        },
                    ],
                },
            ] as any;

            // This should not throw an error or cause infinite recursion
            expect(() => {
                const dependencyGraph = createDependencyGraph(processedLinks);
                
                // All components should be present in the graph
                expect(dependencyGraph.nodes.has('A')).toBe(true);
                expect(dependencyGraph.nodes.has('B')).toBe(true);
                expect(dependencyGraph.nodes.has('C')).toBe(true);

                // Should handle circular dependencies gracefully
                const aDescendants = dependencyGraph.getDescendants('A');
                expect(aDescendants.length).toBeGreaterThan(0);
            }).not.toThrow();
        });

        it('should handle multi-line component names correctly', () => {
            const processedLinks: ProcessedLinkGroup[] = [
                {
                    name: 'links',
                    links: [
                        {
                            link: {start: 'Multi-line\nComponent\nName', end: 'Simple Component', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'Multi-line\nComponent\nName', id: 'multi', type: 'component'} as any,
                            endElement: {name: 'Simple Component', id: 'simple', type: 'component'} as any,
                        },
                    ],
                },
            ] as any;

            const dependencyGraph = createDependencyGraph(processedLinks);

            // Multi-line component names should work correctly
            expect(dependencyGraph.getDescendants('Multi-line\nComponent\nName')).toEqual(['Simple Component']);
            expect(dependencyGraph.getDescendantLinks('Multi-line\nComponent\nName')).toEqual([
                'Multi-line\nComponent\nName->Simple Component',
            ]);
        });
    });

    describe('normalizeComponentName', () => {
        it('should normalize component names by trimming and lowercasing', () => {
            expect(normalizeComponentName('  Component Name  ')).toBe('component name');
            expect(normalizeComponentName('UPPERCASE')).toBe('uppercase');
            expect(normalizeComponentName('MiXeD cAsE')).toBe('mixed case');
            expect(normalizeComponentName('')).toBe('');
        });

        it('should handle multi-line names', () => {
            expect(normalizeComponentName('Multi-line\nComponent\nName')).toBe('multi-line\ncomponent\nname');
            expect(normalizeComponentName('  Line 1  \n  Line 2  ')).toBe('line 1  \n  line 2');
        });
    });

    describe('areComponentNamesEquivalent', () => {
        it('should correctly identify equivalent component names', () => {
            expect(areComponentNamesEquivalent('Component', 'component')).toBe(true);
            expect(areComponentNamesEquivalent('  Component  ', 'component')).toBe(true);
            expect(areComponentNamesEquivalent('COMPONENT', 'component')).toBe(true);
            expect(areComponentNamesEquivalent('Component', 'Different')).toBe(false);
        });

        it('should handle multi-line names', () => {
            expect(areComponentNamesEquivalent('Multi-line\nName', 'multi-line\nname')).toBe(true);
            expect(areComponentNamesEquivalent('Multi-line\nName', 'multi-line\ndifferent')).toBe(false);
        });
    });

    describe('ComponentDependencyGraph interface', () => {
        let dependencyGraph: ComponentDependencyGraph;

        beforeEach(() => {
            const processedLinks: ProcessedLinkGroup[] = [
                {
                    name: 'links',
                    links: [
                        {
                            link: {start: 'A', end: 'B', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'A', id: 'a', type: 'component'} as any,
                            endElement: {name: 'B', id: 'b', type: 'component'} as any,
                        },
                        {
                            link: {start: 'B', end: 'C', flow: false, future: false, past: false, context: '', flowValue: ''},
                            startElement: {name: 'B', id: 'b', type: 'component'} as any,
                            endElement: {name: 'C', id: 'c', type: 'component'} as any,
                        },
                    ],
                },
            ] as any;
            dependencyGraph = createDependencyGraph(processedLinks);
        });

        it('should provide correct descendant information', () => {
            expect(dependencyGraph.getDescendants('A')).toEqual(expect.arrayContaining(['B', 'C']));
            expect(dependencyGraph.getDescendants('B')).toEqual(['C']);
            expect(dependencyGraph.getDescendants('C')).toEqual([]);
        });

        it('should provide correct link information', () => {
            expect(dependencyGraph.getDescendantLinks('A')).toEqual(expect.arrayContaining(['A->B', 'B->C']));
            expect(dependencyGraph.getDescendantLinks('B')).toEqual(['B->C']);
            expect(dependencyGraph.getDescendantLinks('C')).toEqual([]);
        });

        it('should correctly report whether components have descendants', () => {
            expect(dependencyGraph.hasDescendants('A')).toBe(true);
            expect(dependencyGraph.hasDescendants('B')).toBe(true);
            expect(dependencyGraph.hasDescendants('C')).toBe(false);
            expect(dependencyGraph.hasDescendants('NonExistent')).toBe(false);
        });

        it('should provide access to internal nodes Map', () => {
            expect(dependencyGraph.nodes).toBeInstanceOf(Map);
            expect(dependencyGraph.nodes.size).toBe(3);
            expect(dependencyGraph.nodes.has('A')).toBe(true);
            expect(dependencyGraph.nodes.has('B')).toBe(true);
            expect(dependencyGraph.nodes.has('C')).toBe(true);
        });
    });

    describe('real-world scenario: Tea Shop dependency chain', () => {
        it('should correctly handle the user-provided Tea Shop example', () => {
            // Based on the user's example map text:
            // Business -> Cup of Tea -> Tea/Cup -> Hot Water
            // Public and foobar are isolated
            const processedLinks: ProcessedLinkGroup[] = [
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

            const dependencyGraph = createDependencyGraph(processedLinks);

            // Test the exact scenario described by the user

            // Hovering over Business should highlight: Business, Cup of Tea, Tea, Hot Water, Cup
            const businessDescendants = dependencyGraph.getDescendants('Business');
            expect(businessDescendants).toEqual(expect.arrayContaining(['Cup of Tea', 'Tea', 'Hot Water', 'Cup']));
            expect(businessDescendants).toHaveLength(4);

            const businessLinks = dependencyGraph.getDescendantLinks('Business');
            expect(businessLinks).toEqual(
                expect.arrayContaining([
                    'Business->Cup of Tea',
                    'Cup of Tea->Tea',
                    'Cup of Tea->Cup',
                    'Tea->Hot Water',
                ]),
            );
            expect(businessLinks).toHaveLength(4);

            // Hovering over Cup of Tea should highlight: Tea, Hot Water, Cup
            const cupOfTeaDescendants = dependencyGraph.getDescendants('Cup of Tea');
            expect(cupOfTeaDescendants).toEqual(expect.arrayContaining(['Tea', 'Hot Water', 'Cup']));
            expect(cupOfTeaDescendants).toHaveLength(3);

            const cupOfTeaLinks = dependencyGraph.getDescendantLinks('Cup of Tea');
            expect(cupOfTeaLinks).toEqual(expect.arrayContaining(['Cup of Tea->Tea', 'Cup of Tea->Cup', 'Tea->Hot Water']));
            expect(cupOfTeaLinks).toHaveLength(3);

            // Public and foobar should remain unaffected (no descendants)
            expect(dependencyGraph.getDescendants('Public')).toEqual([]);
            expect(dependencyGraph.getDescendantLinks('Public')).toEqual([]);
            expect(dependencyGraph.hasDescendants('Public')).toBe(false);

            expect(dependencyGraph.getDescendants('foobar')).toEqual([]);
            expect(dependencyGraph.getDescendantLinks('foobar')).toEqual([]);
            expect(dependencyGraph.hasDescendants('foobar')).toBe(false);

            // Verify anchors are properly integrated as dependency sources
            expect(dependencyGraph.nodes.has('Business')).toBe(true);
            expect(dependencyGraph.hasDescendants('Business')).toBe(true);
        });
    });
});