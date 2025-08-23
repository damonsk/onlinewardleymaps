import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn().mockResolvedValue(undefined),
        pathname: '/',
        query: {},
        asPath: '/',
        locale: 'en',
        locales: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ko', 'ru'],
        defaultLocale: 'en',
        isReady: true,
        isFallback: false,
        isPreview: false,
        events: {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
        },
    }),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, fallback) => fallback || key,
        i18n: {
            language: 'en',
            changeLanguage: jest.fn().mockResolvedValue(undefined),
            on: jest.fn(),
            off: jest.fn(),
        },
        ready: true,
    }),
    initReactI18next: {
        type: '3rdParty',
        init: jest.fn(),
    },
}));

// Configure React testing environment
global.IS_REACT_ACT_ENVIRONMENT = true;

const warn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('outdated JSX transform')) {
        return;
    }
    if (typeof args[0] === 'string' && args[0].includes('The current testing environment is not configured to support act')) {
        return;
    }
    warn(...args);
};

// Polyfill for MessageChannel in test environment
if (typeof MessageChannel === 'undefined') {
    global.MessageChannel = class MessageChannel {
        constructor() {
            this.port1 = {
                postMessage: jest.fn(),
                onmessage: null,
                close: jest.fn(),
            };
            this.port2 = {
                postMessage: jest.fn(),
                onmessage: null,
                close: jest.fn(),
            };
        }
    };
}
