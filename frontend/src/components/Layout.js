import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import React from 'react';

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
