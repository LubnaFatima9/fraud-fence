# 🔧 Fraud Detection Extension - Debug Guide

## 🚨 Issue #1: Text Fraud Check Not Returning Results

### **Diagnosis**: API call failing or response handling broken

### **Most Likely Causes**:
1. API endpoint URL incorrect
2. CORS headers missing
3. Request format wrong
4. Response parsing error

### **Code Fix for `popup.js`**:

**Problem Location**: Lines around 400-450 in `popup.js`

```javascript
/**
 * Analyze content using the appropriate API - FIXED VERSION
 */
async function analyzeContent(type, content, saveToHistoryFlag = true) {
    showLoading();
    
    try {
        let response;
        
        if (type === 'image') {
            // Handle image upload
            const formData = new FormData();
            formData.append('image', content);
            
            response = await fetch(API_ENDPOINTS.image, {
                method: 'POST',
                body: formData,
                // Remove Content-Type header for FormData - let browser set it
            });
        } else {
            // Handle text and URL - FIXED: Add error handling and timeout
            const payload = type === 'text' ? { text: content } : { url: content };
            
            console.log(`Making ${type} API call to:`, API_ENDPOINTS[type]);
            console.log('Payload:', payload);
            
            response = await Promise.race([
                fetch(API_ENDPOINTS[type], {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        // Add any required auth headers here if needed
                    },
                    body: JSON.stringify(payload)
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout')), 10000)
                )
            ]);
        }
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            // Better error handling
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        // Validate response structure
        if (!result || typeof result !== 'object') {
            throw new Error('Invalid API response format');
        }
        
        // Save to history if requested
        if (saveToHistoryFlag) {
            await saveToHistory(type, content, result);
        }
        
        showResults(result);
        return result;
        
    } catch (error) {
        console.error('Analysis error:', error);
        hideLoading();
        
        // Show user-friendly error based on error type
        if (error.message.includes('timeout')) {
            showError('Request timed out. Please check your internet connection and try again.');
        } else if (error.message.includes('Failed to fetch')) {
            showError('Network error. Please check your connection and API availability.');
        } else if (error.message.includes('CORS')) {
            showError('CORS error. API may need to allow extension requests.');
        } else {
            showError(`Analysis failed: ${error.message}`);
        }
        throw error;
    }
}
```

### **Why it Failed**:
- Missing timeout handling can cause infinite loading
- Poor error messages make debugging difficult
- CORS issues not properly identified
- Response validation missing

### **Re-test Instructions**:
1. Open Chrome DevTools (F12) → Console tab
2. Try text analysis - check console logs
3. Look for: API call URL, payload, response status
4. If CORS error appears, check API server configuration

---

## 🚨 Issue #2: Context Menu Not Appearing

### **Diagnosis**: Context menu permissions or creation code broken

### **Code Fix for `background.js`**:

**Problem Location**: Lines around 25-60 in `background.js`

```javascript
/**
 * Create context menu items - FIXED VERSION
 */
function createContextMenus() {
    // Remove existing menus first
    chrome.contextMenus.removeAll(() => {
        try {
            // Main "Check for Fraud" option for selected text
            chrome.contextMenus.create({
                id: CONTEXT_MENU_IDS.TEXT_FRAUD_CHECK,
                title: 'Check for Fraud',
                contexts: ['selection'],
                documentUrlPatterns: ['http://*/*', 'https://*/*'] // Allow on all web pages
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error creating context menu:', chrome.runtime.lastError);
                } else {
                    console.log('Context menu created successfully');
                }
            });

            // Don't create duplicate menus - remove the second text option
            // Only keep the main "Check for Fraud" option

            // Analyze image
            chrome.contextMenus.create({
                id: CONTEXT_MENU_IDS.IMAGE,
                title: 'Analyze image for fraud',
                contexts: ['image'],
                documentUrlPatterns: ['http://*/*', 'https://*/*']
            });

            // Analyze link
            chrome.contextMenus.create({
                id: CONTEXT_MENU_IDS.LINK,
                title: 'Check link safety',
                contexts: ['link'],
                documentUrlPatterns: ['http://*/*', 'https://*/*']
            });

            // Analyze current page
            chrome.contextMenus.create({
                id: CONTEXT_MENU_IDS.PAGE,
                title: 'Scan page for scams',
                contexts: ['page'],
                documentUrlPatterns: ['http://*/*', 'https://*/*']
            });
        } catch (error) {
            console.error('Failed to create context menus:', error);
        }
    });
}

// FIXED: Also ensure initialization happens on startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Extension started, creating context menus');
    createContextMenus();
});

// Re-create menus if they disappear
chrome.runtime.onSuspend.addListener(() => {
    console.log('Extension suspending');
});
```

### **Code Fix for `manifest.json`**:

Ensure your manifest has the correct permissions:

```json
{
  "permissions": [
    "contextMenus",
    "storage",
    "scripting",
    "activeTab",
    "notifications",
    "tabs"
  ],
  
  "host_permissions": [
    "https://fraud-fence.vercel.app/*",
    "http://*/*",
    "https://*/*"
  ]
}
```

### **Why it Failed**:
- Missing `documentUrlPatterns` restricts where menu appears
- No error handling for context menu creation
- Duplicate menu items can cause conflicts
- Missing `onStartup` listener

### **Re-test Instructions**:
1. Go to `chrome://extensions/` → Find your extension → Click "Inspect views: background page"
2. Check console for context menu creation logs
3. Go to any website, select text, right-click
4. Menu should appear with "Check for Fraud" option

---

## 🚨 Issue #3: Real-time Page Analysis Fails

### **Diagnosis**: Tabs permission or getCurrentTab code broken

### **Code Fix for `popup.js`**:

**Problem Location**: Around lines 60-120 in `popup.js`

```javascript
/**
 * Check current page URL automatically - FIXED VERSION
 */
async function checkCurrentPageUrl() {
    try {
        // FIXED: Better error handling and permission checking
        let tabs;
        try {
            tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        } catch (error) {
            console.error('Failed to query tabs:', error);
            showCurrentUrlError('Unable to access current tab. Check tabs permission.');
            return;
        }
        
        const [tab] = tabs;
        if (!tab || !tab.url) {
            console.warn('No active tab or URL found');
            showCurrentUrlError('No active tab found.');
            return;
        }
        
        console.log('Current tab URL:', tab.url);
        currentUrl = tab.url;
        
        // Skip chrome:// and extension pages
        if (tab.url.startsWith('chrome://') || 
            tab.url.startsWith('chrome-extension://') ||
            tab.url.startsWith('edge://') ||
            tab.url.startsWith('about:')) {
            
            document.getElementById('current-url-status').innerHTML = `
                <div class="status-safe">
                    ✅ Browser internal page
                </div>
            `;
            document.getElementById('current-url-details').innerHTML = `
                <div class="url-text">${getDisplayUrl(tab.url)}</div>
                <small>Internal browser pages are safe</small>
            `;
            return;
        }
        
        // FIXED: Show loading state properly
        const statusElement = document.getElementById('current-url-status');
        const detailsElement = document.getElementById('current-url-details');
        
        if (!statusElement || !detailsElement) {
            console.error('URL status elements not found in DOM');
            return;
        }
        
        statusElement.innerHTML = `
            <div class="status-loading">
                <div class="spinner-small"></div>
                <span>Analyzing current page...</span>
            </div>
        `;
        
        // Analyze the URL with timeout
        const result = await Promise.race([
            analyzeContent('url', tab.url, false), // Don't save to history automatically
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Analysis timeout')), 8000)
            )
        ]);
        
        displayCurrentUrlResult(result, tab.url);
        
    } catch (error) {
        console.error('Error checking current URL:', error);
        showCurrentUrlError(error.message);
    }
}

// FIXED: Helper functions
function getDisplayUrl(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return url.substring(0, 50) + (url.length > 50 ? '...' : '');
    }
}

function showCurrentUrlError(message) {
    const statusElement = document.getElementById('current-url-status');
    if (statusElement) {
        statusElement.innerHTML = `
            <div class="status-loading">
                ❌ ${message}
            </div>
        `;
    }
}
```

### **Why it Failed**:
- Missing permission checks for tabs API
- No timeout handling for analysis
- Missing DOM element validation
- Poor error handling for edge cases

### **Re-test Instructions**:
1. Open popup on different websites (not chrome:// pages)
2. Check console for "Current tab URL" log
3. Should see "Analyzing current page..." then result
4. Try on both HTTP and HTTPS sites

---

## 🚨 Issue #4: History Not Saving

### **Diagnosis**: Chrome storage permissions or storage API usage broken

### **Code Fix for `popup.js`**:

**Problem Location**: Around lines 300-350 in `popup.js`

```javascript
/**
 * Save analysis to history - FIXED VERSION
 */
async function saveToHistory(type, input, result) {
    try {
        console.log('Saving to history:', { type, input: typeof input, result });
        
        // FIXED: Check if chrome.storage is available
        if (!chrome.storage || !chrome.storage.local) {
            console.error('Chrome storage API not available');
            return;
        }
        
        const storageResult = await new Promise((resolve, reject) => {
            chrome.storage.local.get([STORAGE_KEYS.HISTORY], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
        });
        
        const history = storageResult[STORAGE_KEYS.HISTORY] || [];
        console.log('Current history length:', history.length);
        
        const historyItem = {
            id: Date.now() + Math.random().toString(36).substr(2, 9), // Better unique ID
            type,
            input: typeof input === 'string' ? 
                   (input.length > 500 ? input.substring(0, 500) + '...' : input) : 
                   'File',
            result,
            timestamp: new Date().toISOString()
        };
        
        history.push(historyItem);
        
        // Keep only last 50 items to prevent storage bloat
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }
        
        await new Promise((resolve, reject) => {
            chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: history }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('Successfully saved to history. New length:', history.length);
                    resolve();
                }
            });
        });
        
    } catch (error) {
        console.error('Error saving to history:', error);
        // Don't throw - this is not critical for main functionality
    }
}

/**
 * Load and display history - FIXED VERSION
 */
async function loadHistory() {
    try {
        if (!chrome.storage || !chrome.storage.local) {
            console.error('Chrome storage API not available');
            showHistoryError('Storage not available');
            return;
        }
        
        const result = await new Promise((resolve, reject) => {
            chrome.storage.local.get([STORAGE_KEYS.HISTORY], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
        });
        
        const history = result[STORAGE_KEYS.HISTORY] || [];
        console.log('Loaded history:', history.length, 'items');
        
        const historyList = document.getElementById('history-list');
        const historyEmpty = document.getElementById('history-empty');
        
        if (!historyList || !historyEmpty) {
            console.error('History DOM elements not found');
            return;
        }
        
        if (history.length === 0) {
            historyEmpty.style.display = 'block';
            historyList.innerHTML = '';
            historyList.appendChild(historyEmpty);
        } else {
            historyEmpty.style.display = 'none';
            displayHistoryItems(history.reverse()); // Show newest first
        }
    } catch (error) {
        console.error('Error loading history:', error);
        showHistoryError('Failed to load history');
    }
}

function showHistoryError(message) {
    const historyList = document.getElementById('history-list');
    if (historyList) {
        historyList.innerHTML = `<div class="history-error">${message}</div>`;
    }
}
```

### **Why it Failed**:
- Not checking if chrome.storage API is available
- Using async/await with chrome.storage (which uses callbacks)
- Missing error handling for storage operations
- No validation of DOM elements

### **Re-test Instructions**:
1. Open popup, perform any analysis
2. Check console for "Saving to history" and "Successfully saved" logs
3. Go to History tab - should show the result
4. Close and reopen popup - history should persist

---

## 🔧 General Debugging Tips

### **Enable Extension Console Logging**:
Add this to the top of each file for debugging:

```javascript
// Debug mode - remove in production
const DEBUG = true;
function debugLog(...args) {
    if (DEBUG) console.log('[Fraud Extension]', ...args);
}
```

### **Check Extension Background Page**:
1. Go to `chrome://extensions/`
2. Find your extension
3. Click "Inspect views: background page"
4. Check console for errors

### **Test API Manually**:
```javascript
// Test in browser console
fetch('https://fraud-fence.vercel.app/api/text-detect', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({text: 'test message'})
}).then(r => r.json()).then(console.log).catch(console.error);
```

This debugging guide covers the most common issues. Let me know which specific problem you're experiencing, and I can provide more targeted assistance!
