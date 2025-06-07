// finalJSDocFix.js
// Fix final JSDoc formatting issues in link strategy files
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
    let updated = false;

    // Fix any remaining JSDoc comments with extra newlines
    if (
        content.includes(
            '* @returns Link result containing links and elements\n\n     */',
        )
    ) {
        content = content.replace(
            /\* @returns Link result containing links and elements\n\n\s+\*\//g,
            '* @returns Link result containing links and elements\n     */',
        );
        updated = true;
    }

    // Add ModernMapElements support comment
    if (!content.includes('* Updated to use ModernMapElements')) {
        content = content.replace(
            /export default class ([A-Za-z]+)\s+implements LinkExtractionStrategy/,
            '/**\n * $1\n * Updated to use ModernMapElements in Phase 4C\n */\nexport default class $1 implements LinkExtractionStrategy',
        );
        updated = true;
    }

    if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed JSDoc in ${fileName}`);
        updatedCount++;
    }
});

console.log(`Updated ${updatedCount} files`);
