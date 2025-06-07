/* eslint-disable */
/**
 * Code Cleanup Script
 * This script renames Modern component files to their standard names and updates imports
 * 
 * Usage:
 * 1. Run from the /frontend directory
 * 2. node scripts/cleanup-modern-files.js
 */

const fs = require('fs');
const path = require('path');

// Directory to operate on - adjust if necessary
const baseDir = path.resolve(__dirname, '..');
const componentsDir = path.join(baseDir, 'src/components/map');
const processingDir = path.join(baseDir, 'src/processing');

// Components to rename: [ModernName, StandardName]
const componentsToRename = [
  ['ModernMapEnvironment', 'MapEnvironment'],
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
  ['ModernInertia', 'Inertia'],
  ['ModernMethodElement', 'MethodElement'],
  ['ModernMovable', 'Movable'],
  ['ModernNote', 'Note'],
  ['ModernPipeline', 'Pipeline'],
  ['ModernPipelineVersion2', 'PipelineVersion2'],
  ['ModernRelativeMovable', 'RelativeMovable'],
];

// Processing files to rename
const processingToRename = [
  ['ModernMapElements', 'MapElements'],
  ['ModernMapElements.test', 'MapElements.test'],
];

// Map of all files to rename
const fileMappings = {};

// Archive directory for legacy files
const archiveDir = path.join(baseDir, 'archived_legacy_components');

// Function to rename files
function renameFiles(dir, renameList, extension) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }

  // Create archive directory if it doesn't exist
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }
  
  // First check that all modern files exist
  const missingFiles = [];
  renameList.forEach(([modernName, standardName]) => {
    const modernFile = path.join(dir, `${modernName}${extension}`);
    if (!fs.existsSync(modernFile)) {
      missingFiles.push(modernName);
    }
  });
  
  if (missingFiles.length > 0) {
    console.log('Missing modern files:', missingFiles);
    return;
  }
  
  // Archive legacy files first
  renameList.forEach(([modernName, standardName]) => {
    const legacyFile = path.join(dir, `${standardName}${extension}`);
    if (fs.existsSync(legacyFile)) {
      const archiveFile = path.join(archiveDir, `${standardName}${extension}`);
      fs.copyFileSync(legacyFile, archiveFile);
      console.log(`Archived legacy file: ${legacyFile} to ${archiveFile}`);
    }
  });
  
  // Now rename modern files to standard names
  renameList.forEach(([modernName, standardName]) => {
    const modernFile = path.join(dir, `${modernName}${extension}`);
    const standardFile = path.join(dir, `${standardName}${extension}`);
    
    // Record the mapping for import updates
    fileMappings[modernName] = standardName;
    
    // Delete legacy file if it exists
    if (fs.existsSync(standardFile)) {
      fs.unlinkSync(standardFile);
      console.log(`Deleted legacy file: ${standardFile}`);
    }
    
    // Rename the modern file
    fs.renameSync(modernFile, standardFile);
    console.log(`Renamed: ${modernFile} -> ${standardFile}`);
  });
}

// Function to update imports in all TypeScript files
function updateImports() {
  // Get all TypeScript files
  const getAllFiles = function(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllFiles(filePath, fileList);
      } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    });
    return fileList;
  };
  
  const allFiles = getAllFiles(path.join(baseDir, 'src'));
  
  // Update imports in each file
  allFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check for each renamed component
    Object.entries(fileMappings).forEach(([oldName, newName]) => {
      // Update import statements
      const importRegex = new RegExp(`import\\s+{[^}]*\\b${oldName}\\b[^}]*}\\s+from\\s+['"]([^'"]+)['"]`, 'g');
      content = content.replace(importRegex, (match, importPath) => {
        modified = true;
        return match.replace(oldName, newName);
      });
      
      // Update direct imports
      const directImportRegex = new RegExp(`import\\s+{?\\s*${oldName}\\s*}?\\s+from\\s+['"]([^'"]+)['"]`, 'g');
      content = content.replace(directImportRegex, (match, importPath) => {
        modified = true;
        return match.replace(oldName, newName);
      });
      
      // Update usage within the file
      const usageRegex = new RegExp(`\\b${oldName}\\b`, 'g');
      content = content.replace(usageRegex, (match) => {
        if (match === oldName) {
          modified = true;
          return newName;
        }
        return match;
      });
    });
    
    // Save the file if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated imports in: ${filePath}`);
    }
  });
}

// Execute the script
console.log('Starting code cleanup...');
renameFiles(componentsDir, componentsToRename, '.tsx');
renameFiles(processingDir, processingToRename, '.ts');
updateImports();
console.log('Code cleanup complete!');
