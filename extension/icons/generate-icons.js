const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Color configuration
const PRIMARY_COLOR = '#667eea';
const SECONDARY_COLOR = '#ffffff';

// Icon sizes to generate
const ICON_SIZES = [16, 32, 48, 128];

/**
 * Generate a shield-shaped icon with 'F' letter
 */
function generateShieldIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas with transparent background
    ctx.clearRect(0, 0, size, size);
    
    // Calculate proportional sizes
    const padding = Math.max(1, Math.floor(size * 0.1));
    const shieldWidth = size - (padding * 2);
    const shieldHeight = size - (padding * 2);
    
    // Draw shield background
    ctx.fillStyle = PRIMARY_COLOR;
    ctx.beginPath();
    
    // Shield shape path
    const centerX = size / 2;
    const top = padding;
    const bottom = size - padding;
    const left = padding;
    const right = size - padding;
    const curve = shieldWidth * 0.15;
    
    // Top rounded corners
    ctx.moveTo(left + curve, top);
    ctx.lineTo(right - curve, top);
    ctx.quadraticCurveTo(right, top, right, top + curve);
    
    // Right side
    ctx.lineTo(right, bottom - shieldHeight * 0.3);
    
    // Bottom point (shield tip)
    ctx.lineTo(centerX, bottom);
    ctx.lineTo(left, bottom - shieldHeight * 0.3);
    
    // Left side
    ctx.lineTo(left, top + curve);
    ctx.quadraticCurveTo(left, top, left + curve, top);
    
    ctx.closePath();
    ctx.fill();
    
    // Add subtle gradient/shadow effect for larger icons
    if (size >= 32) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.moveTo(left + curve, top);
        ctx.lineTo(right - curve, top);
        ctx.quadraticCurveTo(right, top, right, top + curve);
        ctx.lineTo(right, bottom - shieldHeight * 0.3);
        ctx.lineTo(centerX + shieldWidth * 0.05, bottom - shieldHeight * 0.05);
        ctx.lineTo(centerX, bottom);
        ctx.lineTo(centerX - shieldWidth * 0.05, bottom - shieldHeight * 0.05);
        ctx.lineTo(left, bottom - shieldHeight * 0.3);
        ctx.lineTo(left, top + curve);
        ctx.quadraticCurveTo(left, top, left + curve, top);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    
    // Draw 'F' letter
    ctx.fillStyle = SECONDARY_COLOR;
    const fontSize = Math.max(8, Math.floor(size * 0.5));
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Position 'F' slightly higher in the shield
    const textY = centerX - (size * 0.05);
    ctx.fillText('F', centerX, textY);
    
    return canvas;
}

/**
 * Generate a simple circular icon with 'F' letter (alternative design)
 */
function generateCircleIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas with transparent background
    ctx.clearRect(0, 0, size, size);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 2;
    
    // Draw circle background
    ctx.fillStyle = PRIMARY_COLOR;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add border for larger icons
    if (size >= 32) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Draw 'F' letter
    ctx.fillStyle = SECONDARY_COLOR;
    const fontSize = Math.max(8, Math.floor(size * 0.6));
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('F', centerX, centerY);
    
    return canvas;
}

/**
 * Save canvas as PNG file
 */
function saveCanvasAsPNG(canvas, filename) {
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);
    console.log(`✅ Generated ${filename}`);
}

/**
 * Main function to generate all icons
 */
async function generateAllIcons() {
    console.log('🎨 Generating Fraud Fence Chrome Extension Icons...\n');
    
    // Create icons directory if it doesn't exist
    const iconsDir = __dirname;
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    try {
        // Generate shield-style icons
        console.log('🛡️  Generating shield-style icons:');
        for (const size of ICON_SIZES) {
            const canvas = generateShieldIcon(size);
            const filename = path.join(iconsDir, `icon${size}.png`);
            saveCanvasAsPNG(canvas, filename);
        }
        
        // Also generate alternative circle icons (optional)
        console.log('\n🔵 Generating alternative circle-style icons:');
        for (const size of ICON_SIZES) {
            const canvas = generateCircleIcon(size);
            const filename = path.join(iconsDir, `icon${size}_circle.png`);
            saveCanvasAsPNG(canvas, filename);
        }
        
        console.log('\n🎉 All icons generated successfully!');
        console.log('\n📋 Generated files:');
        ICON_SIZES.forEach(size => {
            console.log(`   - icon${size}.png (${size}x${size}) - Shield style`);
            console.log(`   - icon${size}_circle.png (${size}x${size}) - Circle style`);
        });
        
        console.log('\n💡 Tips:');
        console.log('   - Use the shield-style icons for the extension');
        console.log('   - Circle icons are alternatives if you prefer');
        console.log('   - You can edit these or replace with custom designs later');
        console.log('   - Colors used: Primary #667eea, Secondary #ffffff');
        
    } catch (error) {
        console.error('❌ Error generating icons:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Make sure you have installed canvas: npm install canvas');
        console.error('   2. On Windows, you may need to install Windows Build Tools');
        console.error('   3. On macOS, you may need to install Xcode Command Line Tools');
        console.error('   4. On Linux, you may need to install canvas dependencies');
        process.exit(1);
    }
}

// Check if canvas is available
try {
    require('canvas');
    generateAllIcons();
} catch (error) {
    console.error('❌ Canvas library not found!');
    console.error('\n📦 Please install the canvas dependency first:');
    console.error('   npm install canvas');
    console.error('\n🔧 If installation fails, you may need:');
    console.error('   - Windows: npm install --global windows-build-tools');
    console.error('   - macOS: xcode-select --install');
    console.error('   - Ubuntu/Debian: sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev');
    console.error('\n💡 Alternative: You can create simple icons manually using any image editor.');
}
