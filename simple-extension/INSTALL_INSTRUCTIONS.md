# 🛡️ Fraud Fence - Installation Instructions

## Quick Install (Load Unpacked Extension)

### Step 1: Open Chrome Extensions Page
Chrome should have opened to `chrome://extensions/` automatically.
If not, manually navigate to: **chrome://extensions/** in your address bar.

### Step 2: Enable Developer Mode
Look for the toggle switch in the **top-right corner** labeled "Developer mode" and turn it **ON**.

### Step 3: Load the Extension
1. Click the **"Load unpacked"** button (appears after enabling Developer mode)
2. In the file picker, navigate to:
   ```
   C:\Users\Lenovo\OneDrive\Desktop\New folder (4)\fraud-fence\simple-extension
   ```
3. Select the `simple-extension` folder and click **"Select Folder"**

### Step 4: Verify Installation
You should now see **Fraud Fence** in your extensions list with:
- ✅ Extension name and version (v1.0.0)
- ✅ Fraud Fence icon
- ✅ Status: Enabled

---

## How to Use the Extension

### Method 1: Analyze Text via Popup
1. Click the **Fraud Fence icon** in your Chrome toolbar (top-right, near address bar)
2. Type or paste suspicious text into the text box
3. Click **"🔍 Analyze Text"** button
4. View the fraud analysis results with risk level and confidence score

### Method 2: Analyze Selected Text (Context Menu)
1. On any webpage, **select/highlight** suspicious text
2. **Right-click** the selected text
3. Choose **"Check for Fraud with Fraud Fence"** from the context menu
4. The popup will open with analysis results

### Method 3: Automatic Page Scanning (Content Script)
The extension **automatically scans** every webpage you visit for:
- ❌ Suspicious keywords (prize scams, phishing, urgency tactics)
- 🔗 Shortened/suspicious URLs
- 📝 Forms requesting sensitive data

If threats are detected:
- 🚨 **Warning banner** appears at the top of the page
- 🔍 Suspicious elements are **highlighted** with colored outlines
- 📊 Click **"Show Details"** for a full security report

---

## Testing the Extension

### Test Text Analysis
Try analyzing this sample phishing text:
```
URGENT! Your account has been suspended. Verify your identity immediately 
by clicking here and entering your credit card number and PIN code. 
Act now - you have 24 hours! Congratulations, you've been selected as a winner!
```

**Expected Result:** HIGH RISK (60-100% confidence)

### Test on a Real Page
Visit any news website or shopping site. The content script will scan the page automatically.

---

## Troubleshooting

### Extension Won't Load
- **Error: "Manifest file is missing or unreadable"**
  - Make sure you selected the `simple-extension` folder, not a parent folder
  - Check that `manifest.json` exists in the folder

- **Error: "Required file is missing"**
  - Verify all files exist: `popup.html`, `popup.js`, `background.js`, `content.js`, `content.css`
  - Check that icon files exist: `icon16.png`, `icon48.png`, `icon128.png`

### Popup Doesn't Open
- Click the **puzzle piece icon** in Chrome toolbar
- Pin Fraud Fence to your toolbar for easy access

### Context Menu Not Showing
- Right-click selected text and look for "Check for Fraud with Fraud Fence"
- If missing, try reloading the extension (toggle off/on in chrome://extensions/)

### Content Script Not Running
- Check that the webpage allows extensions (chrome:// pages block extensions)
- Refresh the page after loading the extension
- Check browser console for errors (F12 → Console tab)

---

## Updating the Extension

After making code changes:
1. Go to **chrome://extensions/**
2. Find Fraud Fence
3. Click the **refresh/reload icon** (circular arrow)
4. Test your changes

---

## Uninstalling

1. Go to **chrome://extensions/**
2. Find Fraud Fence
3. Click **"Remove"**
4. Confirm removal

---

## Files Included

- `manifest.json` - Extension configuration
- `popup.html` - Popup UI structure
- `popup.js` - Popup logic and text analysis
- `background.js` - Service worker (context menu, messaging)
- `content.js` - Page scanning and on-page warnings
- `content.css` - Minimal styling for content script
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons

---

## Support

For issues or questions, check the main project README or examine the browser console for error messages.

**Status:** ✅ Extension ready to install
**Version:** 1.0.0
**Last Updated:** November 16, 2025
