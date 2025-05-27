import { IProvideBaseElement, IProvideDecoratorsConfig } from './types/base';

export const setName = (
    baseElement: IProvideBaseElement & { name?: string },
    element: string,
    config: IProvideDecoratorsConfig,
): void => {
    const name = element
        .split(`${config.keyword} `)[1]
        .trim()
        .split(' [')[0]
        .trim();
    Object.assign(baseElement, { name });
};

export const setCoords = (
    baseElement: IProvideBaseElement & {
        visibility?: number;
        maturity?: number;
    },
    element: string,
): void => {
    if (element.indexOf('[') > -1 && element.indexOf(']') > -1) {
        const loc = element
            .split('[')[1]
            .trim()
            .split(']')[0]
            .replace(/\s/g, '')
            .split(',');
        Object.assign(baseElement, {
            visibility: parseFloat(loc[0]),
            maturity: parseFloat(loc[1]),
        });
    } else {
        Object.assign(baseElement, {
            visibility: 0.9,
            maturity: 0.1,
        });
    }
};

export const isDeAccelerator = (
    baseElement: IProvideBaseElement & { deaccelerator?: boolean },
    element: string,
): void => {
    Object.assign(baseElement, {
        deaccelerator: element.indexOf('deaccelerator') === 0,
    });
};
