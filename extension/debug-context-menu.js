// Debug script for context menu functionality
// Add this to background.js temporarily to debug

console.log('🔧 Starting Context Menu Debug...');

// Override the original context menu creation with debug version
function createContextMenusWithDebug() {
    console.log('🔧 Removing existing context menus...');
    chrome.contextMenus.removeAll(() => {
        console.log('✅ All context menus removed');
        
        // Create context menus with error handling
        console.log('🔧 Creating new context menus...');
        
        try {
            chrome.contextMenus.create({
                id: 'check-for-fraud-text',
                title: 'Check for Fraud',
                contexts: ['selection']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error('❌ Error creating text fraud check menu:', chrome.runtime.lastError.message);
                } else {
                    console.log('✅ Text fraud check menu created successfully');
                }
            });

            chrome.contextMenus.create({
                id: 'analyze-selected-text',
                title: 'Analyze selected text: "%s"',
                contexts: ['selection']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error('❌ Error creating text analysis menu:', chrome.runtime.lastError.message);
                } else {
                    console.log('✅ Text analysis menu created successfully');
                }
            });

            chrome.contextMenus.create({
                id: 'analyze-image',
                title: 'Analyze image for fraud',
                contexts: ['image']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error('❌ Error creating image analysis menu:', chrome.runtime.lastError.message);
                } else {
                    console.log('✅ Image analysis menu created successfully');
                }
            });

            chrome.contextMenus.create({
                id: 'analyze-link',
                title: 'Check link safety',
                contexts: ['link']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error('❌ Error creating link check menu:', chrome.runtime.lastError.message);
                } else {
                    console.log('✅ Link check menu created successfully');
                }
            });

            chrome.contextMenus.create({
                id: 'analyze-page',
                title: 'Scan page for scams',
                contexts: ['page']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error('❌ Error creating page scan menu:', chrome.runtime.lastError.message);
                } else {
                    console.log('✅ Page scan menu created successfully');
                }
            });

        } catch (error) {
            console.error('❌ Exception during context menu creation:', error);
        }
    });
}

// Override the click handler with debug version
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    console.log('🎯 Context menu clicked!');
    console.log('📋 Menu item ID:', info.menuItemId);
    console.log('📋 Selected text:', info.selectionText);
    console.log('📋 Source URL:', info.srcUrl);
    console.log('📋 Link URL:', info.linkUrl);
    console.log('📋 Tab info:', tab.url);
    
    // Show immediate notification to confirm click was detected
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '🔧 Debug: Menu Clicked!',
        message: `Menu ID: ${info.menuItemId}\nDetected click successfully!`
    });
    
    try {
        switch (info.menuItemId) {
            case 'analyze-selected-text':
            case 'check-for-fraud-text':
                console.log('📝 Processing text analysis...');
                if (info.selectionText) {
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icons/icon48.png',
                        title: '🔍 Analyzing Text',
                        message: `Text: "${info.selectionText.substring(0, 50)}..."`
                    });
                    // Call the actual handler
                    await handleTextAnalysis(info.selectionText, tab);
                } else {
                    console.error('❌ No text selected');
                }
                break;
            
            case 'analyze-image':
                console.log('🖼️ Processing image analysis...');
                if (info.srcUrl) {
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icons/icon48.png',
                        title: '🔍 Analyzing Image',
                        message: `Image: ${info.srcUrl.substring(0, 50)}...`
                    });
                    await handleImageAnalysis(info.srcUrl, tab);
                } else {
                    console.error('❌ No image URL found');
                }
                break;
            
            case 'analyze-link':
                console.log('🔗 Processing link analysis...');
                if (info.linkUrl) {
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icons/icon48.png',
                        title: '🔍 Checking Link',
                        message: `Link: ${info.linkUrl.substring(0, 50)}...`
                    });
                    await handleLinkAnalysis(info.linkUrl, tab);
                } else {
                    console.error('❌ No link URL found');
                }
                break;
            
            case 'analyze-page':
                console.log('📄 Processing page analysis...');
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: '🔍 Scanning Page',
                    message: `Page: ${tab.url.substring(0, 50)}...`
                });
                await handlePageScan(tab);
                break;
                
            default:
                console.error('❌ Unknown menu item:', info.menuItemId);
                break;
        }
    } catch (error) {
        console.error('❌ Error in context menu handler:', error);
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: '❌ Error',
            message: `Failed to process: ${error.message}`
        });
    }
});

// Test context menu creation on script load
createContextMenusWithDebug();

console.log('✅ Context Menu Debug setup complete!');
