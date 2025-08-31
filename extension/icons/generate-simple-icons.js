const fs = require('fs');
const path = require('path');

// Simple PNG generation without canvas
// This creates basic colored square PNGs programmatically

/**
 * Create a simple PNG buffer with the specified color and size
 * This is a minimal PNG implementation for solid colored squares
 */
function createSimplePNG(size, color) {
    // PNG signature
    const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    // Convert hex color to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Create IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(size, 0); // Width
    ihdrData.writeUInt32BE(size, 4); // Height
    ihdrData.writeUInt8(8, 8);       // Bit depth
    ihdrData.writeUInt8(2, 9);       // Color type (RGB)
    ihdrData.writeUInt8(0, 10);      // Compression
    ihdrData.writeUInt8(0, 11);      // Filter
    ihdrData.writeUInt8(0, 12);      // Interlace
    
    const ihdrCrc = calculateCRC(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
    const ihdrChunk = Buffer.concat([
        Buffer.from([0, 0, 0, 13]), // Length
        Buffer.from('IHDR'),
        ihdrData,
        ihdrCrc
    ]);
    
    // Create image data (simple solid color)
    const rowBytes = size * 3; // RGB
    const imageData = Buffer.alloc(size * (rowBytes + 1)); // +1 for filter byte per row
    
    for (let y = 0; y < size; y++) {
        const rowStart = y * (rowBytes + 1);
        imageData[rowStart] = 0; // Filter type (None)
        
        for (let x = 0; x < size; x++) {
            const pixelStart = rowStart + 1 + (x * 3);
            imageData[pixelStart] = r;
            imageData[pixelStart + 1] = g;
            imageData[pixelStart + 2] = b;
        }
    }
    
    // Compress image data (simple, not optimal)
    const compressedData = Buffer.concat([Buffer.from([0x78, 0x01]), deflateData(imageData), Buffer.from([0, 0, 0, 0, 0])]);
    
    // Create IDAT chunk
    const idatCrc = calculateCRC(Buffer.concat([Buffer.from('IDAT'), compressedData]));
    const idatLength = Buffer.alloc(4);
    idatLength.writeUInt32BE(compressedData.length, 0);
    const idatChunk = Buffer.concat([
        idatLength,
        Buffer.from('IDAT'),
        compressedData,
        idatCrc
    ]);
    
    // Create IEND chunk
    const iendCrc = calculateCRC(Buffer.from('IEND'));
    const iendChunk = Buffer.concat([
        Buffer.from([0, 0, 0, 0]), // Length
        Buffer.from('IEND'),
        iendCrc
    ]);
    
    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

/**
 * Simple CRC32 calculation
 */
function calculateCRC(data) {
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
    }
    return Buffer.from([(crc ^ 0xFFFFFFFF) >>> 24, (crc ^ 0xFFFFFFFF) >>> 16, (crc ^ 0xFFFFFFFF) >>> 8, (crc ^ 0xFFFFFFFF) & 0xFF]);
}

/**
 * Very basic deflate (not optimal, but works for simple data)
 */
function deflateData(data) {
    // For simplicity, we'll create uncompressed blocks
    const result = [];
    let pos = 0;
    
    while (pos < data.length) {
        const blockSize = Math.min(65535, data.length - pos);
        const isLast = (pos + blockSize >= data.length) ? 1 : 0;
        
        // Block header (uncompressed)
        result.push(isLast); // BFINAL + BTYPE (00 = uncompressed)
        
        // Block size (little endian)
        result.push(blockSize & 0xFF);
        result.push((blockSize >> 8) & 0xFF);
        result.push((~blockSize) & 0xFF);
        result.push(((~blockSize) >> 8) & 0xFF);
        
        // Block data
        for (let i = 0; i < blockSize; i++) {
            result.push(data[pos + i]);
        }
        
        pos += blockSize;
    }
    
    return Buffer.from(result);
}

/**
 * Create SVG icon and save it (alternative approach)
 */
function createSVGIcon(size, filename) {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
    </defs>
    <!-- Shield shape -->
    <path d="M${size * 0.1} ${size * 0.1} 
             L${size * 0.9} ${size * 0.1} 
             Q${size * 0.95} ${size * 0.1} ${size * 0.95} ${size * 0.15}
             L${size * 0.95} ${size * 0.65}
             L${size * 0.5} ${size * 0.9}
             L${size * 0.05} ${size * 0.65}
             L${size * 0.05} ${size * 0.15}
             Q${size * 0.05} ${size * 0.1} ${size * 0.1} ${size * 0.1} Z" 
          fill="url(#grad1)" 
          stroke="#ffffff" 
          stroke-width="${size > 32 ? 2 : 1}" 
          stroke-opacity="0.3"/>
    
    <!-- Letter F -->
    <text x="${size * 0.5}" 
          y="${size * 0.55}" 
          font-family="Arial, sans-serif" 
          font-size="${Math.floor(size * 0.5)}" 
          font-weight="bold" 
          fill="#ffffff" 
          text-anchor="middle" 
          dominant-baseline="middle">F</text>
</svg>`;
    
    fs.writeFileSync(filename, svg);
    console.log(`✅ Generated ${filename} (SVG)`);
}

/**
 * Main function to generate simple icon files
 */
async function generateSimpleIcons() {
    console.log('🎨 Generating Simple Fraud Fence Icons...\n');
    
    const sizes = [16, 32, 48, 128];
    const iconsDir = __dirname;
    
    // Method 1: Create SVG icons (better quality, scalable)
    console.log('🎭 Creating SVG icons (recommended):');
    for (const size of sizes) {
        const svgFilename = path.join(iconsDir, `icon${size}.svg`);
        createSVGIcon(size, svgFilename);
    }
    
    // Method 2: Create simple PNG placeholders
    console.log('\n🔳 Creating simple PNG placeholders:');
    for (const size of sizes) {
        try {
            const pngBuffer = createSimplePNG(size, '#667eea');
            const pngFilename = path.join(iconsDir, `icon${size}_simple.png`);
            fs.writeFileSync(pngFilename, pngBuffer);
            console.log(`✅ Generated ${pngFilename} (Simple PNG)`);
        } catch (error) {
            console.log(`❌ Failed to generate PNG for size ${size}: ${error.message}`);
        }
    }
    
    console.log('\n🎉 Icon generation complete!');
    console.log('\n📋 Generated files:');
    sizes.forEach(size => {
        console.log(`   - icon${size}.svg (${size}x${size}) - SVG version (recommended)`);
        console.log(`   - icon${size}_simple.png (${size}x${size}) - PNG version`);
    });
    
    console.log('\n💡 Usage recommendations:');
    console.log('   1. SVG icons are better quality and scalable');
    console.log('   2. Convert SVG to PNG using online tools if needed');
    console.log('   3. Use tools like Inkscape, GIMP, or online converters');
    console.log('   4. Chrome supports SVG icons in manifest.json');
    
    console.log('\n🔧 To convert SVG to PNG:');
    console.log('   - Online: svg2png.com, convertio.co, or similar');
    console.log('   - Software: Inkscape (free), Adobe Illustrator, or GIMP');
    console.log('   - Command line: imagemagick or puppeteer');
}

// Generate the icons
generateSimpleIcons().catch(console.error);
