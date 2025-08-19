import '@testing-library/jest-dom';

const warn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('outdated JSX transform')) {
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
