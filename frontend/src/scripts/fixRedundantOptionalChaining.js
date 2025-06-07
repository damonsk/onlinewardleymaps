// fixRedundantOptionalChaining.js
// Fix redundant optional chaining in link strategy files
// Part of Phase 4C: ModernMapElements Integration

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

    // Fix redundant optional chaining
    if (content.includes('mapElements?.getLegacyAdapter()')) {
        content = content.replace(
            /mapElements\?\.(getLegacyAdapter\(\))/g,
            'mapElements.$1',
        );
        fs.writeFileSync(filePath, content);
        console.log(`Fixed redundant optional chaining in ${fileName}`);
        updatedCount++;
    }

    // Add JSDoc comments to getLinks method if not present
    if (!content.includes('* Get links according to this strategy')) {
        content = content.replace(
            /(\s+)(getLinks\(\): LinkResult {)/g,
            '$1/**\n$1 * Get links according to this strategy\n$1 * @returns Link result containing links and elements\n$1 */\n$1$2',
        );
        fs.writeFileSync(filePath, content);
        console.log(`Added JSDoc comments to ${fileName}`);
        updatedCount++;
    }
});

console.log(`Updated ${updatedCount} files`);
