// Add ambient declarations for modules that don't have type definitions
declare module 'next/router';
declare module 'react-i18next';
declare module '@mui/material' {
  export * from '@mui/material';
}
declare module '@mui/material/*';
declare module '@mui/styles';
declare module '@mui/icons-material/*';
declare module 'lodash.merge';

// For JSX support
import * as React from 'react';
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
