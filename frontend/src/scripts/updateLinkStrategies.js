/* eslint-disable */
/**
 * Script to fix link strategies to use ModernMapElements
 * Part of Phase 4C Migration
 *
 * This script will:
 * 1. Update imports to use ModernMapElements
 * 2. Update constructor parameter types
 * 3. Add code to use getLegacyAdapter()
 */

// Disable ESLint for Node.js require statements
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

const fs = require('fs');
const path = require('path');

const strategyDir = path.join(__dirname, '..', 'linkStrategies');
const files = fs
    .readdirSync(strategyDir)
    .filter(
        (file) =>
            file.endsWith('.ts') &&
            file !== 'LinksBuilder.ts' &&
            file !== 'LinkStrategiesInterfaces.ts',
    );

console.log(`Found ${files.length} strategy files to update`);

files.forEach((file) => {
    const filePath = path.join(strategyDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip already updated files
    if (content.includes('ModernMapElements')) {
        console.log(`${file} - Already updated, skipping`);
        return;
    }

    // Update imports
    content = content.replace(
        /import\s+{\s*UnifiedMapElements\s*}\s+from\s+['"]\.\.\/processing\/UnifiedMapElements['"];/,
        `import { ModernMapElements } from '../processing/ModernMapElements';`,
    );

    // Update class header with comment
    content = content.replace(
        /(export default class \w+ implements LinkExtractionStrategy)/,
        `/**
 * ${file.replace('.ts', '')}
 * Updated to use ModernMapElements in Phase 4C
 */
$1`,
    );

    // Update constructor parameter
    content = content.replace(
        /(private mapElements: UnifiedMapElements;)/,
        `private mapElements: any; // Using any for adapter compatibility`,
    );

    // Update constructor implementation
    content = content.replace(
        /(constructor\s*\(.*?,\s*mapElements:\s*)UnifiedMapElements(\s*\)\s*{)([\s\n]*)this\.mapElements = mapElements;/,
        `$1ModernMapElements$2$3// Use the legacy adapter for compatibility
        this.mapElements = mapElements.getLegacyAdapter();`,
    );

    // Fix type errors in find callbacks
    content = content.replace(/\.find\(\(i\)\s+=>/g, '.find((i: any) =>');

    fs.writeFileSync(filePath, content);
    console.log(`${file} - Updated successfully`);
});

console.log('Link strategy update complete');
