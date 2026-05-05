const fs = require('fs');
const path = require('path');

const replacements = [
  // Hex replacements (case-insensitive)
  { re: /#002029/gi, to: '#091413' },
  { re: /#004052/gi, to: '#285A48' },
  { re: /#00607a/gi, to: '#408A71' },
  { re: /#cce6f0/gi, to: '#B0E4CC' },
  
  // RGB opacity replacements
  { re: /0,\s*32,\s*41/g, to: '9, 20, 19' },
  { re: /0,\s*64,\s*82/g, to: '40, 90, 72' },
  { re: /0,\s*96,\s*122/g, to: '64, 138, 113' },
  { re: /204,\s*230,\s*240/g, to: '176, 228, 204' },
  
  // Try to reverse the overlapping/other hex variations in index.css
  { re: /#f0f4f5/gi, to: '#f0faf5' },
  { re: /#005066/gi, to: '#5aa88e' },
  { re: /#99c2d6/gi, to: '#8ec4ad' },
  { re: /#002833/gi, to: '#0a1816' },
  { re: /#00303d/gi, to: '#1a3d31' }, // Will catch both original #0d1f1d and #1a3d31. We'll fix #0d1f1d manually if needed.
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.css') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const rule of replacements) {
        if (rule.re.test(content)) {
          content = content.replace(rule.re, rule.to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log("Reverted " + fullPath);
      }
    }
  }
}

processDir('./src');
