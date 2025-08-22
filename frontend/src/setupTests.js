import '@testing-library/jest-dom';

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
