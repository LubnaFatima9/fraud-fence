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
      title: result.isFraudulent ? 'High Risk - Likely Fraud' : 
             (confidenceScore >= 30 ? 'Medium Risk - Be Cautious' : 'Low Risk - Appears Safe'),
      percentage: confidenceScore,
      message: result.explanation || result.message || 'Analysis complete',
      threatTypes: result.threatTypes || [],
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
      title: result.isFraudulent ? 'High Risk URL - Likely Malicious' : 
             (confidenceScore >= 30 ? 'Medium Risk URL - Verify Before Clicking' : 'URL Appears Safe'),
      percentage: confidenceScore,
      message: result.explanation || result.message || 'URL analysis complete',
      domain: extractDomain(url),
      threatTypes: result.threatTypes || [],
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
  const loadingDiv = document.getElementById('loading');
  
  // Hide loading
  loadingDiv.style.display = 'none';
  
  // Show result with animation
  resultDiv.classList.add('show');
  
  // Determine status class
  const statusClass = result.type === 'danger' ? 'danger' : 
                      result.type === 'warning' ? 'warning' : 'safe';
  
  // Extract threat types from the result
  let threatTypes = [];
  if (result.threatTypes && Array.isArray(result.threatTypes)) {
    threatTypes = result.threatTypes;
  } else if (result.redFlags && result.redFlags.length > 0) {
    threatTypes = result.redFlags.map(flag => flag.text);
  }
  
  // Build threat types HTML
  let threatTypesHTML = '';
  if (threatTypes.length > 0) {
    threatTypesHTML = `
      <div class="threat-types">
        <h4>⚠️ Detected Threat Types:</h4>
        ${threatTypes.map(threat => `<span class="threat-tag">${threat}</span>`).join('')}
      </div>
    `;
  }
  
  // Build percentage/confidence display
  let confidenceHTML = '';
  if (result.percentage !== undefined) {
    confidenceHTML = `
      <span class="confidence">
        Confidence: <strong>${result.percentage}%</strong>
      </span>
    `;
  }
  
  // Build badge HTML
  let badgeHTML = '';
  if (result.apiPowered) {
    badgeHTML = '<span class="badge api">🌐 AI Powered</span>';
  } else {
    badgeHTML = '<span class="badge fallback">🔍 Rule Based</span>';
  }
  
  // Parse markdown-style explanation to HTML
  let explanationHTML = parseMarkdownToHTML(result.message || result.reasoning || result.explanation || 'Analysis complete.');
  
  // Build the full result HTML
  resultDiv.innerHTML = `
    <div class="result-header ${statusClass}">
      <div class="result-icon">${result.emoji}</div>
      <div class="result-title">
        <h3>${result.title}</h3>
        ${confidenceHTML}
      </div>
      ${badgeHTML}
    </div>
    
    ${threatTypesHTML}
    
    <div class="explanation">
      ${explanationHTML}
    </div>
  `;
}

// Parse markdown-style text to HTML
function parseMarkdownToHTML(text) {
  if (!text) return '';
  
  let html = text;
  
  // Convert markdown headers
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  
  // Convert bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert lists
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>\n?)+/gs, '<ul>$&</ul>');
  
  // Convert line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<p>')) {
    html = '<p>' + html + '</p>';
  }
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>\s*<br>\s*<\/p>/g, '');
  
  // Convert inline code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  return html;
}

// Function to analyze text automatically with AI
async function autoAnalyze(text) {
  const resultDiv = document.getElementById('result');
  const loadingDiv = document.getElementById('loading');
  
  if (!text) {
    resultDiv.classList.remove('show');
    resultDiv.style.display = 'none';
    loadingDiv.style.display = 'none';
    return;
  }
  
  // Show loading state
  resultDiv.classList.remove('show');
  resultDiv.style.display = 'none';
  loadingDiv.style.display = 'block';
  
  try {
    const result = await analyzeTextWithAI(text);
    displayResult(result);
  } catch (error) {
    console.error('Analysis error:', error);
    loadingDiv.style.display = 'none';
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <div class="result-header danger">
        <div class="result-icon">❌</div>
        <div class="result-title">
          <h3>Analysis Failed</h3>
        </div>
      </div>
      <div class="explanation">
        <p>Unable to analyze content. Please check:</p>
        <ul>
          <li>Website is running at <code>http://localhost:9005</code></li>
          <li>Internet connection is active</li>
          <li>Browser extensions are not blocking requests</li>
        </ul>
        <p><strong>Error:</strong> ${error.message}</p>
      </div>
    `;
  }
}

// Listen for button clicks and text input
document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('textInput');
  const clearBtn = document.getElementById('clearBtn');
  const resultDiv = document.getElementById('result');
  
  let typingTimer;
  const typingDelay = 1500; // 1.5 seconds after user stops typing
  
  // Auto-analyze when user types
  if (textInput) {
    textInput.addEventListener('input', () => {
      clearTimeout(typingTimer);
      const text = textInput.value.trim();
      
      // Clear results if text is too short
      if (text.length < 10) {
        resultDiv.classList.remove('show');
        resultDiv.style.display = 'none';
        document.getElementById('loading').style.display = 'none';
        return;
      }
      
      // Show a subtle hint that analysis will start
      const loadingDiv = document.getElementById('loading');
      loadingDiv.style.display = 'none';
      
      // Start analysis after user stops typing
      typingTimer = setTimeout(() => {
        autoAnalyze(text);
      }, typingDelay);
    });
    
    // Instant analysis on paste
    textInput.addEventListener('paste', () => {
      setTimeout(() => {
        const text = textInput.value.trim();
        if (text.length >= 10) {
          clearTimeout(typingTimer);
          autoAnalyze(text);
        }
      }, 100);
    });
  }
  
  // Clear button click
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      textInput.value = '';
      resultDiv.classList.remove('show');
      resultDiv.style.display = 'none';
      document.getElementById('loading').style.display = 'none';
      clearTimeout(typingTimer);
      textInput.focus();
    });
  }
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