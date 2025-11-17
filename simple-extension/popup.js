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
  let reasons = [];
  
  // Check keywords
  scamKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      fraudScore += 10;
      reasons.push(`Contains suspicious keyword: "${keyword}"`);
    }
  });
  
  // Check patterns
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      fraudScore += 20;
      reasons.push('Contains suspicious URL pattern');
    }
  });
  
  // Check for urgency and pressure tactics
  if (/within \d+ (hours?|minutes?|days?)/i.test(text)) {
    fraudScore += 15;
    reasons.push('Creates false urgency with time limit');
  }
  
  // Check for "act now" or "limited time"
  if (/act now|limited time|hurry|expires soon|don't wait/i.test(text)) {
    fraudScore += 10;
    reasons.push('Uses pressure tactics');
  }
  
  // Check for excessive punctuation (!!!, ???)
  if (/[!?]{3,}/.test(text)) {
    fraudScore += 8;
    reasons.push('Excessive punctuation (pressure tactic)');
  }
  
  // Check for ALL CAPS (yelling)
  const capsWords = text.match(/\b[A-Z]{4,}\b/g);
  if (capsWords && capsWords.length >= 2) {
    fraudScore += 8;
    reasons.push('Excessive use of CAPITAL LETTERS');
  }
  
  // Determine risk level
  if (fraudScore >= 40) {
    return {
      type: 'danger',
      emoji: '🚨',
      title: 'High Risk - Likely Scam',
      message: 'This text contains multiple fraud indicators. Do NOT share personal information or send money.<br><br>' +
               '<strong>Reasons:</strong><br>• ' + reasons.slice(0, 3).join('<br>• ')
    };
  } else if (fraudScore >= 20) {
    return {
      type: 'warning',
      emoji: '⚠️',
      title: 'Medium Risk - Be Cautious',
      message: 'This text has some suspicious elements. Verify through official channels before taking action.<br><br>' +
               '<strong>Warnings:</strong><br>• ' + reasons.slice(0, 2).join('<br>• ')
    };
  } else {
    return {
      type: 'safe',
      emoji: '✅',
      title: 'Low Risk',
      message: 'No major fraud indicators detected. Always verify requests through official channels.'
    };
  }
}

// URL fraud detection logic
function analyzeURL(url) {
  let fraudScore = 0;
  let reasons = [];
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    const fullURL = url.toLowerCase();
    
    // 1. Check for IP address instead of domain
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
      fraudScore += 30;
      reasons.push('🔴 Uses IP address instead of domain name (common in phishing)');
    }
    
    // 2. Check for suspicious TLDs (top-level domains)
    const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.club', '.live', '.online'];
    if (suspiciousTLDs.some(tld => domain.endsWith(tld))) {
      fraudScore += 25;
      reasons.push('🔴 Uses suspicious free domain extension');
    }
    
    // 3. Check for URL shorteners
    const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'adf.ly'];
    if (shorteners.some(shortener => domain.includes(shortener))) {
      fraudScore += 20;
      reasons.push('⚠️ URL shortener detected (hides real destination)');
    }
    
    // 4. Check for excessive subdomains
    const subdomains = domain.split('.');
    if (subdomains.length > 4) {
      fraudScore += 15;
      reasons.push('⚠️ Excessive subdomains (obfuscation technique)');
    }
    
    // 5. Check for suspicious keywords in URL
    const suspiciousKeywords = ['verify', 'account', 'secure', 'login', 'signin', 'update', 'confirm', 'banking', 'paypal', 'apple', 'amazon', 'microsoft', 'wallet', 'bitcoin'];
    const foundKeywords = suspiciousKeywords.filter(keyword => fullURL.includes(keyword));
    if (foundKeywords.length > 0 && !isLegitDomain(domain)) {
      fraudScore += 15 * foundKeywords.length;
      reasons.push(`🔴 Contains suspicious keywords: ${foundKeywords.join(', ')}`);
    }
    
    // 6. Check for misspelled popular domains
    const legitDomains = ['google.com', 'facebook.com', 'paypal.com', 'amazon.com', 'microsoft.com', 'apple.com', 'netflix.com', 'instagram.com', 'twitter.com', 'linkedin.com'];
    legitDomains.forEach(legitDomain => {
      if (isSimilarDomain(domain, legitDomain) && domain !== legitDomain) {
        fraudScore += 40;
        reasons.push(`🔴 Typosquatting: Impersonates ${legitDomain}`);
      }
    });
    
    // 7. Check for HTTPS (lack of it is suspicious)
    if (urlObj.protocol === 'http:') {
      fraudScore += 10;
      reasons.push('⚠️ Not using HTTPS (insecure connection)');
    }
    
    // 8. Check for @ symbol in URL (credential hiding)
    if (fullURL.includes('@')) {
      fraudScore += 35;
      reasons.push('🔴 Contains @ symbol (credential phishing technique)');
    }
    
    // 9. Check for excessive hyphens
    const hyphenCount = domain.split('-').length - 1;
    if (hyphenCount > 3) {
      fraudScore += 10;
      reasons.push('⚠️ Excessive hyphens in domain');
    }
    
    // 10. Check for long domain names (over 30 chars)
    if (domain.length > 30) {
      fraudScore += 8;
      reasons.push('⚠️ Unusually long domain name');
    }
    
    // 11. Check URL path for suspicious patterns
    if (/\/(login|signin|verify|account|secure|update|confirm)/i.test(urlObj.pathname)) {
      fraudScore += 10;
      reasons.push('⚠️ Suspicious path (login/verify page)');
    }
    
  } catch (error) {
    return {
      type: 'danger',
      emoji: '❌',
      title: 'Invalid URL',
      message: 'The URL format is invalid. Please check and try again.'
    };
  }
  
  // Determine risk level
  if (fraudScore >= 50) {
    return {
      type: 'danger',
      emoji: '🚨',
      title: 'HIGH RISK URL - Likely Phishing',
      message: 'This URL shows multiple fraud indicators. DO NOT click or enter any information.<br><br>' +
               '<strong>Threats Detected:</strong><br>• ' + reasons.slice(0, 4).join('<br>• ') +
               '<br><br><strong>Domain:</strong> ' + extractDomain(url)
    };
  } else if (fraudScore >= 25) {
    return {
      type: 'warning',
      emoji: '⚠️',
      title: 'MEDIUM RISK URL - Verify Before Clicking',
      message: 'This URL has suspicious characteristics. Verify it\'s legitimate before proceeding.<br><br>' +
               '<strong>Warnings:</strong><br>• ' + reasons.slice(0, 3).join('<br>• ') +
               '<br><br><strong>Domain:</strong> ' + extractDomain(url)
    };
  } else if (fraudScore > 0) {
    return {
      type: 'warning',
      emoji: '⚠️',
      title: 'LOW RISK URL - Minor Concerns',
      message: 'Some minor concerns detected. Always verify URLs before entering sensitive data.<br><br>' +
               '<strong>Notes:</strong><br>• ' + reasons.join('<br>• ') +
               '<br><br><strong>Domain:</strong> ' + extractDomain(url)
    };
  } else {
    return {
      type: 'safe',
      emoji: '✅',
      title: 'URL Appears Safe',
      message: 'No major fraud indicators detected in this URL. However, always verify legitimacy before entering sensitive information.<br><br>' +
               '<strong>Domain:</strong> ' + extractDomain(url)
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

// Function to display results
function displayResult(result) {
  const resultDiv = document.getElementById('result');
  resultDiv.style.display = 'block';
  resultDiv.className = result.type;
  resultDiv.innerHTML = `
    <strong>${result.emoji} ${result.title}</strong><br>
    ${result.message}
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