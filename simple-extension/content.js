// Content Script for Fraud Fence Extension (copied from main extension)
// Runs on web pages to detect suspicious content and provide warnings

// Configuration
const SUSPICIOUS_PATTERNS = [
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

function initialize() {
  scanPageForSuspiciousContent();
  setupMutationObserver();
  setupMessageListener();
  setInterval(scanPageForSuspiciousContent, 5000);
}

function scanPageForSuspiciousContent() {
  if (isScanning) return;
  isScanning = true;
  try {
    const suspiciousElements = [];
    const textElements = findSuspiciousText();
    suspiciousElements.push(...textElements);
    const linkElements = findSuspiciousLinks();
    suspiciousElements.push(...linkElements);
    const formElements = findSuspiciousForms();
    suspiciousElements.push(...formElements);

    if (suspiciousElements.length > 0) {
      handleSuspiciousContent(suspiciousElements);
    }
  } catch (error) {
    console.error('Fraud Fence: Error scanning page:', error);
  } finally {
    isScanning = false;
  }
}

function findSuspiciousText() {
  const suspiciousElements = [];
  const textNodes = getAllTextNodes(document.body);
  textNodes.forEach(node => {
    const text = node.textContent.trim();
    if (text.length < 10) return;
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

function findSuspiciousLinks() {
  const suspiciousElements = [];
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    const href = link.href;
    const linkText = link.textContent.trim();
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
    if (linkText && href) {
      const linkDomain = extractDomain(href);
      const textDomain = extractDomainFromText(linkText);
      if (textDomain && linkDomain && textDomain !== linkDomain && 
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

function findSuspiciousForms() {
  const suspiciousElements = [];
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
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

function handleSuspiciousContent(suspiciousElements) {
  const highSeverity = suspiciousElements.filter(el => el.severity === 'high');
  const mediumSeverity = suspiciousElements.filter(el => el.severity === 'medium');
  if (highSeverity.length > 0) {
    showWarningBanner(suspiciousElements);
  }
  suspiciousElements.forEach(({ element, severity }) => {
    highlightSuspiciousElement(element, severity);
  });
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

function showWarningBanner(suspiciousElements) {
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
  insertWarningBannerStyles();
  document.body.insertBefore(warningBanner, document.body.firstChild);
  document.getElementById('fraud-fence-dismiss').onclick = () => {
    warningBanner.remove();
    warningBanner = null;
  };
  document.getElementById('fraud-fence-show-details').onclick = () => {
    showDetailedReport(suspiciousElements);
  };
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
    .fraud-fence-banner-icon { font-size: 18px !important; margin-right: 12px !important; }
    .fraud-fence-banner-text { flex: 1 !important; font-weight: 500 !important; }
    .fraud-fence-banner-actions { display: flex !important; gap: 8px !important; }
    .fraud-fence-banner-actions button {
      background: rgba(255,255,255,0.2) !important; border: none !important; color: white !important;
      padding: 6px 12px !important; border-radius: 4px !important; cursor: pointer !important; font-size: 12px !important;
    }
    .fraud-fence-banner-actions button:hover { background: rgba(255,255,255,0.3) !important; }
    @keyframes fraud-fence-slide-down { from { transform: translateY(-100%); } to { transform: translateY(0); } }
  `;
  document.head.appendChild(style);
}

function highlightSuspiciousElement(element, severity) {
  if (!element || element.classList.contains('fraud-fence-highlighted')) return;
  element.classList.add('fraud-fence-highlighted');
  element.style.cssText += `outline: 2px solid ${severity === 'high' ? '#ff4757' : '#ffa502'} !important; outline-offset: 2px !important; position: relative !important;`;
  const indicator = document.createElement('div');
  indicator.className = 'fraud-fence-indicator';
  indicator.innerHTML = severity === 'high' ? '🚨' : '⚠️';
  indicator.style.cssText = `position: absolute !important; top: -10px !important; right: -10px !important; background: ${severity === 'high' ? '#ff4757' : '#ffa502'} !important; color: white !important; border-radius: 50% !important; width: 20px !important; height: 20px !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 10px !important; z-index: 1000 !important; box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;`;
  element.style.position = 'relative';
  element.appendChild(indicator);
}

function showDetailedReport(suspiciousElements) {
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
          <button class="fraud-fence-btn-secondary" onclick="window.open('https://fraud-fence.vercel.app/guides', '_blank')">Learn About Scams</button>
          <button class="fraud-fence-btn-primary" id="fraud-fence-close-modal">I Understand</button>
        </div>
      </div>
    </div>
  `;
  insertModalStyles();
  document.body.appendChild(modal);
  modal.querySelector('.fraud-fence-modal-close').onclick = () => modal.remove();
  modal.querySelector('#fraud-fence-close-modal').onclick = () => modal.remove();
  modal.querySelector('.fraud-fence-modal-overlay').onclick = (e) => { if (e.target === e.currentTarget) modal.remove(); };
}

function insertModalStyles() {
  if (document.getElementById('fraud-fence-modal-styles')) return;
  const style = document.createElement('style');
  style.id = 'fraud-fence-modal-styles';
  style.textContent = `
    #fraud-fence-modal { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; z-index: 2147483647 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; }
    .fraud-fence-modal-overlay { background: rgba(0,0,0,0.8) !important; width: 100% !important; height: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 20px !important; }
    .fraud-fence-modal-content { background: white !important; border-radius: 12px !important; max-width: 600px !important; width: 100% !important; max-height: 80vh !important; overflow: hidden !important; box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important; }
    .fraud-fence-modal-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; color: white !important; padding: 20px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
    .fraud-fence-modal-header h2 { margin: 0 !important; font-size: 18px !important; font-weight: 600 !important; }
    .fraud-fence-modal-close { background: rgba(255,255,255,0.2) !important; border: none !important; color: white !important; width: 32px !important; height: 32px !important; border-radius: 50% !important; cursor: pointer !important; font-size: 14px !important; }
    .fraud-fence-modal-body { padding: 20px !important; max-height: 400px !important; overflow-y: auto !important; }
    .fraud-fence-threat-item { border: 1px solid #e9ecef !important; border-radius: 8px !important; padding: 12px !important; margin-bottom: 12px !important; }
    .fraud-fence-threat-item.severity-high { border-left: 4px solid #ff4757 !important; background: #fff5f5 !important; }
    .fraud-fence-threat-item.severity-medium { border-left: 4px solid #ffa502 !important; background: #fffbf0 !important; }
    .fraud-fence-threat-header { display: flex !important; align-items: center !important; gap: 8px !important; margin-bottom: 8px !important; }
    .fraud-fence-threat-category { font-weight: 600 !important; text-transform: capitalize !important; color: #333 !important; }
    .fraud-fence-threat-severity { background: #f8f9fa !important; padding: 2px 6px !important; border-radius: 12px !important; font-size: 11px !important; color: #6c757d !important; text-transform: uppercase !important; font-weight: 500 !important; }
    .fraud-fence-threat-text { font-size: 13px !important; color: #666 !important; line-height: 1.4 !important; }
    .fraud-fence-modal-footer { padding: 20px !important; background: #f8f9fa !important; display: flex !important; gap: 12px !important; justify-content: flex-end !important; }
    .fraud-fence-btn-primary, .fraud-fence-btn-secondary { padding: 8px 16px !important; border-radius: 6px !important; font-size: 14px !important; font-weight: 500 !important; cursor: pointer !important; border: none !important; }
    .fraud-fence-btn-primary { background: #667eea !important; color: white !important; }
    .fraud-fence-btn-secondary { background: white !important; color: #666 !important; border: 1px solid #ddd !important; }
  `;
  document.head.appendChild(style);
}

function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => { if (node.nodeType === Node.ELEMENT_NODE) { shouldScan = true; } });
      }
    });
    if (shouldScan) {
      clearTimeout(window.fraudFenceScanTimeout);
      window.fraudFenceScanTimeout = setTimeout(scanPageForSuspiciousContent, 1000);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

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
        sendResponse({ url: window.location.href, title: document.title, suspiciousCount: detectedElements.size });
        break;
    }
  });
}

function getAllTextNodes(element) {
  const textNodes = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while (node = walker.nextNode()) {
    if (node.textContent.trim()) textNodes.push(node);
  }
  return textNodes;
}

function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; }
}

function extractDomainFromText(text) {
  const domainMatch = text.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return domainMatch ? domainMatch[1].replace(/^www\./, '') : null;
}

function getInputLabel(input) {
  if (input.labels && input.labels.length > 0) return input.labels[0].textContent || '';
  const label = input.closest('label'); if (label) return label.textContent || '';
  const id = input.id; if (id) { const labelElement = document.querySelector(`label[for="${id}"]`); if (labelElement) return labelElement.textContent || ''; }
  return input.name || input.placeholder || '';
}

function isLegitimateForm(form) {
  const domain = window.location.hostname;
  const legitimateDomains = ['paypal.com','amazon.com','ebay.com','google.com','microsoft.com','apple.com','facebook.com','twitter.com','linkedin.com'];
  return legitimateDomains.some(legitDomain => domain.includes(legitDomain) || domain.endsWith(legitDomain));
}

function clearHighlights() {
  document.querySelectorAll('.fraud-fence-highlighted').forEach(element => {
    element.classList.remove('fraud-fence-highlighted');
    element.style.outline = ''; element.style.outlineOffset = '';
    const indicator = element.querySelector('.fraud-fence-indicator'); if (indicator) indicator.remove();
  });
  detectedElements.clear();
  if (warningBanner) { warningBanner.remove(); warningBanner = null; }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else { initialize(); }

// ==========================================================
// content.js: Analysis Logic and Advanced On-Page Result Display
// ==========================================================

// --- 1. Text Analysis Logic (Updated to calculate Score and Confidence) ---

function analyzeText(text) {
  const lowerText = text.toLowerCase();
  const scamKeywords = {
    'urgent': 15, 'verify your account': 15, 'suspended': 15, 'click here immediately': 20,
    'congratulations you won': 25, 'claim your prize': 25, 'limited time offer': 10,
    'wire transfer': 30, 'western union': 30, 'social security number': 40, 'credit card': 40, 
    'password': 40, 'pin code': 40, 'verify identity': 20, 'nigerian prince': 50, 'inheritance': 20, 
    'lottery': 20, 'bitcoin wallet': 30, 'investment opportunity': 20, 'guaranteed returns': 25, 'risk-free': 20
  };
  const suspiciousPatterns = {
    '/bit\\.ly/i': 25, '/tinyurl/i': 25, '/\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}/': 30, // IP addresses
    '/https?:\\/\\/[^\\s]+\\.(tk|ml|ga|cf|gq)/i': 35 // Free domains
  };
    
  let fraudScore = 0;
  let reasons = [];
  let riskBreakdown = { keywords: 0, patterns: 0, urgency: 0, punctuation: 0 };
    
  // Check keywords
  Object.entries(scamKeywords).forEach(([keyword, weight]) => {
    if (lowerText.includes(keyword)) {
      fraudScore += weight;
      reasons.push({ factor: `Suspicious Keyword: "${keyword}"`, weight: weight });
      riskBreakdown.keywords += weight;
    }
  });

  // Check patterns
  Object.entries(suspiciousPatterns).forEach(([patternStr, weight]) => {
    const pattern = new RegExp(patternStr.substring(1, patternStr.lastIndexOf('/')), patternStr.substring(patternStr.lastIndexOf('/') + 1));
    if (pattern.test(text)) {
      fraudScore += weight;
      reasons.push({ factor: `Suspicious URL/IP Pattern`, weight: weight });
      riskBreakdown.patterns += weight;
    }
  });

  // Check for urgency and pressure tactics
  const urgencyWeight = 20;
  if (/within \d+ (hours?|minutes?|days?)/i.test(text)) {
    fraudScore += urgencyWeight;
    reasons.push({ factor: 'Creates False Urgency/Deadline', weight: urgencyWeight });
    riskBreakdown.urgency += urgencyWeight;
  }
    
  // Check for excessive punctuation (!!!, ???)
  const punctuationWeight = 5;
  if (/[!?]{3,}/.test(text)) {
    fraudScore += punctuationWeight;
    reasons.push({ factor: 'Excessive Punctuation (Pressure Tactic)', weight: punctuationWeight });
    riskBreakdown.punctuation += punctuationWeight;
  }

  // Calculate final confidence percentage
  const maxPossibleScore = 400; // Arbitrary high max score for scaling
  let fraudConfidence = Math.min(100, Math.round((fraudScore / maxPossibleScore) * 100));

  let title, message, riskType, emoji;
  if (fraudConfidence >= 60) {
    riskType = 'danger';
    emoji = '🚨';
    title = 'HIGH RISK';
    message = 'Immediate action required. This text contains severe fraud indicators. DO NOT respond or click links.';
  } else if (fraudConfidence >= 30) {
    riskType = 'warning';
    emoji = '⚠️';
    title = 'MEDIUM RISK';
    message = 'Proceed with extreme caution. Verify the sender through official channels before taking any action.';
  } else {
    riskType = 'safe';
    emoji = '✅';
    title = 'LOW RISK';
    message = 'No major indicators detected, but always remain skeptical of unexpected messages.';
  }
    
  return {
    type: riskType,
    emoji: emoji,
    title: title,
    confidence: fraudConfidence,
    message: message,
    reasons: reasons.sort((a, b) => b.weight - a.weight), // Sort by highest impact
    breakdown: riskBreakdown
  };
}


// --- 2. Communication Listener (Same as before) ---

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle Text Analysis Request
  if (request.action === 'analyzeTextContent' && request.type === 'text') {
    const analysisResult = analyzeText(request.data);
    displayResult(analysisResult, 'Text Selection');
    sendResponse({ success: true });
    return true;
  } 
  
  // Handle Image Analysis Results (Loading, Error, or Final Result)
  else if (request.action === 'displayAnalysisResult') {
    // Mock image results need slight reformatting to match the new UI structure
    if (request.loading) {
      const loadingData = { type: 'loading', emoji: '🔍', title: 'ANALYZING', message: 'Request sent to Fraud Analysis Service. Please wait.', confidence: '...' };
      displayResult(loadingData, request.type === 'image-detailed' ? 'Detailed Image' : 'Basic Image', true);
    } else if (request.error) {
      const errorData = { type: 'danger', emoji: '❌', title: 'ANALYSIS FAILED', message: request.error, confidence: 'N/A' };
      displayResult(errorData, request.type === 'image-detailed' ? 'Detailed Image' : 'Basic Image');
    } else if (request.result) {
      const isFraud = request.result.isFraud;
      const confidence = Math.round(request.result.confidence * 100);
      const displayData = {
          type: isFraud ? 'danger' : (confidence < 80 ? 'warning' : 'safe'),
          emoji: isFraud ? '🚨' : (confidence < 80 ? '⚠️' : '✅'),
          title: isFraud ? 'IMAGE HIGH RISK' : 'IMAGE LOW RISK',
          confidence: confidence,
          message: request.result.message || 'Analysis complete.',
          reasons: request.result.details ? request.result.details.map(d => ({ factor: d, weight: 1 })) : [],
          breakdown: { manipulation: confidence, source: 100 - confidence, general: 50 } // Mock breakdown for image
      };
      displayResult(displayData, request.type === 'image-detailed' ? 'Detailed Image Analysis' : 'Basic Image Analysis');
    }
    sendResponse({ success: true });
    return true;
  }
});


// --- 3. UI Helper Functions ---

function getRiskColor(type) {
    switch(type) {
        case 'danger': return '#E60023';
        case 'warning': return '#FFB300';
        case 'safe': return '#38A838';
        case 'loading': return '#1890ff';
        default: return '#595959';
    }
}

function getBackgroundColor(type) {
    switch(type) {
        case 'danger': return '#fde2e6';
        case 'warning': return '#fff1d7';
        case 'safe': return '#e1f4e1';
        case 'loading': return '#e6f7ff';
        default: return '#f0f2f5';
    }
}

// Function to generate a simple SVG bar graph
function generateBarGraph(breakdown) {
    const data = [
        { label: 'Keywords', value: breakdown.keywords || 0, color: '#4a90e2' },
        { label: 'Patterns', value: breakdown.patterns || 0, color: '#ff7733' },
        { label: 'Urgency', value: breakdown.urgency || 0, color: '#f74646' },
        { label: 'Other', value: breakdown.punctuation || 0, color: '#cccccc' }
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
    const chartHeight = 100;

    let barsHtml = '';
    let cumulativeWidth = 0;

    data.forEach(item => {
        if (item.value > 0) {
            const width = (item.value / total) * 100;
            barsHtml += `
                <rect x="${cumulativeWidth}%" y="0" width="${width}%" height="100%" fill="${item.color}" rx="2" ry="2">
                    <title>${item.label}: ${item.value} points</title>
                </rect>
            `;
            cumulativeWidth += width;
        }
    });

    const legendHtml = data.map(item => item.value > 0 ? `
        <div style="display: flex; align-items: center; margin-right: 15px; font-size: 0.8em; color: #555;">
            <span style="display: inline-block; width: 8px; height: 8px; background-color: ${item.color}; border-radius: 50%; margin-right: 5px;"></span>
            ${item.label} (${item.value})
        </div>
    ` : '').join('');

    return `
        <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
            <h3 style="font-size: 1em; font-weight: 700; color: #333; margin-bottom: 8px;">Risk Factor Distribution</h3>
            <svg width="100%" height="${chartHeight}px" viewBox="0 0 100 10" preserveAspectRatio="none" style="margin-bottom: 8px; border-radius: 4px; background-color: #f9f9f9;">
                ${barsHtml}
            </svg>
            <div style="display: flex; flex-wrap: wrap; justify-content: flex-start;">${legendHtml}</div>
        </div>
    `;
}

// --- 4. Main Display Function (Revamped for Rich UI) ---

function removeExistingDisplay() {
  const existingDisplay = document.getElementById("fraud-fence-result");
  if (existingDisplay) {
    existingDisplay.remove();
  }
}

function displayResult(result, contextType, isTemporary = false) {
  removeExistingDisplay();

  const resultDiv = document.createElement("div");
  resultDiv.id = "fraud-fence-result";
  
  const mainColor = getRiskColor(result.type);
  const bgColor = getBackgroundColor(result.type);

  // Apply rich styling
  resultDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 0; 
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    z-index: 2147483647;
    max-width: 420px;
    min-width: 350px;
    font-family: 'Inter', sans-serif, system-ui;
    cursor: pointer;
    overflow: hidden;
    background-color: white;
    transition: opacity 0.3s ease;
  `;
  
  // --- Header HTML ---
  const headerHtml = `
    <div style="background-color: ${mainColor}; color: white; padding: 20px 25px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
            <span style="font-size: 2em; margin-right: 10px;">${result.emoji}</span>
            <div>
                <div style="font-size: 1.5em; font-weight: 900; line-height: 1;">${result.title || 'ANALYSIS REPORT'}</div>
                <small style="font-size: 0.8em; opacity: 0.8;">Source: ${contextType}</small>
            </div>
        </div>
        ${result.confidence !== undefined && result.confidence !== '...' ? 
            `<div style="font-size: 2.2em; font-weight: 900;">${result.confidence}%</div>` : 
            `<div style="font-size: 1.2em; font-weight: 600;">Loading...</div>`
        }
    </div>
  `;

  // --- Body HTML ---
  const reasonsHtml = result.reasons && result.reasons.length > 0 ? 
      `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f0f0f0;">
          <h3 style="font-size: 1em; font-weight: 700; color: ${mainColor}; margin-bottom: 8px;">Reasons for Risk (High Impact First)</h3>
          <ul style="list-style-type: none; padding: 0; margin: 0;">
              ${result.reasons.slice(0, 5).map(r => 
                  `<li style="margin-bottom: 5px; font-size: 0.9em; color: #333; display: flex; align-items: center;">
                       <span style="font-size: 1.1em; color: ${mainColor}; margin-right: 8px;">•</span>
                       ${r.factor} ${r.weight ? `(Weight: ${r.weight})` : ''}
                   </li>`).join('')}
              ${result.reasons.length > 5 ? `<li style="font-size: 0.8em; color: #777; margin-top: 5px;">... and ${result.reasons.length - 5} more factors.</li>` : ''}
          </ul>
      </div>` : '';

  const bodyHtml = `
    <div style="padding: 20px 25px;">
        <p style="font-size: 0.95em; color: #333; margin: 0 0 15px 0; border-left: 3px solid ${mainColor}; padding-left: 10px; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">
            ${result.message}
        </p>

        ${reasonsHtml}

        ${result.breakdown ? generateBarGraph(result.breakdown) : ''}
        
    </div>
  `;

  // Combine
  resultDiv.innerHTML = headerHtml + bodyHtml;

  // Add CSS animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  // Add dismiss functionality
  resultDiv.onclick = () => resultDiv.remove();

  document.body.appendChild(resultDiv);
  
  // Auto-dismiss after a period
  if (!isTemporary && contextType.indexOf('Detailed') === -1) {
    setTimeout(() => {
      if (resultDiv.parentNode) {
        resultDiv.style.opacity = '0';
        setTimeout(() => resultDiv.remove(), 300);
      }
    }, 15000); // Increased time for better reading
  }
}