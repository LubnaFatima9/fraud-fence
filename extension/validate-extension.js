// Simple validation script for the extension
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Fraud Fence Extension...\n');

// Check required files
const requiredFiles = [
    'manifest.json',
    'popup.html',
    'popup.js',
    'styles.css',
    'background.js',
    'content.js',
    'content.css'
];

const requiredIcons = [
    'icons/icon16.png',
    'icons/icon32.png',
    'icons/icon48.png',
    'icons/icon128.png'
];

let allValid = true;

// Validate required files
console.log('📄 Checking required files:');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allValid = false;
    }
});

console.log('\n🖼️  Checking icon files:');
requiredIcons.forEach(icon => {
    if (fs.existsSync(icon)) {
        console.log(`✅ ${icon}`);
    } else {
        console.log(`⚠️  ${icon} - MISSING (extension may not load properly)`);
    }
});

// Validate manifest.json
console.log('\n📋 Validating manifest.json:');
try {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    
    if (manifest.manifest_version === 3) {
        console.log('✅ Manifest version 3');
    } else {
        console.log('❌ Invalid manifest version');
        allValid = false;
    }
    
    if (manifest.permissions && manifest.permissions.length > 0) {
        console.log('✅ Permissions defined');
    } else {
        console.log('❌ No permissions defined');
        allValid = false;
    }
    
    if (manifest.background && manifest.background.service_worker) {
        console.log('✅ Service worker defined');
    } else {
        console.log('❌ Service worker not defined');
        allValid = false;
    }
    
} catch (error) {
    console.log('❌ Invalid manifest.json:', error.message);
    allValid = false;
}

// Check API endpoints
console.log('\n🌐 Checking API configuration:');
try {
    const popupJs = fs.readFileSync('popup.js', 'utf8');
    const backgroundJs = fs.readFileSync('background.js', 'utf8');
    
    if (popupJs.includes('fraud-fence.vercel.app') && backgroundJs.includes('fraud-fence.vercel.app')) {
        console.log('✅ API endpoints configured');
    } else {
        console.log('⚠️  API endpoints may need configuration');
    }
    
} catch (error) {
    console.log('❌ Error checking API configuration:', error.message);
}

// Final result
console.log('\n' + '='.repeat(50));
if (allValid) {
    console.log('🎉 Extension validation passed!');
    console.log('\n📋 Next steps:');
    console.log('1. Add icon files to icons/ folder');
    console.log('2. Open Chrome and go to chrome://extensions/');
    console.log('3. Enable Developer mode');
    console.log('4. Click "Load unpacked" and select this folder');
    console.log('5. Test the extension functionality');
} else {
    console.log('❌ Extension validation failed!');
    console.log('Please fix the issues above before loading the extension.');
}

console.log('\n📚 For more help, see README.md');
