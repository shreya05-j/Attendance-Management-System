const fs = require('fs');

const replaceFiles = [
  'src/components/landing/LandingPage.tsx',
  'src/pages/Login.tsx'
];

for (const file of replaceFiles) {
  let c = fs.readFileSync(file, 'utf8');
  
  // Replace direct hex strings with standard Tailwind variables mappings where applicable
  c = c.replace(/\[\#091413\]/g, '[var(--bg-base)]');
  c = c.replace(/\[\#B0E4CC\]/g, '[var(--text-primary)]');
  c = c.replace(/\[\#408A71\]/g, '[var(--text-muted)]');
  c = c.replace(/\[\#285A48\]/g, '[var(--border-strong)]');

  fs.writeFileSync(file, c);
  console.log('Fixed themes for', file);
}
