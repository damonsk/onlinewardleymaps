/**
 * Script to fix all link strategy files for ModernMapElements compatibility
 * - Sets this.links = links || [] to handle undefined links
 * - Fixes the mapElements assignment to handle both legacy and modern APIs
 */

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

console.log(`Found ${files.length} strategy files to fix`);

files.forEach((file) => {
    const filePath = path.join(strategyDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Update constructor to handle undefined links and modernMapElements
    if (content.includes('constructor(')) {
        // First, change parameter type to 'any'
        content = content.replace(
            /(constructor\s*\(\s*links\s*:\s*Link\[\]\s*,\s*mapElements\s*:)\s*ModernMapElements(\s*\))/g,
            '$1 any$2',
        );

        // Fix links assignment to handle undefined
        if (content.includes('this.links = links;')) {
            content = content.replace(
                /this\.links\s*=\s*links;/g,
                'this.links = links || []; // Initialize links with empty array if undefined',
            );
        }

        // Fix mapElements assignment to handle both legacy and modern APIs
        if (content.includes('this.mapElements = mapElements;')) {
            content = content.replace(
                /this\.mapElements\s*=\s*mapElements;/g,
                'this.mapElements = mapElements.getLegacyAdapter ? mapElements.getLegacyAdapter() : mapElements; // Handle both legacy and modern APIs',
            );
        }

        fs.writeFileSync(filePath, content);
        console.log(`${file} - Updated constructor`);
    } else {
        console.log(`${file} - No constructor found, skipping`);
    }
});

console.log('Link strategy fixes complete!');
