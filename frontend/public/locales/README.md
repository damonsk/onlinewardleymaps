# Translation Management

This directory contains internationalization resources for OnlineWardleyMaps.

## Structure

Translation files are stored in `/public/locales/[lang]/common.json` where `[lang]` is the ISO language code.

## Adding or Updating Translations

1. Add new translation strings to the English file (`/public/locales/en/common.json`) first
2. Run the translation check script to identify missing or untranslated keys in other languages
3. Update the translation files in other languages accordingly

## Translation Scripts

### Find Untranslated UI Strings

This script scans the component files for hardcoded UI strings that may need translation:

```bash
yarn find-untranslated
```

### Check Translation Files

This script compares all locale files against the English reference file to find missing or potentially untranslated keys:

```bash
yarn check-translations
```

To check a specific locale only:

```bash
yarn check-translations --locale=es
```

### Automatically Fix Missing Keys

This script automatically adds missing keys to translation files by copying them from the English reference:

```bash
yarn fix-translations
```

To fix a specific locale only:

```bash
yarn fix-translations --locale=de
```

## Best Practices

1. Always use the `t()` function from the `useI18n` hook for UI text
2. Provide a default value as fallback, e.g., `t('common.save', 'Save')`
3. Use structured, hierarchical keys for better organization
4. Keep translation files in sync across all supported languages
5. Check for missing translations when adding new features
