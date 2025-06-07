/* eslint-disable */
// fixReturnStatements.js
// Add defensive coding to return statements in link strategy files
// Part of Phase 4C: MapElements Integration

const fs = require('fs');
const path = require('path');

const LINK_STRATEGIES_DIR = path.join(__dirname, '..', 'linkStrategies');

// Get all link strategy files
const strategyFiles = fs
    .readdirSync(LINK_STRATEGIES_DIR)
    .filter((file) => file.endsWith('.ts') && !file.includes('Interfaces'));

console.log(`Found ${strategyFiles.length} link strategy files to check`);

let updatedCount = 0;

strategyFiles.forEach((fileName) => {
    const filePath = path.join(LINK_STRATEGIES_DIR, fileName);
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Fix JSDoc comments formatting again if needed
    if (
        content.includes(
            '/**\n     * Get links according to this strategy\n\n     *',
        )
    ) {
        content = content.replace(
            /\/\*\*\n\s+\* Get links according to this strategy\n\n\s+\* @returns/g,
            '/**\n     * Get links according to this strategy\n     * @returns',
        );
        updated = true;
    }

    // Add defensive coding to the return statements
    if (
        content.includes('.getNoneEvolvingElements()') &&
        !content.includes('.getNoneEvolvingElements() || []')
    ) {
        content = content.replace(/(this\.mapElements\.\w+\(\))/g, '$1 || []');
        updated = true;
    }

    if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed return statements in ${fileName}`);
        updatedCount++;
    }
});

console.log(`Updated ${updatedCount} files`);
