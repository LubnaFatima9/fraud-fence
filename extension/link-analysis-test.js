// Direct link analysis test - run this in the background console
// This will help debug the exact issue

console.log('🧪 Testing Link Analysis Function Directly...');

async function testLinkAnalysisDirectly() {
    const testUrl = 'https://gnits.ac.in/about-gnits/';
    
    console.log('🔗 Testing URL:', testUrl);
    
    try {
        // Test the analyzeContent function directly
        console.log('Step 1: Testing analyzeContent function...');
        const result = await analyzeContent('url', testUrl);
        console.log('✅ analyzeContent result:', result);
        
        // Test the notification function
        console.log('Step 2: Testing notification...');
        const title = result.isFraud ? '🚨 Dangerous Link!' : '✅ Link Looks Safe';
        const message = `${Math.round(result.confidence)}% confidence - ${result.riskLevel}`;
        
        console.log('Notification details:', { title, message });
        showNotification(title, message);
        
        // Test storage save
        console.log('Step 3: Testing storage save...');
        await saveAnalysisToStorage('url', testUrl, result);
        console.log('✅ Storage save completed');
        
        // Test message sending
        console.log('Step 4: Testing message to popup...');
        chrome.runtime.sendMessage({
            action: 'context-menu-result',
            type: 'url',
            content: testUrl,
            result: result
        }).then(() => {
            console.log('✅ Message sent successfully');
        }).catch((error) => {
            console.log('📬 Message failed (popup likely not open):', error.message);
            // Store for later
            chrome.storage.local.set({
                latestContextResult: {
                    type: 'url',
                    content: testUrl,
                    result: result,
                    timestamp: Date.now()
                }
            });
            console.log('✅ Stored result for later pickup');
        });
        
        console.log('🎯 Direct test completed successfully!');
        
    } catch (error) {
        console.error('❌ Direct test failed:', error);
    }
}

// Also test the handleLinkAnalysis function directly
async function testHandleLinkAnalysisDirectly() {
    console.log('🧪 Testing handleLinkAnalysis function directly...');
    
    const testUrl = 'https://gnits.ac.in/about-gnits/';
    const fakeTab = { url: 'https://test-page.com', id: 1 };
    
    try {
        await handleLinkAnalysis(testUrl, fakeTab);
        console.log('✅ handleLinkAnalysis completed');
    } catch (error) {
        console.error('❌ handleLinkAnalysis failed:', error);
    }
}

// Run both tests
testLinkAnalysisDirectly();
setTimeout(() => testHandleLinkAnalysisDirectly(), 3000);

console.log('🔍 Tests queued. Watch for results above.');
