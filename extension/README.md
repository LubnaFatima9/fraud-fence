# Fraud Fence Chrome Extension

A powerful Chrome extension that helps detect fraud, scams, and suspicious content across the web.

## Features

### 🔍 **Multi-Modal Analysis**
- **Text Analysis**: Paste suspicious text to check for fraud patterns
- **Image Analysis**: Upload images to detect fraudulent content
- **URL Analysis**: Check if links are safe before clicking

### 🖱️ **Context Menu Integration**
- Right-click on selected text to analyze instantly
- Right-click on images to check for fraud
- Right-click on links to verify safety
- Scan entire pages for suspicious content

### 🛡️ **Real-Time Protection**
- Automatic page scanning for common scam patterns
- Warning banners for high-risk content
- Visual highlighting of suspicious elements
- Background monitoring of dynamic content

### 📊 **Detailed Reporting**
- Confidence scores for all analyses
- Categorized threat detection
- Detailed explanations of findings
- False positive reporting system

## Installation

### For Development
1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `extension/` folder

### For Production
1. Package the extension using Chrome's extension packaging tools
2. Upload to Chrome Web Store for review and publication

## API Integration

The extension connects to your Fraud Fence API hosted on Vercel:

- **Text Detection**: `POST https://fraud-fence.vercel.app/api/text-detect`
- **Image Detection**: `POST https://fraud-fence.vercel.app/api/image-detect`
- **URL Detection**: `POST https://fraud-fence.vercel.app/api/url-detect`

### Expected API Request Formats

**Text Analysis:**
```json
{
  "text": "Congratulations! You've won $1,000,000!"
}
```

**URL Analysis:**
```json
{
  "url": "https://suspicious-website.com"
}
```

**Image Analysis:**
```
multipart/form-data with 'image' field containing the file
```

### Expected API Response Format

```json
{
  "isFraud": true,
  "confidence": 85,
  "riskLevel": "high",
  "details": "Contains typical prize scam language patterns",
  "analysis": "Detected phrases commonly used in lottery scams"
}
```

## File Structure

```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── popup.css             # Popup styling
├── background.js         # Background service worker
├── content-script.js     # Page content analysis
├── content-script.css    # Content script styling
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## Permissions Explained

- `contextMenus`: Create right-click menu options
- `storage`: Store user preferences and temporary data
- `scripting`: Inject scripts into web pages for analysis
- `activeTab`: Access current tab content when requested
- `notifications`: Show fraud detection alerts
- `host_permissions`: Connect to your API endpoints

## Customization

### Updating API Endpoints
To change API endpoints, modify the `API_BASE_URL` constant in:
- `popup.js` (line 2)
- `background.js` (line 4)

### Adding New Scam Patterns
Edit the `SUSPICIOUS_PATTERNS` array in `content-script.js` (line 4) to add new detection patterns.

### Styling Customization
- Modify `popup.css` for popup appearance
- Modify `content-script.css` for warning banner and highlight styles

## Browser Compatibility

- **Chrome**: Version 88+ (Manifest V3 support)
- **Edge**: Version 88+ (Chromium-based)
- **Other Browsers**: May require adaptation for different extension APIs

## Privacy & Security

- No personal data is collected or stored
- All analysis is performed via your secure API
- Content is only sent to your API when explicitly requested by user
- No tracking or analytics included

## Development Guidelines

### Code Organization
- Keep API configurations at the top of each file
- Use descriptive function names and comments
- Follow consistent error handling patterns
- Maintain separation between UI and business logic

### Testing
1. Test all popup functionality manually
2. Test context menu actions on different content types
3. Verify content script detection on various websites
4. Test API connectivity and error handling

### Performance Considerations
- Content script runs on all pages - keep it lightweight
- Debounce page scanning to avoid excessive API calls
- Use efficient DOM querying and manipulation
- Implement proper cleanup for event listeners

## Troubleshooting

### Common Issues

**Extension not loading:**
- Check manifest.json syntax
- Verify all file paths are correct
- Check browser console for errors

**API requests failing:**
- Verify API endpoints are accessible
- Check CORS configuration on your server
- Confirm request format matches API expectations

**Content script not working:**
- Check for JavaScript errors in page console
- Verify content script injection permissions
- Test on different websites

### Debug Mode
Enable debug logging by setting `console.log` statements or use Chrome DevTools:
1. Open extension popup
2. Right-click → Inspect
3. Check Console and Network tabs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Your License Here]

## Support

For issues and feature requests, please contact [your-email@domain.com] or visit [your-website.com].
