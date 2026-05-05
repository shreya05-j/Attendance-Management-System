const fs = require('fs');
const path = require('path');

const replacements = [
  // Hex replacements (case-insensitive)
  { re: /#091413/gi, to: '#002029' },
  { re: /#285A48/gi, to: '#004052' },
  { re: /#408A71/gi, to: '#00607a' },
  { re: /#B0E4CC/gi, to: '#cce6f0' },
  // RGB opacity replacements
  { re: /9,\s*20,\s*19/g, to: '0, 32, 41' },
  { re: /40,\s*90,\s*72/g, to: '0, 64, 82' },
  { re: /64,\s*138,\s*113/g, to: '0, 96, 122' },
  { re: /176,\s*228,\s*204/g, to: '204, 230, 240' },
  // Other named hex variations in index.css
  { re: /#0d1f1d/gi, to: '#00303d' },
  { re: /#0a1816/gi, to: '#002833' },
  { re: /#f0faf5/gi, to: '#f0f4f5' },
  { re: /#1a3d31/gi, to: '#00303d' },
  { re: /#5aa88e/gi, to: '#005066' },
  { re: /#8ec4ad/gi, to: '#99c2d6' }
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
        console.log("Updated " + fullPath);
      }
    }
  }
}

processDir('./src');
