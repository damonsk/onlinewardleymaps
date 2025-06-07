/* eslint-disable */
/**
 * Code Cleanup Script
 * This script renames Modern component files to their standard names and updates imports
 * 
 * Usage:
 * 1. Run from the /frontend directory
 * 2. node scripts/cleanup-modern-files.js
 * 
 * Enhanced for full frontend cleanup - handles special cases across different directories
 */

const fs = require('fs');
const path = require('path');

// Directory to operate on - adjust if necessary
const baseDir = path.resolve(__dirname, '..');
const componentDirs = {
  map: path.join(baseDir, 'components/map'),
  symbols: path.join(baseDir, 'components/symbols'),
  editor: path.join(baseDir, 'components/editor'),
  root: path.join(baseDir, 'components'),
};
const processingDir = path.join(baseDir, 'processing');

// Special cases that cross directories (ModernFile in one directory, legacy file in another)
const specialCases = [
  {
    modernPath: path.join(baseDir, 'components/map/ModernMapEnvironment.tsx'),
    legacyPath: path.join(baseDir, 'components/MapEnvironment.tsx'),
    newPath: path.join(baseDir, 'components/MapEnvironment.tsx'),
    modernName: 'ModernMapEnvironment',
    standardName: 'MapEnvironment',
    importFixes: { // Import paths need adjustment when moving across directories
      "../../components/FeatureSwitchesContext": "../FeatureSwitchesContext",
      "../../conversion/UnifiedConverter": "../conversion/UnifiedConverter",
      "../../processing/ModernMapElements": "../processing/MapElements",
      "../../types/unified/map": "../types/unified/map"
    }
  },
  {
    modernPath: path.join(baseDir, 'processing/ModernMapElements.ts'),
    legacyPath: path.join(baseDir, 'processing/UnifiedMapElements.ts'),
    newPath: path.join(baseDir, 'processing/MapElements.ts'),
    modernName: 'ModernMapElements',
    standardName: 'MapElements',
    archiveLegacy: true // Flag to indicate we should archive this legacy file
  }
];

// Components to rename by directory: { dirKey: [[ModernName, StandardName], ...] }
const componentsByDir = {
  map: [
    ['ModernMapView', 'MapView'],
    ['ModernUnifiedMapCanvas', 'UnifiedMapCanvas'],
    ['ModernUnifiedMapContent', 'UnifiedMapContent'],
    ['ModernMapComponent', 'MapComponent'],
    ['ModernComponentText', 'ComponentText'],
    ['ModernAnchor', 'Anchor'],
    ['ModernAnnotationBox', 'AnnotationBox'],
    ['ModernAnnotationElement', 'AnnotationElement'],
    ['ModernAttitude', 'Attitude'],
    ['ModernComponentLink', 'ComponentLink'],
    ['ModernEvolvingComponentLink', 'EvolvingComponentLink'],
    ['ModernFluidLink', 'FluidLink'],
    ['ModernFlowText', 'FlowText'],
    ['ModernInertia', 'Inertia'],
    ['ModernMethodElement', 'MethodElement'],
    ['ModernMovable', 'Movable'],
    ['ModernNote', 'Note'],
    ['ModernPipeline', 'Pipeline'],
    ['ModernPipelineVersion2', 'PipelineVersion2'],
    ['ModernRelativeMovable', 'RelativeMovable'],
    ['ModernMapPipelines', 'MapPipelines'],
  ],
  symbols: [
    ['ModernComponentSymbol', 'ComponentSymbol'],
    ['ModernAcceleratorSymbol', 'AcceleratorSymbol'],
    ['ModernAnchorSymbol', 'AnchorSymbol'],
    ['ModernAnnotationBoxSymbol', 'AnnotationBoxSymbol'],
    ['ModernAnnotationTextSymbol', 'AnnotationTextSymbol'],
    ['ModernAttitudeSymbol', 'AttitudeSymbol'],
    ['ModernEcosystemSymbol', 'EcosystemSymbol'],
    ['ModernInertiaSymbol', 'InertiaSymbol'],
    ['ModernLinkSymbol', 'LinkSymbol'],
    ['ModernMarketSymbol', 'MarketSymbol'],
    ['ModernMethodSymbol', 'MethodSymbol'],
    ['ModernNoteSymbol', 'NoteSymbol'],
    ['ModernPipelineComponentSymbol', 'PipelineComponentSymbol'],
    ['ModernSubMapSymbol', 'SubMapSymbol'],
  ],
  editor: [
    ['ModernEditor', 'Editor'],
  ],
  root: []
};

// Archive directory for legacy files
const archiveDir = path.join(baseDir, 'archived_legacy_components');
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}

// Test mode flag (set to false to apply changes)
const TEST_MODE = true;
// Options
const ARCHIVE_LEGACY = true; // Archive legacy files instead of deleting

// Logging utilities
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m%s\x1b[0m', // cyan
    success: '\x1b[32m%s\x1b[0m', // green
    warning: '\x1b[33m%s\x1b[0m', // yellow
    error: '\x1b[31m%s\x1b[0m', // red
  };
  console.log(colors[type], message);
}

// Create backup function
function createBackup(filePath) {
  if (TEST_MODE) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const backupPath = `${filePath}.bak`;
  fs.writeFileSync(backupPath, content);
  log(`Created backup: ${backupPath}`, 'info');
}

// Move file function with import path fixing
function moveFile(sourcePath, destPath, importFixes = {}) {
  if (!fs.existsSync(sourcePath)) {
    log(`Source file not found: ${sourcePath}`, 'error');
    return false;
  }
  
  createBackup(sourcePath);
  
  let content = fs.readFileSync(sourcePath, 'utf8');
  
  // Fix import paths if needed (for cross-directory moves)
  if (Object.keys(importFixes).length > 0) {
    Object.entries(importFixes).forEach(([oldPath, newPath]) => {
      const importRegex = new RegExp(`from ['"](${oldPath})['"]`, 'g');
      content = content.replace(importRegex, `from '${newPath}'`);
    });
  }
  
  if (!TEST_MODE) {
    fs.writeFileSync(destPath, content);
    log(`Moved file: ${sourcePath} -> ${destPath}`, 'success');
  } else {
    log(`[TEST] Would move file: ${sourcePath} -> ${destPath}`, 'info');
  }
  return true;
}

// Archive legacy file function
function archiveLegacyFile(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`Legacy file not found: ${filePath}`, 'warning');
    return false;
  }

  const fileName = path.basename(filePath);
  const archivePath = path.join(archiveDir, fileName);
  
  if (!TEST_MODE) {
    if (ARCHIVE_LEGACY) {
      createBackup(filePath);
      fs.copyFileSync(filePath, archivePath);
      fs.unlinkSync(filePath);
      log(`Archived legacy file: ${filePath} -> ${archivePath}`, 'success');
    } else {
      fs.unlinkSync(filePath);
      log(`Deleted legacy file: ${filePath}`, 'success');
    }
  } else {
    if (ARCHIVE_LEGACY) {
      log(`[TEST] Would archive legacy file: ${filePath} -> ${archivePath}`, 'info');
    } else {
      log(`[TEST] Would delete legacy file: ${filePath}`, 'info');
    }
  }
  return true;
}

// Find all TypeScript/JavaScript files that need import updates
function findAllTsFiles() {
  const result = [];
  function scanDir(dir) {
    if (!fs.existsSync(dir)) {
      console.log(`Directory does not exist: ${dir}`);
      return;
    }
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        scanDir(filePath);
      } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        result.push(filePath);
      }
    });
  }
  scanDir(baseDir);
  return result;
}

// Update imports in a file
function updateImportsInFile(filePath, oldName, newName) {
  if (!fs.existsSync(filePath)) return false;
  
  createBackup(filePath);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Replace import { ModernXXX } from './ModernXXX'
  const importRegex = new RegExp(`import\\s+{([^}]*)${oldName}([^}]*)}\\s+from\\s+['"]([^'"]*${oldName})['"](;?)`, 'g');
  content = content.replace(importRegex, (match, before, after, path, semicolon) => {
    updated = true;
    return `import {${before}${newName}${after}} from '${path.replace(oldName, newName)}'${semicolon}`;
  });
  
  // Replace import { ModernXXX } from './components/somewhere'
  const namedImportRegex = new RegExp(`import\\s+{([^}]*)${oldName}([^}]*)}\\s+from\\s+['"]([^'"]*)['"](;?)`, 'g');
  content = content.replace(namedImportRegex, (match, before, after, path, semicolon) => {
    updated = true;
    return `import {${before}${newName}${after}} from '${path}'${semicolon}`;
  });
  
  // Replace <ModernXXX> with <XXX> in JSX
  const jsxRegex = new RegExp(`<(\\/?)(${oldName})(\\s|>|/)`, 'g');
  content = content.replace(jsxRegex, (match, slash, name, end) => {
    updated = true;
    return `<${slash}${newName}${end}`;
  });
  
  // Replace references in code
  const refRegex = new RegExp(`\\b${oldName}\\b`, 'g');
  content = content.replace(refRegex, () => {
    updated = true;
    return newName;
  });
  
  if (updated && !TEST_MODE) {
    fs.writeFileSync(filePath, content);
    log(`Updated imports in ${filePath}`, 'success');
  } else if (updated) {
    log(`[TEST] Would update imports in ${filePath}`, 'info');
  }
  
  return updated;
}

// Function to run the cleanup
async function runCleanup() {
  log('Starting code cleanup process...', 'info');
  
  // 1. Handle special cases first (cross-directory files)
  log('\n=== Processing Special Cases ===', 'info');
  specialCases.forEach(({ modernPath, legacyPath, newPath, modernName, standardName, importFixes, archiveLegacy }) => {
    log(`Processing special case: ${modernName} -> ${standardName}`, 'info');
    
    // Move the Modern file to its new location with proper name
    moveFile(modernPath, newPath, importFixes || {});
    
    // Archive the legacy file if it exists and is marked for archiving
    if (archiveLegacy && fs.existsSync(legacyPath)) {
      archiveLegacyFile(legacyPath);
    }
  });
  
  // 2. Process standard directory-based components
  log('\n=== Processing Directory Components ===', 'info');
  Object.entries(componentsByDir).forEach(([dirKey, components]) => {
    const dir = componentDirs[dirKey];
    log(`Processing directory: ${dir}`, 'info');
    
    components.forEach(([modernName, standardName]) => {
      const modernPath = path.join(dir, `${modernName}.tsx`);
      const modernPathAlt = path.join(dir, `${modernName}.ts`); // Try .ts extension too
      const standardPath = path.join(dir, `${standardName}.tsx`);
      const standardPathAlt = path.join(dir, `${standardName}.ts`);
      const legacyPath = fs.existsSync(standardPath) ? standardPath : 
                        (fs.existsSync(standardPathAlt) ? standardPathAlt : null);
      const sourcePath = fs.existsSync(modernPath) ? modernPath : 
                        (fs.existsSync(modernPathAlt) ? modernPathAlt : null);
      
      if (!sourcePath) {
        log(`Modern file not found: ${modernName}`, 'warning');
        return;
      }
      
      // Determine destination extension based on source extension
      const isTypeScript = sourcePath.endsWith('.ts');
      const destPath = path.join(dir, `${standardName}${isTypeScript ? '.ts' : '.tsx'}`);
      
      log(`Processing: ${modernName} -> ${standardName}`, 'info');
      
      // Move modern file to standard name
      moveFile(sourcePath, destPath);
      
      // Archive legacy file if exists
      if (legacyPath && legacyPath !== destPath) {
        archiveLegacyFile(legacyPath);
      }
    });
  });
  
  // 3. Update imports in all TypeScript files
  log('\n=== Updating Imports ===', 'info');
  const tsFiles = findAllTsFiles();
  
  // Build a map of all component renames for import updates
  const allRenames = {};
  
  // Add special cases
  specialCases.forEach(({ modernName, standardName }) => {
    allRenames[modernName] = standardName;
  });
  
  // Add directory components
  Object.entries(componentsByDir).forEach(([, components]) => {
    components.forEach(([modernName, standardName]) => {
      allRenames[modernName] = standardName;
    });
  });
  
  // Update imports in all files
  tsFiles.forEach((filePath) => {
    Object.entries(allRenames).forEach(([oldName, newName]) => {
      updateImportsInFile(filePath, oldName, newName);
    });
  });
  
  log('\n=== Cleanup Complete ===', 'success');
  if (TEST_MODE) {
    log('TEST MODE: No files were actually modified.', 'warning');
    log('Set TEST_MODE = false to apply changes.', 'warning');
  }
}

// Run the cleanup
runCleanup().catch(err => {
  log(`Error: ${err.message}`, 'error');
  console.error(err);
});
