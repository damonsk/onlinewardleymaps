import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#23222f',
      paper: '#353347',
    },
    action: {
      active: '#90caf9',
    },
  },
  typography: {
    fontFamily: '"Exo 2",Lato,Lato2,sans-serif',
    h1: {
      fontFamily: '"Exo 2",Lato,Lato2,sans-serif',
      fontSize: '34px',
      // lineHeight: '42px',
      fontWeight: '700',
    },
    h2: {
      fontFamily: '"Exo 2",Lato,Lato2,sans-serif',
    },
    h3: {
      fontFamily: '"Exo 2",Lato,Lato2,sans-serif',
      fontSize: '18px',
      // lineHeight: '24px',
      fontWeight: '600',
    },
    h4: {
      fontFamily: '"Exo 2",Lato,Lato2,sans-serif',
    },
    h5: {
      fontFamily: '"Exo 2",Lato,Lato2,sans-serif',
      fontSize: '18px',
    },
    caption: {
      fontFamily: 'Lato,Lato2,sans-serif',
    },
    body1: {
      fontFamily: 'Lato,Lato2,sans-serif',
      color: 'rgba(255,255,255,.8)',
      fontSize: '14px',
    },
    body2: {
      fontFamily: 'Lato,Lato2,sans-serif',
    },
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
  typography: {
    fontFamily: '"Exo 2",Lato,Lato2,sans-serif',
    h1: {
      fontFamily: '"Exo 2",Lato,Lato2,sans-serif',
      fontSize: '34px',
      // lineHeight: '42px',
      fontWeight: '700',
    },
    h2: {
      fontFamily: '"Exo 2",Lato,Lato2,sans-serif',
    },
    h3: {
      fontFamily: '"Exo 2",Lato,Lato2,sans-serif',
      fontSize: '18px',
      // lineHeight: '24px',
      fontWeight: '600',
    },
    h4: {
      fontFamily: '"Exo 2",Lato,Lato2,sans-serif',
    },
    h5: {
      fontFamily: '"Exo 2",Lato,Lato2,sans-serif',
      fontSize: '18px',
    },
    caption: {
      fontFamily: 'Lato,Lato2,sans-serif',
    },
    body1: {
      fontFamily: 'Lato,Lato2,sans-serif',
      fontSize: '14px',
    },
    body2: {
      fontFamily: 'Lato,Lato2,sans-serif',
    },
  },
});
export { lightTheme, theme };
