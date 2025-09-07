// Background Script for Fraud Fence Extension
// Handles context menus, API requests, and communication between scripts

// API Configuration - Using local Next.js API endpoints
const LOCAL_API_BASE = 'http://localhost:9005/api';

const API_CONFIG = {
    text: {
        endpoint: `${LOCAL_API_BASE}/text-detect`,
        type: 'local-api'
    },
    image: {
        endpoint: `${LOCAL_API_BASE}/image-detect`,
        type: 'local-api'
    },
    url: {
        endpoint: `${LOCAL_API_BASE}/url-detect`,
        type: 'local-api'
    }
};

// Context Menu IDs
const CONTEXT_MENU_IDS = {
    TEXT: 'analyze-selected-text',
    TEXT_FRAUD_CHECK: 'check-for-fraud-text',
    IMAGE: 'analyze-image',
    LINK: 'analyze-link',
    PAGE: 'analyze-page'
};

/**
 * Initialize extension when installed
 */
chrome.runtime.onInstalled.addListener(() => {
    console.log('🚀 Fraud Fence extension installed');
    createContextMenus();
});

/**
 * Also create context menus when service worker starts
 */
chrome.runtime.onStartup.addListener(() => {
    console.log('🚀 Fraud Fence extension starting up');
    createContextMenus();
});

/**
 * Create context menu items
 */
function createContextMenus() {
    console.log('🔧 Creating context menus...');
    
    // Remove existing menus first
    chrome.contextMenus.removeAll(() => {
        console.log('✅ Existing context menus removed');
        
        // Main "Check for Fraud" option for selected text
        chrome.contextMenus.create({
            id: CONTEXT_MENU_IDS.TEXT_FRAUD_CHECK,
            title: 'Check for Fraud',
            contexts: ['selection']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('❌ Error creating fraud check menu:', chrome.runtime.lastError.message);
            } else {
                console.log('✅ Fraud check menu created');
            }
        });

        // Analyze selected text (detailed)
        chrome.contextMenus.create({
            id: CONTEXT_MENU_IDS.TEXT,
            title: 'Analyze selected text: "%s"',
            contexts: ['selection']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('❌ Error creating text analysis menu:', chrome.runtime.lastError.message);
            } else {
                console.log('✅ Text analysis menu created');
            }
        });

        // Analyze image
        chrome.contextMenus.create({
            id: CONTEXT_MENU_IDS.IMAGE,
            title: 'Analyze image for fraud',
            contexts: ['image']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('❌ Error creating image analysis menu:', chrome.runtime.lastError.message);
            } else {
                console.log('✅ Image analysis menu created');
            }
        });

        // Analyze link
        chrome.contextMenus.create({
            id: CONTEXT_MENU_IDS.LINK,
            title: 'Check link safety',
            contexts: ['link']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('❌ Error creating link check menu:', chrome.runtime.lastError.message);
            } else {
                console.log('✅ Link check menu created');
            }
        });

        // Analyze current page
        chrome.contextMenus.create({
            id: CONTEXT_MENU_IDS.PAGE,
            title: 'Scan page for scams',
            contexts: ['page']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('❌ Error creating page scan menu:', chrome.runtime.lastError.message);
            } else {
                console.log('✅ Page scan menu created');
            }
        });
        
        console.log('🔧 All context menus creation initiated');
    });
}

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    console.log('🎯 Context menu clicked!');
    console.log('📋 Menu item ID:', info.menuItemId);
    console.log('📋 Selected text:', info.selectionText);
    console.log('📋 Source URL:', info.srcUrl);
    console.log('📋 Link URL:', info.linkUrl);
    console.log('📋 Tab info:', tab?.url);
    
    // Show immediate confirmation notification
    showNotification('🔍 Processing...', `Analyzing your request...`);
    
    try {
        switch (info.menuItemId) {
            case CONTEXT_MENU_IDS.TEXT:
            case CONTEXT_MENU_IDS.TEXT_FRAUD_CHECK:
                console.log('📝 Processing text analysis...');
                await handleTextAnalysis(info.selectionText, tab);
                break;
            
            case CONTEXT_MENU_IDS.IMAGE:
                    console.log('🖼️ Processing image analysis...');
                    await handleImageAnalysis(info.srcUrl, tab);
                break;
            
            case CONTEXT_MENU_IDS.LINK:
                console.log('🔗 Processing link analysis...');
                await handleLinkAnalysis(info.linkUrl, tab);
                break;
            
            case CONTEXT_MENU_IDS.PAGE:
                console.log('📄 Processing page analysis...');
                await handlePageScan(tab);
                break;
                
            default:
                console.error('❌ Unknown menu item:', info.menuItemId);
                break;
        }
    } catch (error) {
        console.error('❌ Context menu action failed:', error);
        showNotification('Error', `Failed to analyze content: ${error.message}`);
    }
});

/**
 * Handle text analysis from context menu with improved notifications
 */
async function handleTextAnalysis(text, tab) {
    console.log('🔍 handleTextAnalysis called with:', { textLength: text?.length, tabUrl: tab?.url });
    
    if (!text || text.length > 5000) {
        console.log('❌ Text validation failed:', { textExists: !!text, textLength: text?.length });
        showNotification('Error', 'Selected text is too long or empty.');
        return;
    }

    console.log('📝 Starting text analysis for:', text.substring(0, 50) + '...');
    showNotification('Analyzing...', 'Checking selected text for fraud patterns.');

    try {
        console.log('🌐 Calling analyzeContent API...');
        const result = await analyzeContent('text', { text });
        console.log('✅ API response received:', result);
        
        // Create detailed notification
        const title = result.isFraud ? '🚨 Fraud Detected!' : 
                      result.confidence > 50 ? '⚠️ Suspicious Text' : '✅ Text Looks Safe';
        const message = `${Math.round(result.confidence)}% confidence\n${result.details || result.riskLevel}`;
        
        console.log('📢 Showing result notification:', { title, message });
        showNotification(title, message);
        
        // Store in history and send message to popup to update
        console.log('💾 Saving to storage...');
        await saveAnalysisToStorage('text', text, result);
        
        // Send message to popup if it's open, or store data for when it opens
        console.log('📤 Sending message to popup...');
        chrome.runtime.sendMessage({
            action: 'context-menu-result',
            type: 'text',
            content: text,
            result: result
        }).catch((error) => {
            console.log('📬 Popup not open, storing result for later:', error.message);
            // Popup not open, store result for later
            chrome.storage.local.set({
                latestContextResult: {
                    type: 'text',
                    content: text,
                    result: result,
                    timestamp: Date.now()
                }
            });
        });
        
        console.log('✅ Text analysis completed successfully');
        
    } catch (error) {
        console.error('❌ Text analysis failed:', error);
        showNotification('Analysis Failed', `Could not analyze the selected text: ${error.message}`);
    }
}

/**
 * Handle image analysis from context menu
 */
async function handleImageAnalysis(imageUrl, tab) {
    if (!imageUrl) {
        showNotification('Error', 'Could not access image URL.');
        return;
    }

    showNotification('Analyzing...', 'Checking image for fraudulent content.');

    try {
        console.log('🖼️ Starting image analysis for URL:', imageUrl);
        
        // Download the image and convert to data URL
        const imageBlob = await downloadImage(imageUrl);
        console.log('🖼️ Image blob downloaded, size(bytes):', imageBlob.size);
        
        // Convert blob to data URL
        const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        
        const dataUrl = await blobToDataUrl(imageBlob);
        console.log('🖼️ Image converted to data URL, length:', dataUrl.length);
        
        // Call the local API with the data URL
        const result = await analyzeContent('image', { imageData: dataUrl });
        
        const title = result.isFraud ? '🚨 Suspicious Image!' : '✅ Image Looks Safe';
        const message = `${Math.round(result.confidence)}% confidence - ${result.riskLevel}`;
        
        showNotification(title, message);
        
        // Store in history and send message to popup
        await saveAnalysisToStorage('image', imageUrl, result);
        
        chrome.runtime.sendMessage({
            action: 'context-menu-result',
            type: 'image',
            content: imageUrl,
            result: result
        }).catch(() => {
            chrome.storage.local.set({
                latestContextResult: {
                    type: 'image',
                    content: imageUrl,
                    result: result,
                    timestamp: Date.now()
                }
            });
        });
        
    } catch (error) {
        console.error('❌ Image analysis failed:', error);
        showNotification('Analysis Failed', `Could not analyze the image: ${error.message}`);
    }
}

/**
 * Handle link analysis from context menu
 */
async function handleLinkAnalysis(url, tab) {
    console.log('🔗 handleLinkAnalysis called with:', { url, tabUrl: tab?.url });
    
    if (!url) {
        console.log('❌ No URL provided');
        showNotification('Error', 'Could not access link URL.');
        return;
    }

    console.log('🌐 Starting link analysis for:', url);
    showNotification('Analyzing...', 'Checking link safety.');

    try {
        console.log('🌐 Calling analyzeContent API for URL...');
        const result = await analyzeContent('url', url);
        console.log('✅ Link analysis API response received:', result);
        
        const title = result.isFraud ? '🚨 Dangerous Link!' : '✅ Link Looks Safe';
        const message = `${Math.round(result.confidence)}% confidence - ${result.riskLevel}`;
        
        console.log('📢 Showing link result notification:', { title, message });
        showNotification(title, message);
        
        // Store data and send message to popup
        console.log('💾 Saving link analysis to storage...');
        await saveAnalysisToStorage('url', url, result);
        
        console.log('📤 Sending link analysis message to popup...');
        chrome.runtime.sendMessage({
            action: 'context-menu-result',
            type: 'url',
            content: url,
            result: result
        }).catch((error) => {
            console.log('📬 Popup not open for link analysis, storing result for later:', error.message);
            chrome.storage.local.set({
                latestContextResult: {
                    type: 'url',
                    content: url,
                    result: result,
                    timestamp: Date.now()
                }
            });
        });
        
        console.log('✅ Link analysis completed successfully');
        
    } catch (error) {
        console.error('❌ Link analysis failed:', error);
        showNotification('Analysis Failed', `Could not analyze the link: ${error.message}`);
    }
}

/**
 * Handle full page scan from context menu
 */
async function handlePageScan(tab) {
    showNotification('Scanning...', 'Scanning page for suspicious content.');

    try {
        // Inject content script to scan page
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: scanPageContent
        });

        if (results && results[0]) {
            const scanResult = results[0];
            const suspiciousCount = scanResult.suspiciousElements?.length || 0;
            
            if (suspiciousCount > 0) {
                const title = `⚠️ ${suspiciousCount} Suspicious Item(s) Found!`;
                const message = `Found potentially fraudulent content on this page.`;
                
                showNotification(title, message);
                
                // Trigger warning banner on page
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: showWarningBanner,
                    args: [scanResult]
                });
                
                // Store scan result and send message to popup
                const pageScanData = {
                    url: tab.url,
                    timestamp: Date.now(),
                    result: scanResult
                };
                
                await chrome.storage.local.set({
                    pageScanResult: pageScanData
                });
                
                chrome.runtime.sendMessage({
                    action: 'page-scan-result',
                    result: pageScanData
                }).catch(() => {
                    // Message failed, data is already stored for when popup opens
                });
                
            } else {
                showNotification('✅ Page Looks Clean', 'No suspicious content detected.');
                
                // Also check the page URL for safety
                try {
                    const urlResult = await analyzeContent('url', tab.url);
                    if (urlResult.isFraud) {
                        showNotification('⚠️ URL Warning!', `This website URL may be malicious: ${urlResult.riskLevel}`);
                        
                        await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            function: showWarningBanner,
                            args: [{
                                suspiciousElements: [{
                                    type: 'URL',
                                    reason: `Malicious URL detected: ${urlResult.details}`,
                                    confidence: urlResult.confidence
                                }]
                            }]
                        });
                    }
                } catch (urlError) {
                    console.log('URL analysis failed during page scan:', urlError);
                }
            }
        }
        
    } catch (error) {
        console.error('Page scan failed:', error);
        showNotification('Scan Failed', `Could not scan the current page: ${error.message}. Make sure you have permission to access this site.`);
    }
}

/**
 * Make API request to analyze content using local Next.js API endpoints
 */
async function analyzeContent(type, data) {
    console.log('🌐 analyzeContent called with:', { type, data });
    
    const config = API_CONFIG[type];
    if (!config) {
        console.error('❌ Unsupported analysis type:', type);
        throw new Error(`Unsupported analysis type: ${type}`);
    }
    console.log('⚙️ Using API config:', { endpoint: config.endpoint, type: config.type });
    
    let requestBody;
    
    // Prepare request body based on analysis type
    switch (type) {
        case 'text':
            requestBody = { text: data.text || data };
            break;
        case 'image':
            // For image analysis, data should contain imageData (base64 data URL)
            if (data.image_base64) {
                // Convert base64 to data URL format if needed
                const imageData = data.image_base64.startsWith('data:') ? 
                    data.image_base64 : 
                    `data:image/jpeg;base64,${data.image_base64}`;
                requestBody = { imageData };
            } else if (data.imageData) {
                requestBody = { imageData: data.imageData };
            } else {
                throw new Error('No image data provided for image analysis');
            }
            break;
        case 'url':
            requestBody = { url: data.url || data };
            break;
        default:
            throw new Error(`Unknown analysis type: ${type}`);
    }
    
    console.log('� Request body prepared:', { ...requestBody, imageData: requestBody.imageData ? '[IMAGE_DATA]' : undefined });
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    };
    
    console.log('📡 Making API request:', { url: config.endpoint, method: options.method });
    
    try {
        const response = await fetch(config.endpoint, options);
        console.log('📥 API response status:', response.status, response.statusText);
        
        if (!response.ok) {
            console.error('❌ API request failed:', response.status, response.statusText);
            let errorText = 'Unknown error';
            try {
                errorText = await response.text();
                console.error('❌ Error response body:', errorText);
            } catch (e) {
                console.error('❌ Could not read error response');
            }
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('📦 Raw API response:', result);
        
        // Transform the response to match the expected format
        const transformedResult = {
            isFraud: result.isFraudulent || result.isFraud || !result.isSafe || false,
            confidence: result.confidenceScore || result.confidence || 0,
            riskLevel: result.isFraudulent || result.isFraud || !result.isSafe ? 'High Risk' : 'Safe',
            details: result.explanation || result.details || 'Analysis complete',
            source: 'Local API'
        };
        
        console.log('🔧 Transformed result:', transformedResult);
        return transformedResult;
        
    } catch (error) {
        console.error('❌ API request error:', error);
        throw error;
    }
}

/**
 * Download image from URL as blob
 */
async function downloadImage(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to download image');
    }
    return await response.blob();
}

/**
 * Parse API response to standardized format
 */
function parseApiResponse(data) {
    return {
        isFraud: data.isFraud || data.fraud || false,
        confidence: data.confidence || data.score || 0,
        riskLevel: data.riskLevel || (data.isFraud ? 'High Risk' : 'Safe'),
        details: data.details || data.analysis || 'Analysis complete'
    };
}

/**
 * Show browser notification
 */
function showNotification(title, message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: title,
        message: message
    });
}

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'analyze-content':
            handleContentAnalysis(request.data)
                .then(sendResponse)
                .catch(error => {
                    console.error('Content analysis error:', error);
                    sendResponse({ error: error.message });
                });
            return true; // Keep message channel open for async response
            
        case 'show-notification':
            showNotification(request.title, request.message);
            sendResponse({ success: true });
            break;
            
        case 'get-settings':
            chrome.storage.sync.get(['settings'], (result) => {
                sendResponse(result.settings || {});
            });
            return true;
            
        case 'save-settings':
            chrome.storage.sync.set({ settings: request.settings }, () => {
                sendResponse({ success: true });
            });
            return true;
    }
});

/**
 * Handle content analysis requests from content script or popup
 */
async function handleContentAnalysis(data) {
    const { type, content } = data;
    
    try {
        const result = await analyzeContent(type, { [type]: content });
        
        // Save to history
        await saveAnalysisToStorage(type, content, result);
        
        return { success: true, result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Save analysis result to storage (for history)
 */
async function saveAnalysisToStorage(type, input, result) {
    try {
        const STORAGE_KEY = 'fraud_check_history';
        const storageResult = await chrome.storage.local.get([STORAGE_KEY]);
        const history = storageResult[STORAGE_KEY] || [];
        
        const historyItem = {
            id: Date.now() + Math.random(),
            type,
            input: typeof input === 'string' ? input : 'File',
            result,
            timestamp: new Date().toISOString()
        };
        
        history.push(historyItem);
        
        // Keep only last 50 items
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }
        
        await chrome.storage.local.set({ [STORAGE_KEY]: history });
    } catch (error) {
        console.error('Error saving analysis to storage:', error);
    }
}

// Functions that will be injected into pages
/**
 * Scan page content for suspicious patterns (injected function)
 */
function scanPageContent() {
    const suspiciousPatterns = [
        // Financial fraud
        { pattern: /congratulations.*won.*\$|won.*prize.*\$|lottery.*winner/i, type: 'Lottery Scam', severity: 'high' },
        { pattern: /click here.*claim.*money|claim.*\$.*now|collect.*reward/i, type: 'Prize Scam', severity: 'high' },
        { pattern: /verify.*account.*immediately|account.*suspended.*verify/i, type: 'Account Phishing', severity: 'high' },
        { pattern: /tax refund.*pending|irs.*refund|government.*refund/i, type: 'Tax Scam', severity: 'high' },
        { pattern: /bitcoin|cryptocurrency.*investment|crypto.*profit/i, type: 'Crypto Scam', severity: 'medium' },
        
        // Urgency tactics
        { pattern: /act now.*limited time|urgent.*action required|expires.*today/i, type: 'Urgency Pressure', severity: 'medium' },
        { pattern: /only.*\d+.*left|last chance|don't miss out/i, type: 'Scarcity Pressure', severity: 'medium' },
        
        // Tech support scams
        { pattern: /security alert.*virus|computer.*infected|microsoft.*support/i, type: 'Tech Support Scam', severity: 'high' },
        { pattern: /call.*support.*immediately|tech support.*\d{3}[-.]?\d{3}[-.]?\d{4}/i, type: 'Fake Tech Support', severity: 'high' },
        
        // Romance/social scams  
        { pattern: /lonely.*meet.*local|single.*women.*area|dating.*site.*free/i, type: 'Dating Scam', severity: 'low' },
        
        // Generic fraud indicators
        { pattern: /guaranteed.*income|make.*money.*fast|work from home.*\$/i, type: 'Get Rich Quick', severity: 'medium' },
        { pattern: /free.*trial.*credit card|no cost.*just pay shipping/i, type: 'Hidden Fee Scam', severity: 'medium' },
        { pattern: /click.*unsubscribe.*below|not.*spam.*legitimate/i, type: 'Spam Indicator', severity: 'low' }
    ];
    
    const suspiciousElements = [];
    const textElements = [];
    
    // Get all elements with text content
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
        if (el.textContent && el.textContent.trim().length > 10) {
            // Skip script and style elements
            if (!['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) {
                textElements.push(el);
            }
        }
    });
    
    // Also check specific suspicious element types
    const suspiciousSelectors = [
        'button[onclick*="claim"]',
        'a[href*="winner"]', 
        'a[href*="prize"]',
        'form[action*="verify"]',
        'input[value*="claim"]',
        '.popup', '.modal',
        '[class*="urgent"]', '[class*="warning"]'
    ];
    
    suspiciousSelectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (!textElements.includes(el)) {
                    textElements.push(el);
                }
            });
        } catch (e) {
            // Invalid selector, skip
        }
    });
    
    // Check each element against patterns
    textElements.forEach(element => {
        const text = element.textContent || element.value || element.alt || '';
        const href = element.href || element.action || '';
        const fullText = (text + ' ' + href).toLowerCase();
        
        suspiciousPatterns.forEach(({ pattern, type, severity }) => {
            if (pattern.test(fullText)) {
                // Check if this element or its content is already flagged
                const isDuplicate = suspiciousElements.some(existing => 
                    existing.element === element || 
                    (existing.text && text && existing.text.includes(text.substring(0, 50)))
                );
                
                if (!isDuplicate) {
                    suspiciousElements.push({
                        type: type,
                        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                        element: element.tagName,
                        severity: severity,
                        href: href.substring(0, 100),
                        reason: `Matches pattern: ${type}`,
                        confidence: severity === 'high' ? 85 : severity === 'medium' ? 65 : 40,
                        position: {
                            top: element.offsetTop,
                            left: element.offsetLeft
                        }
                    });
                }
            }
        });
    });
    
    // Additional checks for suspicious URLs in links
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
        const href = link.href.toLowerCase();
        const suspiciousDomains = [
            'bit.ly', 'tinyurl.com', 'short.link',  // URL shorteners
            'winner', 'prize', 'claim', 'reward',   // Common scam words in domains
            'verify', 'secure', 'update'            // Phishing words
        ];
        
        const hasSuspiciousDomain = suspiciousDomains.some(domain => href.includes(domain));
        const hasLongPath = href.split('/').length > 6;
        const hasRandomChars = /[a-z]{20,}/.test(href); // Very long random strings
        
        if (hasSuspiciousDomain || hasLongPath || hasRandomChars) {
            suspiciousElements.push({
                type: 'Suspicious URL',
                text: link.textContent.substring(0, 50),
                element: 'A',
                severity: 'medium',
                href: href.substring(0, 100),
                reason: hasSuspiciousDomain ? 'Suspicious domain' : hasLongPath ? 'Complex URL structure' : 'Random URL pattern',
                confidence: 60
            });
        }
    });
    
    // Check for excessive use of urgency words
    const urgencyWords = ['urgent', 'immediate', 'now', 'today', 'expires', 'limited', 'hurry'];
    const bodyText = document.body.textContent.toLowerCase();
    const urgencyCount = urgencyWords.reduce((count, word) => 
        count + (bodyText.match(new RegExp(word, 'g')) || []).length, 0
    );
    
    if (urgencyCount > 5) {
        suspiciousElements.push({
            type: 'Excessive Urgency',
            text: 'Multiple urgency indicators found',
            element: 'BODY',
            severity: 'medium',
            reason: `${urgencyCount} urgency words detected`,
            confidence: Math.min(30 + urgencyCount * 5, 80)
        });
    }
    
    return { 
        suspiciousElements,
        pageStats: {
            totalElements: textElements.length,
            linksScanned: links.length,
            urgencyScore: urgencyCount
        }
    };
}

/**
 * Show warning banner on page (injected function)
 */
function showWarningBanner(scanResult) {
    // Remove existing banner if present
    const existingBanner = document.getElementById('fraud-fence-warning');
    if (existingBanner) {
        existingBanner.remove();
    }
    
    const suspiciousCount = scanResult.suspiciousElements.length;
    const highSeverityCount = scanResult.suspiciousElements.filter(el => el.severity === 'high').length;
    
    // Choose banner color based on severity
    const bannerColor = highSeverityCount > 0 ? 
        'linear-gradient(90deg, #dc3545, #e74c3c)' :  // Red for high severity
        'linear-gradient(90deg, #ffc107, #f39c12)';   // Orange for medium/low
    
    // Create warning banner
    const banner = document.createElement('div');
    banner.id = 'fraud-fence-warning';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10000;
        background: ${bannerColor};
        color: white;
        padding: 15px 20px;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 2px 15px rgba(0,0,0,0.3);
        animation: slideDown 0.4s ease-out;
        cursor: pointer;
    `;
    
    // Create detailed content
    const topThreats = scanResult.suspiciousElements
        .sort((a, b) => (b.confidence || 50) - (a.confidence || 50))
        .slice(0, 3);
    
    const threatsList = topThreats.map(threat => 
        `<span style="background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 3px; margin: 0 2px;">${threat.type}</span>`
    ).join(' ');
    
    const severityText = highSeverityCount > 0 ? 
        `${highSeverityCount} High Risk` : 
        `${suspiciousCount} Medium/Low Risk`;
    
    banner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">${highSeverityCount > 0 ? '🚨' : '⚠️'}</span>
                <span style="font-weight: bold;">Fraud Fence Alert</span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span>${severityText} threat${suspiciousCount > 1 ? 's' : ''} detected:</span>
                ${threatsList}
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button id="fraud-fence-details" style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    Details
                </button>
                <button id="fraud-fence-close" style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 6px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    ✕
                </button>
            </div>
        </div>
        
        <div id="fraud-fence-details-panel" style="
            display: none;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid rgba(255,255,255,0.3);
            text-align: left;
            max-height: 200px;
            overflow-y: auto;
        ">
            ${scanResult.suspiciousElements.slice(0, 5).map((threat, index) => `
                <div style="margin: 6px 0; padding: 6px; background: rgba(0,0,0,0.1); border-radius: 4px;">
                    <strong>${threat.type}</strong> 
                    <span style="font-size: 11px; opacity: 0.8;">(${threat.confidence || 50}% confidence)</span>
                    <br>
                    <span style="font-size: 12px; opacity: 0.9;">${threat.reason || threat.text}</span>
                </div>
            `).join('')}
            ${scanResult.suspiciousElements.length > 5 ? 
                `<div style="text-align: center; opacity: 0.8; font-size: 12px; margin-top: 8px;">
                    ...and ${scanResult.suspiciousElements.length - 5} more issues
                </div>` : ''
            }
        </div>
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(banner);
    
    // Add event listeners
    document.getElementById('fraud-fence-close').onclick = () => {
        banner.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => banner.remove(), 300);
    };
    
    document.getElementById('fraud-fence-details').onclick = () => {
        const panel = document.getElementById('fraud-fence-details-panel');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    };
    
    // Auto-hide after 15 seconds for high severity, 10 seconds for others
    const autoHideDelay = highSeverityCount > 0 ? 15000 : 10000;
    setTimeout(() => {
        if (document.getElementById('fraud-fence-warning')) {
            banner.style.animation = 'slideDown 0.3s ease-out reverse';
            setTimeout(() => banner.remove(), 300);
        }
    }, autoHideDelay);
}
