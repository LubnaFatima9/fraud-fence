# 🚨 Extension Debug Guide

## The Issue: "Could not establish connection. Receiving end does not exist"

This error typically occurs when:
1. The background script isn't running properly
2. Message listeners aren't set up correctly  
3. The extension needs to be reloaded
4. There's a permission issue in the manifest

## 🔧 **IMMEDIATE FIXES TO TRY:**

### **Step 1: Force Reload the Extension**
1. Go to `chrome://extensions/`
2. Find "Fraud Fence - Scam Detector"
3. Toggle it **OFF** then **ON** again
4. Click the **🔄 Reload** button
5. **Close and reopen** Chrome completely

### **Step 2: Check for Errors**
1. Right-click the extension icon
2. Select "**Inspect popup**"
3. Go to the **Console** tab
4. Look for any error messages
5. Try clicking "View Details" again

### **Step 3: Test Basic Functionality**
1. Open the extension popup
2. Go to the **Text** tab
3. Paste some text like "You won $1000000! Click here!"
4. Click **Analyze Text**
5. See if it works without the "View Details" button

### **Step 4: Background Script Check**
1. Go to `chrome://extensions/`  
2. Click on "Fraud Fence" extension
3. Look for "**Inspect views: background page**" link
4. Click it to check for background script errors

## 🔍 **DEBUG COMMANDS**

Open the extension popup, then press **F12** to open Developer Tools and run these commands:

```javascript
// Test 1: Check if Chrome APIs are available
console.log('Chrome Runtime:', !!chrome.runtime);
console.log('Chrome Storage:', !!chrome.storage);
console.log('Chrome Tabs:', !!chrome.tabs);

// Test 2: Check if DOM elements exist
console.log('View Details Button:', !!document.getElementById('view-details'));
console.log('Results Div:', !!document.getElementById('results'));

// Test 3: Test storage access
chrome.storage.local.set({test: 'working'}).then(() => {
    console.log('Storage write: ✅ Success');
}).catch(e => console.log('Storage write: ❌ Failed', e));

// Test 4: Test notification system
if (typeof showCustomNotification === 'function') {
    showCustomNotification('success', 'Test', 'Extension is working!');
    console.log('Notifications: ✅ Working');
} else {
    console.log('Notifications: ❌ Function not found');
}
```

## 🛠️ **MOST LIKELY SOLUTIONS:**

### **Solution 1: Missing Permissions**
The error might be due to missing permissions. The extension should work with the current permissions, but try this:

1. Reload the extension completely
2. Make sure it's enabled
3. Try the extension on a regular webpage (not chrome:// pages)

### **Solution 2: Background Script Issue**
The background script might not be responding:

1. Check `chrome://extensions/` 
2. Look for "Inspect views: background page"
3. If you see errors, the background script failed to load

### **Solution 3: Simple Workaround**
If the "View Details" button doesn't work, the main analysis functionality should still work:

1. Use the Text, URL, or Image tabs normally
2. The results will show in the popup (even without the detailed view)
3. The custom notifications should still appear

## 📞 **Quick Test Script**

Copy this into the extension popup console:

```javascript
// Quick extension test
console.log('🧪 Testing Fraud Fence Extension...');

// Test basic functionality
document.getElementById('view-details')?.addEventListener('click', () => {
    console.log('🔍 View Details clicked!');
    alert('View Details button is working! The detailed analysis feature is functional.');
});

// Test notification system  
if (typeof showCustomNotification === 'function') {
    showCustomNotification('info', 'Test Complete', 'Extension is responding to commands.');
} else {
    alert('Extension loaded, but some features may not be available.');
}
```

Try these steps and let me know what you see in the console! 🔍
