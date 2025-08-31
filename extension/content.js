// Content Script for Fraud Fence Extension
// Runs on all web pages to detect suspicious content and provide warnings

// Configuration
const SUSPICIOUS_PATTERNS = [
    // Common scam phrases
    { pattern: /congratulations.*you.*won/i, severity: 'high', category: 'prize_scam' },
    { pattern: /click here.*claim.*prize/i, severity: 'high', category: 'prize_scam' },
    { pattern: /you've been selected.*winner/i, severity: 'high', category: 'prize_scam' },
    { pattern: /act now.*limited time.*offer/i, severity: 'medium', category: 'urgency' },
    { pattern: /verify.*account.*immediately/i, severity: 'high', category: 'phishing' },
    { pattern: /account.*suspended.*click/i, severity: 'high', category: 'phishing' },
    { pattern: /security alert.*verify/i, severity: 'high', category: 'phishing' },
    { pattern: /tax refund.*pending/i, severity: 'medium', category: 'government' },
    { pattern: /free.*iphone.*ipad/i, severity: 'medium', category: 'prize_scam' },
    { pattern: /miracle.*cure.*doctors hate/i, severity: 'medium', category: 'health_scam' },
    { pattern: /earn.*\$\d+.*day.*home/i, severity: 'medium', category: 'money_scam' },
    { pattern: /nigerian.*prince.*inheritance/i, severity: 'high', category: 'advance_fee' }
];

const SUSPICIOUS_URLS = [
    /bit\.ly\/[a-zA-Z0-9]+/i,
    /tinyurl\.com\/[a-zA-Z0-9]+/i,
    /t\.co\/[a-zA-Z0-9]+/i,
    /goo\.gl\/[a-zA-Z0-9]+/i
];

// State
let isScanning = false;
let detectedElements = new Set();
let warningBanner = null;

/**
 * Initialize content script
 */
function initialize() {
    // Scan page initially
    scanPageForSuspiciousContent();
    
    // Set up mutation observer to detect dynamic content
    setupMutationObserver();
    
    // Listen for messages from background script
    setupMessageListener();
    
    // Scan periodically for dynamic content
    setInterval(scanPageForSuspiciousContent, 5000);
}

/**
 * Scan the entire page for suspicious content
 */
function scanPageForSuspiciousContent() {
    if (isScanning) return;
    isScanning = true;
    
    try {
        const suspiciousElements = [];
        
        // Scan text content
        const textElements = findSuspiciousText();
        suspiciousElements.push(...textElements);
        
        // Scan links
        const linkElements = findSuspiciousLinks();
        suspiciousElements.push(...linkElements);
        
        // Scan forms
        const formElements = findSuspiciousForms();
        suspiciousElements.push(...formElements);
        
        // Process results
        if (suspiciousElements.length > 0) {
            handleSuspiciousContent(suspiciousElements);
        }
        
    } catch (error) {
        console.error('Fraud Fence: Error scanning page:', error);
    } finally {
        isScanning = false;
    }
}

/**
 * Find suspicious text content on the page
 */
function findSuspiciousText() {
    const suspiciousElements = [];
    const textNodes = getAllTextNodes(document.body);
    
    textNodes.forEach(node => {
        const text = node.textContent.trim();
        if (text.length < 10) return; // Skip very short text
        
        SUSPICIOUS_PATTERNS.forEach(({ pattern, severity, category }) => {
            if (pattern.test(text)) {
                const element = node.parentElement;
                if (!detectedElements.has(element)) {
                    suspiciousElements.push({
                        element,
                        text: text.substring(0, 200),
                        pattern: pattern.source,
                        severity,
                        category,
                        type: 'text'
                    });
                    detectedElements.add(element);
                }
            }
        });
    });
    
    return suspiciousElements;
}

/**
 * Find suspicious links on the page
 */
function findSuspiciousLinks() {
    const suspiciousElements = [];
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
        const href = link.href;
        const linkText = link.textContent.trim();
        
        // Check for URL shorteners
        SUSPICIOUS_URLS.forEach(pattern => {
            if (pattern.test(href)) {
                if (!detectedElements.has(link)) {
                    suspiciousElements.push({
                        element: link,
                        text: `Link: ${linkText} -> ${href}`,
                        pattern: 'URL shortener detected',
                        severity: 'medium',
                        category: 'suspicious_url',
                        type: 'link'
                    });
                    detectedElements.add(link);
                }
            }
        });
        
        // Check for misleading link text
        if (linkText && href) {
            const linkDomain = extractDomain(href);
            const textDomain = extractDomainFromText(linkText);
            
            if (textDomain && textDomain !== linkDomain && 
                !href.includes(textDomain) && linkText.length > 10) {
                if (!detectedElements.has(link)) {
                    suspiciousElements.push({
                        element: link,
                        text: `Misleading link: "${linkText}" -> ${href}`,
                        pattern: 'Domain mismatch',
                        severity: 'high',
                        category: 'phishing',
                        type: 'link'
                    });
                    detectedElements.add(link);
                }
            }
        }
    });
    
    return suspiciousElements;
}

/**
 * Find suspicious form elements
 */
function findSuspiciousForms() {
    const suspiciousElements = [];
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Check for forms asking for sensitive information
        const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
        const sensitiveFields = [];
        
        inputs.forEach(input => {
            const label = getInputLabel(input);
            const placeholder = input.placeholder || '';
            const combined = `${label} ${placeholder}`.toLowerCase();
            
            if (combined.includes('ssn') || combined.includes('social security') ||
                combined.includes('credit card') || combined.includes('bank account') ||
                combined.includes('routing number') || combined.includes('pin')) {
                sensitiveFields.push(combined);
            }
        });
        
        if (sensitiveFields.length > 0 && !isLegitimateForm(form)) {
            if (!detectedElements.has(form)) {
                suspiciousElements.push({
                    element: form,
                    text: `Form requesting: ${sensitiveFields.join(', ')}`,
                    pattern: 'Sensitive data collection',
                    severity: 'high',
                    category: 'phishing',
                    type: 'form'
                });
                detectedElements.add(form);
            }
        }
    });
    
    return suspiciousElements;
}

/**
 * Handle detected suspicious content
 */
function handleSuspiciousContent(suspiciousElements) {
    // Group by severity
    const highSeverity = suspiciousElements.filter(el => el.severity === 'high');
    const mediumSeverity = suspiciousElements.filter(el => el.severity === 'medium');
    
    // Show warning banner if high severity threats detected
    if (highSeverity.length > 0) {
        showWarningBanner(suspiciousElements);
    }
    
    // Highlight suspicious elements
    suspiciousElements.forEach(({ element, severity }) => {
        highlightSuspiciousElement(element, severity);
    });
    
    // Notify background script
    chrome.runtime.sendMessage({
        action: 'suspicious-content-detected',
        data: {
            total: suspiciousElements.length,
            high: highSeverity.length,
            medium: mediumSeverity.length,
            url: window.location.href
        }
    });
}

/**
 * Show warning banner at top of page
 */
function showWarningBanner(suspiciousElements) {
    // Don't show multiple banners
    if (warningBanner) return;
    
    const highSeverity = suspiciousElements.filter(el => el.severity === 'high').length;
    const mediumSeverity = suspiciousElements.filter(el => el.severity === 'medium').length;
    
    warningBanner = document.createElement('div');
    warningBanner.id = 'fraud-fence-warning-banner';
    warningBanner.innerHTML = `
        <div class="fraud-fence-banner-content">
            <div class="fraud-fence-banner-icon">⚠️</div>
            <div class="fraud-fence-banner-text">
                <strong>Fraud Fence Warning:</strong>
                ${highSeverity > 0 ? `${highSeverity} high-risk` : ''} 
                ${mediumSeverity > 0 ? `${mediumSeverity} medium-risk` : ''} 
                suspicious element(s) detected on this page
            </div>
            <div class="fraud-fence-banner-actions">
                <button id="fraud-fence-show-details">Show Details</button>
                <button id="fraud-fence-dismiss">✕</button>
            </div>
        </div>
    `;
    
    // Insert CSS
    insertWarningBannerStyles();
    
    // Insert banner at top of page
    document.body.insertBefore(warningBanner, document.body.firstChild);
    
    // Add event listeners
    document.getElementById('fraud-fence-dismiss').onclick = () => {
        warningBanner.remove();
        warningBanner = null;
    };
    
    document.getElementById('fraud-fence-show-details').onclick = () => {
        showDetailedReport(suspiciousElements);
    };
    
    // Auto-dismiss after 15 seconds
    setTimeout(() => {
        if (warningBanner) {
            warningBanner.style.opacity = '0';
            setTimeout(() => {
                if (warningBanner) {
                    warningBanner.remove();
                    warningBanner = null;
                }
            }, 300);
        }
    }, 15000);
}

/**
 * Insert CSS styles for warning banner
 */
function insertWarningBannerStyles() {
    if (document.getElementById('fraud-fence-banner-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'fraud-fence-banner-styles';
    style.textContent = `
        #fraud-fence-warning-banner {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 2147483647 !important;
            background: linear-gradient(90deg, #ff6b6b, #ffa726) !important;
            color: white !important;
            padding: 0 !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            font-size: 14px !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
            animation: fraud-fence-slide-down 0.3s ease-out !important;
            transition: opacity 0.3s ease !important;
        }
        
        .fraud-fence-banner-content {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 12px 20px !important;
            max-width: 1200px !important;
            margin: 0 auto !important;
        }
        
        .fraud-fence-banner-icon {
            font-size: 18px !important;
            margin-right: 12px !important;
        }
        
        .fraud-fence-banner-text {
            flex: 1 !important;
            font-weight: 500 !important;
        }
        
        .fraud-fence-banner-actions {
            display: flex !important;
            gap: 8px !important;
        }
        
        .fraud-fence-banner-actions button {
            background: rgba(255,255,255,0.2) !important;
            border: none !important;
            color: white !important;
            padding: 6px 12px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            transition: background 0.2s ease !important;
        }
        
        .fraud-fence-banner-actions button:hover {
            background: rgba(255,255,255,0.3) !important;
        }
        
        @keyframes fraud-fence-slide-down {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Highlight suspicious element on the page
 */
function highlightSuspiciousElement(element, severity) {
    if (element.classList.contains('fraud-fence-highlighted')) return;
    
    element.classList.add('fraud-fence-highlighted');
    element.style.cssText += `
        outline: 2px solid ${severity === 'high' ? '#ff4757' : '#ffa502'} !important;
        outline-offset: 2px !important;
        position: relative !important;
    `;
    
    // Add warning indicator
    const indicator = document.createElement('div');
    indicator.className = 'fraud-fence-indicator';
    indicator.innerHTML = severity === 'high' ? '🚨' : '⚠️';
    indicator.style.cssText = `
        position: absolute !important;
        top: -10px !important;
        right: -10px !important;
        background: ${severity === 'high' ? '#ff4757' : '#ffa502'} !important;
        color: white !important;
        border-radius: 50% !important;
        width: 20px !important;
        height: 20px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 10px !important;
        z-index: 1000 !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
    `;
    
    element.style.position = 'relative';
    element.appendChild(indicator);
}

/**
 * Show detailed report modal
 */
function showDetailedReport(suspiciousElements) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'fraud-fence-modal';
    modal.innerHTML = `
        <div class="fraud-fence-modal-overlay">
            <div class="fraud-fence-modal-content">
                <div class="fraud-fence-modal-header">
                    <h2>🛡️ Fraud Fence - Security Report</h2>
                    <button class="fraud-fence-modal-close">✕</button>
                </div>
                <div class="fraud-fence-modal-body">
                    <p><strong>Detected ${suspiciousElements.length} suspicious elements on this page:</strong></p>
                    <div class="fraud-fence-threats-list">
                        ${suspiciousElements.map((el, i) => `
                            <div class="fraud-fence-threat-item severity-${el.severity}">
                                <div class="fraud-fence-threat-header">
                                    <span class="fraud-fence-threat-icon">${el.severity === 'high' ? '🚨' : '⚠️'}</span>
                                    <span class="fraud-fence-threat-category">${el.category.replace('_', ' ')}</span>
                                    <span class="fraud-fence-threat-severity">${el.severity} risk</span>
                                </div>
                                <div class="fraud-fence-threat-text">${el.text}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="fraud-fence-modal-footer">
                    <button class="fraud-fence-btn-secondary" onclick="window.open('https://fraud-fence.vercel.app/guides', '_blank')">
                        Learn About Scams
                    </button>
                    <button class="fraud-fence-btn-primary" id="fraud-fence-close-modal">
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Insert modal CSS
    insertModalStyles();
    
    // Add to page
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.fraud-fence-modal-close').onclick = () => modal.remove();
    modal.querySelector('#fraud-fence-close-modal').onclick = () => modal.remove();
    modal.querySelector('.fraud-fence-modal-overlay').onclick = (e) => {
        if (e.target === e.currentTarget) modal.remove();
    };
}

/**
 * Insert CSS styles for modal
 */
function insertModalStyles() {
    if (document.getElementById('fraud-fence-modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'fraud-fence-modal-styles';
    style.textContent = `
        #fraud-fence-modal {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 2147483647 !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        
        .fraud-fence-modal-overlay {
            background: rgba(0,0,0,0.8) !important;
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 20px !important;
        }
        
        .fraud-fence-modal-content {
            background: white !important;
            border-radius: 12px !important;
            max-width: 600px !important;
            width: 100% !important;
            max-height: 80vh !important;
            overflow: hidden !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
        }
        
        .fraud-fence-modal-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            padding: 20px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
        }
        
        .fraud-fence-modal-header h2 {
            margin: 0 !important;
            font-size: 18px !important;
            font-weight: 600 !important;
        }
        
        .fraud-fence-modal-close {
            background: rgba(255,255,255,0.2) !important;
            border: none !important;
            color: white !important;
            width: 32px !important;
            height: 32px !important;
            border-radius: 50% !important;
            cursor: pointer !important;
            font-size: 14px !important;
        }
        
        .fraud-fence-modal-body {
            padding: 20px !important;
            max-height: 400px !important;
            overflow-y: auto !important;
        }
        
        .fraud-fence-threats-list {
            margin-top: 16px !important;
        }
        
        .fraud-fence-threat-item {
            border: 1px solid #e9ecef !important;
            border-radius: 8px !important;
            padding: 12px !important;
            margin-bottom: 12px !important;
        }
        
        .fraud-fence-threat-item.severity-high {
            border-left: 4px solid #ff4757 !important;
            background: #fff5f5 !important;
        }
        
        .fraud-fence-threat-item.severity-medium {
            border-left: 4px solid #ffa502 !important;
            background: #fffbf0 !important;
        }
        
        .fraud-fence-threat-header {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            margin-bottom: 8px !important;
        }
        
        .fraud-fence-threat-category {
            font-weight: 600 !important;
            text-transform: capitalize !important;
            color: #333 !important;
        }
        
        .fraud-fence-threat-severity {
            background: #f8f9fa !important;
            padding: 2px 6px !important;
            border-radius: 12px !important;
            font-size: 11px !important;
            color: #6c757d !important;
            text-transform: uppercase !important;
            font-weight: 500 !important;
        }
        
        .fraud-fence-threat-text {
            font-size: 13px !important;
            color: #666 !important;
            line-height: 1.4 !important;
        }
        
        .fraud-fence-modal-footer {
            padding: 20px !important;
            background: #f8f9fa !important;
            display: flex !important;
            gap: 12px !important;
            justify-content: flex-end !important;
        }
        
        .fraud-fence-btn-primary, .fraud-fence-btn-secondary {
            padding: 8px 16px !important;
            border-radius: 6px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            border: none !important;
        }
        
        .fraud-fence-btn-primary {
            background: #667eea !important;
            color: white !important;
        }
        
        .fraud-fence-btn-secondary {
            background: white !important;
            color: #666 !important;
            border: 1px solid #ddd !important;
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Set up mutation observer to detect dynamic content
 */
function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
        let shouldScan = false;
        
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        shouldScan = true;
                    }
                });
            }
        });
        
        if (shouldScan) {
            // Debounce scanning
            clearTimeout(window.fraudFenceScanTimeout);
            window.fraudFenceScanTimeout = setTimeout(scanPageForSuspiciousContent, 1000);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * Set up message listener for communication with background script
 */
function setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.action) {
            case 'scan-page':
                scanPageForSuspiciousContent();
                sendResponse({ success: true });
                break;
                
            case 'clear-highlights':
                clearHighlights();
                sendResponse({ success: true });
                break;
                
            case 'get-page-info':
                sendResponse({
                    url: window.location.href,
                    title: document.title,
                    suspiciousCount: detectedElements.size
                });
                break;
        }
    });
}

// Utility Functions

/**
 * Get all text nodes in an element
 */
function getAllTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.trim()) {
            textNodes.push(node);
        }
    }
    
    return textNodes;
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return null;
    }
}

/**
 * Extract domain-like text from string
 */
function extractDomainFromText(text) {
    const domainMatch = text.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    return domainMatch ? domainMatch[1].replace(/^www\./, '') : null;
}

/**
 * Get label for form input
 */
function getInputLabel(input) {
    if (input.labels && input.labels.length > 0) {
        return input.labels[0].textContent || '';
    }
    
    const label = input.closest('label');
    if (label) return label.textContent || '';
    
    const id = input.id;
    if (id) {
        const labelElement = document.querySelector(`label[for="${id}"]`);
        if (labelElement) return labelElement.textContent || '';
    }
    
    return input.name || input.placeholder || '';
}

/**
 * Check if form is from a legitimate source
 */
function isLegitimateForm(form) {
    const domain = window.location.hostname;
    
    // Add known legitimate domains
    const legitimateDomains = [
        'paypal.com',
        'amazon.com',
        'ebay.com',
        'google.com',
        'microsoft.com',
        'apple.com',
        'facebook.com',
        'twitter.com',
        'linkedin.com'
    ];
    
    return legitimateDomains.some(legitDomain => 
        domain.includes(legitDomain) || domain.endsWith(legitDomain)
    );
}

/**
 * Clear all highlights from the page
 */
function clearHighlights() {
    document.querySelectorAll('.fraud-fence-highlighted').forEach(element => {
        element.classList.remove('fraud-fence-highlighted');
        element.style.outline = '';
        element.style.outlineOffset = '';
        
        const indicator = element.querySelector('.fraud-fence-indicator');
        if (indicator) {
            indicator.remove();
        }
    });
    
    detectedElements.clear();
    
    if (warningBanner) {
        warningBanner.remove();
        warningBanner = null;
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
