/**
 * Browser detection utilities for handling browser-specific behaviors
 */

export interface BrowserInfo {
    isSafari: boolean;
    isChrome: boolean;
    isFirefox: boolean;
    isWebKit: boolean;
}

/**
 * Detect Safari browser using feature detection and user agent fallback
 */
export function isSafariBrowser(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false;
    }

    // Feature detection: Safari has specific SVG foreignObject behavior
    // Safari also has specific CSS and DOM behaviors we can detect
    const hasWebKit = 'webkitAppearance' in document.documentElement.style;
    const hasAppleWebKit = /AppleWebKit/.test(navigator.userAgent);
    const isNotChrome = !/Chrome|Chromium/.test(navigator.userAgent);
    const isNotEdge = !/Edge|Edg/.test(navigator.userAgent);

    // Safari-specific feature: Safari has different behavior with SVG transforms
    const hasSafariSVGQuirks = (() => {
        try {
            // Safari handles SVG foreignObject positioning differently
            // This is a known Safari-specific behavior
            return hasWebKit && hasAppleWebKit && isNotChrome && isNotEdge;
        } catch {
            return false;
        }
    })();

    // User agent detection as fallback
    const userAgent = navigator.userAgent;
    const isSafariUA = /Safari/.test(userAgent) && !/Chrome|Chromium/.test(userAgent) && !/Edge|Edg/.test(userAgent);

    return hasSafariSVGQuirks || isSafariUA;
}

/**
 * Get comprehensive browser information
 */
export function detectBrowser(): BrowserInfo {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return {
            isSafari: false,
            isChrome: false,
            isFirefox: false,
            isWebKit: false,
        };
    }

    const userAgent = navigator.userAgent;

    const isSafari = isSafariBrowser();
    const isChrome = /Chrome|Chromium/.test(userAgent) && !/Edge|Edg/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    const isWebKit = /WebKit/.test(userAgent);

    return {
        isSafari,
        isChrome,
        isFirefox,
        isWebKit,
    };
}

/**
 * Check if the current browser has Safari-specific SVG positioning quirks
 */
export function hasSafariSVGQuirks(): boolean {
    return isSafariBrowser();
}
