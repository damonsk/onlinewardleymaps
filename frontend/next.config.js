const {i18n} = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    i18n,
    compiler: {
        styledComponents: true,
    },
    webpack: (config, {isServer}) => {
        // Fixes npm packages that depend on `fs` module
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
            };
        }
        return config;
    },
    turbopack: {
        root: __dirname,
        resolveAlias: {
            // Turbopack equivalent of webpack resolve.fallback
            // Only polyfill fs for browser/client-side code
            fs: {
                browser: require.resolve('./fs-polyfill.js'),
            },
        },
    },
};

module.exports = nextConfig;
