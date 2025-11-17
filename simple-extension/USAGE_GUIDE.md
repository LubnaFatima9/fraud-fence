# 🛡️ Fraud Fence - Usage Guide

## ✅ Changes Made

### 1. **Auto-Detect Selected Text**
The popup now **automatically detects** any text you have selected when you open it!

### 2. **Fixed "Check for Fraud" Button**
The button now works properly and analyzes text instantly.

### 3. **Added "Scripting" Permission**
Allows the extension to read selected text from any webpage.

---

## 🚀 How to Use (Updated)

### Method 1: Select Text & Open Popup (NEW!)
1. **Select/highlight text** on any webpage
2. **Click the Fraud Fence icon** in your toolbar
3. The popup opens with the selected text **already loaded**
4. Analysis runs **automatically** - no need to click anything!

### Method 2: Right-Click Context Menu
1. **Select text** on any webpage
2. **Right-click** → "Check for Fraud with Fraud Fence"
3. Extension icon shows a notification to click it
4. Click the icon → Analysis runs automatically

### Method 3: Manual Entry
1. Click the Fraud Fence icon
2. Type or paste text into the box
3. Click **"Check for Fraud"** button
4. View results instantly

---

## 🔄 How to Update Your Extension

Since you already have the extension loaded, you need to **reload** it:

### Quick Reload Steps:
1. Go to **chrome://extensions/**
2. Find **Fraud Fence**
3. Click the **refresh/reload icon** (🔄 circular arrow button)
4. Done! The changes are now active

---

## 🧪 Test the New Features

### Test Auto-Detection:
1. Go to any webpage (e.g., news site, email)
2. **Select this suspicious text:**
   ```
   URGENT! Your account has been suspended. Click here to verify 
   your credit card and social security number within 24 hours!
   ```
3. **Click the Fraud Fence icon** (don't right-click, just open the popup)
4. ✅ Text should appear in the box automatically
5. ✅ Analysis should run automatically
6. ✅ You should see: 🚨 **High Risk - Likely Scam**

---

## 🎯 Expected Behavior

| User Action | What Happens |
|-------------|-------------|
| Select text → Click extension icon | Text auto-loads → Auto-analyzes |
| Select text → Right-click → Menu | Stores text → Notification → Click icon → Auto-analyzes |
| Just click extension icon | Empty box → Manually type/paste → Click "Check for Fraud" |

---

## 🐛 Troubleshooting

### "Check for Fraud" Button Does Nothing
- **Solution:** Reload the extension in chrome://extensions/
- Click the refresh icon next to Fraud Fence

### Selected Text Doesn't Auto-Load
- **Check 1:** Make sure text is actually selected (highlighted)
- **Check 2:** Reload the extension after updating files
- **Check 3:** Try on a regular webpage (not chrome:// pages)

### Context Menu Not Showing
- Reload the extension
- Try selecting text again and right-clicking

---

## 📊 Risk Levels Explained

| Score | Risk Level | Icon | Meaning |
|-------|-----------|------|---------|
| 40+ points | 🚨 High Risk | Red | Likely scam - DO NOT respond |
| 20-39 points | ⚠️ Medium Risk | Yellow | Be cautious - verify first |
| 0-19 points | ✅ Low Risk | Green | Looks safe, but stay alert |

### What Triggers High Risk:
- "urgent", "verify", "suspended" keywords (+10 each)
- Asking for credit card, SSN, password (+10 each)
- Shortened URLs (bit.ly, tinyurl) (+20)
- Time pressure ("within 24 hours") (+15)
- Excessive punctuation (!!!) (+8)
- ALL CAPS WORDS (+8)

---

## 💡 Pro Tips

1. **Quick Analysis:** Select suspicious text and press the extension icon - that's it!
2. **No Clicking Needed:** Analysis runs automatically when text is detected
3. **Works Everywhere:** Gmail, Facebook, news sites, shopping sites, etc.
4. **Stay Protected:** The content script also scans pages automatically

---

**Last Updated:** November 16, 2025  
**Version:** 1.0.0 (Enhanced)
