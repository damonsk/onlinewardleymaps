import {useRouter} from 'next/router';
import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

/**
 * Custom hook for internationalization
 * Provides translation function and current language state
 */
export const useI18n = () => {
    const {
        t: originalT,
        i18n,
        ready,
    } = useTranslation('common', {
        // This ensures the component using this hook will re-render when the language changes
        bindI18n: 'languageChanged loaded',
    });
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);
    const [forceRender, setForceRender] = useState(0);

    // Track hydration state to prevent SSR/CSR mismatches
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Set up listener for i18next language changes
    useEffect(() => {
        const handleLanguageChanged = () => {
            // Force rerender by updating state
            setForceRender(prev => prev + 1);
        };

        // Add event listener for both i18next and our custom event
        i18n.on('languageChanged', handleLanguageChanged);
        window.addEventListener('languageChanged', handleLanguageChanged);

        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
            window.removeEventListener('languageChanged', handleLanguageChanged);
        };
    }, [i18n]);

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
        [isHydrated, ready, originalT, forceRender, i18n.language],
    );

    const changeLanguage = useCallback(
        async (language: string) => {
            try {
                console.log(`Changing language to: ${language}`);

                // Change i18next language immediately for UI updates
                if (i18n && typeof i18n.changeLanguage === 'function') {
                    await i18n.changeLanguage(language);

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
        [i18n, router],
    );

    const currentLanguage = i18n.language || router.locale || 'en';
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
            {code: 'ru', name: 'Russian', nativeName: 'Русский'},
        ],
    };
};
