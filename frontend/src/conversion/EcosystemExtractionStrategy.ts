import ExtendableComponentExtractionStrategy from './ExtendableComponentExtractionStrategy';
import { IParseStrategy } from './IParseStrategy';

export default class EcosystemExtractionStrategy implements IParseStrategy {
    data: string;
    keyword: string;
    containerName: string;
    parentStrategy: ExtendableComponentExtractionStrategy;
    constructor(data: string) {
        const config = {
            keyword: 'ecosystem',
            containerName: 'ecosystems',
            defaultAttributes: { increaseLabelSpacing: 3 },
        };
        this.data = data;
        this.keyword = config.keyword;
        this.containerName = config.containerName;
        this.parentStrategy = new ExtendableComponentExtractionStrategy(
            data,
            config,
            [],
        );
    }

    apply() {
        return this.parentStrategy.apply();
    }
}
