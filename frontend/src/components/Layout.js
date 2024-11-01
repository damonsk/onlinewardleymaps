import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const Layout = (props) => {
	const { children, currentTheme } = props;
	return (
		<ThemeProvider theme={currentTheme}>
			<CssBaseline />
			<React.Fragment>{children}</React.Fragment>
		</ThemeProvider>
	);
};

export default Layout;
