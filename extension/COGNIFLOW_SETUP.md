# Mixed API Setup Guide - Cogniflow + Google Safe Browsing

The Chrome extension has been configured to use a mixed API approach:
- **Text Analysis**: Cogniflow API (your fraud detection model)
- **Image Analysis**: Cogniflow API (your image classification model)  
- **URL Analysis**: Google Safe Browsing API (malicious URL detection)

## ✅ Current Configuration Status

Your extension is already configured with the following credentials:

### Text Analysis (Cogniflow)
- **Model ID**: `b7562ba0-a75d-4001-9375-1f06f22e0b13`
- **API Key**: `cdc872e5-00ae-4d32-936c-a80bf6a889ce`
- **Endpoint**: `https://predict.cogniflow.ai/text/classification/predict/...`

### Image Analysis (Cogniflow)
- **Model ID**: `ba056844-ddea-47fb-b6f5-9adcf567cbae`
- **API Key**: `764ea05f-f623-4c7f-919b-dac6cf7223f3`
- **Endpoint**: `https://predict.cogniflow.ai/image/llm-classification/predict/...`

### URL Analysis (Google Safe Browsing)
- **API Key**: `AIzaSyD7t6JWpS89dUelr1MXYJHcze2MnLTLmpY` (from your .env file)
- **Endpoint**: `https://safebrowsing.googleapis.com/v4/threatMatches:find`
- **Purpose**: Detect malicious URLs, phishing sites, malware

## 🔧 API Integration Details

### Cogniflow API Structure
```javascript
// Text Analysis Request
POST https://predict.cogniflow.ai/text/classification/predict/b7562ba0-a75d-4001-9375-1f06f22e0b13
Headers: {
    "Content-Type": "application/json",
    "x-api-key": "cdc872e5-00ae-4d32-936c-a80bf6a889ce"
}
Body: {
    "text": "Your text to analyze"
}

// Image Analysis Request  
POST https://predict.cogniflow.ai/image/llm-classification/predict/ba056844-ddea-47fb-b6f5-9adcf567cbae
Headers: {
    "x-api-key": "764ea05f-f623-4c7f-919b-dac6cf7223f3"
}
Body: FormData with file field
```

### Google Safe Browsing API Structure
```javascript
// URL Analysis Request
POST https://safebrowsing.googleapis.com/v4/threatMatches:find?key=AIzaSyD7t6JWpS89dUelr1MXYJHcze2MnLTLmpY
Headers: {
    "Content-Type": "application/json"
}
Body: {
    "client": {
        "clientId": "fraud-fence-extension",
        "clientVersion": "1.0.0"
    },
    "threatInfo": {
        "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
        "platformTypes": ["ANY_PLATFORM"],
        "threatEntryTypes": ["URL"],
        "threatEntries": [{"url": "https://example.com"}]
    }
}
```

## 🧪 Testing Your Configuration

### Option 1: Use the API Test Tool
1. Open `api-test.html` in your browser
2. All credentials are pre-filled with your actual values
3. Test each analysis type to verify functionality

### Option 2: Test the Chrome Extension
1. Load the extension in Chrome (Developer mode)
2. **Text Analysis**: Select text on any webpage → right-click → "Check for Fraud"
3. **Image Analysis**: Click extension icon → Image tab → upload an image
4. **URL Analysis**: Click extension icon → URL tab → paste a URL

## 🔄 Response Format Standardization

The extension normalizes all API responses to a consistent format:

```javascript
{
    isFraud: boolean,           // true if fraud/threat detected
    confidence: number,         // 0-100 confidence score
    riskLevel: string,          // "Safe", "Low Risk", "High Risk", etc.
    details: string,            // Analysis details or threat type
    source: string             // "Cogniflow" or "Google Safe Browsing"
}
```

### Example Responses

**Cogniflow Text Analysis**:
```json
{
    "prediction": "fraud",
    "confidence": 0.85,
    "details": "Suspicious language patterns detected"
}
```

**Google Safe Browsing URL Check**:
```json
{
    "matches": [
        {
            "threatType": "MALWARE",
            "platformType": "ANY_PLATFORM", 
            "threat": {"url": "http://malware.testing.google.test/testing/malware/"}
        }
    ]
}
```

**Normalized Extension Response**:
```json
{
    "isFraud": true,
    "confidence": 95,
    "riskLevel": "High Risk - Malicious URL detected",
    "details": "Threat detected: MALWARE",
    "source": "Google Safe Browsing"
}
```

## 🛠️ Configuration Files

The extension uses these configuration constants:

**popup.js** and **background.js**:
```javascript
const API_CONFIG = {
    text: {
        endpoint: `${API_BASE_URL}/text/classification/predict/b7562ba0-a75d-4001-9375-1f06f22e0b13`,
        apiKey: 'cdc872e5-00ae-4d32-936c-a80bf6a889ce',
        type: 'cogniflow'
    },
    image: {
        endpoint: `${API_BASE_URL}/image/llm-classification/predict/ba056844-ddea-47fb-b6f5-9adcf567cbae`,
        apiKey: '764ea05f-f623-4c7f-919b-dac6cf7223f3',
        type: 'cogniflow'
    },
    url: {
        endpoint: `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_API_KEY}`,
        apiKey: GOOGLE_SAFE_BROWSING_API_KEY,
        type: 'google-safe-browsing'
    }
};
```

## 🚀 Ready to Use!

Your Chrome extension is fully configured and ready to:

✅ **Detect fraudulent text** using your trained Cogniflow model  
✅ **Analyze suspicious images** using your Cogniflow image classifier  
✅ **Check malicious URLs** using Google's comprehensive threat database  
✅ **Store analysis history** in Chrome's local storage  
✅ **Provide real-time analysis** when the popup opens on any website  
✅ **Context menu integration** for quick text analysis  

## 🔧 Troubleshooting

### Common Issues:

1. **Cogniflow 401 Unauthorized**: Check if your API keys are valid and active
2. **Cogniflow 404 Not Found**: Verify your model IDs are correct and models are deployed
3. **Google Safe Browsing 403 Forbidden**: Check if your API key has Safe Browsing API enabled
4. **Extension popup not loading**: Check browser console (F12) for JavaScript errors

### Getting Help:

- **Cogniflow Issues**: Check [Cogniflow Documentation](https://docs.cogniflow.ai/)
- **Google Safe Browsing**: Check [Google Safe Browsing API docs](https://developers.google.com/safe-browsing/)
- **Chrome Extension Issues**: Check browser developer console for error messages

## 🔒 Security Notes

- Your API keys are hardcoded in the extension files (this is acceptable for personal use)
- For production deployment, consider using Chrome extension storage APIs for sensitive data
- Google Safe Browsing API has usage quotas - monitor your usage in Google Cloud Console
- Cogniflow API usage depends on your subscription plan

## 📊 Expected Performance

- **Text Analysis**: ~1-3 seconds response time via Cogniflow
- **Image Analysis**: ~2-5 seconds response time via Cogniflow  
- **URL Analysis**: ~0.5-2 seconds response time via Google Safe Browsing
- **History Storage**: Instant local storage, 50 item limit with auto-cleanup
