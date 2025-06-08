import {
    IParseStrategy,
    IProvideBaseStrategyRunnerConfig,
} from '../types/base';
import ExtendableComponentExtractionStrategy from './ExtendableComponentExtractionStrategy';

export default class MarketExtractionStrategy implements IParseStrategy {
    data: string;
    keyword: string;
    containerName: string;
    parentStrategy: ExtendableComponentExtractionStrategy;
    constructor(data: string) {
        const config: IProvideBaseStrategyRunnerConfig = {
            keyword: 'market',
            containerName: 'markets',
            defaultAttributes: { increaseLabelSpacing: 1},
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
