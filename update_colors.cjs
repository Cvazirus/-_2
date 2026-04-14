const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Add new variables to @theme
cssContent = cssContent.replace(
  /--color-card-border: var\(--card-border\);/,
  `--color-card-border: var(--card-border);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-input: var(--input);`
);

// Define default values for :root
cssContent = cssContent.replace(
  /--card-border: #e5e7eb;/,
  `--card-border: #e5e7eb;
    --muted: #f3f4f6;
    --muted-foreground: #6b7280;
    --input: #e5e7eb;`
);

// Define default values for .dark
cssContent = cssContent.replace(
  /--card-border: #2c2c2e;/,
  `--card-border: #2c2c2e;
    --muted: #2c2c2e;
    --muted-foreground: #9ca3af;
    --input: #2c2c2e;`
);

// Define default values for mystic
cssContent = cssContent.replace(
  /--card-border: #4a3b69;/,
  `--card-border: #4a3b69;
    --muted: #3a2b59;
    --muted-foreground: #b8a58d;
    --input: #4a3b69;`
);

// Define default values for cyberpunk
cssContent = cssContent.replace(
  /--card-border: #ff00ff;/,
  `--card-border: #ff00ff;
    --muted: #1a1a1a;
    --muted-foreground: #009988;
    --input: #330033;`
);

// Define default values for nordic
cssContent = cssContent.replace(
  /--card-border: #cbd5e1;/,
  `--card-border: #cbd5e1;
    --muted: #f1f5f9;
    --muted-foreground: #64748b;
    --input: #e2e8f0;`
);

// Define default values for sunset
cssContent = cssContent.replace(
  /--card-border: #8a3f0c;/,
  `--card-border: #8a3f0c;
    --muted: #7a350a;
    --muted-foreground: #e8a87c;
    --input: #8a3f0c;`
);

// Define default values for windows
cssContent = cssContent.replace(
  /--card-border: #d1d5db;/,
  `--card-border: #d1d5db;
    --muted: #e5e7eb;
    --muted-foreground: #6b7280;
    --input: #d1d5db;`
);

// Define default values for apple
cssContent = cssContent.replace(
  /--card-border: #3a3a3c;/,
  `--card-border: #3a3a3c;
    --muted: #3a3a3c;
    --muted-foreground: #8e8e93;
    --input: #3a3a3c;`
);

// Define default values for graphite
cssContent = cssContent.replace(
  /--card-border: #333333;/,
  `--card-border: #333333;
    --muted: #2a2a2a;
    --muted-foreground: #a0a0a0;
    --input: #333333;`
);

// Define default values for linux
cssContent = cssContent.replace(
  /--card-border: #4b4d4f;/,
  `--card-border: #4b4d4f;
    --muted: #4b4d4f;
    --muted-foreground: #a9b7c6;
    --input: #4b4d4f;`
);

// Define default values for classic
cssContent = cssContent.replace(
  /--card-border: #dee2e6;/,
  `--card-border: #dee2e6;
    --muted: #e9ecef;
    --muted-foreground: #6c757d;
    --input: #dee2e6;`
);

// Define default values for business
cssContent = cssContent.replace(
  /--card-border: #475569;/,
  `--card-border: #475569;
    --muted: #475569;
    --muted-foreground: #94a3b8;
    --input: #475569;`
);

// Define default values for beige
cssContent = cssContent.replace(
  /--card-border: #e6dfd3;/,
  `--card-border: #e6dfd3;
    --muted: #e6dfd3;
    --muted-foreground: #8c7350;
    --input: #e6dfd3;`
);

// Define default values for walnut
cssContent = cssContent.replace(
  /--card-border: #5c4033;/,
  `--card-border: #5c4033;
    --muted: #4d3322;
    --muted-foreground: #b0804a;
    --input: #5c4033;`
);

fs.writeFileSync(cssPath, cssContent);

// Now let's replace hardcoded tailwind classes in all components
const componentsDir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace background colors
  content = content.replace(/bg-white dark:bg-\[#1c1c1e\]/g, 'bg-card-bg');
  content = content.replace(/bg-white dark:bg-black/g, 'bg-background');
  content = content.replace(/bg-gray-50 dark:bg-gray-800/g, 'bg-muted');
  content = content.replace(/bg-gray-100 dark:bg-gray-800/g, 'bg-muted');
  content = content.replace(/bg-gray-50 dark:bg-\[#2c2c2e\]/g, 'bg-muted');
  content = content.replace(/bg-gray-100 dark:bg-\[#2c2c2e\]/g, 'bg-muted');
  
  // Replace text colors
  content = content.replace(/text-gray-900 dark:text-white/g, 'text-foreground');
  content = content.replace(/text-gray-800 dark:text-gray-200/g, 'text-foreground');
  content = content.replace(/text-gray-700 dark:text-gray-300/g, 'text-foreground');
  content = content.replace(/text-gray-600 dark:text-gray-400/g, 'text-muted-foreground');
  content = content.replace(/text-gray-500 dark:text-gray-400/g, 'text-muted-foreground');
  content = content.replace(/text-gray-500/g, 'text-muted-foreground');
  
  // Replace border colors
  content = content.replace(/border-gray-200 dark:border-gray-700/g, 'border-card-border');
  content = content.replace(/border-gray-100 dark:border-gray-800/g, 'border-card-border');
  content = content.replace(/border-gray-300 dark:border-gray-600/g, 'border-input');
  
  fs.writeFileSync(filePath, content);
}

// Also update App.tsx
const appPath = path.join(__dirname, 'src', 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');
appContent = appContent.replace(/bg-white dark:bg-black/g, 'bg-background');
appContent = appContent.replace(/bg-\[#F2F2F7\] dark:bg-black/g, 'bg-background');
appContent = appContent.replace(/text-gray-900 dark:text-white/g, 'text-foreground');
appContent = appContent.replace(/text-gray-500 dark:text-gray-400/g, 'text-muted-foreground');
fs.writeFileSync(appPath, appContent);

console.log('Done');
