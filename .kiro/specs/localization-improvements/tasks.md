# Implementation Plan

- [-]   1. Localize currently identified untranslated strings

  - Add translation keys for all strings found by find-untranslated.js script
  - Update components to use i18n hooks instead of hardcoded English text
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 4.1, 4.2, 4.3_

- [x] 1.1 Localize ContextMenu component strings

  - Replace "Context menu" hardcoded text with t('map.contextMenu.title', 'Context menu')
  - Replace aria-label with localized version using t('map.contextMenu.ariaLabel', 'Context menu')
  - Add corresponding keys to all language JSON files
  - _Requirements: 1.1, 3.1, 3.2_

- [x] 1.2 Localize MapView notification strings

  - Replace "Close notification" hardcoded text with t('common.closeNotification', 'Close notification')
  - Update aria-label for close button using localized string
  - Add translation keys to all supported language files
  - _Requirements: 1.1, 3.1, 3.2_

- [x] 1.3 Localize ToolbarDropdown PST selection

  - Replace "PST type selection" with t('map.toolbar.pstTypeSelection', 'PST type selection')
  - Update aria-label with localized version
  - Add keys to all language translation files
  - _Requirements: 1.1, 3.1, 3.2, 4.1_

- [x] 1.4 Localize WysiwygToolbar strings and accessibility labels

  - Replace "Map component toolbar with keyboard shortcuts" with t('map.toolbar.wysiwygLabel', 'Map component toolbar with keyboard shortcuts')
  - Replace "Drag handle to move toolbar" with t('map.toolbar.dragHandle', 'Drag handle to move toolbar')
  - Replace "Drag to move toolbar" title with t('map.toolbar.dragTitle', 'Drag to move toolbar')
  - Update all aria-labels with localized versions
  - Add all keys to supported language files
  - _Requirements: 1.1, 3.1, 3.2, 4.1, 4.2_

- [x] 1.5 Localize undo/redo functionality strings

  - Replace UndoIcon "Undo last action" with t('editor.undo.description', 'Undo last action')
  - Replace "Click to undo the last action performed on the map" with t('editor.undo.tooltip', 'Click to undo the last action performed on the map')
  - Replace "Undo" title with t('editor.undo.title', 'Undo')
  - Replace RedoIcon "Redo last undone action" with t('editor.redo.description', 'Redo last undone action')
  - Replace "Click to redo the last action that was undone" with t('editor.redo.tooltip', 'Click to redo the last action that was undone')
  - Replace "Redo" title with t('editor.redo.title', 'Redo')
  - Add all undo/redo keys to all language files
  - _Requirements: 1.1, 3.1, 3.2, 4.3_

- [-] 1.6 Localize LinkIcon component

  - Replace "Link Components" title with t('components.linkComponents', 'Link Components')
  - Add translation key to all language files
  - _Requirements: 1.1, 4.1_

- [ ]   2. Enhance translation validation and build process

  - Improve existing scripts to catch untranslated strings in build pipeline
  - Create comprehensive validation for all language file completeness
  - _Requirements: 2.2, 2.3, 5.1, 5.2, 5.3_

- [ ] 2.1 Enhance find-untranslated.js script for strict validation

  - Add command line flag --strict that makes the script exit with error code if untranslated strings found
  - Improve detection accuracy for aria-labels, titles, and text content in JSX
  - Add filtering capabilities to focus on specific component types or directories
  - Create detailed JSON output format for integration with other tools
  - _Requirements: 2.2, 5.1_

- [ ] 2.2 Create comprehensive translation completeness validator

  - Write new script check-translation-completeness.js that verifies all keys exist in all language files
  - Implement validation that checks interpolation variables match across languages
  - Add detection for orphaned keys that exist in translations but aren't used in code
  - Generate detailed reports showing missing keys per language with completion percentages
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 2.3 Integrate validation into build pipeline

  - Update package.json scripts to include translation validation in build process
  - Modify build configuration to fail on translation validation errors
  - Add pre-commit git hook that runs translation validation
  - Create CI workflow step that validates translations on pull requests
  - _Requirements: 2.2, 2.3, 5.1, 5.3_

- [ ]   3. Create translation management utilities

  - Build tools to help maintainers and contributors manage translations efficiently
  - Implement automated key generation and maintenance features
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 3.1 Create translation key generator utility

  - Write generate-translation-keys.js script that suggests consistent key names based on component context
  - Implement automatic key generation following existing naming patterns (e.g., namespace.category.type)
  - Add functionality to batch-generate keys for multiple components
  - Create template system for common translation patterns
  - _Requirements: 6.1, 6.2_

- [ ] 3.2 Build translation maintenance tools

  - Create sync-translations.js script that ensures all languages have same key structure
  - Implement key renaming utility that updates keys across all language files and code references
  - Add cleanup tool that removes unused translation keys from all language files
  - Create validation for translation key naming conventions
  - _Requirements: 6.2, 6.3_

- [ ] 3.3 Develop translation contribution workflow

  - Create template files for new language additions with all required keys
  - Write documentation for translation contributors with examples and guidelines
  - Implement translation validation that provides helpful error messages for contributors
  - Add translation status dashboard showing completion rates per language
  - _Requirements: 6.4_

- [ ]   4. Write comprehensive tests for localization functionality

  - Create unit tests for translation validation scripts
  - Implement integration tests for component localization
  - Add E2E tests for complete language switching workflows
  - _Requirements: All requirements validation_

- [ ] 4.1 Write unit tests for translation validation scripts

  - Test find-untranslated.js accuracy with mock components containing various string types
  - Test translation completeness validator with missing keys scenarios
  - Test key generator utility with different component patterns
  - Create test cases for edge cases like nested interpolation and special characters
  - _Requirements: 2.2, 5.1, 5.2_

- [ ] 4.2 Create integration tests for component localization

  - Test useI18n hook behavior across all supported languages
  - Verify component rendering updates correctly when language changes
  - Test fallback behavior when translation keys are missing
  - Validate accessibility labels work correctly in all languages
  - _Requirements: 1.1, 1.3, 3.1, 3.2_

- [ ] 4.3 Implement E2E tests for multi-language workflows
  - Test complete user workflow in non-English language (toolbar usage, context menus, undo/redo)
  - Validate language switching preserves user state and updates UI immediately
  - Test that all newly localized components display correctly in target languages
  - Verify screen reader compatibility with localized accessibility labels
  - _Requirements: 1.1, 3.1, 3.2, 4.1, 4.2, 4.3_
