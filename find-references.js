import fs from 'fs';
import path from 'path';

function findFilesWithPatterns(dir, patterns) {
  const results = [];
  
  function searchDirectory(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          searchDirectory(fullPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const hasPattern = patterns.some(pattern => content.includes(pattern));
            
            if (hasPattern) {
              results.push(fullPath);
            }
          } catch (err) {
            // Skip files that can't be read
          }
        }
      }
    } catch (err) {
      // Skip directories that can't be read
    }
  }
  
  searchDirectory(dir);
  return results;
}

const patterns = ['ResearchPage', 'OracleRoomPage', '/research', '/oracle'];
const srcDir = path.join(process.cwd(), 'src');

const matchingFiles = findFilesWithPatterns(srcDir, patterns);

console.log('Files containing the specified patterns:');
matchingFiles.slice(0, 10).forEach(file => {
  console.log(file);
});

if (matchingFiles.length === 0) {
  console.log('No files found containing the specified patterns.');
}