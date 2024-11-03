import MapElements from '../MapElements';
import { Link, LinkResult } from './LinkStrategiesInterfaces';

export default class AllNoneEvolvedLinksStrategy {
    private links: Link[];
    private mapElements: MapElements;

    constructor(links: Link[], mapElements: MapElements) {
        this.links = links;
        this.mapElements = mapElements;
    }
    getLinks(): LinkResult {
        return {
            name: 'links',
            links: this.links,
            startElements: this.mapElements.getNonEvolvedElements(),
            endElements: this.mapElements.getNonEvolvedElements(),
        };
    }
}
