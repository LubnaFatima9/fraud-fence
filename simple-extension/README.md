# 🛡️ Fraud Fence Browser Extension

A simple, working browser extension to detect fraud and scams!

## ✅ How to Load This Extension

### Step 1: Open Chrome Extensions
1. Open Google Chrome
2. Type in the address bar: `chrome://extensions/`
3. Press Enter

### Step 2: Enable Developer Mode
- Find the toggle switch in the **top-right corner** that says "Developer mode"
- Turn it **ON** (it should turn blue)

### Step 3: Load the Extension
1. Click the **"Load unpacked"** button (top-left area)
2. Navigate to this folder:
   ```
   C:\Users\Lenovo\OneDrive\Desktop\New folder (4)\fraud-fence\simple-extension
   ```
3. Click **"Select Folder"**

### Step 4: Success! 🎉
You should see "Fraud Fence" appear in your extensions list with a shield icon.

## 🎯 How to Use

### Method 1: Click the Extension Icon
1. Click the Fraud Fence icon in your browser toolbar (top-right)
2. Paste any suspicious text, message, or URL
3. Click "Check for Fraud"
4. Get instant results!

### Method 2: Right-Click Context Menu
1. Select any text on any webpage
2. Right-click the selected text
3. Choose "Check for Fraud with Fraud Fence"
4. The extension will analyze it automatically

## 🔍 What It Detects

The extension checks for:
- ✅ Suspicious keywords (urgent, verify account, etc.)
- ✅ Pressure tactics (limited time, act now)
- ✅ Suspicious URLs (shortened links, IP addresses)
- ✅ Phishing indicators (requests for passwords, SSN)
- ✅ Common scam patterns (lottery, inheritance)

## 🎨 Features

- **Simple Interface** - Easy to use, beautiful gradient design
- **Context Menu** - Right-click any text to check it
- **Risk Levels** - Clear indicators (Safe, Warning, Danger)
- **Offline** - Works without internet (uses built-in detection)
- **Privacy** - No data sent to external servers

## 🔄 Connect to Your API (Optional)

To use your advanced AI detection API:

1. Open `popup.js`
2. Find the `analyzeText()` function
3. Replace it with an API call to `http://localhost:9005/api/text-detect`

Example:
```javascript
async function analyzeText(text) {
  const response = await fetch('http://localhost:9005/api/text-detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return await response.json();
}
```

## ⚠️ Troubleshooting

**Extension won't load?**
- Make sure you selected the `simple-extension` folder, not the parent folder
- Check that Developer mode is enabled
- Try restarting Chrome

**Context menu not appearing?**
- Refresh the webpage after loading the extension
- Make sure you're selecting text first, then right-clicking

**Icon not showing?**
- The extension is still loaded! Click the puzzle piece icon in Chrome toolbar
- Pin the extension to make it always visible

## 📝 Files Included

- `manifest.json` - Extension configuration
- `popup.html` - Extension popup interface
- `popup.js` - Fraud detection logic
- `background.js` - Context menu handler
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons

## 🚀 This Extension:

✅ **Guaranteed to load** - Minimal, valid manifest
✅ **Fully functional** - Works immediately after loading
✅ **No dependencies** - Doesn't need your dev server running
✅ **Clean code** - Easy to understand and modify

Enjoy your Fraud Fence extension! 🛡️
