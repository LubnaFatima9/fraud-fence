# 🌐 FraudFence Extension - Website API Integration

## ✨ What Changed?

Your extension now uses the **SAME fraud detection logic as your main website**!

### Before vs After:

| Before | After |
|--------|-------|
| Gemini API directly | Website's API endpoints |
| Separate logic in extension | Unified logic across website & extension |
| Need API key in extension | No API key needed in extension |
| Inconsistent results | Consistent results everywhere |

## 🎯 Benefits:

✅ **Unified Logic** - Same detection algorithm as website  
✅ **No API Key Needed** - Extension calls website, website calls Gemini  
✅ **Consistent Results** - Same analysis everywhere  
✅ **Easier Updates** - Update logic once, works everywhere  
✅ **Better Error Handling** - Website's robust error handling  

## 🚀 Setup Instructions

### Step 1: Start Your Website Server

The extension needs your website running locally:

```bash
cd "C:\Users\Lenovo\OneDrive\Desktop\New folder (4)\fraud-fence"
npm run dev
```

This starts the server at: **http://localhost:9005**

### Step 2: Load Extension in Chrome

1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select folder: `simple-extension`

### Step 3: Test It!

**Test with Text:**
```
URGENT! Account suspended! Click now to verify!
```

**What Happens:**
1. Extension captures text
2. Sends to: `http://localhost:9005/api/text-detect`
3. Website API analyzes with Gemini AI
4. Returns detailed results
5. Extension displays with "🌐 Website API Analysis" badge

## 📡 How It Works

### Architecture:

```
Extension (Browser)
    ↓ POST request
Website API (localhost:9005/api/text-detect or url-detect)
    ↓ Calls
Gemini AI (Google's servers)
    ↓ Returns analysis
Website API (formats response)
    ↓ Returns JSON
Extension (displays results)
```

### API Endpoints Used:

1. **Text Analysis**: `POST /api/text-detect`
   ```json
   {
     "text": "Your message here"
   }
   ```

2. **URL Analysis**: `POST /api/url-detect`
   ```json
   {
     "url": "https://example.com"
   }
   ```

### Response Format:

```json
{
  "isFraudulent": true/false,
  "confidenceScore": 0.0-1.0,
  "explanation": "Detailed analysis...",
  "indicators": ["List of flags"],
  "threatTypes": ["phishing", "scam", etc.],
  "reasoning": "Why this was flagged..."
}
```

## ⚙️ Configuration

Edit `config.js` to change settings:

### Development (Default):
```javascript
API_BASE_URL: 'http://localhost:9005/api'
```

### Production (When Deployed):
```javascript
API_BASE_URL: 'https://fraud-fence.vercel.app/api'
```

### Fallback Mode:
```javascript
USE_FALLBACK: true  // Uses rule-based if API fails
```

## 🧪 Testing

### Test 1: With Website Running ✅
1. Start website: `npm run dev`
2. Open extension
3. Analyze text/URL
4. **Result**: Shows "🌐 Website API Analysis" badge

### Test 2: Without Website Running ⚠️
1. Stop website server
2. Open extension
3. Analyze text/URL
4. **Result**: Automatically falls back to rule-based detection

### Test 3: Different Texts

**Legitimate Email:**
```
Dear Customer,
Thank you for your order #12345.
Your item will arrive in 3-5 business days.
```
✅ Should show: **Low Risk**

**Phishing Attempt:**
```
URGENT! Your PayPal account is suspended!
Click here NOW to verify within 24 hours or lose access!
```
🚨 Should show: **High Risk**

**Normal Marketing:**
```
Limited time sale! 30% off all items this weekend.
Shop now at our official store.
```
✅ Should show: **Low Risk** (legitimate marketing)

## 🔧 Troubleshooting

### "Analysis failed" Error

**Cause**: Website server not running  
**Solution**: 
```bash
cd fraud-fence
npm run dev
```

### "Network error" / "Connection refused"

**Cause**: Wrong API URL in config  
**Check**: `config.js` → `API_BASE_URL`  
**Fix**: Make sure it's `http://localhost:9005/api`

### Results different from website

**Cause**: Using old cached version  
**Solution**: 
1. Go to `chrome://extensions/`
2. Click reload (↻) on FraudFence
3. Try again

### Extension using fallback mode

**Check**: Open browser console (F12) when clicking extension  
**Look for**: "⚠️ Falling back to rule-based detection..."  
**Cause**: API call failed  
**Fix**: Verify website is running at http://localhost:9005

## 🌍 Deploying to Production

When you deploy your website to production:

1. **Update config.js:**
   ```javascript
   API_BASE_URL: 'https://fraud-fence.vercel.app/api'
   ```

2. **Update manifest.json permissions** (if needed):
   ```json
   "host_permissions": [
     "https://fraud-fence.vercel.app/*"
   ]
   ```

3. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click reload on FraudFence

## 📊 What's Analyzed

The website API checks:

### Text Analysis:
- ✅ Scam patterns (fake prizes, phishing)
- ✅ Urgency tactics (immediate action required)
- ✅ Personal info requests (SSN, credit cards)
- ✅ Payment method red flags (wire transfer, gift cards)
- ✅ Grammar and professionalism
- ✅ Legitimate business indicators

### URL Analysis:
- ✅ Domain reputation
- ✅ Typosquatting detection
- ✅ Suspicious TLDs (.tk, .ml, .ga, etc.)
- ✅ IP addresses vs domains
- ✅ URL shorteners
- ✅ HTTPS usage
- ✅ Brand impersonation

## 🎉 Benefits of Integration

### For You (Developer):
- 📝 Single codebase for fraud logic
- 🔄 Update once, works everywhere
- 🐛 Easier debugging
- 📊 Consistent analytics

### For Users:
- 🎯 More accurate detection
- 🚀 Same quality as website
- 🔒 Centralized security updates
- 💪 Better protection

## 🔐 Privacy & Security

- Extension sends data to YOUR website only
- Website handles Gemini API calls
- No third-party tracking
- API keys stored securely on server
- Extension doesn't store analyzed data

## 📚 Files Changed

1. **config.js** - Updated to use website API endpoints
2. **popup.js** - Modified `analyzeTextWithAI` and `analyzeURLWithAI` functions
3. All other files remain the same

## ✅ Quick Checklist

- [ ] Website running at http://localhost:9005
- [ ] Extension loaded in Chrome
- [ ] Developer mode enabled
- [ ] Extension icon visible in toolbar
- [ ] Test analysis shows "🌐 Website API Analysis" badge

---

**You now have a unified fraud detection system across your website and browser extension!** 🎊
