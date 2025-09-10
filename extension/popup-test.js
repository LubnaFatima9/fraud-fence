// Simple test popup script - let's isolate the issue
console.log('🧪 Test script loading...');

// Test basic functionality first
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, testing basic functions...');
    
    // Test 1: Simple button click
    const viewDetailsBtn = document.getElementById('view-details');
    if (viewDetailsBtn) {
        console.log('✅ View Details button found');
        
        viewDetailsBtn.addEventListener('click', function() {
            console.log('🔍 View Details clicked!');
            
            // Simple test - just open analysis.html directly
            if (chrome.tabs && chrome.tabs.create) {
                chrome.tabs.create({
                    url: chrome.runtime.getURL('analysis.html')
                }, function(tab) {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Tab creation failed:', chrome.runtime.lastError);
                        alert('Failed to open analysis page: ' + chrome.runtime.lastError.message);
                    } else {
                        console.log('✅ Analysis tab created successfully');
                        alert('Analysis page opened in new tab!');
                    }
                });
            } else {
                console.log('📭 Chrome tabs API not available, trying window.open');
                window.open(chrome.runtime.getURL('analysis.html'), '_blank');
            }
        });
    } else {
        console.error('❌ View Details button not found');
    }
    
    // Test 2: Simple notification
    function showSimpleNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4f46e5;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 1000;
            font-size: 12px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Test notification
    showSimpleNotification('Extension test loaded successfully!');
    
    console.log('✅ Test script loaded completely');
});

console.log('✅ Test script file parsed successfully');
