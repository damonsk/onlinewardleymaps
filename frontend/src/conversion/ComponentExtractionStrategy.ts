import { IProvideBaseStrategyRunnerConfig } from './BaseStrategyRunnerConfig';
import ExtendableComponentExtractionStrategy from './ExtendableComponentExtractionStrategy';
import { IParseStrategy } from './IParseStrategy';

export default class ComponentExtractionStrategy implements IParseStrategy {
    data: string;
    keyword: string;
    containerName: string;
    parentStrategy: ExtendableComponentExtractionStrategy;
    constructor(data: string) {
        const config: IProvideBaseStrategyRunnerConfig = {
            keyword: 'component',
            containerName: 'elements',
            defaultAttributes: {},
        };

        const lines = [];
        const toRunThrough = data.split('\n');
        let isWithinNestedContainer = false;
        for (let i = 0; i < toRunThrough.length; i++) {
            const element = toRunThrough[i];
            if (element.trim().indexOf('{') === 0) {
                isWithinNestedContainer = true;
                lines.push(' ');
            }
            if (isWithinNestedContainer && element.trim().indexOf('}') === 0) {
                isWithinNestedContainer = false;
                lines.push(' ');
            }
            if (
                isWithinNestedContainer &&
                element.trim().includes('}') === false &&
                element.trim().includes('{') === false
            ) {
                lines.push(' ');
            }
            if (
                !isWithinNestedContainer &&
                element.trim().indexOf('}') === -1
            ) {
                lines.push(element);
            }
        }
        const cleanedData = lines.join('\n');
        this.data = cleanedData;
        this.keyword = config.keyword;
        this.containerName = config.containerName;
        this.parentStrategy = new ExtendableComponentExtractionStrategy(
            cleanedData,
            config,
            [],
        );
    }

    apply() {
        return this.parentStrategy.apply();
    }
}
