const presets = [
    [
        '@babel/env',
        {
            useBuiltIns: 'usage',
            corejs: 3,
        },
        'react-app',
    ],
    '@babel/preset-react',
];
const env = {
    test: {
        plugins: ['require-context-hook'],
    },
};
module.exports = api => {
    const isTest = api.env('test');

    return isTest === false
        ? {
              presets: ['next/babel'],
              plugins: [],
          }
        : { presets, env };
};
