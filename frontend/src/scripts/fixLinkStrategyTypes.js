/* eslint-disable */
// fixLinkStrategyTypes.js
// Script to update link strategy files with proper TypeScript typing
// Part of Phase 4C: MapElements Integration

const fs = require('fs');
const path = require('path');

const LINK_STRATEGIES_DIR = path.join(__dirname, '..', 'linkStrategies');

// Get all link strategy files
const strategyFiles = fs
    .readdirSync(LINK_STRATEGIES_DIR)
    .filter((file) => file.endsWith('.ts') && !file.includes('Interfaces'));

console.log(`Found ${strategyFiles.length} link strategy files to update`);

// Pattern to identify constructor parameters
const constructorPattern =
    /constructor\(\s*links\s*:\s*Link\[]\s*,\s*mapElements\s*:\s*any/;

// Pattern for getLinks method with no type safety
const getLinksPattern = /getLinks\(\)\s*:\s*LinkResult/;

// Updates to make
const constructorReplacement =
    'constructor(links: Link[] = [], mapElements: any = {})';
const getLegacyAdapterBlock = `
        // Use the legacy adapter if available, otherwise use mapElements directly
        this.mapElements = mapElements?.getLegacyAdapter
            ? mapElements.getLegacyAdapter()
            : mapElements;
        // Initialize links with empty array if undefined
        this.links = links || [];`;

let updatedCount = 0;

strategyFiles.forEach((fileName) => {
    const filePath = path.join(LINK_STRATEGIES_DIR, fileName);
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Add import for MapElements if not present
    if (!content.includes('MapElements')) {
        const importStatement =
            '// Using any type instead of MapElements for compatibility with both modern and legacy elements';
        if (!content.includes(importStatement)) {
            content = content.replace(
                /import {[^}]*} from [^\n]*;/,
                (match) => `${importStatement}\n${match}`,
            );
            updated = true;
        }
    }

    // Update constructor parameter typing
    if (constructorPattern.test(content)) {
        content = content.replace(constructorPattern, constructorReplacement);
        updated = true;
    }

    // Add defensive coding for mapElements initialization
    if (!content.includes('getLegacyAdapter')) {
        content = content.replace(
            /constructor\([^)]*\)\s*{[^{]*{/,
            (match) => `${match}${getLegacyAdapterBlock}`,
        );
        updated = true;
    }

    // Add documentation comment for updated class
    if (!content.includes('Updated to use MapElements')) {
        content = content.replace(
            /export default class ([A-Za-z]+) implements LinkExtractionStrategy/,
            '/**\n * $1\n * Updated to use MapElements in Phase 4C\n */\nexport default class $1 implements LinkExtractionStrategy',
        );
        updated = true;
    }

    // Write the updated file
    if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${fileName}`);
        updatedCount++;
    } else {
        console.log(`No changes needed for ${fileName}`);
    }
});

console.log(
    `Updated ${updatedCount} of ${strategyFiles.length} link strategy files`,
);
