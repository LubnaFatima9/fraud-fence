const fs = require('fs');
const path = require('path');

/**
 * Create PNG files from SVG using HTML5 Canvas in Node.js (without canvas library)
 * This creates a simple HTML file that can be used to convert SVG to PNG
 */
function createSVGtoPNGConverter() {
    const converterHTML = `<!DOCTYPE html>
<html>
<head>
    <title>SVG to PNG Converter</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .icon-preview { display: inline-block; margin: 10px; text-align: center; }
        .icon-preview img { border: 1px solid #ddd; padding: 5px; }
        button { 
            background: #667eea; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 4px; 
            cursor: pointer;
            margin: 5px;
        }
        button:hover { background: #5a6fd8; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Fraud Fence Icon Converter</h1>
        <p>This tool converts the generated SVG icons to PNG format for your Chrome extension.</p>
        
        <div class="status info">
            <strong>Instructions:</strong>
            <ol>
                <li>Click "Load SVG Icons" to preview the generated icons</li>
                <li>Click "Download PNG" buttons to save PNG versions</li>
                <li>Save the PNG files as icon16.png, icon32.png, icon48.png, icon128.png</li>
                <li>Place them in your extension's icons/ folder</li>
            </ol>
        </div>

        <button onclick="loadIcons()">Load SVG Icons</button>
        <button onclick="downloadAllPNGs()">Download All PNGs</button>
        
        <div id="iconContainer"></div>
        <div id="status"></div>
    </div>

    <script>
        const iconSizes = [16, 32, 48, 128];
        
        function loadIcons() {
            const container = document.getElementById('iconContainer');
            container.innerHTML = '<h2>Icon Previews:</h2>';
            
            iconSizes.forEach(size => {
                const iconDiv = document.createElement('div');
                iconDiv.className = 'icon-preview';
                
                const svg = createSVGIcon(size);
                const svgBlob = new Blob([svg], {type: 'image/svg+xml'});
                const svgUrl = URL.createObjectURL(svgBlob);
                
                iconDiv.innerHTML = \`
                    <div>
                        <img src="\${svgUrl}" alt="Icon \${size}x\${size}" width="\${size}" height="\${size}">
                        <br>
                        <strong>\${size}x\${size}</strong>
                        <br>
                        <button onclick="downloadPNG(\${size})">Download PNG</button>
                    </div>
                \`;
                
                container.appendChild(iconDiv);
            });
        }
        
        function createSVGIcon(size) {
            return \`<?xml version="1.0" encoding="UTF-8"?>
<svg width="\${size}" height="\${size}" viewBox="0 0 \${size} \${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="grad\${size}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow\${size}" x="-20%" y="-20%" width="140%" height="140%">
            <dropShadow dx="1" dy="1" stdDeviation="1" flood-opacity="0.3"/>
        </filter>
    </defs>
    <!-- Shield shape -->
    <path d="M\${size * 0.1} \${size * 0.1} 
             L\${size * 0.9} \${size * 0.1} 
             Q\${size * 0.95} \${size * 0.1} \${size * 0.95} \${size * 0.15}
             L\${size * 0.95} \${size * 0.65}
             L\${size * 0.5} \${size * 0.9}
             L\${size * 0.05} \${size * 0.65}
             L\${size * 0.05} \${size * 0.15}
             Q\${size * 0.05} \${size * 0.1} \${size * 0.1} \${size * 0.1} Z" 
          fill="url(#grad\${size})" 
          stroke="#ffffff" 
          stroke-width="\${size > 32 ? 2 : 1}" 
          stroke-opacity="0.3"
          filter="\${size >= 48 ? \`url(#shadow\${size})\` : 'none'}"/>
    
    <!-- Letter F -->
    <text x="\${size * 0.5}" 
          y="\${size * 0.55}" 
          font-family="Arial, sans-serif" 
          font-size="\${Math.floor(size * 0.5)}" 
          font-weight="bold" 
          fill="#ffffff" 
          text-anchor="middle" 
          dominant-baseline="middle">F</text>
</svg>\`;
        }
        
        function downloadPNG(size) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = size;
            canvas.height = size;
            
            const svg = createSVGIcon(size);
            const svgBlob = new Blob([svg], {type: 'image/svg+xml'});
            const svgUrl = URL.createObjectURL(svgBlob);
            
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(img, 0, 0, size, size);
                
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`icon\${size}.png\`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    updateStatus(\`Downloaded icon\${size}.png successfully!\`, 'success');
                }, 'image/png');
                
                URL.revokeObjectURL(svgUrl);
            };
            
            img.onerror = function() {
                updateStatus(\`Error loading SVG for size \${size}\`, 'error');
            };
            
            img.src = svgUrl;
        }
        
        function downloadAllPNGs() {
            iconSizes.forEach((size, index) => {
                setTimeout(() => downloadPNG(size), index * 500); // Stagger downloads
            });
        }
        
        function updateStatus(message, type) {
            const statusDiv = document.getElementById('status');
            statusDiv.innerHTML = \`<div class="status \${type}">\${message}</div>\`;
            setTimeout(() => statusDiv.innerHTML = '', 3000);
        }
        
        // Auto-load icons when page loads
        window.onload = loadIcons;
    </script>
</body>
</html>`;

    const htmlFile = path.join(__dirname, 'convert-icons.html');
    fs.writeFileSync(htmlFile, converterHTML);
    console.log(`✅ Created ${htmlFile}`);
    console.log(`📱 Open this file in your browser to convert SVG icons to PNG!`);
    return htmlFile;
}

/**
 * Generate basic PNG icons using a different approach
 */
function generateBasicPNGIcons() {
    const sizes = [16, 32, 48, 128];
    
    // Create a simple base64 encoded PNG template
    sizes.forEach(size => {
        const pngData = createBasicPNGData(size);
        const filename = path.join(__dirname, `icon${size}.png`);
        fs.writeFileSync(filename, pngData);
        console.log(`✅ Generated ${filename}`);
    });
}

/**
 * Create basic PNG data (solid color square)
 */
function createBasicPNGData(size) {
    // This is a minimal PNG - solid color square
    // You would replace this with actual PNG data generation
    
    // For now, create a simple placeholder that Chrome can read
    const header = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
        0x49, 0x48, 0x44, 0x52  // IHDR
    ]);
    
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);     // Width
    ihdr.writeUInt32BE(size, 4);     // Height
    ihdr.writeUInt8(8, 8);           // Bit depth
    ihdr.writeUInt8(6, 9);           // Color type (RGBA)
    ihdr.writeUInt8(0, 10);          // Compression
    ihdr.writeUInt8(0, 11);          // Filter
    ihdr.writeUInt8(0, 12);          // Interlace
    
    // This is a very basic approach - for production, you'd want proper PNG generation
    // The SVG approach above is better for actual use
    
    return Buffer.concat([header, ihdr]);
}

// Main execution
console.log('🎨 Fraud Fence Icon Generator\n');

console.log('🔧 Creating SVG to PNG converter...');
const htmlFile = createSVGtoPNGConverter();

console.log('\n📋 Next steps:');
console.log(`1. Open ${htmlFile} in your web browser`);
console.log('2. Click "Download All PNGs" to get PNG versions');
console.log('3. Save the downloaded files as:');
console.log('   - icon16.png');
console.log('   - icon32.png');
console.log('   - icon48.png');
console.log('   - icon128.png');
console.log('4. Place them in your extension/icons/ folder');

console.log('\n💡 Alternative: Use the SVG files directly');
console.log('Chrome extensions support SVG icons in manifest.json');

console.log('\n🎯 Your icons will have:');
console.log('   - Primary color: #667eea');
console.log('   - Shield shape with letter "F"');
console.log('   - Gradient effect and subtle shadows');
console.log('   - Professional appearance');

const absoluteHtmlPath = path.resolve(htmlFile);
console.log(`\n🌐 Open this URL in your browser:`);
console.log(`file:///${absoluteHtmlPath.replace(/\\/g, '/')}`);
