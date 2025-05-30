import { makeStyles } from '@mui/styles';

import { UncontrolledReactSVGPanZoom } from 'react-svg-pan-zoom';

const useStyles = makeStyles(() => ({
    mapCanvas: {
        userSelect: 'none',
    },
}));

export function MapSVGContainer({
    viewerRef,
    tool,
    mapCanvasDimensions,
    mapDimensions,
    allowMapZoomMouseWheel,
    showMiniMap,
    mapStyleDefs,
    onDoubleClick,
    onZoom,
    onZoomReset,
    // onMouseMove,
    children,
}) {
    const styles = useStyles();

    return (
        <UncontrolledReactSVGPanZoom
            ref={viewerRef}
            id="wm-svg-pan-zoom"
            SVGBackground="white"
            tool={tool}
            width={mapCanvasDimensions.width + 90}
            height={mapCanvasDimensions.height + 30}
            detectAutoPan={false}
            detectWheel={allowMapZoomMouseWheel}
            miniatureProps={{ position: showMiniMap ? 'right' : 'none' }}
            toolbarProps={{ position: 'none' }}
            SVGStyle={{
                x: '-30',
                y: '-40',
                height: mapDimensions.height + 90,
                width: mapDimensions.width + 60,
            }}
            fontFamily={mapStyleDefs.fontFamily}
            fontSize={mapStyleDefs.fontSize}
            background="#eee"
            onDoubleClick={onDoubleClick}
            // onMouseMove={onMouseMove}
            onZoom={onZoom}
            onZoomReset={onZoomReset}
            style={{
                userSelect: 'none',
                fontFamily: mapStyleDefs.fontFamily,
            }}
        >
            <svg
                className={[mapStyleDefs.className, styles.mapCanvas].join(' ')}
                width={mapDimensions.width + 2}
                height={mapDimensions.height + 4}
                id="svgMap"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                {children}
            </svg>
        </UncontrolledReactSVGPanZoom>
    );
}
