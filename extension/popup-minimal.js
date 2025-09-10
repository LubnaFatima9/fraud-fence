// Minimal popup.js for debugging
console.log('🔧 Starting minimal popup script...');

// Basic variables
let currentTab = 'text';
let selectedImage = null;
let currentUrl = null;
let analysisCount = 0;
let threatCount = 0;

console.log('📊 Variables initialized');

// Essential functions only
function showCustomNotification(type = 'info', title = '', message = '', duration = 3000) {
    console.log(`📢 Notification: ${type} - ${title}: ${message}`);
    
    // Create simple notification
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
        `;
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: #4f46e5;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        margin-bottom: 5px;
        font-size: 12px;
        cursor: pointer;
    `;
    notification.textContent = `${title}: ${message}`;
    notification.onclick = () => notification.remove();
    
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
}

console.log('📢 Notification function ready');

async function openDetailedAnalysis() {
    console.log('🔍 Opening detailed analysis...');
    
    try {
        // Save simple test data
        if (chrome.storage && chrome.storage.local) {
            await chrome.storage.local.set({ 
                latestAnalysisResult: {
                    confidence: 85,
                    riskLevel: 'medium',
                    explanation: 'Test analysis data for debugging',
                    contentType: 'Test',
                    originalContent: 'This is test content for debugging the extension'
                }
            });
            console.log('💾 Test data saved to storage');
        }
        
        // Try to open analysis page
        if (chrome.tabs && chrome.tabs.create) {
            const url = chrome.runtime.getURL('analysis.html');
            console.log('🌐 Opening URL:', url);
            
            chrome.tabs.create({ url }, (tab) => {
                if (chrome.runtime.lastError) {
                    console.error('❌ Tab creation failed:', chrome.runtime.lastError);
                    showCustomNotification('error', 'Error', chrome.runtime.lastError.message);
                } else {
                    console.log('✅ Tab created successfully:', tab.id);
                    showCustomNotification('success', 'Success', 'Analysis page opened!');
                }
            });
        } else {
            console.log('📭 No tabs API, using window.open');
            const url = chrome.runtime.getURL('analysis.html');
            window.open(url, '_blank');
            showCustomNotification('info', 'Opened', 'Analysis page opened in new window');
        }
        
    } catch (error) {
        console.error('❌ Error in openDetailedAnalysis:', error);
        showCustomNotification('error', 'Error', error.message);
    }
}

console.log('🔍 Analysis function ready');

// Simple initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing...');
    
    // Set up View Details button
    const viewDetailsBtn = document.getElementById('view-details');
    if (viewDetailsBtn) {
        console.log('✅ View Details button found');
        viewDetailsBtn.addEventListener('click', openDetailedAnalysis);
    } else {
        console.error('❌ View Details button not found');
    }
    
    // Set up other basic buttons
    const clearBtn = document.getElementById('clear-results');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            console.log('🗑️ Clear results clicked');
            const resultsDiv = document.getElementById('results');
            if (resultsDiv) {
                resultsDiv.style.display = 'none';
            }
        });
    }
    
    const reportBtn = document.getElementById('report-issue');
    if (reportBtn) {
        reportBtn.addEventListener('click', () => {
            console.log('📝 Report issue clicked');
            showCustomNotification('info', 'Report Submitted', 'Thank you for your feedback!');
        });
    }
    
    // Test notification on load
    setTimeout(() => {
        showCustomNotification('success', 'Extension Ready', 'Minimal popup script loaded successfully!');
    }, 1000);
    
    console.log('✅ Basic initialization complete');
});

// Make functions global for testing
window.openDetailedAnalysis = openDetailedAnalysis;
window.showCustomNotification = showCustomNotification;

console.log('✅ Minimal popup.js loaded completely - functions should be available now');
