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

    return (
        <ButtonGroup orientation="horizontal" aria-label="button group">
            <IconButton
                id="wm-map-select"
                aria-label={'Select'}
                onClick={event => handleChangeTool(event, TOOL_NONE)}
                sx={tool === TOOL_NONE ? SelectedIconButtonStyle : IconButtonStyle}>
                <HandIcon />
            </IconButton>
            <IconButton
                id="wm-map-pan"
                aria-label={'Pan'}
                onClick={event => handleChangeTool(event, TOOL_PAN)}
                sx={tool === TOOL_PAN ? SelectedIconButtonStyle : IconButtonStyle}>
                <PanIcon />
            </IconButton>
            <IconButton
                id="wm-zoom-in"
                aria-label={'Zoom In'}
                sx={tool === TOOL_ZOOM_IN ? SelectedIconButtonStyle : IconButtonStyle}
                onClick={event => handleChangeTool(event, TOOL_ZOOM_IN)}>
                <ZoomInIcon />
            </IconButton>
            <IconButton
                id="wm-zoom-out"
                aria-label={'Zoom Out'}
                sx={tool === TOOL_ZOOM_OUT ? SelectedIconButtonStyle : IconButtonStyle}
                onClick={event => handleChangeTool(event, TOOL_ZOOM_OUT)}>
                <ZoomOutIcon />
            </IconButton>
            <IconButton id="wm-map-fit" aria-label={'Fit'} sx={IconButtonStyle} onClick={() => _fitToViewer()}>
                <FitScreenIcon />
            </IconButton>
            <IconButton id="wm-map-fullscreen" onClick={() => shouldHideNav()} aria-label={hideNav ? 'Exit Fullscreen' : 'Fullscreen'}>
                {hideNav ? <FullscreenExitIcon sx={IconButtonStyle} /> : <FullscreenIcon sx={IconButtonStyle} />}
            </IconButton>
        </ButtonGroup>
    );
};

export default MapCanvasToolbar;
