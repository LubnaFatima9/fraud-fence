// Background service worker for Fraud Fence

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'checkFraud',
    title: 'Check for Fraud with Fraud Fence',
    contexts: ['selection']
  });
  
  console.log('Fraud Fence extension installed successfully! 🛡️');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'checkFraud' && info.selectionText) {
    console.log('Context menu clicked with text:', info.selectionText);
    
    // Store the selected text
    chrome.storage.local.set({
      selectedText: info.selectionText
    }, () => {
      console.log('Text stored successfully');
      
      // Send message to popup if it's open
      chrome.runtime.sendMessage({
        action: 'textSelected',
        text: info.selectionText
      }).catch(() => {
        // Popup might not be open, that's okay
        console.log('Popup not open, text saved for when it opens');
      });
    });
    
    // Try to open the popup
    chrome.action.openPopup().catch((err) => {
      console.log('Could not open popup programmatically:', err);
      // On some Chrome versions, openPopup() doesn't work from context menu
      // User will need to click the extension icon
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Fraud Fence',
        message: 'Click the extension icon to see the analysis results'
      });
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeText') {
    // Here you could call your API at http://localhost:9005/api/text-detect
    // For now, we'll just respond
    sendResponse({ success: true });
  }
  return true;
});
