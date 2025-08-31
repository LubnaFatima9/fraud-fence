// Simple test script to validate Chrome extension functionality

console.log('🔍 Testing Fraud Fence Extension...');

// Test 1: Check if extension is loaded
chrome.management.getSelf((info) => {
    console.log('✅ Extension loaded:', info.name, 'v' + info.version);
});

// Test 2: Check context menu creation
chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
        id: 'test-menu',
        title: 'Test Fraud Fence',
        contexts: ['selection']
    }, () => {
        if (chrome.runtime.lastError) {
            console.error('❌ Context menu creation failed:', chrome.runtime.lastError);
        } else {
            console.log('✅ Test context menu created successfully');
        }
    });
});

// Test 3: Check API configuration
console.log('🔧 API Configuration:');
console.log('Text API:', 'https://predict.cogniflow.ai/text/classification/predict/b7562ba0-a75d-4001-9375-1f06f22e0b13');
console.log('Image API:', 'https://predict.cogniflow.ai/image/llm-classification/predict/ba056844-ddea-47fb-b6f5-9adcf567cbae');
console.log('Safe Browsing API:', 'https://safebrowsing.googleapis.com/v4/threatMatches:find');

// Test 4: Check permissions
const requiredPermissions = ['contextMenus', 'storage', 'scripting', 'activeTab', 'notifications'];
chrome.permissions.getAll((permissions) => {
    requiredPermissions.forEach(perm => {
        if (permissions.permissions.includes(perm)) {
            console.log('✅ Permission granted:', perm);
        } else {
            console.error('❌ Permission missing:', perm);
        }
    });
});

console.log('🚀 Extension test complete. Check console for results.');
