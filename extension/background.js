// Background Script for Fraud Fence Extension
// Handles context menus, API requests, and communication between scripts

// API Configuration - Mixed APIs (Cogniflow + Google Safe Browsing)
const API_BASE_URL = 'https://predict.cogniflow.ai';
const GOOGLE_SAFE_BROWSING_API_KEY = 'AIzaSyD7t6JWpS89dUelr1MXYJHcze2MnLTLmpY';

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
        // Always use JSON base64 payload (previous 422 shows server expects JSON not multipart)
        const imageBlob = await downloadImage(imageUrl);
        console.log('🖼️ Image blob downloaded, size(bytes):', imageBlob.size);
        const blobToBase64 = (blob) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        const dataUrl = await blobToBase64(imageBlob);
        const base64 = dataUrl.split(',')[1];
        const payload = {
            image_base64: base64,
            image: base64,              // alternate key some APIs accept
            format: 'base64',           // REQUIRED by API (422 complained about missing format)
            prompt: 'Analyze this image for fraud, scam, phishing, deceptive or suspicious indicators'
        };
        console.log('📤 Sending image JSON payload (keys):', Object.keys(payload));
        const result = await analyzeContent('image', payload);
        
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
        console.error('Image analysis failed:', error);
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
 * Make API request to analyze content using mixed APIs (Cogniflow + Google Safe Browsing)
 */
async function analyzeContent(type, data) {
    console.log('🌐 analyzeContent called with:', { type, data });
    
    const config = API_CONFIG[type];
    if (!config) {
        console.error('❌ Unsupported analysis type:', type);
        throw new Error(`Unsupported analysis type: ${type}`);
    }
    console.log('⚙️ Using API config:', { endpoint: config.endpoint, type: config.type });
    
    let options;
    
    if (config.type === 'google-safe-browsing') {
        // Handle URL analysis with Google Safe Browsing API
        const url = data.url || data.text || data;
        const payload = {
            client: {
                clientId: "fraud-fence-extension",
                clientVersion: "1.0.0"
            },
            threatInfo: {
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url: url }]
            }
        };
        
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };
    } else if (type === 'image') {
        // --- Image analysis branch with adaptive payload strategy ---
        // Convert FormData to base64 JSON if needed
        if (typeof FormData !== 'undefined' && data instanceof FormData) {
            console.log('ℹ️ Converting FormData to base64 JSON for image endpoint');
            const fileEntry = data.get('file') || data.get('image');
            if (!fileEntry) throw new Error('No image file found in FormData');
            const blob = fileEntry;
            const toB64 = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onloadend = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });
            const b64 = await toB64(blob);
            data = { image_base64: b64, format: 'base64', prompt: data.get('prompt') || 'Analyze this image for fraud or scam indicators' };
        }

        // Normalize incoming object
        if (data && typeof data === 'object') {
            // If only "image" provided, map to image_base64
            if (!data.image_base64 && data.image && typeof data.image === 'string') {
                data.image_base64 = data.image;
            }
            if (data.image_base64 && !data.format) data.format = 'base64';
        }

        const base64Len = data?.image_base64 ? data.image_base64.length : 0;
        console.log('🖼️ Prepared base64 (length only):', base64Len);

        const prompt = data.prompt || 'Analyze this image for fraud or scam indicators';
        const b64 = data.image_base64;
        if (!b64) {
            throw new Error('No base64 image data supplied for image analysis');
        }

        // Prepare a set of payload variants (some APIs are picky about field names)
        const payloadVariants = [
            { image_base64: b64, format: 'base64', prompt },
            { image: b64, format: 'base64', prompt },
            { image_base64: b64, image: b64, format: 'base64', prompt },
            { image_base64: b64, format: 'base64' } // without prompt
        ];

        let lastErrorStatus = null;
        let lastErrorBody = null;
        let successResponse = null;

        for (let i = 0; i < payloadVariants.length; i++) {
            const variant = payloadVariants[i];
            console.log(`📤 Image API attempt ${i + 1}/${payloadVariants.length} with keys:`, Object.keys(variant));
            const attemptOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': config.apiKey
                },
                body: JSON.stringify(variant)
            };
            try {
                const resp = await fetch(config.endpoint, attemptOptions);
                console.log(`📥 Attempt ${i + 1} status:`, resp.status, resp.statusText);
                if (!resp.ok) {
                    lastErrorStatus = resp.status;
                    try {
                        lastErrorBody = await resp.text();
                    } catch (_) {
                        lastErrorBody = '<unreadable>';
                    }
                    console.warn(`⚠️ Attempt ${i + 1} failed (${resp.status}). Body snippet:`, (lastErrorBody || '').substring(0, 180));
                    // If server error 5xx, we might still try next variant; small delay for 500 specifically
                    if (resp.status >= 500) {
                        await new Promise(r => setTimeout(r, 250));
                    }
                    continue; // try next variant
                }
                // Success
                successResponse = await resp.json();
                console.log('✅ Image API success on variant', i + 1, 'raw response:', successResponse);
                // Replace result variable path by faking normal flow below (assign and break)
                result = successResponse; // allow normal post-processing logic
                break;
            } catch (fetchErr) {
                console.error(`❌ Network/Fetch error on attempt ${i + 1}:`, fetchErr.message);
                lastErrorBody = fetchErr.message;
                // brief delay then continue
                await new Promise(r => setTimeout(r, 150));
            }
        }

        if (!successResponse) {
            console.error('🛑 All image payload variants failed. Last status/body:', lastErrorStatus, lastErrorBody);
            throw new Error(`Image analysis failed (last status ${lastErrorStatus}): ${lastErrorBody?.substring(0,200)}`);
        }

        // Skip the generic fetch below since we already fetched successfully.
        // Continue to transformation logic outside main branch.
        console.log('🔁 Bypassing generic request flow for image after success variant.');
        // Proceed directly to transformation logic without executing rest of function's fetch section.
        // Emulate early-return pattern: wrap transformation logic after generic fetch in a conditional.
        // We'll handle by marking a flag and jumping to transformation portion.
        var skipGenericRequest = true;
        // Fall through so transformation logic executes.
    } else {
        // Handle text analysis with Cogniflow
        const payload = { text: data.text || data };
        
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey
            },
            body: JSON.stringify(payload)
        };
    }
    let result;
    if (!skipGenericRequest) {
        console.log('📡 Making API request:', { url: config.endpoint, method: options.method });
        console.log('📋 Request options:', { headers: options.headers, bodyPreview: typeof options.body === 'string' ? options.body.substring(0, 120) : typeof options.body });
        const response = await fetch(config.endpoint, options);
        console.log('📡 Fetch completed for:', config.endpoint);
        
        console.log('📥 API response status:', response.status, response.statusText);
        
        if (!response.ok) {
            console.error('❌ API request failed:', response.status, response.statusText);
            // Try to get error details from response
            try {
                const errorText = await response.text();
                console.error('❌ Error response body:', errorText);
            } catch (e) {
                console.error('❌ Could not read error response');
            }
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        result = await response.json();
        console.log('📦 Raw API response:', result);
    }
    
    // Transform Google Safe Browsing API response to match expected format
    if (config.type === 'google-safe-browsing') {
        console.log('🛡️ Processing Google Safe Browsing response...');
        const hasThreat = result.matches && result.matches.length > 0;
        console.log('🔍 Threat analysis:', { hasThreat, matches: result.matches });
        
        result = {
            isFraud: hasThreat || false, // Ensure it's always boolean
            confidence: hasThreat ? 95 : 5,
            riskLevel: hasThreat ? 'High Risk - Malicious URL detected' : 'Safe - No known threats',
            details: hasThreat ? `Threat detected: ${result.matches[0].threatType}` : 'URL appears safe',
            source: 'Google Safe Browsing'
        };
        
        console.log('✅ Transformed Safe Browsing result:', result);
    } else {
        // For Cogniflow APIs, extract confidence from the actual response
        console.log('🧠 Processing Cogniflow response...');
        
        if (result.result !== undefined) {
            // Handle the actual Cogniflow response format: {result: 'fraud', confidence_score: 0.698}
            const prediction = result.result;
            let confidence = (result.confidence_score || result.confidence || 0.05) * 100;
            
            console.log('📊 Cogniflow analysis:', { prediction, confidence, originalConfidence: result.confidence_score });
            
            result = {
                isFraud: prediction === 'fraud' || prediction === 'scam',
                confidence: Math.round(confidence),
                riskLevel: confidence > 80 ? 'High Risk' : confidence > 50 ? 'Medium Risk' : 'Low Risk',
                details: prediction === 'fraud' ? `Fraud detected with ${Math.round(confidence)}% confidence` : 
                        prediction === 'scam' ? `Scam detected with ${Math.round(confidence)}% confidence` :
                        `Classified as: ${prediction} (${Math.round(confidence)}% confidence)`,
                source: 'Cogniflow'
            };
        } else if (result.prediction || result.predictions) {
            // Handle older prediction format (if still used)
            const prediction = result.prediction || result.predictions?.[0];
            let confidence = 5; // default low confidence
            
            if (typeof prediction === 'object') {
                confidence = (prediction.confidence || prediction.score || 0.05) * 100;
            } else if (result.confidence !== undefined) {
                confidence = result.confidence * 100;
            } else if (result.score !== undefined) {
                confidence = result.score * 100;
            }
            
            result = {
                isFraud: prediction === 'fraud' || prediction === 'scam' || confidence > 50,
                confidence: Math.round(confidence),
                riskLevel: confidence > 80 ? 'High Risk' : confidence > 50 ? 'Medium Risk' : 'Low Risk',
                details: result.details || `Analysis complete with ${Math.round(confidence)}% confidence`,
                source: 'Cogniflow'
            };
        } else if (result.label || result.class_name || (result.classes && Array.isArray(result.classes))) {
            // Handle image classification response variations
            let confidence = (result.confidence || result.score || result.confidence_score || 0.05) * 100;
            let label = result.label || result.class_name;

            // If label missing but classes array exists, take top class
            if (!label && result.classes && result.classes.length) {
                const top = result.classes[0];
                label = top.label || top.class || 'unknown';
                if (top.score) confidence = top.score * 100;
            }

            result = {
                isFraud: ['fraud', 'scam', 'phishing', 'suspicious'].includes((label || '').toLowerCase()),
                confidence: Math.round(confidence),
                riskLevel: confidence > 80 ? 'High Risk' : confidence > 50 ? 'Medium Risk' : 'Low Risk',
                details: `Image classified as: ${label} (${Math.round(confidence)}% confidence)` ,
                source: 'Cogniflow'
            };
        }
    }
    
    console.log('🔧 Final transformed result:', result);
    return result;
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
