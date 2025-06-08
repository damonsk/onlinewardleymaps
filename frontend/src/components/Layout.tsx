import CssBaseline from '@mui/material/CssBaseline';
import {Theme, ThemeProvider} from '@mui/material/styles';
import React, {ReactNode} from 'react';

interface LayoutProps {
    children: ReactNode;
    currentTheme: Theme;
}

const Layout: React.FC<LayoutProps> = ({children, currentTheme}) => {
    return (
        <ThemeProvider theme={currentTheme}>
            <CssBaseline />
            <React.Fragment>{children}</React.Fragment>
        </ThemeProvider>
    );
};

export default Layout;
