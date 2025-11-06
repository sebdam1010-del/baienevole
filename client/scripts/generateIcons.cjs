/**
 * Script to generate PWA icons from SVG
 * Run: node client/scripts/generateIcons.js
 *
 * Note: Requires sharp package. Install with: npm install --save-dev sharp
 * For production, replace with actual logo icons.
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');
const svgPath = path.join(iconsDir, 'icon.svg');

console.log('🎨 PWA Icon Generator');
console.log('='.repeat(50));

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log('\n⚠️  sharp is not installed.');
  console.log('To generate PNG icons, install sharp:');
  console.log('  npm install --save-dev sharp');
  console.log('\nFor now, creating placeholder instructions...\n');

  // Create a README for manual icon creation
  const readmePath = path.join(iconsDir, 'README.md');
  const readmeContent = `# PWA Icons

## Current Status
SVG icon created: \`icon.svg\`

## Generate PNG Icons

### Option 1: Using sharp (automated)
\`\`\`bash
npm install --save-dev sharp
node client/scripts/generateIcons.js
\`\`\`

### Option 2: Manual conversion
Convert \`icon.svg\` to PNG at these sizes:
${sizes.map(size => `- ${size}x${size}px → icon-${size}x${size}.png`).join('\n')}

### Option 3: Online tools
1. Open https://realfavicongenerator.net/
2. Upload \`icon.svg\`
3. Generate and download all sizes
4. Place in this directory

## Required Sizes
${sizes.map(size => `- icon-${size}x${size}.png`).join('\n')}

## Design Guidelines
- Background: #DD2D4A (Baie Red)
- Accent: #DFB999 (Baie Beige)
- Use La Baie des Singes logo if available
- Ensure good contrast for both light and dark modes
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log('✅ Created icons/README.md with instructions');
  console.log('\n📝 Please follow the instructions to generate PNG icons.');
  process.exit(0);
}

// Check if SVG exists
if (!fs.existsSync(svgPath)) {
  console.error('❌ SVG file not found:', svgPath);
  process.exit(1);
}

console.log('📂 Input:', svgPath);
console.log('📁 Output directory:', iconsDir);
console.log('');

// Generate PNG icons
async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size}:`, error.message);
    }
  }

  console.log('');
  console.log('🎉 Icon generation complete!');
  console.log('📋 Generated', sizes.length, 'PNG icons');
}

generateIcons().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
