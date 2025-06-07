/* eslint-disable */
// fixDefensiveCoding.js
// Add defensive coding to link strategy files
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

    // Fix JSDoc comments formatting
    if (content.includes('/**\n\n')) {
        content = content.replace(/\/\*\*\n\n\s+\* /g, '/**\n     * ');
        updated = true;
    }

    // Add defensive coding to filter methods
    if (content.includes('.filter(') && !content.includes('|| []')) {
        content = content.replace(
            /(this\.mapElements\s+\.\s*\w+\s*\(\s*\))/g,
            '$1 || []',
        );
        updated = true;
    }

    // Add defensive coding to find methods
    if (content.includes('.find(') && !content.includes('?.find(')) {
        content = content.replace(/(\.\s*find\s*\()/g, '?.find(');
        updated = true;
    }

    // Add more robust error handling to methods that use links
    if (!content.includes('if (!this.links || !this.mapElements)')) {
        content = content.replace(
            /(getLinks\(\): LinkResult {)/,
            '$1\n        // Handle edge cases where links or mapElements might be undefined\n        if (!this.links || !this.mapElements) {\n            return {\n                name: "empty",\n                links: [],\n                startElements: [],\n                endElements: []\n            };\n        }\n',
        );
        updated = true;
    }

    if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`Added defensive coding to ${fileName}`);
        updatedCount++;
    }
});

console.log(`Updated ${updatedCount} files`);
