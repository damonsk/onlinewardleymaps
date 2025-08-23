import {IParseStrategy, IProvideBaseElement, IProvideBaseStrategyRunnerConfig, IProvideDecoratorsConfig} from '../types/base';
import {MapLoadingErrorHandler} from '../utils/errorHandling';

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
        const errorHandler = new MapLoadingErrorHandler();

        for (let i = 0; i < lines.length; i++) {
            const element = lines[i];

            // Skip empty lines and comments
            if (!element.trim() || element.trim().startsWith('//') || element.trim().startsWith('/*')) {
                continue;
            }

            if (element.trim().indexOf(`${this.keyword} `) === 0) {
                try {
                    const baseElement = Object.assign(
                        {
                            id: 1 + i,
                            line: 1 + i,
                        },
                        this.config.defaultAttributes,
                    );

                    // Apply decorators with individual error handling
                    let elementValid = true;
                    for (const decorator of this.decorators) {
                        try {
                            decorator(baseElement, element, {
                                keyword: this.keyword,
                                containerName: this.containerName,
                                config: this.config,
                            });
                        } catch (decoratorError) {
                            console.warn(`Decorator error on line ${i + 1} for ${this.keyword}:`, decoratorError);

                            // Try to continue with partial element if possible
                            const errorMessage = decoratorError instanceof Error ? decoratorError.message : String(decoratorError);
                            errors.push({
                                line: i + 1,
                                name: `Decorator error: ${errorMessage}`,
                                element: element,
                                keyword: this.keyword,
                            });

                            // For critical decorator failures, skip the element
                            if (errorMessage.includes('critical') || errorMessage.includes('name')) {
                                elementValid = false;
                                break;
                            }
                        }
                    }

                    if (elementValid) {
                        // Validate that the element has required properties
                        // PST elements (pioneers, settlers, townplanners) don't require names
                        const isPSTElement = [
                            'pioneers',
                            'settlers',
                            'townplanners',
                            'note',
                            'annotation',
                            'title',
                            'presentation',
                            'size',
                            'style',
                        ].includes(this.keyword);
                        if (!baseElement.name && !isPSTElement) {
                            console.warn(`Element on line ${i + 1} missing name, using fallback`);
                            baseElement.name = `${this.keyword.charAt(0).toUpperCase() + this.keyword.slice(1)} ${i + 1}`;
                        }

                        elementsToReturn.push(baseElement);
                    }
                } catch (e) {
                    const errorMessage = e instanceof Error ? e.message : String(e);
                    console.error(`Critical error processing ${this.keyword} on line ${i + 1}:`, e);

                    errors.push({
                        line: i + 1,
                        name: `Critical parsing error: ${errorMessage}`,
                        element: element,
                        keyword: this.keyword,
                        type: 'critical',
                    });

                    // For critical errors, try to create a minimal safe element to prevent map corruption
                    if (this.keyword === 'component') {
                        try {
                            const safeElement = Object.assign(
                                {
                                    id: 1 + i,
                                    line: 1 + i,
                                    name: `Component ${i + 1}`,
                                    maturity: 0.5,
                                    visibility: 0.5,
                                },
                                this.config.defaultAttributes,
                            );
                            elementsToReturn.push(safeElement);
                            console.warn(`Created safe fallback component for line ${i + 1}`);
                        } catch (fallbackError) {
                            console.error(`Failed to create safe fallback element:`, fallbackError);
                        }
                    }
                }
            }
        }

        // Log summary of parsing issues
        if (errors.length > 0) {
            const criticalErrors = errors.filter((e: any) => e.type === 'critical').length;
            const warningErrors = errors.length - criticalErrors;
            console.warn(`${this.keyword} parsing completed with ${criticalErrors} critical errors and ${warningErrors} warnings`);
        }

        return {
            [this.containerName]: elementsToReturn,
            errors: errors,
        };
    }
}
