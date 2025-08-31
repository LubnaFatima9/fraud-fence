// Simple extension validation script
// Run this in the background script console to test basic functionality

console.log('🔍 Starting Extension Validation...');

// Test 1: Check if all required APIs are available
const requiredAPIs = ['chrome.contextMenus', 'chrome.notifications', 'chrome.scripting', 'chrome.storage'];
requiredAPIs.forEach(api => {
    const apiPath = api.split('.');
    let currentAPI = window.chrome;
    
    for (const path of apiPath.slice(1)) {
        if (currentAPI && currentAPI[path]) {
            currentAPI = currentAPI[path];
        } else {
            currentAPI = null;
            break;
        }
    }
    
    if (currentAPI) {
        console.log('✅ API Available:', api);
    } else {
        console.error('❌ API Missing:', api);
    }
});

// Test 2: Check context menu creation
console.log('🔧 Testing context menu creation...');
try {
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: 'test-validation',
            title: 'Validation Test',
            contexts: ['page']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('❌ Context menu creation failed:', chrome.runtime.lastError.message);
            } else {
                console.log('✅ Test context menu created successfully');
                
                // Clean up test menu
                chrome.contextMenus.remove('test-validation', () => {
                    console.log('🧹 Test menu cleaned up');
                });
            }
        });
    });
} catch (error) {
    console.error('❌ Context menu creation error:', error);
}

// Test 3: Check notification capability
console.log('🔔 Testing notification...');
try {
    chrome.notifications.create('test-notification', {
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Extension Validation',
        message: 'Extension is working properly!'
    }, (notificationId) => {
        if (chrome.runtime.lastError) {
            console.error('❌ Notification failed:', chrome.runtime.lastError.message);
        } else {
            console.log('✅ Test notification created:', notificationId);
            
            // Clean up test notification after 3 seconds
            setTimeout(() => {
                chrome.notifications.clear(notificationId);
                console.log('🧹 Test notification cleaned up');
            }, 3000);
        }
    });
} catch (error) {
    console.error('❌ Notification error:', error);
}

// Test 4: Check storage capability
console.log('💾 Testing storage...');
try {
    chrome.storage.local.set({ validationTest: 'success' }, () => {
        if (chrome.runtime.lastError) {
            console.error('❌ Storage write failed:', chrome.runtime.lastError.message);
        } else {
            chrome.storage.local.get(['validationTest'], (result) => {
                if (chrome.runtime.lastError) {
                    console.error('❌ Storage read failed:', chrome.runtime.lastError.message);
                } else if (result.validationTest === 'success') {
                    console.log('✅ Storage read/write working');
                    
                    // Clean up test data
                    chrome.storage.local.remove(['validationTest']);
                } else {
                    console.error('❌ Storage data mismatch');
                }
            });
        }
    });
} catch (error) {
    console.error('❌ Storage error:', error);
}

// Test 5: Test the scanPageContent function
console.log('📄 Testing page scan function...');
try {
    // Test if the function is defined and callable
    if (typeof scanPageContent === 'function') {
        console.log('✅ scanPageContent function is defined');
        
        // Create a test to see if it runs without errors
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: scanPageContent
                }, (results) => {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Page scan execution failed:', chrome.runtime.lastError.message);
                    } else if (results && results[0]) {
                        console.log('✅ Page scan executed successfully');
                        console.log('📊 Scan results:', results[0]);
                    } else {
                        console.error('❌ Page scan returned no results');
                    }
                });
            }
        });
    } else {
        console.error('❌ scanPageContent function not defined');
    }
} catch (error) {
    console.error('❌ Page scan test error:', error);
}

console.log('🎯 Extension validation complete. Check messages above for any issues.');

// Instructions for user
console.log(`
📋 NEXT STEPS:
1. If all tests show ✅, your extension is working properly
2. If you see any ❌ errors, those need to be fixed
3. Now try the context menu:
   - Right-click on any webpage
   - Look for fraud detection options
   - Check console for "🎯 Context menu clicked!" message

4. If context menus still don't appear:
   - Try reloading the extension completely
   - Check if any other extensions are interfering
   - Make sure you're not on chrome:// pages (they block extensions)
`);
