import {featureSwitches} from '../constants/featureswitches';
import {UnifiedConverter} from '../conversion/UnifiedConverter';

const mapText = `title Synthetic Map
component Customer [0.9, 0.2]
component Service [0.7, 0.55]
Customer->Service
pipeline Service
{
    component Custom Service [0.4]
    component Product Service [0.7]
}
`;

describe('UnifiedConverter public constructor', () => {
    it('parses with the application feature switches when no configuration is supplied', () => {
        const map = new UnifiedConverter().parse(mapText);

        expect(map.errors).toEqual([]);
        expect(map.title).toBe('Synthetic Map');
        expect(map.components.map(component => component.name)).toEqual(['Customer', 'Service']);
        expect(map.pipelines[0].components.map(component => component.name)).toEqual(['Custom Service', 'Product Service']);
        expect(map).toEqual(new UnifiedConverter(featureSwitches).parse(mapText));
    });

    it('preserves explicitly supplied feature switches', () => {
        const map = new UnifiedConverter({...featureSwitches, enableNewPipelines: false}).parse(mapText);

        expect(map.pipelines[0].components).toEqual([]);
    });
});
