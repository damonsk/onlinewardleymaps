import {IParseStrategy, IProvideBaseElement, IProvideBaseStrategyRunnerConfig, IProvideDecoratorsConfig} from '../types/base';

export default class BaseStrategyRunner implements IParseStrategy {
    data: string;
    containerName: string;
    keyword: string;
    config: IProvideBaseStrategyRunnerConfig;
    decorators: Array<(baseElement: IProvideBaseElement, element: string, config: IProvideDecoratorsConfig) => void>;

    constructor(
        data: string,
        config: IProvideBaseStrategyRunnerConfig,
        decorators: Array<(baseElement: IProvideBaseElement, element: string, config: IProvideDecoratorsConfig) => void>,
    ) {
        this.data = data;
        this.keyword = config.keyword;
        this.containerName = config.containerName;
        this.config = config;
        this.decorators = decorators;
    }
    apply() {
        const lines = this.data.split('\n');
        const elementsToReturn: any[] = [];
        const errors = [];
        for (let i = 0; i < lines.length; i++) {
            try {
                const element = lines[i];
                if (element.trim().indexOf(`${this.keyword} `) === 0) {
                    const baseElement = Object.assign(
                        {
                            id: 1 + i,
                            line: 1 + i,
                        },
                        this.config.defaultAttributes,
                    );
                    this.decorators.forEach(f =>
                        f(baseElement, element, {
                            keyword: this.keyword,
                            containerName: this.containerName,
                            config: this.config,
                        }),
                    );
                    elementsToReturn.push(baseElement);
                }
            } catch (e) {
                console.log(e);
                errors.push({line: i, name: e});
            }
        }
        return {
            [this.containerName]: elementsToReturn,
            errors: errors,
        };
    }
}
