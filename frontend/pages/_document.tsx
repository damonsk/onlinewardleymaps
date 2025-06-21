import Document, {DocumentContext, Head, Html, Main, NextScript} from 'next/document';

class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);
        return initialProps;
    }

    render() {
        const {locale} = this.props;

        return (
            <Html lang={locale || 'en'}>
                <Head>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="application-name" content="Online Wardley Maps" />
                    <meta
                        name="description"
                        content="Create and share Wardley Maps online. A visual tool for strategic planning and understanding the evolution of business and technology components."
                    />
                    <meta
                        name="keywords"
                        content="wardley maps, strategy, business planning, strategic mapping, simon wardley, evolution, value chain"
                    />
                    <meta name="author" content="Damon Skelhorn" />
                    <meta name="robots" content="index, follow" />
                    <meta name="referrer" content="origin-when-cross-origin" />

                    {/* PWA/Mobile App */}
                    <meta name="mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                    <meta name="apple-mobile-web-app-title" content="Wardley Maps" />

                    {/* Open Graph / Facebook */}
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content="Online Wardley Maps" />
                    <meta property="og:url" content="https://onlinewardleymaps.com" />
                    <meta
                        property="og:description"
                        content="Create and share Wardley Maps online. A visual tool for strategic planning and understanding the evolution of business and technology components."
                    />
                    <meta property="og:site_name" content="Online Wardley Maps" />
                    <meta property="og:locale" content={locale || 'en'} />
                    <meta property="og:image" content="https://onlinewardleymaps.com/android-chrome-512x512.png" />
                    <meta property="og:image:width" content="512" />
                    <meta property="og:image:height" content="512" />
                    <meta property="og:image:alt" content="Online Wardley Maps Logo" />

                    {/* Twitter */}
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:title" content="Online Wardley Maps" />
                    <meta
                        name="twitter:description"
                        content="Create and share Wardley Maps online. A visual tool for strategic planning."
                    />
                    <meta name="twitter:site" content="@MapsAsCode" />
                    <meta name="twitter:image" content="https://onlinewardleymaps.com/android-chrome-512x512.png" />

                    {/* Favicon */}
                    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                    <link rel="manifest" href="/manifest.json" />

                    {/* Theme color */}
                    <meta name="theme-color" content="#1976d2" />
                    <meta name="msapplication-TileColor" content="#1976d2" />

                    {/* Language alternates for SEO */}
                    <link rel="alternate" hrefLang="en" href="https://onlinewardleymaps.com/en" />
                    <link rel="alternate" hrefLang="es" href="https://onlinewardleymaps.com/es" />
                    <link rel="alternate" hrefLang="fr" href="https://onlinewardleymaps.com/fr" />
                    <link rel="alternate" hrefLang="de" href="https://onlinewardleymaps.com/de" />
                    <link rel="alternate" hrefLang="it" href="https://onlinewardleymaps.com/it" />
                    <link rel="alternate" hrefLang="pt" href="https://onlinewardleymaps.com/pt" />
                    <link rel="alternate" hrefLang="ja" href="https://onlinewardleymaps.com/ja" />
                    <link rel="alternate" hrefLang="zh" href="https://onlinewardleymaps.com/zh" />
                    <link rel="alternate" hrefLang="ko" href="https://onlinewardleymaps.com/ko" />
                    <link rel="alternate" hrefLang="ru" href="https://onlinewardleymaps.com/ru" />
                    <link rel="alternate" hrefLang="x-default" href="https://onlinewardleymaps.com" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
