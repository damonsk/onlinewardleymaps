/**
 * Tests for PST element integration in MapElements class
 */

import {MapElements} from '../../processing/MapElements';
import {UnifiedWardleyMap, createEmptyMap} from '../../types/unified/map';
import {PSTElement} from '../../types/map/pst';

describe('MapElements PST Integration', () => {
    let mockMap: UnifiedWardleyMap;

    beforeEach(() => {
        mockMap = createEmptyMap();
        mockMap.attitudes = [
            {
                id: 1,
                line: 5,
                attitude: 'pioneers',
                maturity: 0.1,
                visibility: 0.9,
                maturity2: 0.3,
                visibility2: 0.7,
                name: 'Test Pioneers',
            },
            {
                id: 2,
                line: 8,
                attitude: 'settlers',
                maturity: 0.4,
                visibility: 0.8,
                maturity2: 0.6,
                visibility2: 0.6,
                name: 'Test Settlers',
            },
            {
                id: 3,
                line: 12,
                attitude: 'townplanners',
                maturity: 0.7,
                visibility: 0.5,
                maturity2: 0.9,
                visibility2: 0.3,
            },
            {
                id: 4,
                line: 15,
                attitude: 'other_attitude', // Non-PST attitude
                maturity: 0.5,
                visibility: 0.5,
                maturity2: 0.7,
                visibility2: 0.3,
            },
        ];
    });

    describe('PST Element Extraction', () => {
        it('should extract PST elements from attitudes array', () => {
            const mapElements = new MapElements(mockMap);
            const pstElements = mapElements.getPSTElements();

            expect(pstElements).toHaveLength(3); // Only PST attitudes, not the 'other_attitude'

            // Check pioneers element
            const pioneersElement = pstElements.find(el => el.type === 'pioneers');
            expect(pioneersElement).toBeDefined();
            expect(pioneersElement?.name).toBe('Test Pioneers');
            expect(pioneersElement?.line).toBe(5);
            expect(pioneersElement?.coordinates).toEqual({
                maturity1: 0.1,
                visibility1: 0.9,
                maturity2: 0.3,
                visibility2: 0.7,
            });

            // Check settlers element
            const settlersElement = pstElements.find(el => el.type === 'settlers');
            expect(settlersElement).toBeDefined();
            expect(settlersElement?.name).toBe('Test Settlers');
            expect(settlersElement?.line).toBe(8);

            // Check townplanners element
            const townplannersElement = pstElements.find(el => el.type === 'townplanners');
            expect(townplannersElement).toBeDefined();
            expect(townplannersElement?.line).toBe(12);
            expect(townplannersElement?.name).toBeUndefined(); // No name provided
        });

        it('should handle empty attitudes array', () => {
            mockMap.attitudes = [];
            const mapElements = new MapElements(mockMap);
            const pstElements = mapElements.getPSTElements();

            expect(pstElements).toHaveLength(0);
        });

        it('should handle attitudes array with no PST elements', () => {
            mockMap.attitudes = [
                {
                    id: 1,
                    line: 5,
                    attitude: 'other_attitude',
                    maturity: 0.5,
                    visibility: 0.5,
                    maturity2: 0.7,
                    visibility2: 0.3,
                },
            ];
            const mapElements = new MapElements(mockMap);
            const pstElements = mapElements.getPSTElements();

            expect(pstElements).toHaveLength(0);
        });
    });

    describe('PST Component Integration', () => {
        it('should integrate PST elements as UnifiedComponents', () => {
            const mapElements = new MapElements(mockMap);
            const allComponents = mapElements.getAllComponents();
            const pstComponents = mapElements.getPSTComponents();

            expect(pstComponents).toHaveLength(3);

            // Check that PST components are included in all components
            const pstComponentsInAll = allComponents.filter(comp => comp.type === 'pst');
            expect(pstComponentsInAll).toHaveLength(3);

            // Check pioneers component
            const pioneersComponent = pstComponents.find(comp => comp.pstType === 'pioneers');
            expect(pioneersComponent).toBeDefined();
            expect(pioneersComponent?.name).toBe('Test Pioneers');
            expect(pioneersComponent?.type).toBe('pst');
            expect(pioneersComponent?.maturity).toBe(0.1); // Should use maturity1
            expect(pioneersComponent?.visibility).toBe(0.9); // Should use visibility1
            expect(pioneersComponent?.pstCoordinates).toEqual({
                maturity1: 0.1,
                visibility1: 0.9,
                maturity2: 0.3,
                visibility2: 0.7,
            });
            expect(pioneersComponent?.line).toBe(5);
            expect(pioneersComponent?.evolving).toBe(false);
            expect(pioneersComponent?.evolved).toBe(false);
        });

        it('should generate appropriate names for unnamed PST elements', () => {
            const mapElements = new MapElements(mockMap);
            const pstComponents = mapElements.getPSTComponents();

            const townplannersComponent = pstComponents.find(comp => comp.pstType === 'townplanners');
            expect(townplannersComponent?.name).toBe('townplanners_12');
        });

        it('should set correct default properties for PST components', () => {
            const mapElements = new MapElements(mockMap);
            const pstComponents = mapElements.getPSTComponents();

            pstComponents.forEach(component => {
                expect(component.type).toBe('pst');
                expect(component.evolving).toBe(false);
                expect(component.evolved).toBe(false);
                expect(component.inertia).toBe(false);
                expect(component.pseudoComponent).toBe(false);
                expect(component.offsetY).toBe(0);
                expect(component.increaseLabelSpacing).toBe(0);
                expect(component.label).toEqual({x: 0, y: 0});
                expect(component.decorators).toEqual({
                    ecosystem: false,
                    market: false,
                    buy: false,
                    build: false,
                    outsource: false,
                });
            });
        });
    });

    describe('PST Element Filtering', () => {
        it('should filter PST elements by type', () => {
            const mapElements = new MapElements(mockMap);

            const pioneersElements = mapElements.getPSTElementsByType('pioneers');
            expect(pioneersElements).toHaveLength(1);
            expect(pioneersElements[0].type).toBe('pioneers');

            const settlersElements = mapElements.getPSTElementsByType('settlers');
            expect(settlersElements).toHaveLength(1);
            expect(settlersElements[0].type).toBe('settlers');

            const townplannersElements = mapElements.getPSTElementsByType('townplanners');
            expect(townplannersElements).toHaveLength(1);
            expect(townplannersElements[0].type).toBe('townplanners');

            const nonExistentElements = mapElements.getPSTElementsByType('nonexistent');
            expect(nonExistentElements).toHaveLength(0);
        });

        it('should get components by type including PST', () => {
            const mapElements = new MapElements(mockMap);

            const pstComponents = mapElements.getComponentsByType('pst');
            expect(pstComponents).toHaveLength(3);

            pstComponents.forEach(component => {
                expect(component.type).toBe('pst');
                expect(component.pstType).toBeDefined();
                expect(component.pstCoordinates).toBeDefined();
            });
        });
    });

    describe('Legacy Adapter', () => {
        it('should include PST methods in legacy adapter', () => {
            const mapElements = new MapElements(mockMap);
            const adapter = mapElements.getLegacyAdapter();

            expect(adapter.getPSTElements).toBeDefined();
            expect(adapter.getPSTElementsByType).toBeDefined();
            expect(adapter.getPSTComponents).toBeDefined();
            expect(adapter.getAllComponentsIncludingPST).toBeDefined();

            // Test the methods work
            const pstElements = adapter.getPSTElements();
            expect(pstElements).toHaveLength(3);

            const pioneersElements = adapter.getPSTElementsByType('pioneers');
            expect(pioneersElements).toHaveLength(1);

            const pstComponents = adapter.getPSTComponents();
            expect(pstComponents).toHaveLength(3);

            const allComponents = adapter.getAllComponentsIncludingPST();
            expect(allComponents.filter((c: any) => c.type === 'pst')).toHaveLength(3);
        });
    });
});
