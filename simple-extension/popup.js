// Simple fraud detection logic
function analyzeText(text) {
  const lowerText = text.toLowerCase();
  const trimmedText = text.trim();
  
  // Check if input is primarily a URL (with or without protocol)
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
  const hasProtocol = /^https?:\/\//i.test(trimmedText);
  const looksLikeURL = urlPattern.test(trimmedText);
  
  // If it's a URL, analyze it as such
  if (hasProtocol || looksLikeURL) {
    // Add protocol if missing
    const urlToAnalyze = hasProtocol ? trimmedText : 'https://' + trimmedText;
    return analyzeURL(urlToAnalyze);
  }
  
  // Enhanced keyword detection with context awareness
  const highRiskPatterns = [
    { pattern: /urgent.*verify.*account/i, weight: 25, desc: 'Urgency + Account verification request' },
    { pattern: /account.*suspended.*click/i, weight: 25, desc: 'Account suspension threat' },
    { pattern: /verify.*identity.*immediately/i, weight: 25, desc: 'Immediate identity verification demand' },
    { pattern: /congratulations.*won.*claim.*prize/i, weight: 30, desc: 'Fake prize/lottery scam' },
    { pattern: /wire transfer.*western union/i, weight: 35, desc: 'Untraceable payment method request' },
    { pattern: /social security.*ssn.*verify/i, weight: 40, desc: 'SSN phishing attempt' },
    { pattern: /nigerian prince.*inheritance/i, weight: 50, desc: 'Classic advance-fee scam' },
    { pattern: /bitcoin.*wallet.*transfer.*urgent/i, weight: 35, desc: 'Cryptocurrency scam' },
    { pattern: /password.*expired.*update.*now/i, weight: 30, desc: 'Password phishing' },
    { pattern: /bank account.*routing number.*verify/i, weight: 35, desc: 'Banking information phishing' }
  ];
  
  const mediumRiskPatterns = [
    { pattern: /click here.*limited time/i, weight: 15, desc: 'Pressure tactic with urgency' },
    { pattern: /act now.*offer expires/i, weight: 12, desc: 'False urgency tactic' },
    { pattern: /free.*gift card.*survey/i, weight: 15, desc: 'Survey scam pattern' },
    { pattern: /refund.*pending.*claim/i, weight: 15, desc: 'Fake refund notification' }
  ];
  
  // Legitimate patterns that should reduce suspicion
  const legitimatePatterns = [
    /dear (customer|user|member)/i,
    /sincerely|regards|best wishes/i,
    /unsubscribe|opt.out|manage preferences/i,
    /privacy policy|terms of service/i,
    /receipt|invoice|order confirmation/i
  ];
  
  let fraudScore = 0;
  let redFlags = [];
  let greenFlags = [];
  const maxScore = 200; // Maximum possible score for percentage calculation
  
  // Check for legitimate indicators first
  let legitimacyScore = 0;
  legitimatePatterns.forEach(pattern => {
    if (pattern.test(text)) {
      legitimacyScore += 5;
      greenFlags.push({ text: 'Contains professional communication elements' });
    }
  });
  
  // Check high-risk patterns (require multiple keywords in context)
  highRiskPatterns.forEach(item => {
    if (item.pattern.test(text)) {
      fraudScore += item.weight;
      redFlags.push({ text: item.desc, weight: item.weight });
    }
  });
  
  // Check medium-risk patterns
  mediumRiskPatterns.forEach(item => {
    if (item.pattern.test(text)) {
      fraudScore += item.weight;
      redFlags.push({ text: item.desc, weight: item.weight });
    }
  });
  
  // Check for suspicious URLs embedded in text (more selective)
  const urlShortenerPattern = /https?:\/\/(bit\.ly|tinyurl\.com|t\.co|goo\.gl)\/[a-zA-Z0-9]+/i;
  if (urlShortenerPattern.test(text)) {
    fraudScore += 20;
    redFlags.push({ text: 'Contains URL shortener (hides destination)', weight: 20 });
  }
  
  // Check for IP addresses in URLs
  const ipUrlPattern = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
  if (ipUrlPattern.test(text)) {
    fraudScore += 25;
    redFlags.push({ text: 'Contains IP address URL (suspicious)', weight: 25 });
  }
  
  // Check for free domain TLDs
  const freeDomainPattern = /https?:\/\/[^\s]+\.(tk|ml|ga|cf|gq)\b/i;
  if (freeDomainPattern.test(text)) {
    fraudScore += 20;
    redFlags.push({ text: 'Contains free/suspicious domain', weight: 20 });
  }
  
  // Check for excessive urgency (multiple urgency keywords)
  const urgencyKeywords = ['urgent', 'immediately', 'now', 'asap', 'hurry', 'quick', 'expires', 'limited time'];
  const urgencyCount = urgencyKeywords.filter(keyword => lowerText.includes(keyword)).length;
  if (urgencyCount >= 3) {
    fraudScore += 15;
    redFlags.push({ text: `Excessive urgency tactics (${urgencyCount} urgency words)`, weight: 15 });
  } else if (urgencyCount >= 2) {
    fraudScore += 8;
    redFlags.push({ text: 'Multiple urgency indicators', weight: 8 });
  }
  
  // Check for excessive punctuation (!!!, ???)
  const excessivePunctuation = text.match(/[!?]{3,}/g);
  if (excessivePunctuation && excessivePunctuation.length >= 2) {
    fraudScore += 10;
    redFlags.push({ text: 'Excessive punctuation (pressure tactic)', weight: 10 });
  }
  
  // Check for ALL CAPS words (must be significant portion)
  const allCapsWords = text.match(/\b[A-Z]{4,}\b/g);
  const totalWords = text.split(/\s+/).length;
  if (allCapsWords && allCapsWords.length >= 3 && totalWords > 10) {
    const capsRatio = allCapsWords.length / totalWords;
    if (capsRatio > 0.3) {
      fraudScore += 12;
      redFlags.push({ text: 'Excessive use of CAPITAL LETTERS', weight: 12 });
    }
  }
  
  // Add green flags for safe indicators
  if (redFlags.length === 0) {
    greenFlags.push({ text: 'No high-risk fraud patterns detected' });
  }
  if (urgencyCount === 0) {
    greenFlags.push({ text: 'No pressure or urgency tactics' });
  }
  if (!excessivePunctuation) {
    greenFlags.push({ text: 'Normal punctuation usage' });
  }
  if (text.length > 100 && text.length < 1000) {
    greenFlags.push({ text: 'Reasonable message length' });
  }
  if (/https:\/\/[a-z0-9-]+\.(com|org|gov|edu)/i.test(text)) {
    greenFlags.push({ text: 'Contains standard domain extensions' });
  }
  
  // Reduce score based on legitimacy indicators
  fraudScore = Math.max(0, fraudScore - legitimacyScore);
  
  // Calculate fraud percentage
  const fraudPercentage = Math.min(100, Math.round((fraudScore / maxScore) * 100));
  
  // Determine risk level with higher thresholds
  if (fraudScore >= 60) {
    return {
      type: 'danger',
      emoji: '🚨',
      title: 'High Risk - Likely Scam',
      percentage: fraudPercentage,
      message: 'This text contains multiple fraud indicators. Do NOT share personal information or send money.',
      redFlags: redFlags,
      greenFlags: greenFlags
    };
  } else if (fraudScore >= 30) {
    return {
      type: 'warning',
      emoji: '⚠️',
      title: 'Medium Risk - Be Cautious',
      percentage: fraudPercentage,
      message: 'This text has some suspicious elements. Verify through official channels before taking action.',
      redFlags: redFlags,
      greenFlags: greenFlags
    };
  } else {
    return {
      type: 'safe',
      emoji: '✅',
      title: 'Low Risk',
      percentage: fraudPercentage,
      message: 'No major fraud indicators detected. Always verify requests through official channels.',
      redFlags: redFlags,
      greenFlags: greenFlags
    };
  }
}

// URL fraud detection logic
function analyzeURL(url) {
  let fraudScore = 0;
  let redFlags = [];
  let greenFlags = [];
  const maxScore = 250; // Maximum possible score for percentage calculation
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    const fullURL = url.toLowerCase();
    
    // Check if it's a known legitimate domain first
    const trustedDomains = [
      'google.com', 'facebook.com', 'amazon.com', 'microsoft.com', 'apple.com',
      'youtube.com', 'netflix.com', 'twitter.com', 'instagram.com', 'linkedin.com',
      'github.com', 'stackoverflow.com', 'reddit.com', 'wikipedia.org', 'yahoo.com',
      'ebay.com', 'paypal.com', 'office.com', 'live.com', 'outlook.com'
    ];
    
    const isTrustedDomain = trustedDomains.some(trusted => 
      domain === trusted || domain.endsWith('.' + trusted)
    );
    
    if (isTrustedDomain) {
      greenFlags.push({ text: 'Recognized legitimate domain' });
      greenFlags.push({ text: 'Domain matches known trusted service' });
      // Trusted domains get minimal scrutiny
      if (urlObj.protocol === 'https:') {
        greenFlags.push({ text: 'Uses secure HTTPS connection' });
        return {
          type: 'safe',
          emoji: '✅',
          title: 'URL Appears Safe',
          percentage: 0,
          message: 'This is a recognized legitimate domain with HTTPS encryption.',
          domain: extractDomain(url),
          redFlags: redFlags,
          greenFlags: greenFlags
        };
      }
    }
    
    // 1. Check for IP address instead of domain
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
      fraudScore += 40;
      redFlags.push({ text: 'Uses IP address instead of domain name (common in phishing)', weight: 40 });
    } else {
      greenFlags.push({ text: 'Uses proper domain name' });
    }
    
    // 2. Check for suspicious TLDs (top-level domains) - be more selective
    const highRiskTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq'];
    const mediumRiskTLDs = ['.xyz', '.top', '.work', '.club', '.live', '.online', '.site'];
    
    if (highRiskTLDs.some(tld => domain.endsWith(tld))) {
      fraudScore += 35;
      redFlags.push({ text: 'Uses free high-risk domain extension (commonly used in scams)', weight: 35 });
    } else if (mediumRiskTLDs.some(tld => domain.endsWith(tld))) {
      // Only flag if combined with other suspicious indicators
      if (domain.length > 20 || domain.split('.').length > 3) {
        fraudScore += 15;
        redFlags.push({ text: 'Uses uncommon domain extension', weight: 15 });
      }
    } else {
      greenFlags.push({ text: 'Uses standard domain extension' });
    }
    
    // 3. Check for URL shorteners
    const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'adf.ly', 'shorte.st'];
    if (shorteners.some(shortener => domain === shortener || domain.endsWith('.' + shortener))) {
      fraudScore += 25;
      redFlags.push({ text: 'URL shortener detected (hides real destination)', weight: 25 });
    } else {
      greenFlags.push({ text: 'Full URL visible (not shortened)' });
    }
    
    // 4. Check for excessive subdomains (more than 3 is suspicious)
    const subdomains = domain.split('.');
    if (subdomains.length > 4) {
      fraudScore += 20;
      redFlags.push({ text: `Too many subdomains (${subdomains.length - 2} levels) - obfuscation technique`, weight: 20 });
    }
    
    // 5. Check for suspicious keywords in URL - must be in suspicious context
    const suspiciousKeywords = ['verify', 'account', 'secure', 'login', 'signin', 'update', 'confirm', 'banking', 'wallet'];
    const brandKeywords = ['paypal', 'apple', 'amazon', 'microsoft', 'netflix', 'google', 'facebook'];
    
    const foundSuspiciousKeywords = suspiciousKeywords.filter(keyword => fullURL.includes(keyword));
    const foundBrandKeywords = brandKeywords.filter(keyword => fullURL.includes(keyword));
    
    // Only flag if suspicious keywords found AND not a legitimate domain
    if (foundSuspiciousKeywords.length > 0 && !isTrustedDomain) {
      // Check if brand name is in URL but domain doesn't match
      if (foundBrandKeywords.length > 0) {
        const matchesBrand = foundBrandKeywords.some(brand => domain.includes(brand));
        if (!matchesBrand) {
          fraudScore += 35;
          redFlags.push({ text: `Impersonates ${foundBrandKeywords[0]} but different domain`, weight: 35 });
        }
      } else if (foundSuspiciousKeywords.length >= 2) {
        const weight = 15 * foundSuspiciousKeywords.length;
        fraudScore += weight;
        redFlags.push({ text: `Contains multiple suspicious keywords: ${foundSuspiciousKeywords.join(', ')}`, weight: weight });
      }
    }
    
    // 6. Check for typosquatting of popular domains
    const legitDomains = ['google.com', 'facebook.com', 'paypal.com', 'amazon.com', 'microsoft.com', 'apple.com', 'netflix.com', 'instagram.com', 'twitter.com', 'linkedin.com'];
    let isTyposquatting = false;
    
    legitDomains.forEach(legitDomain => {
      if (isSimilarDomain(domain, legitDomain) && domain !== legitDomain && !domain.endsWith('.' + legitDomain)) {
        fraudScore += 50;
        redFlags.push({ text: `TYPOSQUATTING DETECTED: Impersonates ${legitDomain}`, weight: 50 });
        isTyposquatting = true;
      }
    });
    
    if (!isTyposquatting && !isTrustedDomain && domain.split('.').length === 2) {
      greenFlags.push({ text: 'Domain doesn\'t appear to impersonate known brands' });
    }
    
    // 7. Check for HTTPS
    if (urlObj.protocol === 'http:') {
      fraudScore += 15;
      redFlags.push({ text: 'Not using HTTPS (insecure connection)', weight: 15 });
    } else {
      greenFlags.push({ text: 'Uses secure HTTPS connection' });
    }
    
    // 8. Check for @ symbol in URL (credential hiding)
    if (fullURL.includes('@')) {
      fraudScore += 40;
      redFlags.push({ text: 'Contains @ symbol (credential phishing technique)', weight: 40 });
    }
    
    // 9. Check for excessive hyphens (more than 3)
    const hyphenCount = domain.split('-').length - 1;
    if (hyphenCount > 3) {
      fraudScore += 15;
      redFlags.push({ text: `Excessive hyphens in domain (${hyphenCount} hyphens)`, weight: 15 });
    } else if (hyphenCount === 0) {
      greenFlags.push({ text: 'Clean domain structure' });
    }
    
    // 10. Check for long domain names (over 35 chars)
    if (domain.length > 35) {
      fraudScore += 10;
      redFlags.push({ text: `Unusually long domain name (${domain.length} characters)`, weight: 10 });
    } else if (domain.length < 20) {
      greenFlags.push({ text: 'Normal domain length' });
    }
    
    // 11. Check URL path for suspicious patterns - only if other flags exist
    if (fraudScore > 0 && /\/(login|signin|verify|account|secure|update|confirm)/i.test(urlObj.pathname)) {
      fraudScore += 10;
      redFlags.push({ text: 'Suspicious path (login/verify page)', weight: 10 });
    }
    
  } catch (error) {
    return {
      type: 'danger',
      emoji: '❌',
      title: 'Invalid URL',
      percentage: 0,
      message: 'The URL format is invalid. Please check and try again.',
      redFlags: [{ text: 'Malformed URL structure', weight: 0 }],
      greenFlags: []
    };
  }
  
  // Calculate fraud percentage
  const fraudPercentage = Math.min(100, Math.round((fraudScore / maxScore) * 100));
  
  // Determine risk level with adjusted thresholds
  if (fraudScore >= 70) {
    return {
      type: 'danger',
      emoji: '🚨',
      title: 'HIGH RISK URL - Likely Phishing',
      percentage: fraudPercentage,
      message: 'This URL shows multiple fraud indicators. DO NOT click or enter any information.',
      domain: extractDomain(url),
      redFlags: redFlags,
      greenFlags: greenFlags
    };
  } else if (fraudScore >= 35) {
    return {
      type: 'warning',
      emoji: '⚠️',
      title: 'MEDIUM RISK URL - Verify Before Clicking',
      percentage: fraudPercentage,
      message: 'This URL has suspicious characteristics. Verify it\'s legitimate before proceeding.',
      domain: extractDomain(url),
      redFlags: redFlags,
      greenFlags: greenFlags
    };
  } else if (fraudScore > 15) {
    return {
      type: 'warning',
      emoji: '⚠️',
      title: 'LOW RISK URL - Minor Concerns',
      percentage: fraudPercentage,
      message: 'Some minor concerns detected. Always verify URLs before entering sensitive data.',
      domain: extractDomain(url),
      redFlags: redFlags,
      greenFlags: greenFlags
    };
  } else {
    return {
      type: 'safe',
      emoji: '✅',
      title: 'URL Appears Safe',
      percentage: fraudPercentage,
      message: 'No major fraud indicators detected in this URL. However, always verify legitimacy before entering sensitive information.',
      domain: extractDomain(url),
      redFlags: redFlags,
      greenFlags: greenFlags
    };
  }
}

// Helper function to check if domain is legitimate
function isLegitDomain(domain) {
  const legitDomains = [
    'google.com', 'facebook.com', 'paypal.com', 'amazon.com', 
    'microsoft.com', 'apple.com', 'netflix.com', 'instagram.com',
    'twitter.com', 'linkedin.com', 'github.com', 'stackoverflow.com',
    'reddit.com', 'youtube.com', 'gmail.com', 'outlook.com'
  ];
  return legitDomains.some(legit => domain.endsWith(legit));
}

// Helper function to check domain similarity (typosquatting)
function isSimilarDomain(domain, legitDomain) {
  // Remove TLD for comparison
  const domainBase = domain.split('.')[0];
  const legitBase = legitDomain.split('.')[0];
  
  // Check if domains are very similar (Levenshtein distance)
  const distance = levenshteinDistance(domainBase, legitBase);
  return distance > 0 && distance <= 2; // 1-2 character difference
}

// Calculate Levenshtein distance (edit distance between strings)
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Extract clean domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'Invalid URL';
  }
}

// Function to display results with detailed flags
function displayResult(result) {
  const resultDiv = document.getElementById('result');
  resultDiv.style.display = 'block';
  resultDiv.className = result.type;
  
  // Build red flags HTML
  let redFlagsHTML = '';
  if (result.redFlags && result.redFlags.length > 0) {
    redFlagsHTML = '<div style="margin-top: 12px;"><strong style="color: #e74c3c;">🚩 Red Flags Detected:</strong><ul style="margin: 8px 0; padding-left: 20px;">';
    result.redFlags.forEach(flag => {
      redFlagsHTML += `<li style="margin: 4px 0; color: #c0392b;"><span style="font-weight: 500;">${flag.text}</span> ${flag.weight ? `<span style="font-size: 0.85em; color: #e74c3c;">(Risk: +${flag.weight})</span>` : ''}</li>`;
    });
    redFlagsHTML += '</ul></div>';
  }
  
  // Build green flags HTML
  let greenFlagsHTML = '';
  if (result.greenFlags && result.greenFlags.length > 0) {
    greenFlagsHTML = '<div style="margin-top: 12px;"><strong style="color: #27ae60;">✅ Safe Indicators:</strong><ul style="margin: 8px 0; padding-left: 20px;">';
    result.greenFlags.forEach(flag => {
      greenFlagsHTML += `<li style="margin: 4px 0; color: #229954;">${flag.text}</li>`;
    });
    greenFlagsHTML += '</ul></div>';
  }
  
  // Build domain info if available
  let domainHTML = '';
  if (result.domain) {
    domainHTML = `<div style="margin-top: 10px; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 4px;"><strong>Domain:</strong> <code style="font-family: monospace; font-size: 0.9em;">${result.domain}</code></div>`;
  }
  
  // Build percentage display
  let percentageHTML = '';
  if (result.percentage !== undefined) {
    const percentageColor = result.percentage >= 50 ? '#e74c3c' : (result.percentage >= 25 ? '#f39c12' : '#27ae60');
    percentageHTML = `
      <div style="margin: 15px 0; padding: 12px; background: rgba(0,0,0,0.03); border-radius: 8px; text-align: center;">
        <div style="font-size: 0.9em; color: #555; margin-bottom: 5px;">Fraud Risk Level</div>
        <div style="font-size: 2em; font-weight: bold; color: ${percentageColor};">${result.percentage}%</div>
        <div style="margin-top: 8px; background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="width: ${result.percentage}%; height: 100%; background: ${percentageColor}; transition: width 0.5s ease;"></div>
        </div>
      </div>
    `;
  }
  
  resultDiv.innerHTML = `
    <strong style="font-size: 1.1em;">${result.emoji} ${result.title}</strong>
    ${percentageHTML}
    <p style="margin: 10px 0;">${result.message}</p>
    ${domainHTML}
    ${redFlagsHTML}
    ${greenFlagsHTML}
  `;
}

// Function to analyze text automatically
function autoAnalyze(text) {
  const resultDiv = document.getElementById('result');
  
  if (!text) {
    resultDiv.style.display = 'block';
    resultDiv.className = 'warning';
    resultDiv.innerHTML = '⚠️ No text to analyze. Select text on any page and click the extension icon.';
    return;
  }
  
  // Show loading
  resultDiv.style.display = 'block';
  resultDiv.className = '';
  resultDiv.innerHTML = '🔍 Analyzing...';
  
  // Analyze after brief delay
  setTimeout(() => {
    const result = analyzeText(text);
    displayResult(result);
  }, 500);
}

// Listen for text input changes (for manual typing)
document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('textInput');
  
  // Auto-analyze when user stops typing for 1 second
  let typingTimer;
  textInput.addEventListener('input', () => {
    clearTimeout(typingTimer);
    const text = textInput.value.trim();
    if (text.length > 10) {
      typingTimer = setTimeout(() => {
        autoAnalyze(text);
      }, 1000);
    }
  });
});

// Function to get selected text from the current page
async function getSelectedTextFromPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Execute script to get selected text
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString().trim()
    });
    
    if (results && results[0] && results[0].result) {
      return results[0].result;
    }
  } catch (error) {
    console.log('Could not get selected text from page:', error);
  }
  return null;
}

// Function to load and analyze selected text
async function loadSelectedText() {
  console.log('Checking for selected text...');
  
  // First check storage (from context menu)
  chrome.storage.local.get(['selectedText'], async (data) => {
    let textToAnalyze = null;
    
    if (data.selectedText) {
      console.log('Found selected text in storage:', data.selectedText);
      textToAnalyze = data.selectedText;
      // Clear the stored text
      chrome.storage.local.remove('selectedText');
    } else {
      // Try to get selected text from the active page
      console.log('No stored text, trying to get from active page...');
      textToAnalyze = await getSelectedTextFromPage();
      if (textToAnalyze) {
        console.log('Found selected text on page:', textToAnalyze);
      }
    }
    
    if (textToAnalyze) {
      document.getElementById('textInput').value = textToAnalyze;
      // Auto-analyze immediately
      autoAnalyze(textToAnalyze);
    } else {
      console.log('No selected text found');
    }
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in popup:', request);
  if (request.action === 'textSelected' && request.text) {
    document.getElementById('textInput').value = request.text;
    // Auto-analyze immediately
    autoAnalyze(request.text);
    sendResponse({ received: true });
  }
  return true;
});

// Load selected text when popup opens
document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded, checking for selected text...');
  loadSelectedText();
});