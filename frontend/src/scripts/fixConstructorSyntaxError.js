// fixConstructorSyntaxError.js
// Fix the syntax error in link strategy constructors
// Part of Phase 4C: ModernMapElements Integration

const fs = require('fs');
const path = require('path');

const LINK_STRATEGIES_DIR = path.join(__dirname, '..', 'linkStrategies');

// Get all link strategy files
const strategyFiles = fs
    .readdirSync(LINK_STRATEGIES_DIR)
    .filter((file) => file.endsWith('.ts') && !file.includes('Interfaces'));

console.log(`Found ${strategyFiles.length} link strategy files to check`);

// Pattern to identify the syntax error in constructor
const syntaxErrorPattern = /constructor\([^)]*\) \{/;

let updatedCount = 0;

strategyFiles.forEach((fileName) => {
    const filePath = path.join(LINK_STRATEGIES_DIR, fileName);
    let content = fs.readFileSync(filePath, 'utf8');

    // Check for and fix the syntax error
    if (
        content.includes(
            'constructor(links: Link[] = [], mapElements: any = {}))',
        )
    ) {
        content = content.replace(
            'constructor(links: Link[] = [], mapElements: any = {})) {',
            'constructor(links: Link[] = [], mapElements: any = {}) {',
        );
        fs.writeFileSync(filePath, content);
        console.log(`Fixed syntax error in ${fileName}`);
        updatedCount++;
    }

    // Add optional chaining to mapElements?.getLegacyAdapter
    if (!content.includes('mapElements?.getLegacyAdapter')) {
        content = content.replace(
            /mapElements.getLegacyAdapter/g,
            'mapElements?.getLegacyAdapter',
        );
        fs.writeFileSync(filePath, content);
        console.log(`Added optional chaining in ${fileName}`);
        updatedCount++;
    }
});

console.log(`Updated ${updatedCount} files`);
