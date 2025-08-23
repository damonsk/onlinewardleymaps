/**
 * Domain types for selection system
 * Following Domain-Driven Design principles
 */

export type SelectableElementType = 'component' | 'evolved-component' | 'link';

export interface ISelectableElement {
    readonly id: string;
    readonly type: SelectableElementType;
    readonly name: string;
}

export interface IComponentElement extends ISelectableElement {
    readonly type: 'component' | 'evolved-component';
    readonly componentData: unknown;
}

export interface ILinkElement extends ISelectableElement {
    readonly type: 'link';
    readonly linkData: {
        readonly start: string;
        readonly end: string;
        readonly flow?: boolean;
        readonly flowValue?: string;
        readonly line: number;
    };
}

export type SelectableElement = IComponentElement | ILinkElement;

/**
 * Type guards for safe type checking
 */
export const isComponentElement = (element: ISelectableElement): element is IComponentElement => {
    return element.type === 'component' || element.type === 'evolved-component';
};

export const isLinkElement = (element: ISelectableElement): element is ILinkElement => {
    return element.type === 'link';
};
