# 🧪 Fraud Fence Chrome Extension - Test Plan

**Version**: 2.0  
**Date**: August 30, 2025  
**Extension**: Fraud Detection Chrome Extension  

## 📋 Pre-Test Setup

### Prerequisites
1. ✅ Extension loaded in Chrome (`chrome://extensions/`)
2. ✅ Developer Mode enabled
3. ✅ Extension icon visible in toolbar
4. ✅ API endpoints accessible (https://fraud-fence.vercel.app/api/*)

### Test Environment
- **Browser**: Chrome (latest version)
- **Network**: Internet connection required for API calls
- **Permissions**: All extension permissions granted

---

## 🧪 Test Cases

### 1. Text Fraud Check ✏️

**Feature**: Analyze suspicious text content for fraud patterns

**Steps**:
1. Click extension icon in toolbar to open popup
2. Navigate to **Text** tab (should be active by default)
3. Enter test text in textarea:
   - **Safe text**: `"Hello, how are you today?"`
   - **Suspicious text**: `"Congratulations! You've won $1,000,000! Click here to claim your prize!"`
4. Click **"Analyze Text"** button

**Expected Results**:
- ✅ Loading spinner appears while processing
- ✅ Result displayed in card format with:
  - Status icon (✅ Safe, ⚠️ Suspicious, 🚨 Fraud)
  - Confidence percentage
  - Analysis details
- ✅ Result automatically saved to History
- ✅ Clear button available to reset form

**Files to Check if Issues**:
- `popup.js` - Lines 180-220 (analyzeContent function)
- `popup.html` - Text tab section
- `styles.css` - Result card styling

---

### 2. URL Fraud Check 🌐

**Feature**: Analyze URLs for suspicious/malicious websites

#### 2A. Manual URL Entry

**Steps**:
1. Open popup and navigate to **URL** tab
2. Scroll past the "Current Page Analysis" section
3. Enter test URLs in the input field:
   - **Safe URL**: `"https://google.com"`
   - **Suspicious URL**: `"https://bit.ly/suspicious-link"`
4. Click **"Analyze URL"** button

**Expected Results**:
- ✅ Loading spinner appears
- ✅ Result displayed with safety status
- ✅ URL saved to History with type "URL"
- ✅ Input field can be cleared

#### 2B. Real-time Page Analysis

**Steps**:
1. Navigate to any website (e.g., github.com, cnn.com)
2. Open extension popup
3. Stay on URL tab and observe "Current Page Analysis" section at top

**Expected Results**:
- ✅ Current page URL automatically analyzed on popup open
- ✅ Real-time status display: "Safe (95%)" or similar
- ✅ Current domain shown in analysis panel
- ✅ Chrome internal pages (chrome://) show as safe
- ✅ No duplicate history entries for auto-analysis

**Files to Check if Issues**:
- `popup.js` - Lines 50-100 (checkCurrentPageUrl function)
- `manifest.json` - "tabs" permission
- `popup.html` - current-url-check section

---

### 3. Image Fraud Check 📷

**Feature**: Upload and analyze images for fraudulent content

**Steps**:
1. Navigate to **Image** tab in popup
2. Test both upload methods:
   - **Method A**: Click the upload area and select image
   - **Method B**: Drag and drop image onto upload area
3. Use test images:
   - Normal photo (should be safe)
   - Screenshot of suspicious content
4. Click **"Analyze Image"** button

**Expected Results**:
- ✅ Image preview appears after selection
- ✅ "Analyze Image" button becomes enabled
- ✅ Loading spinner during upload/analysis
- ✅ Result shows image analysis outcome
- ✅ History entry shows "Image file" as input
- ✅ Drag & drop visual feedback works

**Files to Check if Issues**:
- `popup.js` - Lines 120-180 (handleImageSelection function)
- `popup.html` - Image tab file upload section
- `styles.css` - File upload styling (.file-upload-area)

---

### 4. History Management 📊

**Feature**: View and manage analysis history

**Steps**:
1. Perform several different checks (text, URL, image)
2. Navigate to **History** tab
3. Verify history display
4. Test "Clear All" functionality

**Expected Results**:
- ✅ All past checks displayed in chronological order (newest first)
- ✅ Each entry shows:
  - Type badge (TEXT, URL, IMAGE)
  - Input content (truncated if long)
  - Result status with confidence
  - Timestamp
- ✅ Empty state message when no history
- ✅ "Clear All" button removes all entries
- ✅ History persists between popup sessions

**Files to Check if Issues**:
- `popup.js` - Lines 240-320 (loadHistory, displayHistoryItems functions)
- `popup.html` - History tab section
- `styles.css` - History item styling (.history-item)

---

### 5. Right-click Context Menu 🖱️

**Feature**: Analyze selected text via context menu

**Steps**:
1. Go to any webpage with text content
2. Select/highlight some text:
   - **Safe text**: Regular paragraph text
   - **Suspicious text**: "URGENT: Verify your account immediately!"
3. Right-click on selected text
4. Choose **"Check for Fraud"** from context menu

**Expected Results**:
- ✅ Context menu option appears for selected text
- ✅ Chrome notification appears with analysis result
- ✅ Notification shows fraud status and confidence
- ✅ Result automatically saved to extension history
- ✅ No popup interference during context action

**Files to Check if Issues**:
- `background.js` - Lines 40-80 (context menu creation and handling)
- `manifest.json` - "contextMenus" permission
- `background.js` - Lines 90-130 (handleTextAnalysis function)

---

### 6. UI/UX Testing 🎨

**Feature**: User interface and experience validation

#### 6A. Tab Navigation
**Steps**:
1. Open popup
2. Click through all tabs: Text → URL → Image → History
3. Verify active tab highlighting
4. Test responsive behavior

**Expected Results**:
- ✅ All 4 tabs present and clickable
- ✅ Active tab highlighted with blue color/border
- ✅ Tab content switches correctly
- ✅ Previous results clear when switching tabs
- ✅ Tabs work on different screen sizes

#### 6B. Loading States
**Steps**:
1. Test each analysis feature
2. Observe loading animations
3. Check for proper user feedback

**Expected Results**:
- ✅ Spinner appears during API calls
- ✅ "Analyzing..." text displayed
- ✅ Buttons disabled during processing
- ✅ Loading state clears after response

#### 6C. Result Display
**Steps**:
1. Perform various analyses
2. Check result card formatting
3. Verify color coding and icons

**Expected Results**:
- ✅ Results in clean card format
- ✅ Color coding: Green (safe), Orange (suspicious), Red (fraud)
- ✅ Proper icons for each risk level
- ✅ Confidence percentages displayed
- ✅ Clear action buttons available

**Files to Check if Issues**:
- `styles.css` - All UI styling
- `popup.html` - HTML structure
- `popup.js` - UI state management functions

---

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

| **Issue** | **Likely Cause** | **Files to Check** | **Solution** |
|-----------|------------------|-------------------|--------------|
| Popup doesn't open | Extension not loaded | `manifest.json` | Reload extension |
| API calls fail | Network/CORS issues | `popup.js`, `background.js` | Check API endpoints, network tab |
| Context menu missing | Permission issue | `manifest.json`, `background.js` | Verify contextMenus permission |
| History not saving | Storage permission | `popup.js`, `manifest.json` | Check storage permission |
| Icons not showing | Missing icon files | `/icons/` folder | Verify PNG files exist |
| Real-time analysis fails | Tabs permission | `popup.js`, `manifest.json` | Check tabs permission |

### Debug Tools

1. **Chrome DevTools**:
   - Right-click popup → Inspect
   - Check Console for JavaScript errors
   - Monitor Network tab for API calls

2. **Extension DevTools**:
   - Go to `chrome://extensions/`
   - Click "Inspect views: background page"
   - Check background script errors

3. **Storage Inspection**:
   - Chrome DevTools → Application → Storage
   - Check Local Storage for extension data

---

## ✅ Test Completion Checklist

### Core Functionality
- [ ] Text analysis works with safe/suspicious content
- [ ] URL analysis works (manual + real-time)
- [ ] Image upload and analysis functional
- [ ] History saves and displays correctly
- [ ] Context menu appears and works
- [ ] All API endpoints responding

### UI/UX
- [ ] All 4 tabs present and functional
- [ ] Loading spinners appear during processing
- [ ] Results display in styled cards
- [ ] Color coding correct (green/orange/red)
- [ ] Mobile/responsive design works
- [ ] Error states handled gracefully

### Data Persistence
- [ ] History persists between sessions
- [ ] Clear history function works
- [ ] Context menu results saved to history
- [ ] No duplicate entries created

### Browser Integration
- [ ] Extension icon visible in toolbar
- [ ] Popup opens correctly
- [ ] Permissions granted properly
- [ ] No console errors in background page

---

## 📝 Test Report Template

```
DATE: ___________
TESTER: ___________
CHROME VERSION: ___________

FEATURE TESTING:
✅/❌ Text Fraud Check: ___________
✅/❌ URL Fraud Check: ___________
✅/❌ Image Fraud Check: ___________
✅/❌ Real-time Analysis: ___________
✅/❌ History Management: ___________
✅/❌ Context Menu: ___________

UI/UX TESTING:
✅/❌ Tab Navigation: ___________
✅/❌ Loading States: ___________
✅/❌ Result Display: ___________

ISSUES FOUND:
1. ___________
2. ___________
3. ___________

OVERALL STATUS: PASS/FAIL
READY FOR PRODUCTION: YES/NO
```

---

**Happy Testing! 🧪✨**
