// AI-Powered fraud detection using Website's API
async function analyzeTextWithAI(text) {
  const trimmedText = text.trim();
  
  // Check if input is primarily a URL (with or without protocol)
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
  const hasProtocol = /^https?:\/\//i.test(trimmedText);
  const looksLikeURL = urlPattern.test(trimmedText);
  
  // If it's a URL, analyze it separately
  if (hasProtocol || looksLikeURL) {
    const urlToAnalyze = hasProtocol ? trimmedText : 'https://' + trimmedText;
    return await analyzeURLWithAI(urlToAnalyze);
  }
  
  try {
    // Call Website's Text Detection API (same logic as the main site)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
    
    console.log('📝 Calling website API for text analysis...');
    const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.TEXT_DETECT_URL}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ text: text }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Website API response:', result);
    
    // Format response from website API
    const confidenceScore = Math.round((result.confidenceScore || 0) * 100);
    
    return {
      type: result.isFraudulent ? 'danger' : (confidenceScore >= 30 ? 'warning' : 'safe'),
      emoji: result.isFraudulent ? '🚨' : (confidenceScore >= 30 ? '⚠️' : '✅'),
      title: result.isFraudulent ? 'High Risk - Likely Scam' : 
             (confidenceScore >= 30 ? 'Medium Risk - Be Cautious' : 'Low Risk - Appears Safe'),
      percentage: confidenceScore,
      message: result.explanation || result.message || 'Analysis complete',
      redFlags: (result.indicators || result.details || [])
        .filter(item => item.toLowerCase().includes('suspicious') || 
                       item.toLowerCase().includes('risk') ||
                       item.toLowerCase().includes('phishing') ||
                       item.toLowerCase().includes('scam'))
        .map(flag => ({ text: flag, weight: 0 })),
      greenFlags: (result.indicators || result.details || [])
        .filter(item => item.toLowerCase().includes('legitimate') || 
                       item.toLowerCase().includes('safe') ||
                       item.toLowerCase().includes('secure'))
        .map(flag => ({ text: flag })),
      apiPowered: true,
      reasoning: result.reasoning || result.explanation
    };
    
  } catch (error) {
    console.error('Website API analysis failed:', error);
    
    // Fallback to rule-based detection
    if (CONFIG.USE_FALLBACK) {
      console.log('⚠️ Falling back to rule-based detection...');
      return analyzeTextRuleBased(text);
    }
    
    throw error;
  }
}

// Rule-based fallback detection (improved logic)
function analyzeTextRuleBased(text) {
  const lowerText = text.toLowerCase();
  const trimmedText = text.trim();
  
  // Check if input is primarily a URL
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
  const hasProtocol = /^https?:\/\//i.test(trimmedText);
  const looksLikeURL = urlPattern.test(trimmedText);
  
  if (hasProtocol || looksLikeURL) {
    const urlToAnalyze = hasProtocol ? trimmedText : 'https://' + trimmedText;
    return analyzeURL(urlToAnalyze);
  }
  
  // High-risk patterns that require multiple keywords in context
  const highRiskPatterns = [
    { pattern: /urgent.*verify.*account.*click/i, weight: 30, desc: 'Urgency + Account verification + Click request' },
    { pattern: /account.*suspended.*immediate/i, weight: 30, desc: 'Account suspension threat with urgency' },
    { pattern: /congratulations.*won.*prize.*claim/i, weight: 35, desc: 'Fake prize/lottery scam pattern' },
    { pattern: /wire transfer.*western union.*money/i, weight: 40, desc: 'Untraceable payment method request' },
    { pattern: /social security.*number.*verify/i, weight: 45, desc: 'SSN phishing attempt' },
    { pattern: /nigerian prince.*inheritance.*transfer/i, weight: 50, desc: 'Classic advance-fee scam' }
  ];
  
  let fraudScore = 0;
  let redFlags = [];
  let greenFlags = [];
  const maxScore = 200;
  
  // Check for high-risk contextual patterns
  highRiskPatterns.forEach(item => {
    if (item.pattern.test(text)) {
      fraudScore += item.weight;
      redFlags.push({ text: item.desc, weight: item.weight });
    }
  });
  
  // Only check individual keywords if high-risk patterns found
  if (fraudScore > 0) {
    const dangerousKeywords = ['ssn', 'wire transfer', 'western union', 'nigerian prince', 'bitcoin wallet'];
    dangerousKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        fraudScore += 15;
        redFlags.push({ text: `High-risk keyword: "${keyword}"`, weight: 15 });
      }
    });
  }
  
  // Check for suspicious URLs embedded in text
  const ipUrlPattern = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
  if (ipUrlPattern.test(text)) {
    fraudScore += 25;
    redFlags.push({ text: 'Contains IP address URL (highly suspicious)', weight: 25 });
  }
  
  const freeDomainPattern = /https?:\/\/[^\s]+\.(tk|ml|ga|cf|gq)\b/i;
  if (freeDomainPattern.test(text)) {
    fraudScore += 20;
    redFlags.push({ text: 'Contains free/suspicious domain', weight: 20 });
  }
  
  // Green flags for legitimate patterns
  if (/unsubscribe|opt.out|privacy policy|terms of service/i.test(text)) {
    greenFlags.push({ text: 'Contains legitimate opt-out/policy links' });
    fraudScore = Math.max(0, fraudScore - 15);
  }
  
  if (/dear (customer|user|member)|sincerely|regards/i.test(text)) {
    greenFlags.push({ text: 'Professional communication format' });
    fraudScore = Math.max(0, fraudScore - 10);
  }
  
  if (text.length > 100 && !/[!?]{3,}/.test(text)) {
    greenFlags.push({ text: 'Normal message structure and punctuation' });
  }
  
  if (redFlags.length === 0) {
    greenFlags.push({ text: 'No major fraud indicators detected' });
  }
  
  // Calculate fraud percentage
  const fraudPercentage = Math.min(100, Math.round((fraudScore / maxScore) * 100));
  
  // Higher thresholds to reduce false positives
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
      title: 'Low Risk - Appears Safe',
      percentage: fraudPercentage,
      message: 'No major fraud indicators detected. Always verify requests through official channels.',
      redFlags: redFlags,
      greenFlags: greenFlags
    };
  }
}

// AI-Powered URL analysis using Website's API
async function analyzeURLWithAI(url) {
  try {
    // Call Website's URL Detection API (same logic as the main site)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
    
    console.log('🔗 Calling website API for URL analysis...');
    const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.URL_DETECT_URL}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ url: url }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Website API URL response:', result);
    
    // Format response from website API
    const confidenceScore = Math.round((result.confidenceScore || 0) * 100);
    
    return {
      type: result.isFraudulent ? 'danger' : (confidenceScore >= 30 ? 'warning' : 'safe'),
      emoji: result.isFraudulent ? '🚨' : (confidenceScore >= 30 ? '⚠️' : '✅'),
      title: result.isFraudulent ? 'HIGH RISK URL - Likely Phishing' : 
             (confidenceScore >= 30 ? 'MEDIUM RISK URL - Verify Before Clicking' : 'URL Appears Safe'),
      percentage: confidenceScore,
      message: result.explanation || result.message || 'URL analysis complete',
      domain: extractDomain(url),
      redFlags: (result.indicators || result.threatTypes || result.details || [])
        .filter(item => typeof item === 'string' && (
          item.toLowerCase().includes('suspicious') || 
          item.toLowerCase().includes('risk') ||
          item.toLowerCase().includes('phishing') ||
          item.toLowerCase().includes('malicious')
        ))
        .map(flag => ({ text: flag, weight: 0 })),
      greenFlags: (result.indicators || result.details || [])
        .filter(item => typeof item === 'string' && (
          item.toLowerCase().includes('legitimate') || 
          item.toLowerCase().includes('safe') ||
          item.toLowerCase().includes('secure') ||
          item.toLowerCase().includes('trusted')
        ))
        .map(flag => ({ text: flag })),
      apiPowered: true,
      reasoning: result.reasoning || result.explanation
    };
    
  } catch (error) {
    console.error('Website API URL analysis failed:', error);
    
    // Fallback to rule-based detection
    if (CONFIG.USE_FALLBACK) {
      console.log('⚠️ Falling back to rule-based URL detection...');
      return analyzeURL(url);
    }
    
    throw error;
  }
}

// URL fraud detection logic (fallback)
function analyzeURL(url) {
  let fraudScore = 0;
  let redFlags = [];
  let greenFlags = [];
  const maxScore = 200; // Maximum possible score for percentage calculation
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    const fullURL = url.toLowerCase();
    
    // 1. Check for IP address instead of domain
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
      fraudScore += 30;
      redFlags.push({ text: 'Uses IP address instead of domain name (common in phishing)', weight: 30 });
    } else {
      greenFlags.push({ text: 'Uses proper domain name' });
    }
    
    // 2. Check for suspicious TLDs (top-level domains)
    const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.club', '.live', '.online'];
    if (suspiciousTLDs.some(tld => domain.endsWith(tld))) {
      fraudScore += 25;
      redFlags.push({ text: 'Uses suspicious free domain extension', weight: 25 });
    } else {
      greenFlags.push({ text: 'Uses standard domain extension' });
    }
    
    // 3. Check for URL shorteners
    const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'adf.ly'];
    if (shorteners.some(shortener => domain.includes(shortener))) {
      fraudScore += 20;
      redFlags.push({ text: 'URL shortener detected (hides real destination)', weight: 20 });
    } else {
      greenFlags.push({ text: 'Full URL visible (not shortened)' });
    }
    
    // 4. Check for excessive subdomains
    const subdomains = domain.split('.');
    if (subdomains.length > 4) {
      fraudScore += 15;
      redFlags.push({ text: 'Excessive subdomains (obfuscation technique)', weight: 15 });
    }
    
    // 5. Check for suspicious keywords in URL
    const suspiciousKeywords = ['verify', 'account', 'secure', 'login', 'signin', 'update', 'confirm', 'banking', 'paypal', 'apple', 'amazon', 'microsoft', 'wallet', 'bitcoin'];
    const foundKeywords = suspiciousKeywords.filter(keyword => fullURL.includes(keyword));
    if (foundKeywords.length > 0 && !isLegitDomain(domain)) {
      const weight = 15 * foundKeywords.length;
      fraudScore += weight;
      redFlags.push({ text: `Contains suspicious keywords: ${foundKeywords.join(', ')}`, weight: weight });
    }
    
    // 6. Check for misspelled popular domains
    const legitDomains = ['google.com', 'facebook.com', 'paypal.com', 'amazon.com', 'microsoft.com', 'apple.com', 'netflix.com', 'instagram.com', 'twitter.com', 'linkedin.com'];
    let isTyposquatting = false;
    legitDomains.forEach(legitDomain => {
      if (isSimilarDomain(domain, legitDomain) && domain !== legitDomain) {
        fraudScore += 40;
        redFlags.push({ text: `Typosquatting: Impersonates ${legitDomain}`, weight: 40 });
        isTyposquatting = true;
      }
    });
    if (!isTyposquatting && isLegitDomain(domain)) {
      greenFlags.push({ text: 'Legitimate known domain' });
    }
    
    // 7. Check for HTTPS (lack of it is suspicious)
    if (urlObj.protocol === 'http:') {
      fraudScore += 10;
      redFlags.push({ text: 'Not using HTTPS (insecure connection)', weight: 10 });
    } else {
      greenFlags.push({ text: 'Uses secure HTTPS connection' });
    }
    
    // 8. Check for @ symbol in URL (credential hiding)
    if (fullURL.includes('@')) {
      fraudScore += 35;
      redFlags.push({ text: 'Contains @ symbol (credential phishing technique)', weight: 35 });
    }
    
    // 9. Check for excessive hyphens
    const hyphenCount = domain.split('-').length - 1;
    if (hyphenCount > 3) {
      fraudScore += 10;
      redFlags.push({ text: 'Excessive hyphens in domain', weight: 10 });
    }
    
    // 10. Check for long domain names (over 30 chars)
    if (domain.length > 30) {
      fraudScore += 8;
      redFlags.push({ text: 'Unusually long domain name', weight: 8 });
    } else if (domain.length < 20) {
      greenFlags.push({ text: 'Normal domain length' });
    }
    
    // 11. Check URL path for suspicious patterns
    if (/\/(login|signin|verify|account|secure|update|confirm)/i.test(urlObj.pathname)) {
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
  
  // Determine risk level
  if (fraudScore >= 50) {
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
  } else if (fraudScore >= 25) {
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
  } else if (fraudScore > 0) {
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
    ${result.apiPowered ? '<div style="margin-top: 10px; padding: 6px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 4px; font-size: 0.85em; text-align: center;">🌐 Website API Analysis</div>' : ''}
  `;
}

// Function to analyze text automatically with AI
async function autoAnalyze(text) {
  const resultDiv = document.getElementById('result');
  
  if (!text) {
    resultDiv.style.display = 'block';
    resultDiv.className = 'warning';
    resultDiv.innerHTML = '⚠️ No text to analyze. Select text on any page and click the extension icon.';
    return;
  }
  
  // Show loading with API indicator
  resultDiv.style.display = 'block';
  resultDiv.className = '';
  resultDiv.innerHTML = '🔍 Analyzing with Website API...<br><small style="opacity: 0.7;">Connecting to fraud detection server...</small>';
  
  // Analyze with AI
  try {
    const result = await analyzeTextWithAI(text);
    displayResult(result);
  } catch (error) {
    console.error('Analysis error:', error);
    resultDiv.className = 'danger';
    resultDiv.innerHTML = '❌ Analysis failed. Please check your internet connection or API key.';
  }
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