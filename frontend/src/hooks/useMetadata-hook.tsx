import Head from 'next/head';
import {useRouter} from 'next/router';
import React, {useEffect} from 'react';
import {useI18n} from './useI18n';

/**
 * Hook to manage dynamic metadata based on language and other state
 */
export const useMetadata = () => {
    const {t, currentLanguage} = useI18n();
    const router = useRouter();

    useEffect(() => {
        // Update document language attribute when language changes
        if (typeof document !== 'undefined') {
            document.documentElement.lang = currentLanguage;
        }
    }, [currentLanguage]);

    const MetadataComponent = () => (
        <Head>
            <title>
                {t('app.title', 'Wardley Maps')} - {t('app.name', 'Online Wardley Maps')}
            </title>
            <meta name="description" content={t('app.description', 'Create and share Wardley Maps online')} />
            <meta property="og:title" content={`${t('app.title', 'Wardley Maps')} - ${t('app.name', 'Online Wardley Maps')}`} />
            <meta property="og:description" content={t('app.description', 'Create and share Wardley Maps online')} />
            <meta property="og:locale" content={currentLanguage} />
            <meta name="twitter:title" content={`${t('app.title', 'Wardley Maps')} - ${t('app.name', 'Online Wardley Maps')}`} />
            <meta name="twitter:description" content={t('app.description', 'Create and share Wardley Maps online')} />

            {/* Canonical URL with current language */}
            <link rel="canonical" href={`https://onlinewardleymaps.com${router.asPath}`} />
        </Head>
    );

    return {
        MetadataComponent,
        currentLanguage,
    };
};
