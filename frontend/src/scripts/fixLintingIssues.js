/* eslint-disable */
/**
 * Script to fix linting issues in link strategy files
 * - Removes the unused ModernMapElements import
 * - Fixes the parameter type definitions
 */

const fs = require('fs');
const path = require('path');

// Disable ESLint for this script file
/* eslint-disable @typescript-eslint/no-var-requires */

const strategyDir = path.join(__dirname, '..', 'linkStrategies');
const files = fs
    .readdirSync(strategyDir)
    .filter(
        (file) =>
            file.endsWith('.ts') && file !== 'LinkStrategiesInterfaces.ts',
    );

console.log(`Found ${files.length} strategy files to fix`);

files.forEach((file) => {
    const filePath = path.join(strategyDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // If the file is LinksBuilder.ts, handle it differently since we need the import
    if (file === 'LinksBuilder.ts') {
        content = content.replace(
            /(import { ModernMapElements } from '\.\.\/processing\/ModernMapElements';)/,
            '// We need the import for type checking, but we handle both legacy and modern elements\n$1',
        );

        // Fix the constructor parameter type
        content = content.replace(
            /(constructor\s*\(\s*mapLinks: Link\[\] = \[\],\s*)modernMapElements: any( = \{\},)/,
            '$1modernMapElements: ModernMapElements$2',
        );

        fs.writeFileSync(filePath, content);
        console.log(`${file} - Fixed comments and parameter types`);
    } else {
        // For other files, replace the ModernMapElements import with a comment
        if (
            content.includes(
                "import { ModernMapElements } from '../processing/ModernMapElements';",
            )
        ) {
            content = content.replace(
                /import { ModernMapElements } from '\.\.\/processing\/ModernMapElements';/,
                '// Using any type instead of ModernMapElements for compatibility with both modern and legacy elements',
            );

            fs.writeFileSync(filePath, content);
            console.log(`${file} - Removed unused import`);
        } else {
            console.log(
                `${file} - No ModernMapElements import found, skipping`,
            );
        }
    }
});

console.log('Linting fixes complete!');
