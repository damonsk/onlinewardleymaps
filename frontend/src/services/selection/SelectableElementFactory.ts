import {UnifiedComponent} from '../../types/unified/components';
import {IComponentElement, ILinkElement, SelectableElement} from './SelectionTypes';

/**
 * Factory for creating selectable elements
 * Single Responsibility: Only creates selection elements
 * Open/Closed: Easy to add new element types
 */
export class SelectableElementFactory {
    public static createComponent(component: UnifiedComponent): IComponentElement {
        return {
            id: String(component.id || component.name),
            type: component.evolved ? 'evolved-component' : 'component',
            name: component.name,
            componentData: component,
        };
    }

    public static createLink(linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number}): ILinkElement {
        const linkId = `${linkInfo.start}->${linkInfo.end}`;
        return {
            id: linkId,
            type: 'link',
            name: `${linkInfo.start} → ${linkInfo.end}`,
            linkData: linkInfo,
        };
    }

    public static createElement(input: UnifiedComponent | typeof linkInfo): SelectableElement {
        // Type guard to determine the input type
        if ('start' in input && 'end' in input) {
            return this.createLink(input);
        } else {
            return this.createComponent(input as UnifiedComponent);
        }
    }
}
