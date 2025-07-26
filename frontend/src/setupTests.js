import '@testing-library/jest-dom';

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
