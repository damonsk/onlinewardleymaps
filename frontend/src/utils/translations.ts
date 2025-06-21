import {serverSideTranslations} from 'next-i18next/serverSideTranslations';

/**
 * Helper function to get translations for static pages
 * @param locale - The locale to load translations for
 * @param namespaces - Array of translation namespaces to load (defaults to ['common'])
 * @returns Static props with translations
 */
export const getTranslationStaticProps = async (locale: string, namespaces: string[] = ['common']) => {
    return {
        props: {
            ...(await serverSideTranslations(locale, namespaces)),
        },
    };
};
