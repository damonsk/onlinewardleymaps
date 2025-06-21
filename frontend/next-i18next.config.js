const path = require('path');

module.exports = {
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ko', 'ru'],
    },
    localePath: path.resolve('./public/locales'),
    reloadOnPrerender: process.env.NODE_ENV === 'development',
    fallbackLng: 'en',
    debug: false, // Disable debug to reduce warnings
    react: {
        useSuspense: false,
    },
    // Ensure translation keys are loaded on the server
    interpolation: {
        escapeValue: false,
    },
    // Suppress SSG warnings
    initImmediate: false,
};
