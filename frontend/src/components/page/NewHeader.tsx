import MoreVertIcon from '@mui/icons-material/MoreVert';
import {MenuListProps, PopoverVirtualElement, Stack} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {alpha, styled} from '@mui/material/styles';
import React, {FunctionComponent, MouseEvent, useRef, useState} from 'react';
import {ExampleMap, MapPersistenceStrategy} from '../../constants/defaults';
import CoreHeader from './CoreHeader';

interface StyledMenuProps {
    id: string;
    MenuListProps: MenuListProps;
    anchorEl: Element | PopoverVirtualElement | (() => Element) | (() => PopoverVirtualElement) | null | undefined;
    open: boolean;
    onClose: (preAction: () => void) => void;
    children: React.ReactNode;
}

const StyledMenu = styled(Menu)<StyledMenuProps>(({theme}) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
            },
            '&:active': {
                backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
            },
        },
    },
}));

export interface NewHeaderProps {
    saveOutstanding: any;
    saveMapClick: any;
    mutateMapText: any;
    newMapClick: any;
    downloadMapImage: any;
    currentUrl: any;
    setShowLineNumbers: any;
    showLineNumbers: any;
    setShowLinkedEvolved: any;
    showLinkedEvolved: any;
    downloadMapAsSVG: any;
    setMapOnlyView: any;
    mapOnlyView: any;
    toggleMenu: any;
}

export const NewHeader: FunctionComponent<NewHeaderProps> = ({
    saveOutstanding,
    saveMapClick,
    mutateMapText,
    newMapClick,
    downloadMapImage,
    currentUrl,
    setShowLineNumbers,
    showLineNumbers,
    setShowLinkedEvolved,
    showLinkedEvolved,
    downloadMapAsSVG,
    setMapOnlyView,
    mapOnlyView,
    toggleMenu,
}) => {
    const [anchorMoreEl, setAnchorMoreEl] = useState<Element | null>();
    const [modalShow, setModalShow] = useState(false);
    const example = () => {
        mutateMapText(ExampleMap);
    };
    const textArea = useRef(null);
    const copyCodeToClipboard = () => {
        const copyUrl = currentUrl.replace('#', '#clone:');
        navigator.clipboard.writeText(copyUrl);
    };

    const openMore = Boolean(anchorMoreEl);

    const handleMoreClick = (event: MouseEvent) => {
        setAnchorMoreEl(event.currentTarget);
    };

    const handleMoreClose = (preAction: () => void) => {
        if (preAction) preAction();
        setAnchorMoreEl(null);
    };

    const moreMenu = (
        <StyledMenu
            id="more-menu"
            MenuListProps={{
                'aria-labelledby': 'more-menu-button',
            }}
            anchorEl={anchorMoreEl}
            open={openMore}
            onClose={handleMoreClose}>
            <MenuItem disableRipple onClick={() => handleMoreClose(() => setModalShow(true))}>
                Get Clone URL
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleMoreClose(() => downloadMapImage())} disableRipple>
                Download as PNG
            </MenuItem>
            <MenuItem onClick={() => handleMoreClose(() => downloadMapAsSVG())} disableRipple>
                Download as SVG
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleMoreClose(() => setShowLineNumbers(!showLineNumbers))} disableRipple>
                {showLineNumbers ? 'Hide Line Numbers' : 'Show Line Numbers'}
            </MenuItem>
            <MenuItem onClick={() => handleMoreClose(() => setShowLinkedEvolved(!showLinkedEvolved))} disableRipple>
                {showLinkedEvolved ? 'Hide Evolved Links' : 'Show Evolved Links'}
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleMoreClose(() => window.open('https://docs.onlinewardleymaps.com'))} disableRipple>
                Usage Guide
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleMoreClose(() => window.open('https://www.patreon.com/mapsascode'))} disableRipple>
                Become a Patron ❤️
            </MenuItem>
        </StyledMenu>
    );
    return (
        <CoreHeader toggleMenu={toggleMenu}>
            <Stack direction="row" alignItems="flex-start" spacing={0.5} divider={<Divider orientation="vertical" flexItem />}>
                <Button color="inherit" size="small" onClick={() => setMapOnlyView(!mapOnlyView)}>
                    {mapOnlyView ? 'Editor Mode' : 'Presentation Mode'}
                </Button>

                <Button color="inherit" size="small" onClick={example}>
                    Example Map
                </Button>
                <Button
                    color="inherit"
                    size="small"
                    variant="text"
                    id="new-menu-button"
                    onClick={() => newMapClick(MapPersistenceStrategy.Legacy)}>
                    New
                </Button>

                <Button
                    color={saveOutstanding ? 'error' : 'inherit'}
                    size="small"
                    onClick={saveMapClick}
                    variant={saveOutstanding ? 'outlined' : 'text'}
                    sx={saveOutstanding ? {backgroundColor: '#d32f2f', color: 'white'} : null}>
                    Save
                </Button>

                <Button
                    color="inherit"
                    size="small"
                    variant="text"
                    onClick={handleMoreClick}
                    id="more-menu-button"
                    aria-controls={openMore ? 'more-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMore ? 'true' : undefined}>
                    <MoreVertIcon />
                </Button>
            </Stack>

            {moreMenu}

            <Dialog open={modalShow} onClose={() => setModalShow(false)}>
                <DialogTitle>Clone URL</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You can share this URL with others to allow them to create a new map using this map as its initial state.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        ref={textArea}
                        id="name"
                        label="Url"
                        fullWidth
                        variant="standard"
                        value={currentUrl.replace('#', '#clone:')}
                    />
                    <Button onClick={() => copyCodeToClipboard()}>Copy</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalShow(false)}>Cancel</Button>
                    <Button onClick={saveMapClick}>Save Map</Button>
                </DialogActions>
            </Dialog>
        </CoreHeader>
    );
};

export default NewHeader;
