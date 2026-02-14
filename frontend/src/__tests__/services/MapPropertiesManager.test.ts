import {MapPropertiesManager} from '../../services/MapPropertiesManager';

describe('MapPropertiesManager', () => {
    describe('parseMapProperties', () => {
        it('should parse all map properties from map text', () => {
            const mapText = `title Test Map
style wardley
size [800, 600]
evolution Genesis->Custom->Product->Commodity
component A [0.1, 0.9]
component B [0.5, 0.5]`;

            const properties = MapPropertiesManager.parseMapProperties(mapText);

            expect(properties).toEqual({
                style: 'wardley',
                size: {width: 800, height: 600},
                evolution: {
                    stage1: 'Genesis',
                    stage2: 'Custom',
                    stage3: 'Product',
                    stage4: 'Commodity',
                },
            });
        });

        it('should handle map text with no properties', () => {
            const mapText = `title Test Map
component A [0.1, 0.9]
component B [0.5, 0.5]`;

            const properties = MapPropertiesManager.parseMapProperties(mapText);

            expect(properties).toEqual({});
        });

        it('should handle partial properties', () => {
            const mapText = `title Test Map
style plain
component A [0.1, 0.9]`;

            const properties = MapPropertiesManager.parseMapProperties(mapText);

            expect(properties).toEqual({
                style: 'plain',
            });
        });
    });

    describe('getCurrentStyle', () => {
        it('should return current style when present', () => {
            const mapText = `title Test Map
style colour
component A [0.1, 0.9]`;

            const style = MapPropertiesManager.getCurrentStyle(mapText);
            expect(style).toBe('colour');
        });

        it('should return null when no style is set', () => {
            const mapText = `title Test Map
component A [0.1, 0.9]`;

            const style = MapPropertiesManager.getCurrentStyle(mapText);
            expect(style).toBeNull();
        });
    });

    describe('getCurrentSize', () => {
        it('should return current size when present', () => {
            const mapText = `title Test Map
size [1200, 800]
component A [0.1, 0.9]`;

            const size = MapPropertiesManager.getCurrentSize(mapText);
            expect(size).toEqual({width: 1200, height: 800});
        });

        it('should return null when no size is set', () => {
            const mapText = `title Test Map
component A [0.1, 0.9]`;

            const size = MapPropertiesManager.getCurrentSize(mapText);
            expect(size).toBeNull();
        });
    });

    describe('getCurrentEvolutionStages', () => {
        it('should return current evolution stages when present', () => {
            const mapText = `title Test Map
evolution Alpha->Beta->Gamma->Delta
component A [0.1, 0.9]`;

            const stages = MapPropertiesManager.getCurrentEvolutionStages(mapText);
            expect(stages).toEqual({
                stage1: 'Alpha',
                stage2: 'Beta',
                stage3: 'Gamma',
                stage4: 'Delta',
            });
        });

        it('should return null when no evolution stages are set', () => {
            const mapText = `title Test Map
component A [0.1, 0.9]`;

            const stages = MapPropertiesManager.getCurrentEvolutionStages(mapText);
            expect(stages).toBeNull();
        });
    });

    describe('updateMapStyle', () => {
        it('should add style when none exists', () => {
            const mapText = `title Test Map
component A [0.1, 0.9]`;

            const result = MapPropertiesManager.updateMapStyle(mapText, 'wardley');

            expect(result.updatedMapText).toBe(`title Test Map
style wardley
component A [0.1, 0.9]`);
            expect(result.propertyAdded).toBe(true);
            expect(result.propertyUpdated).toBe(false);
            expect(result.lineNumber).toBe(2);
        });

        it('should update existing style', () => {
            const mapText = `title Test Map
style plain
component A [0.1, 0.9]`;

            const result = MapPropertiesManager.updateMapStyle(mapText, 'colour');

            expect(result.updatedMapText).toBe(`title Test Map
style colour
component A [0.1, 0.9]`);
            expect(result.propertyAdded).toBe(false);
            expect(result.propertyUpdated).toBe(true);
            expect(result.lineNumber).toBe(2);
        });

        it('should add style at beginning when no title exists', () => {
            const mapText = `component A [0.1, 0.9]
component B [0.5, 0.5]`;

            const result = MapPropertiesManager.updateMapStyle(mapText, 'wardley');

            expect(result.updatedMapText).toBe(`style wardley
component A [0.1, 0.9]
component B [0.5, 0.5]`);
            expect(result.propertyAdded).toBe(true);
            expect(result.lineNumber).toBe(1);
        });
    });

    describe('updateMapSize', () => {
        it('should add size when none exists', () => {
            const mapText = `title Test Map
component A [0.1, 0.9]`;

            const result = MapPropertiesManager.updateMapSize(mapText, 1000, 700);

            expect(result.updatedMapText).toBe(`title Test Map
size [1000, 700]
component A [0.1, 0.9]`);
            expect(result.propertyAdded).toBe(true);
            expect(result.propertyUpdated).toBe(false);
        });

        it('should update existing size', () => {
            const mapText = `title Test Map
size [800, 600]
component A [0.1, 0.9]`;

            const result = MapPropertiesManager.updateMapSize(mapText, 1200, 900);

            expect(result.updatedMapText).toBe(`title Test Map
size [1200, 900]
component A [0.1, 0.9]`);
            expect(result.propertyAdded).toBe(false);
            expect(result.propertyUpdated).toBe(true);
        });

        it('should throw error for invalid size values', () => {
            const mapText = `title Test Map
component A [0.1, 0.9]`;

            expect(() => MapPropertiesManager.updateMapSize(mapText, 50, 600)).toThrow('Invalid map size');
            expect(() => MapPropertiesManager.updateMapSize(mapText, 6000, 600)).toThrow('Invalid map size');
            expect(() => MapPropertiesManager.updateMapSize(mapText, 800, 50)).toThrow('Invalid map size');
            expect(() => MapPropertiesManager.updateMapSize(mapText, 800, 6000)).toThrow('Invalid map size');
        });
    });

    describe('updateEvolutionStages', () => {
        it('should add evolution stages when none exist', () => {
            const mapText = `title Test Map
component A [0.1, 0.9]`;

            const stages = {
                stage1: 'Alpha',
                stage2: 'Beta',
                stage3: 'Gamma',
                stage4: 'Delta',
            };

            const result = MapPropertiesManager.updateEvolutionStages(mapText, stages);

            expect(result.updatedMapText).toBe(`title Test Map
evolution Alpha->Beta->Gamma->Delta
component A [0.1, 0.9]`);
            expect(result.propertyAdded).toBe(true);
            expect(result.propertyUpdated).toBe(false);
        });

        it('should update existing evolution stages', () => {
            const mapText = `title Test Map
evolution Genesis->Custom->Product->Commodity
component A [0.1, 0.9]`;

            const stages = {
                stage1: 'Start',
                stage2: 'Build',
                stage3: 'Scale',
                stage4: 'Optimize',
            };

            const result = MapPropertiesManager.updateEvolutionStages(mapText, stages);

            expect(result.updatedMapText).toBe(`title Test Map
evolution Start->Build->Scale->Optimize
component A [0.1, 0.9]`);
            expect(result.propertyAdded).toBe(false);
            expect(result.propertyUpdated).toBe(true);
        });

        it('should throw error for invalid stage names', () => {
            const mapText = `title Test Map
component A [0.1, 0.9]`;

            const invalidStages = {
                stage1: '',
                stage2: 'Beta',
                stage3: 'Gamma',
                stage4: 'Delta',
            };

            expect(() => MapPropertiesManager.updateEvolutionStages(mapText, invalidStages)).toThrow('Invalid evolution stages');

            const tooLongStages = {
                stage1: 'A'.repeat(51),
                stage2: 'Beta',
                stage3: 'Gamma',
                stage4: 'Delta',
            };

            expect(() => MapPropertiesManager.updateEvolutionStages(mapText, tooLongStages)).toThrow('Invalid evolution stages');
        });
    });

    describe('DSL generation', () => {
        it('should generate correct style DSL', () => {
            expect(MapPropertiesManager.generateStyleDSL('plain')).toBe('style plain');
            expect(MapPropertiesManager.generateStyleDSL('wardley')).toBe('style wardley');
            expect(MapPropertiesManager.generateStyleDSL('colour')).toBe('style colour');
        });

        it('should generate correct size DSL', () => {
            expect(MapPropertiesManager.generateSizeDSL(800, 600)).toBe('size [800, 600]');
            expect(MapPropertiesManager.generateSizeDSL(1200, 900)).toBe('size [1200, 900]');
        });

        it('should generate correct evolution DSL', () => {
            expect(MapPropertiesManager.generateEvolutionDSL('A', 'B', 'C', 'D')).toBe('evolution A->B->C->D');
            expect(MapPropertiesManager.generateEvolutionDSL('Genesis', 'Custom Built', 'Product', 'Commodity')).toBe(
                'evolution Genesis->Custom Built->Product->Commodity',
            );
        });
    });

    describe('utility methods', () => {
        it('should return default evolution stages', () => {
            const defaultStages = MapPropertiesManager.getDefaultEvolutionStages();
            expect(defaultStages).toEqual({
                stage1: 'Genesis',
                stage2: 'Custom Built',
                stage3: 'Product',
                stage4: 'Commodity',
            });
        });

        it('should detect custom properties', () => {
            const mapWithProperties = `title Test Map
style wardley
component A [0.1, 0.9]`;

            const mapWithoutProperties = `title Test Map
component A [0.1, 0.9]`;

            expect(MapPropertiesManager.hasCustomProperties(mapWithProperties)).toBe(true);
            expect(MapPropertiesManager.hasCustomProperties(mapWithoutProperties)).toBe(false);
        });

        it('should get property line numbers', () => {
            const mapText = `title Test Map
style wardley
size [800, 600]
evolution Genesis->Custom->Product->Commodity
component A [0.1, 0.9]`;

            const lineNumbers = MapPropertiesManager.getPropertyLineNumbers(mapText);
            expect(lineNumbers).toEqual({
                style: 2,
                size: 3,
                evolution: 4,
            });
        });
    });
});
