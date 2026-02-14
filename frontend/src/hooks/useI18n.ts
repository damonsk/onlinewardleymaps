import {useRouter} from 'next/router';
import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

/**
 * Custom hook for internationalization
 * Provides translation function and current language state
 */
export const useI18n = () => {
    // Always call useTranslation unconditionally
    const translationResult = useTranslation('common', {
        // This ensures the component using this hook will re-render when the language changes
        bindI18n: 'languageChanged loaded',
        // Prevent errors when i18next is not yet initialized
        useSuspense: false,
    });

    const {t: originalT, i18n, ready} = translationResult;
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);
    const [forceRender, setForceRender] = useState(0);

    // Storage key for language preference
    const LANGUAGE_STORAGE_KEY = 'onlinewardleymaps_language';

    /**
     * Get the saved language preference from localStorage
     * Falls back to router locale or default 'en'
     */
    const getSavedLanguage = useCallback(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
            if (saved) {
                // Check if it's a valid locale
                const supportedLocales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ko'];
                if (supportedLocales.includes(saved)) {
                    return saved;
                }
            }
        }
        return router.locale || 'en';
    }, [router.locale]);

    // Track hydration state to prevent SSR/CSR mismatches
    useEffect(() => {
        setIsHydrated(true);

        // Once hydrated, check for saved language preference and apply it
        const savedLanguage = getSavedLanguage();
        const currentLang = i18n?.language || router.locale || 'en';

        if (savedLanguage !== currentLang && i18n && typeof i18n.changeLanguage === 'function' && ready) {
            console.log(`Applying saved language preference: ${savedLanguage}`);
            i18n.changeLanguage(savedLanguage)
                .then(() => {
                    // Update Next.js locale as well
                    const {pathname, asPath, query} = router;
                    router.push({pathname, query}, asPath, {locale: savedLanguage});
                })
                .catch(error => {
                    console.error('Error applying saved language:', error);
                });
        }
    }, [getSavedLanguage, i18n, router, ready]);

    // Set up listener for i18next language changes
    useEffect(() => {
        if (!i18n || !ready) return;

        const handleLanguageChanged = () => {
            // Force rerender by updating state
            setForceRender(prev => prev + 1);
        };

        // Add event listener for both i18next and our custom event
        i18n.on('languageChanged', handleLanguageChanged);
        if (typeof window !== 'undefined') {
            window.addEventListener('languageChanged', handleLanguageChanged);
        }

        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
            if (typeof window !== 'undefined') {
                window.removeEventListener('languageChanged', handleLanguageChanged);
            }
        };
    }, [i18n, ready]);

    // Simplified translation function with fallback
    // Will cause re-render when language changes due to forceRender dependency
    const t = useCallback(
        (key: string, fallback?: string) => {
            // During SSR or when not ready, always return fallback
            if (!isHydrated || !ready) {
                return fallback || key;
            }

            const translation = originalT(key);
            // If translation is the same as the key, it means no translation found
            return translation === key && fallback ? fallback : translation;
        },
        [isHydrated, ready, originalT],
    );

    const changeLanguage = useCallback(
        async (language: string) => {
            try {
                console.log(`Changing language to: ${language}`);

                // Change i18next language immediately for UI updates
                if (i18n && typeof i18n.changeLanguage === 'function') {
                    await i18n.changeLanguage(language);

                    // Persist language preference to localStorage
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
                        console.log(`Language preference saved to localStorage: ${language}`);
                    }

                    // Force components to rerender by dispatching a custom event
                    window.dispatchEvent(new CustomEvent('languageChanged', {detail: language}));

                    // Also force this hook to update
                    setForceRender(prev => prev + 1);
                }

                // Also change Next.js locale via router for SSR consistency
                const {pathname, asPath, query} = router;
                await router.push({pathname, query}, asPath, {locale: language});

                console.log(`Language changed to: ${language}`);
            } catch (error) {
                console.error('Error changing language:', error);
            }
        },
        [i18n, router, LANGUAGE_STORAGE_KEY],
    );

    const currentLanguage = i18n?.language || router.locale || 'en';
    const isRTL = ['ar', 'he', 'fa'].includes(currentLanguage);

    return {
        t,
        originalT, // Expose original for complex translations
        changeLanguage,
        currentLanguage,
        isRTL,
        ready: ready && isHydrated,
        isHydrated,
        supportedLanguages: [
            {code: 'en', name: 'English', nativeName: 'English'},
            {code: 'es', name: 'Spanish', nativeName: 'Español'},
            {code: 'fr', name: 'French', nativeName: 'Français'},
            {code: 'de', name: 'German', nativeName: 'Deutsch'},
            {code: 'it', name: 'Italian', nativeName: 'Italiano'},
            {code: 'pt', name: 'Portuguese', nativeName: 'Português'},
            {code: 'ja', name: 'Japanese', nativeName: '日本語'},
            {code: 'zh', name: 'Chinese', nativeName: '中文'},
            {code: 'ko', name: 'Korean', nativeName: '한국어'},
        ],
    };
};
