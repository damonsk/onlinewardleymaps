import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet as StyledServerStyleSheet } from 'styled-components';
import MuiServerStyleSheets from '@mui/styles/ServerStyleSheets';
import { theme } from '../src/theme';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const muiSheets = new MuiServerStyleSheets();
    const styledSesheets = new StyledServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            styledSesheets.collectStyles(muiSheets.collect(<App {...props} />)),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {muiSheets.getStyleElement()}
            {styledSesheets.getStyleElement()}
          </>
        ),
      };
    } finally {
      styledSesheets.seal();
    }
  }
  render() {
    return (
      <Html lang="ja">
        <Head>
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;450;500;550;600;700&display=swap"
          />
          <link rel="shortcut icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
