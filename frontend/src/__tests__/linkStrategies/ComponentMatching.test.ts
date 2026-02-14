import LinksBuilder from '../../linkStrategies/LinksBuilder';
import {Link, MapElement} from '../../types/base';

describe('Component Matching for Multi-line Names', () => {
    describe('normalized component name matching', () => {
        it('should match multi-line component names in links', () => {
            const multiLineComponent = {
                name: 'Multi-line\nComponent\nName',
                id: 'comp1',
                maturity: 0.5,
                visibility: 0.7,
                x: 50,
                y: 70,
            } as MapElement;

            const singleLineComponent = {
                name: 'Simple Component',
                id: 'comp2',
                maturity: 0.3,
                visibility: 0.8,
                x: 30,
                y: 80,
            } as MapElement;

            const links: Link[] = [{start: 'Multi-line\nComponent\nName', end: 'Simple Component'}];

            const mockMapElements = {
                getLegacyAdapter: () => ({
                    getNoneEvolvedOrEvolvingElements: () => [multiLineComponent, singleLineComponent],
                    getEvolvedElements: () => [],
                    getNoneEvolvingElements: () => [multiLineComponent, singleLineComponent],
                    getEvolvingElements: () => [],
                    getNoneEvolvedElements: () => [],
                    getEvolveElements: () => [],
                    getEvolveElements: () => [],
                }),
            };

            const linksBuilder = new LinksBuilder(links, mockMapElements);
            const result = linksBuilder.build();

            expect(result).toHaveLength(6); // Should have all strategy results

            // Find the main AllLinksStrategy result
            const allLinksResult = result.find(r => r.name === 'links');
            expect(allLinksResult).toBeDefined();
            expect(allLinksResult!.links).toHaveLength(1);

            const link = allLinksResult!.links[0];
            expect(link.startElement?.name).toBe('Multi-line\nComponent\nName');
            expect(link.endElement?.name).toBe('Simple Component');
        });

        it('should match multi-line component names with normalized whitespace', () => {
            const multiLineComponent = {
                name: 'Multi-line\nComponent\nName',
                id: 'comp1',
                maturity: 0.5,
                visibility: 0.7,
                x: 50,
                y: 70,
            } as MapElement;

            const links: Link[] = [
                {start: 'Multi-line Component Name', end: 'Target'}, // Space instead of \n
            ];

            const mockMapElements = {
                getLegacyAdapter: () => ({
                    getNoneEvolvedOrEvolvingElements: () => [multiLineComponent, {name: 'Target', id: 'target'} as MapElement],
                    getEvolvedElements: () => [],
                    getNoneEvolvingElements: () => [multiLineComponent, {name: 'Target', id: 'target'} as MapElement],
                    getEvolvingElements: () => [],
                    getNoneEvolvedElements: () => [],
                    getEvolveElements: () => [],
                    getEvolveElements: () => [],
                }),
            };

            const linksBuilder = new LinksBuilder(links, mockMapElements);
            const result = linksBuilder.build();

            const allLinksResult = result.find(r => r.name === 'links');
            expect(allLinksResult).toBeDefined();
            expect(allLinksResult!.links).toHaveLength(1);

            const link = allLinksResult!.links[0];
            expect(link.startElement?.name).toBe('Multi-line\nComponent\nName');
        });

        it('should match component names with different case', () => {
            const component = {
                name: 'Database\nService',
                id: 'comp1',
                maturity: 0.4,
                visibility: 0.6,
                x: 40,
                y: 60,
            } as MapElement;

            const links: Link[] = [
                {start: 'database\nservice', end: 'Target'}, // Different case
            ];

            const mockMapElements = {
                getLegacyAdapter: () => ({
                    getNoneEvolvedOrEvolvingElements: () => [component, {name: 'Target', id: 'target'} as MapElement],
                    getEvolvedElements: () => [],
                    getNoneEvolvingElements: () => [component, {name: 'Target', id: 'target'} as MapElement],
                    getEvolvingElements: () => [],
                    getNoneEvolvedElements: () => [],
                    getEvolveElements: () => [],
                }),
            };

            const linksBuilder = new LinksBuilder(links, mockMapElements);
            const result = linksBuilder.build();

            const allLinksResult = result.find(r => r.name === 'links');
            expect(allLinksResult).toBeDefined();
            expect(allLinksResult!.links).toHaveLength(1);
        });

        it('should match component names with extra whitespace', () => {
            const component = {
                name: 'API Gateway\nv2.0',
                id: 'comp1',
                maturity: 0.7,
                visibility: 0.8,
                x: 70,
                y: 80,
            } as MapElement;

            const links: Link[] = [
                {start: '  API Gateway  \n  v2.0  ', end: 'Target'}, // Extra whitespace
            ];

            const mockMapElements = {
                getLegacyAdapter: () => ({
                    getNoneEvolvedOrEvolvingElements: () => [component, {name: 'Target', id: 'target'} as MapElement],
                    getEvolvedElements: () => [],
                    getNoneEvolvingElements: () => [component, {name: 'Target', id: 'target'} as MapElement],
                    getEvolvingElements: () => [],
                    getNoneEvolvedElements: () => [],
                    getEvolveElements: () => [],
                }),
            };

            const linksBuilder = new LinksBuilder(links, mockMapElements);
            const result = linksBuilder.build();

            const allLinksResult = result.find(r => r.name === 'links');
            expect(allLinksResult).toBeDefined();
            expect(allLinksResult!.links).toHaveLength(1);
        });

        it('should handle components with escaped characters in names', () => {
            const component = {
                name: 'Component with "quotes"\nand backslashes\\',
                id: 'comp1',
                maturity: 0.5,
                visibility: 0.5,
                x: 50,
                y: 50,
            } as MapElement;

            const links: Link[] = [{start: 'Component with "quotes"\nand backslashes\\', end: 'Target'}];

            const mockMapElements = {
                getLegacyAdapter: () => ({
                    getNoneEvolvedOrEvolvingElements: () => [component, {name: 'Target', id: 'target'} as MapElement],
                    getEvolvedElements: () => [],
                    getNoneEvolvingElements: () => [component, {name: 'Target', id: 'target'} as MapElement],
                    getEvolvingElements: () => [],
                    getNoneEvolvedElements: () => [],
                    getEvolveElements: () => [],
                }),
            };

            const linksBuilder = new LinksBuilder(links, mockMapElements);
            const result = linksBuilder.build();

            const allLinksResult = result.find(r => r.name === 'links');
            expect(allLinksResult).toBeDefined();
            expect(allLinksResult!.links).toHaveLength(1);
        });

        it('should not match completely different component names', () => {
            const component = {
                name: 'Database\nService',
                id: 'comp1',
                maturity: 0.4,
                visibility: 0.6,
                x: 40,
                y: 60,
            } as MapElement;

            const links: Link[] = [{start: 'Completely Different\nName', end: 'Target'}];

            const mockMapElements = {
                getLegacyAdapter: () => ({
                    getNoneEvolvedOrEvolvingElements: () => [component, {name: 'Target', id: 'target'} as MapElement],
                    getEvolvedElements: () => [],
                    getNoneEvolvingElements: () => [component, {name: 'Target', id: 'target'} as MapElement],
                    getEvolvingElements: () => [],
                    getNoneEvolvedElements: () => [],
                    getEvolveElements: () => [],
                }),
            };

            const linksBuilder = new LinksBuilder(links, mockMapElements);
            const result = linksBuilder.build();

            const allLinksResult = result.find(r => r.name === 'links');
            expect(allLinksResult).toBeDefined();
            expect(allLinksResult!.links).toHaveLength(0); // No match expected
        });
    });

    describe('performance with many components', () => {
        it('should handle large numbers of multi-line components efficiently', () => {
            const components: MapElement[] = [];
            const links: Link[] = [];

            // Create 100 multi-line components
            for (let i = 0; i < 100; i++) {
                components.push({
                    name: `Component ${i}\nLine 2\nLine 3`,
                    id: `comp${i}`,
                    maturity: 0.5,
                    visibility: 0.5,
                    x: 50,
                    y: 50,
                } as MapElement);

                if (i < 50) {
                    links.push({
                        start: `Component ${i}\nLine 2\nLine 3`,
                        end: `Component ${i + 50}\nLine 2\nLine 3`,
                    });
                }
            }

            const mockMapElements = {
                getLegacyAdapter: () => ({
                    getNoneEvolvedOrEvolvingElements: () => components,
                    getEvolvedElements: () => [],
                    getNoneEvolvingElements: () => components,
                    getEvolvingElements: () => [],
                    getNoneEvolvedElements: () => [],
                    getEvolveElements: () => [],
                    getEvolveElements: () => [],
                }),
            };

            const start = performance.now();
            const linksBuilder = new LinksBuilder(links, mockMapElements);
            const result = linksBuilder.build();
            const end = performance.now();

            expect(end - start).toBeLessThan(100); // Should complete in under 100ms

            const allLinksResult = result.find(r => r.name === 'links');
            expect(allLinksResult).toBeDefined();
            expect(allLinksResult!.links).toHaveLength(50); // All 50 links should be matched
        });
    });
});
