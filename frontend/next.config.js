const {i18n} = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    i18n,
    compiler: {
        styledComponents: true,
    },
    turbopack: {
        root: __dirname,
    },
};

module.exports = nextConfig;
