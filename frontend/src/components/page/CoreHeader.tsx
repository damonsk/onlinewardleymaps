import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, {ReactNode} from 'react';
import {useI18n} from '../../hooks/useI18n';

export interface CoreHeaderProps {
    toggleMenu: any;
    children?: ReactNode;
}

const CoreHeader: React.FC<CoreHeaderProps> = ({children, toggleMenu}) => {
    const {t} = useI18n();
    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label={t('navigation.menu', 'menu')}
                        sx={{mr: 2}}
                        onClick={toggleMenu}>
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            display: {xs: 'none', sm: 'block'},
                        }}>
                        {t('app.title', 'Wardley Maps')}
                    </Typography>
                    {children}
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default CoreHeader;
