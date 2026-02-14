import PanIcon from '@mui/icons-material/ControlCamera';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import HandIcon from '@mui/icons-material/PanToolAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

import React, {MouseEvent} from 'react';
import {TOOL_NONE, TOOL_PAN, TOOL_ZOOM_IN, TOOL_ZOOM_OUT} from 'react-svg-pan-zoom';
import styled from 'styled-components';
import {useI18n} from '../../hooks/useI18n';

interface MapCanvasToolbarProps {
    shouldHideNav: () => void;
    hideNav: boolean;
    tool: string;
    handleChangeTool: (event: MouseEvent<HTMLButtonElement>, newTool: string) => void;
    _fitToViewer: () => void;
}

/**
 * Styled toolbar container matching the WYSIWYG toolbar design
 */
const StyledToolbarContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 4px;
    background: transparent;
    border-radius: 8px;
    padding: 0;
`;

/**
 * Styled button matching the WYSIWYG toolbar buttons
 */
const StyledToolbarButton = styled.button<{$isSelected: boolean}>`
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 6px;
    background: ${props => (props.$isSelected ? '#e3f2fd' : 'transparent')};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    position: relative;
    outline: none;
    color: ${props => (props.$isSelected ? '#1976d2' : 'rgba(0, 0, 0, 0.54)')};

    /* Hover state */
    &:hover {
        background: ${props => (props.$isSelected ? '#e3f2fd' : '#f5f5f5')};
        transform: scale(1.05);
    }

    /* Active state */
    &:active {
        transform: scale(0.95);
    }

    /* Focus state for keyboard navigation */
    &:focus-visible {
        outline: 2px solid #1976d2;
        outline-offset: 2px;
    }

    /* Selected state indicator */
    ${props =>
        props.$isSelected &&
        `
        &::after {
            content: '';
            position: absolute;
            left: -2px;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 20px;
            background: #1976d2;
            border-radius: 2px;
        }
    `}

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
        background: ${props => (props.$isSelected ? '#3182ce' : 'transparent')};
        color: ${props => (props.$isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)')};

        &:hover {
            background: ${props => (props.$isSelected ? '#3182ce' : '#4a5568')};
        }

        &:focus-visible {
            outline-color: #63b3ed;
        }

        ${props =>
            props.$isSelected &&
            `
            &::after {
                background: #63b3ed;
            }
        `}
    }

    /* Responsive behavior */
    @media (max-width: 1200px) {
        width: 32px;
        height: 32px;
    }

    @media (max-width: 768px) {
        width: 28px;
        height: 28px;
    }
`;

/**
 * Icon container with consistent scaling to match WYSIWYG toolbar
 */
const IconContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;

    /* MUI icons need explicit sizing (they are smaller than toolbar SVG symbols when scaled) */
    & > svg {
        width: 22px;
        height: 22px;
        font-size: 22px;
    }

    /* Responsive scaling */
    @media (max-width: 1200px) {
        & > svg {
            width: 20px;
            height: 20px;
            font-size: 20px;
        }
    }

    @media (max-width: 768px) {
        & > svg {
            width: 18px;
            height: 18px;
            font-size: 18px;
        }
    }
`;

const MapCanvasToolbar: React.FC<MapCanvasToolbarProps> = ({shouldHideNav, hideNav, tool, handleChangeTool, _fitToViewer}) => {
    const {t} = useI18n();

    return (
        <StyledToolbarContainer>
            <StyledToolbarButton
                id="wm-map-select"
                aria-label={t('map.toolbar.select', 'Select')}
                onClick={event => handleChangeTool(event, TOOL_NONE)}
                $isSelected={tool === TOOL_NONE}>
                <IconContainer>
                    <HandIcon />
                </IconContainer>
            </StyledToolbarButton>
            <StyledToolbarButton
                id="wm-map-pan"
                aria-label={t('map.toolbar.pan', 'Pan')}
                onClick={event => handleChangeTool(event, TOOL_PAN)}
                $isSelected={tool === TOOL_PAN}>
                <IconContainer>
                    <PanIcon />
                </IconContainer>
            </StyledToolbarButton>
            <StyledToolbarButton
                id="wm-zoom-in"
                aria-label={t('map.toolbar.zoomIn', 'Zoom In')}
                onClick={event => handleChangeTool(event, TOOL_ZOOM_IN)}
                $isSelected={tool === TOOL_ZOOM_IN}>
                <IconContainer>
                    <ZoomInIcon />
                </IconContainer>
            </StyledToolbarButton>
            <StyledToolbarButton
                id="wm-zoom-out"
                aria-label={t('map.toolbar.zoomOut', 'Zoom Out')}
                onClick={event => handleChangeTool(event, TOOL_ZOOM_OUT)}
                $isSelected={tool === TOOL_ZOOM_OUT}>
                <IconContainer>
                    <ZoomOutIcon />
                </IconContainer>
            </StyledToolbarButton>
            <StyledToolbarButton
                id="wm-map-fit"
                aria-label={t('map.toolbar.fit', 'Fit')}
                onClick={() => _fitToViewer()}
                $isSelected={false}>
                <IconContainer>
                    <FitScreenIcon />
                </IconContainer>
            </StyledToolbarButton>
            <StyledToolbarButton
                id="wm-map-fullscreen"
                onClick={() => shouldHideNav()}
                aria-label={hideNav ? t('map.toolbar.exitFullscreen', 'Exit Fullscreen') : t('map.toolbar.fullscreen', 'Fullscreen')}
                $isSelected={false}>
                <IconContainer>{hideNav ? <FullscreenExitIcon /> : <FullscreenIcon />}</IconContainer>
            </StyledToolbarButton>
        </StyledToolbarContainer>
    );
};

export default MapCanvasToolbar;
