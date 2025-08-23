import { useCallback, useEffect, useRef, useState } from 'react';
import { ISelectionObserver, ISelectionService } from '../services/selection/ISelectionService';
import { SelectableElementFactory } from '../services/selection/SelectableElementFactory';
import { SelectionService } from '../services/selection/SelectionService';
import { SelectableElement, isComponentElement, isLinkElement } from '../services/selection/SelectionTypes';
import { UnifiedComponent } from '../types/unified/components';

/**
 * React adapter for the selection service
 * Single Responsibility: Only handles React integration
 * Dependency Inversion: Depends on abstractions, not concrete classes
 */
export const useSelectionService = () => {
    const selectionServiceRef = useRef<ISelectionService<SelectableElement>>(new SelectionService());
    const [selectionVersion, setSelectionVersion] = useState(0);

    // Observer to trigger React re-renders when selection changes
    const reactObserver = useRef<ISelectionObserver>({
        onSelectionChanged: () => {
            setSelectionVersion(prev => prev + 1);
        },
    });

    useEffect(() => {
        const service = selectionServiceRef.current as SelectionService;
        service.addObserver(reactObserver.current);

        return () => {
            service.removeObserver(reactObserver.current);
        };
    }, []);

    const selectComponent = useCallback((component: UnifiedComponent) => {
        const element = SelectableElementFactory.createComponent(component);
        selectionServiceRef.current.select(element);
    }, []);

    const selectLink = useCallback((linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number}) => {
        const element = SelectableElementFactory.createLink(linkInfo);
        selectionServiceRef.current.select(element);
    }, []);

    const clearSelection = useCallback(() => {
        selectionServiceRef.current.deselect();
    }, []);

    const isSelected = useCallback(
        (elementId: string): boolean => {
            return selectionServiceRef.current.isSelected(elementId);
        },
        [selectionVersion],
    ); // Depend on selectionVersion to trigger re-evaluation

    const getSelectedElement = useCallback((): SelectableElement | null => {
        return selectionServiceRef.current.getSelected();
    }, [selectionVersion]);

    const getSelectedLink = useCallback(() => {
        const selected = selectionServiceRef.current.getSelected();
        if (selected && isLinkElement(selected)) {
            return {
                id: selected.id,
                linkData: selected.linkData,
            };
        }
        return null;
    }, [selectionVersion]);

    const getSelectedComponent = useCallback(() => {
        const selected = selectionServiceRef.current.getSelected();
        if (selected && isComponentElement(selected)) {
            return {
                id: selected.id,
                componentData: selected.componentData,
            };
        }
        return null;
    }, [selectionVersion]);

    return {
        selectComponent,
        selectLink,
        clearSelection,
        isSelected,
        getSelectedElement,
        getSelectedLink,
        getSelectedComponent,
    };
};
