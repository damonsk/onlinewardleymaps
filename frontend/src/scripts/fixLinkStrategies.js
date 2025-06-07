/* eslint-disable */
/**
 * Script to fix link strategy constructors for MapElements compatibility
 * This makes sure they handle both direct MapElements and adapter cases
 */

// Disable ESLint for Node.js require statements
/* eslint-disable @typescript-eslint/no-var-requires */

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

    // Fix constructor parameter type and the way getLegacyAdapter is used
    if (content.includes('mapElements.getLegacyAdapter()')) {
        // Update constructor to accept 'any' type and check for getLegacyAdapter
        content = content.replace(
            /(constructor.*?mapElements:\s*)(MapElements)(\s*\).*?\{[\s\n]*)(.*?this\.mapElements\s*=\s*mapElements\.getLegacyAdapter\(\);)/s,
            `$1any$3// Either use the legacy adapter if available or use mapElements directly
        this.mapElements = mapElements.getLegacyAdapter ? mapElements.getLegacyAdapter() : mapElements;`,
        );

        fs.writeFileSync(filePath, content);
        console.log(`${file} - Fixed constructor and getLegacyAdapter usage`);
    } else {
        console.log(`${file} - No getLegacyAdapter usage found, skipping`);
    }
});

console.log('Link strategy fixes complete!');
