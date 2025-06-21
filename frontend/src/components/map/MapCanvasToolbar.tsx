import PanIcon from '@mui/icons-material/ControlCamera';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import HandIcon from '@mui/icons-material/PanToolAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

import {ButtonGroup, IconButton} from '@mui/material';
import React, {MouseEvent} from 'react';
import {TOOL_NONE, TOOL_PAN, TOOL_ZOOM_IN, TOOL_ZOOM_OUT} from 'react-svg-pan-zoom';
import {useI18n} from '../../hooks/useI18n';

interface MapCanvasToolbarProps {
    shouldHideNav: () => void;
    hideNav: boolean;
    tool: string;
    handleChangeTool: (event: MouseEvent<HTMLButtonElement>, newTool: string) => void;
    _fitToViewer: () => void;
}

const MapCanvasToolbar: React.FC<MapCanvasToolbarProps> = ({shouldHideNav, hideNav, tool, handleChangeTool, _fitToViewer}) => {
    const SelectedIconButtonStyle = {color: '#90caf9'};
    const IconButtonStyle = {color: 'rgba(0, 0, 0, 0.54)'};
    const {t} = useI18n();

    return (
        <ButtonGroup orientation="horizontal" aria-label={t('map.toolbar.group', 'button group')}>
            <IconButton
                id="wm-map-select"
                aria-label={t('map.toolbar.select', 'Select')}
                onClick={event => handleChangeTool(event, TOOL_NONE)}
                sx={tool === TOOL_NONE ? SelectedIconButtonStyle : IconButtonStyle}>
                <HandIcon />
            </IconButton>
            <IconButton
                id="wm-map-pan"
                aria-label={t('map.toolbar.pan', 'Pan')}
                onClick={event => handleChangeTool(event, TOOL_PAN)}
                sx={tool === TOOL_PAN ? SelectedIconButtonStyle : IconButtonStyle}>
                <PanIcon />
            </IconButton>
            <IconButton
                id="wm-zoom-in"
                aria-label={t('map.toolbar.zoomIn', 'Zoom In')}
                sx={tool === TOOL_ZOOM_IN ? SelectedIconButtonStyle : IconButtonStyle}
                onClick={event => handleChangeTool(event, TOOL_ZOOM_IN)}>
                <ZoomInIcon />
            </IconButton>
            <IconButton
                id="wm-zoom-out"
                aria-label={t('map.toolbar.zoomOut', 'Zoom Out')}
                sx={tool === TOOL_ZOOM_OUT ? SelectedIconButtonStyle : IconButtonStyle}
                onClick={event => handleChangeTool(event, TOOL_ZOOM_OUT)}>
                <ZoomOutIcon />
            </IconButton>
            <IconButton id="wm-map-fit" aria-label={t('map.toolbar.fit', 'Fit')} sx={IconButtonStyle} onClick={() => _fitToViewer()}>
                <FitScreenIcon />
            </IconButton>
            <IconButton
                id="wm-map-fullscreen"
                onClick={() => shouldHideNav()}
                aria-label={hideNav ? t('map.toolbar.exitFullscreen', 'Exit Fullscreen') : t('map.toolbar.fullscreen', 'Fullscreen')}>
                {hideNav ? <FullscreenExitIcon sx={IconButtonStyle} /> : <FullscreenIcon sx={IconButtonStyle} />}
            </IconButton>
        </ButtonGroup>
    );
};

export default MapCanvasToolbar;
