const fs = require('fs');
const path = require('path');

// Check if sharp is available via next or node_modules
let sharp;
try {
  sharp = require('sharp');
} catch {
  try {
    sharp = require('next/dist/compiled/sharp');
  } catch {
    console.log('Sharp not directly found, using fallback png buffer creation');
  }
}

async function generateIcons() {
  const svgPath = path.join(__dirname, '../public/icons/icon.svg');
  const iconsDir = path.join(__dirname, '../public/icons');
  const svgBuffer = fs.readFileSync(svgPath);

  if (sharp) {
    console.log('Generating crisp PNG icons with Sharp...');
    await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192x192.png'));
    await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512x512.png'));
    await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-maskable-192x192.png'));
    await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-maskable-512x512.png'));
    await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
    await sharp(svgBuffer).resize(48, 48).png().toFile(path.join(iconsDir, 'favicon.png'));
    console.log('Successfully generated all PNG PWA icons!');
  } else {
    // If sharp is not directly accessible, create duplicate SVG references for the manifest
    console.log('Copying SVG icons');
    fs.copyFileSync(svgPath, path.join(iconsDir, 'icon-192x192.svg'));
    fs.copyFileSync(svgPath, path.join(iconsDir, 'icon-512x512.svg'));
  }
}

generateIcons().catch(console.error);
