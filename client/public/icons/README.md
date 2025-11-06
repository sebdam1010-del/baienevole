# PWA Icons

## Current Status
SVG icon created: `icon.svg`

## Generate PNG Icons

### Option 1: Using sharp (automated)
```bash
npm install --save-dev sharp
node client/scripts/generateIcons.js
```

### Option 2: Manual conversion
Convert `icon.svg` to PNG at these sizes:
- 72x72px → icon-72x72.png
- 96x96px → icon-96x96.png
- 128x128px → icon-128x128.png
- 144x144px → icon-144x144.png
- 152x152px → icon-152x152.png
- 192x192px → icon-192x192.png
- 384x384px → icon-384x384.png
- 512x512px → icon-512x512.png

### Option 3: Online tools
1. Open https://realfavicongenerator.net/
2. Upload `icon.svg`
3. Generate and download all sizes
4. Place in this directory

## Required Sizes
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Design Guidelines
- Background: #DD2D4A (Baie Red)
- Accent: #DFB999 (Baie Beige)
- Use La Baie des Singes logo if available
- Ensure good contrast for both light and dark modes
