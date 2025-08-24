import {useCallback, useEffect} from 'react';
import {MapSize} from '../../../types/base';

interface UseMapDimensionsProps {
    mapSize: MapSize;
    mapOnlyView: boolean;
    hideNav: boolean;
    setMapDimensions: (dimensions: {width: number; height: number}) => void;
    setMapCanvasDimensions: (dimensions: {width: number; height: number}) => void;
}

interface UseMapDimensionsReturn {
    getHeight: () => number;
    getWidth: () => number;
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
    let timer: NodeJS.Timeout | null;

    return function (this: any, ...args: Parameters<T>): void {
        clearTimeout(timer!);
        timer = setTimeout(() => {
            timer = null;
            fn.apply(this, args);
        }, ms);
    };
}

export const useMapDimensions = (props: UseMapDimensionsProps): UseMapDimensionsReturn => {
    const {mapSize, mapOnlyView, hideNav, setMapDimensions, setMapCanvasDimensions} = props;

    const getHeight = useCallback(() => {
        const mapElement = document.getElementById('map');
        const clientHeight = mapElement?.clientHeight;

        // If map element doesn't exist or has no height, fall back to window calculation
        if (!clientHeight || clientHeight < 100) {
            const winHeight = window.innerHeight;
            const topNavHeight = document.getElementById('top-nav-wrapper')?.clientHeight;
            const titleHeight = document.getElementById('title')?.clientHeight;
            return winHeight - (topNavHeight || 0) - (titleHeight || 0) - 65; // Fallback calculation
        }

        // Use the actual map container height with margin for toolbar area
        // The toolbar is positioned absolutely at bottom: 20px, so we need some space for it
        return Math.max(clientHeight - 60, 400); // Increased margin to account for toolbar
    }, []);

    const getWidth = useCallback(() => {
        const mapElement = document.getElementById('map');
        const clientWidth = mapElement?.clientWidth;
        // If map element doesn't exist or has no width, use window width with some margin
        if (!clientWidth || clientWidth < 100) {
            return Math.max(window.innerWidth - 100, 800); // Fallback to reasonable minimum
        }
        return Math.max(clientWidth - 10, 600); // Minimal margin, ensure reasonable minimum
    }, []);

    // Update map dimensions when layout changes
    useEffect(() => {
        setMapDimensions({
            width: mapSize.width > 0 ? mapSize.width : 100 + getWidth(),
            height: mapSize.height > 0 ? mapSize.height : getHeight(),
        });
    }, [mapOnlyView, hideNav, mapSize, setMapDimensions, getWidth, getHeight]);

    // Handle window resize events with debouncing
    useEffect(() => {
        const debouncedHandleResize = debounce(() => {
            const dimensions = {
                width: mapSize.width > 0 ? mapSize.width : 100 + getWidth(),
                height: mapSize.height > 0 ? mapSize.height : getHeight(),
            };
            setMapDimensions(dimensions);
        }, 1);

        // Handle standard window resize events (but not panel resizes)
        const handleWindowResize = (event: Event) => {
            // Only handle if it's not a programmatically dispatched event from panel resize
            if (!event.isTrusted) return;
            debouncedHandleResize();
        };

        window.addEventListener('resize', handleWindowResize);
        debouncedHandleResize();

        return () => window.removeEventListener('resize', handleWindowResize);
    }, [mapSize, setMapDimensions, getWidth, getHeight]);

    // Handle canvas dimensions for initial load and layout changes
    useEffect(() => {
        const newDimensions = {
            width: mapSize.width > 0 ? mapSize.width : 100 + getWidth(),
            height: mapSize.height > 0 ? mapSize.height : getHeight(),
        };
        setMapDimensions(newDimensions);
        setMapCanvasDimensions({
            width: getWidth(),
            height: getHeight(),
        });
    }, [mapOnlyView, hideNav, setMapDimensions, setMapCanvasDimensions, mapSize, getWidth, getHeight]);

    // Handle canvas resize events with debouncing and panel resize coordination
    useEffect(() => {
        const initialLoad = () => {
            setMapCanvasDimensions({
                width: getWidth(),
                height: getHeight(),
            });
        };

        const debouncedHandleCanvasResize = debounce(() => {
            setMapCanvasDimensions({
                width: getWidth(),
                height: getHeight(),
            });
        }, 500);

        // Handle panel resize events specifically
        const handlePanelResize = (event: CustomEvent) => {
            // Update both map dimensions and canvas dimensions when panel resizes
            // This should work exactly like browser window resize
            setTimeout(() => {
                const newWidth = getWidth();
                const newHeight = getHeight();

                // Update map dimensions (like window resize does)
                const dimensions = {
                    width: mapSize.width > 0 ? mapSize.width : 100 + newWidth,
                    height: mapSize.height > 0 ? mapSize.height : newHeight,
                };
                setMapDimensions(dimensions);

                // Update canvas dimensions
                setMapCanvasDimensions({
                    width: newWidth,
                    height: newHeight,
                });
            }, 200); // Delay to ensure DOM has fully updated and map container has resized
        };

        // Handle toolbar snap events specifically
        const handleToolbarSnap = (event: CustomEvent) => {
            // Update both map dimensions and canvas dimensions when toolbar snaps/unsnaps
            // This should work exactly like panel resize events
            setTimeout(() => {
                const newWidth = getWidth();
                const newHeight = getHeight();

                // Update map dimensions (like panel resize does)
                const dimensions = {
                    width: mapSize.width > 0 ? mapSize.width : 100 + newWidth,
                    height: mapSize.height > 0 ? mapSize.height : newHeight,
                };
                setMapDimensions(dimensions);

                // Update canvas dimensions
                setMapCanvasDimensions({
                    width: newWidth,
                    height: newHeight,
                });
            }, 200); // Delay to ensure DOM has fully updated and map container has resized
        };

        // Handle standard window resize events (but not panel resizes)
        const handleWindowResize = (event: Event) => {
            // Only handle if it's not a programmatically dispatched event from panel resize
            if (!event.isTrusted) return;
            debouncedHandleCanvasResize();
        };

        window.addEventListener('load', initialLoad);
        window.addEventListener('resize', handleWindowResize);
        window.addEventListener('panelResize', handlePanelResize as EventListener);
        window.addEventListener('toolbarSnap', handleToolbarSnap as EventListener);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
            window.removeEventListener('load', initialLoad);
            window.removeEventListener('panelResize', handlePanelResize as EventListener);
            window.removeEventListener('toolbarSnap', handleToolbarSnap as EventListener);
        };
    }, [setMapDimensions, setMapCanvasDimensions, mapSize, getWidth, getHeight]);

    return {
        getHeight,
        getWidth,
    };
};
