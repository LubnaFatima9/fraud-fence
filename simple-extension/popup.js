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
  
  // Check for common scam keywords (made more flexible)
  const scamKeywords = [
    'urgent', 'verify', 'suspended', 'click here',
    'congratulations', 'claim', 'prize', 'limited time',
    'act now', 'wire transfer', 'western union', 'gift card',
    'social security', 'ssn', 'credit card', 'bank account',
    'password', 'pin', 'verify identity', 'confirm',
    'nigerian prince', 'inheritance', 'lottery', 'bitcoin',
    'investment', 'guaranteed', 'risk-free', 'offer expires',
    'winner', 'selected', 'refund', 'account suspended'
  ];
  
  // Check for suspicious URLs embedded in text
  const suspiciousPatterns = [
    /bit\.ly/i,
    /tinyurl/i,
    /t\.co/i,
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,  // IP addresses
    /https?:\/\/[^\s]+\.(tk|ml|ga|cf|gq)/i  // Free domains
  ];
  
  let fraudScore = 0;
  let redFlags = [];
  let greenFlags = [];
  const maxScore = 150; // Maximum possible score for percentage calculation
  
  // Check keywords
  scamKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      fraudScore += 10;
      redFlags.push({ text: `Contains suspicious keyword: "${keyword}"`, weight: 10 });
    }
  });
  
  // Check patterns
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      fraudScore += 20;
      redFlags.push({ text: 'Contains suspicious URL pattern', weight: 20 });
    }
  });
  
  // Check for urgency and pressure tactics
  if (/within \d+ (hours?|minutes?|days?)/i.test(text)) {
    fraudScore += 15;
    redFlags.push({ text: 'Creates false urgency with time limit', weight: 15 });
  }
  
  // Check for "act now" or "limited time"
  if (/act now|limited time|hurry|expires soon|don't wait/i.test(text)) {
    fraudScore += 10;
    redFlags.push({ text: 'Uses pressure tactics', weight: 10 });
  }
  
  // Check for excessive punctuation (!!!, ???)
  if (/[!?]{3,}/.test(text)) {
    fraudScore += 8;
    redFlags.push({ text: 'Excessive punctuation (pressure tactic)', weight: 8 });
  }
  
  // Check for ALL CAPS (yelling)
  const capsWords = text.match(/\b[A-Z]{4,}\b/g);
  if (capsWords && capsWords.length >= 2) {
    fraudScore += 8;
    redFlags.push({ text: 'Excessive use of CAPITAL LETTERS', weight: 8 });
  }
  
  // Add green flags for safe indicators
  if (!redFlags.length) {
    greenFlags.push({ text: 'No suspicious keywords detected' });
  }
  if (!/[!?]{3,}/.test(text)) {
    greenFlags.push({ text: 'Normal punctuation usage' });
  }
  if (text.length > 50 && text.length < 500) {
    greenFlags.push({ text: 'Reasonable message length' });
  }
  
  // Calculate fraud percentage
  const fraudPercentage = Math.min(100, Math.round((fraudScore / maxScore) * 100));
  
  // Determine risk level
  if (fraudScore >= 40) {
    return {
      type: 'danger',
      emoji: '🚨',
      title: 'High Risk - Likely Scam',
      percentage: fraudPercentage,
      message: 'This text contains multiple fraud indicators. Do NOT share personal information or send money.',
      redFlags: redFlags,
      greenFlags: greenFlags
    };
  } else if (fraudScore >= 20) {
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