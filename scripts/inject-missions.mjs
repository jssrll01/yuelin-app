import fs from 'fs';
import path from 'path';

const checkInPath = path.resolve('src/pages/CheckIn.jsx');
let content = fs.readFileSync(checkInPath, 'utf8');

// 1. Inject the import if it doesn't exist
if (!content.includes('MissionList')) {
  // Find the last import statement
  const importMatch = content.match(/import .*?from .*?;?\n/g);
  if (importMatch) {
    const lastImport = importMatch[importMatch.length - 1];
    content = content.replace(lastImport, `${lastImport}import MissionList from '../components/MissionList.jsx';\n`);
  } else {
    content = `import MissionList from '../components/MissionList.jsx';\n` + content;
  }
}

// 2. Inject the component at the bottom of the main wrapper
if (!content.includes('<MissionList />')) {
  // Look for the final closing div/element of the component before the return wrapper ends
  // This regex matches the final closing div tag just before the end of the return statement
  const returnBlockRegex = /(<\/div>\s*\)\s*;?\s*})$/;
  
  if (returnBlockRegex.test(content)) {
    content = content.replace(returnBlockRegex, '  <MissionList />\n$1');
    fs.writeFileSync(checkInPath, content);
    console.log('✅ Successfully injected <MissionList /> into CheckIn.jsx');
  } else {
    // Fallback: If regex fails due to different layout, prompt manual insertion
    console.log('⚠️ Could not auto-inject into CheckIn.jsx due to structural differences.');
    console.log('Please open src/pages/CheckIn.jsx and manually add <MissionList /> at the bottom of the page structure.');
  }
} else {
  console.log('✅ MissionList is already present in CheckIn.jsx');
}
