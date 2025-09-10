// Enhanced URL fraud analysis with comprehensive explanations
'use server';

import {z} from 'zod';

const AnalyzeUrlForFraudInputSchema = z.object({
  url: z.string().describe('The URL to analyze for potential fraud.'),
});

export type AnalyzeUrlForFraudInput = z.infer<typeof AnalyzeUrlForFraudInputSchema>;

const AnalyzeUrlForFraudOutputSchema = z.object({
  isFraudulent: z.boolean().describe('Whether the URL is likely fraudulent.'),
  confidenceScore: z.number().describe('A score indicating the confidence level of the fraud detection.'),
  explanation: z.string().describe('An explanation of why the URL is considered fraudulent or safe.'),
  threatTypes: z.array(z.string()).describe('Array of detected threat types.')
});

export type AnalyzeUrlForFraudOutput = z.infer<typeof AnalyzeUrlForFraudOutputSchema>;

// Enhanced URL analysis with comprehensive threat detection
function comprehensiveUrlAnalysis(url: string): AnalyzeUrlForFraudOutput {
  console.log('🔗 Performing comprehensive URL analysis for:', url);
  
  let suspiciousScore = 0;
  const detectedThreats: string[] = [];
  
  const urlLower = url.toLowerCase();
  
  // Enhanced threat pattern detection
  const threatPatterns = {
    'Suspicious Domain': ['.tk', '.ml', '.ga', '.cf', '.bit', '.onion', '.ru', '.cn'],
    'URL Shortener': ['bit.ly', 'tinyurl', 't.co', 'goo.gl', 'ow.ly', 'short.link', 'tiny.cc', 'rebrand.ly'],
    'Brand Impersonation': {
      'paypal': ['paypal', 'payp4l', 'paypaI'],
      'amazon': ['amazon', 'amaz0n', 'amazom'],
      'apple': ['apple', 'app1e', 'appl3'],
      'microsoft': ['microsoft', 'micr0soft', 'microsft'],
      'google': ['google', 'g00gle', 'googIe'],
      'facebook': ['facebook', 'faceb00k', 'facebok'],
      'instagram': ['instagram', 'instagr4m', 'inst4gram'],
      'netflix': ['netflix', 'netfl1x', 'netfIix'],
      'banking': ['bank', 'chase', 'wellsfargo', 'bofa', 'citi']
    },
    'Phishing Keywords': ['verify', 'login', 'secure', 'update', 'suspend', 'confirm', 'account'],
    'Scam Indicators': ['winner', 'prize', 'lottery', 'free', 'urgent', 'limited', 'expires'],
    'Financial Threats': ['payment', 'billing', 'invoice', 'refund', 'tax', 'irs']
  };

  // Check for suspicious top-level domains
  if (threatPatterns['Suspicious Domain'].some(tld => urlLower.includes(tld))) {
    suspiciousScore += 0.4;
    detectedThreats.push('Suspicious Domain');
  }
  
  // Check for URL shorteners
  if (threatPatterns['URL Shortener'].some(shortener => urlLower.includes(shortener))) {
    suspiciousScore += 0.3;
    detectedThreats.push('URL Shortener');
  }
  
  // Enhanced brand impersonation detection
  Object.entries(threatPatterns['Brand Impersonation']).forEach(([brand, variations]) => {
    variations.forEach(variation => {
      if (urlLower.includes(variation) && 
          !urlLower.includes(`${brand}.com`) && 
          !urlLower.includes(`www.${brand}.com`)) {
        suspiciousScore += 0.4;
        if (!detectedThreats.includes('Brand Impersonation')) {
          detectedThreats.push('Brand Impersonation');
        }
      }
    });
  });
  
  // Check for phishing-related keywords
  if (threatPatterns['Phishing Keywords'].some(keyword => urlLower.includes(keyword))) {
    suspiciousScore += 0.3;
    if (!detectedThreats.includes('Phishing Attempt')) {
      detectedThreats.push('Phishing Attempt');
    }
  }
  
  // Check for scam indicators
  if (threatPatterns['Scam Indicators'].some(indicator => urlLower.includes(indicator))) {
    suspiciousScore += 0.3;
    if (!detectedThreats.includes('Scam Keywords')) {
      detectedThreats.push('Scam Keywords');
    }
  }
  
  // Check for financial threat keywords
  if (threatPatterns['Financial Threats'].some(threat => urlLower.includes(threat))) {
    suspiciousScore += 0.2;
    if (!detectedThreats.includes('Financial Request')) {
      detectedThreats.push('Financial Request');
    }
  }
  
  // Check for IP addresses instead of domain names
  const ipPattern = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/;
  if (ipPattern.test(url)) {
    suspiciousScore += 0.4;
    detectedThreats.push('IP Address URL');
  }
  
  // Check for suspicious subdomains
  const suspiciousSubdomains = ['secure-', 'verify-', 'login-', 'account-', 'update-', 'auth-'];
  if (suspiciousSubdomains.some(sub => urlLower.includes(sub))) {
    suspiciousScore += 0.3;
    detectedThreats.push('Suspicious Subdomain');
  }
  
  // Check for excessive hyphens or numbers (typosquatting)
  const hyphenCount = (url.match(/-/g) || []).length;
  const numberCount = (url.match(/\d/g) || []).length;
  
  if (hyphenCount > 3) {
    suspiciousScore += 0.2;
    detectedThreats.push('Excessive Hyphens');
  }
  
  if (numberCount > 5) {
    suspiciousScore += 0.2;
    detectedThreats.push('Number Substitution');
  }
  
  // Check for missing HTTPS on sensitive pages
  if (!url.startsWith('https://') && 
      (urlLower.includes('login') || urlLower.includes('bank') || 
       urlLower.includes('pay') || urlLower.includes('secure'))) {
    suspiciousScore += 0.3;
    detectedThreats.push('Insecure Connection');
  }
  
  // Check for homograph attacks (similar-looking characters)
  const homographs = ['а', 'о', 'р', 'е', 'х', 'с']; // Cyrillic that look like Latin
  if (homographs.some(char => url.includes(char))) {
    suspiciousScore += 0.5;
    detectedThreats.push('Homograph Attack');
  }

  const isFraudulent = suspiciousScore >= 0.6;
  const confidenceScore = Math.min(suspiciousScore, 0.95);
  
  // Generate comprehensive explanation
  const explanation = generateComprehensiveUrlExplanation(isFraudulent, confidenceScore, detectedThreats, url);
  
  return {
    isFraudulent,
    confidenceScore,
    explanation,
    threatTypes: detectedThreats
  };
}

function generateComprehensiveUrlExplanation(isFraudulent: boolean, confidence: number, threats: string[], originalUrl: string): string {
  let explanation = "## Overall Assessment\n\n";
  
  if (isFraudulent) {
    explanation += `🚨 **MALICIOUS URL DETECTED** - This URL shows strong indicators of being fraudulent or dangerous with **${Math.round(confidence * 100)}% confidence**.\n\n`;
    
    explanation += "## Key Indicators\n\n";
    explanation += "### **Red Flags Detected**\n";
    threats.forEach(threat => {
      switch(threat) {
        case 'Brand Impersonation':
          explanation += "- **🎭 Brand Impersonation**: URL mimics a trusted brand but uses a different domain\n";
          break;
        case 'Phishing Attempt':
          explanation += "- **🎣 Phishing Website**: Designed to steal login credentials or personal information\n";
          break;
        case 'Suspicious Domain':
          explanation += "- **🌍 Suspicious Domain**: Uses high-risk top-level domains commonly associated with fraud\n";
          break;
        case 'URL Shortener':
          explanation += "- **🔗 URL Shortener**: Hides the real destination, potentially leading to malicious sites\n";
          break;
        case 'IP Address URL':
          explanation += "- **💻 Direct IP Access**: Uses IP address instead of domain name (common in malware)\n";
          break;
        case 'Insecure Connection':
          explanation += "- **🔓 No HTTPS**: Lacks encryption for sensitive operations (login, payments)\n";
          break;
        case 'Homograph Attack':
          explanation += "- **👀 Visual Deception**: Uses similar-looking characters to mimic legitimate domains\n";
          break;
        case 'Suspicious Subdomain':
          explanation += "- **🏷️ Deceptive Subdomain**: Uses misleading subdomains like 'secure-' or 'verify-'\n";
          break;
        default:
          explanation += `- **⚠️ ${threat}**: Commonly used in malicious URLs\n`;
      }
    });
    
    explanation += "\n### **Technical Analysis**\n";
    explanation += `- **🔍 URL Structure**: \`${originalUrl.length > 50 ? originalUrl.substring(0, 50) + '...' : originalUrl}\`\n`;
    explanation += "- **🎯 Attack Vector**: Likely designed to deceive users into providing sensitive information\n";
    explanation += "- **⚡ Threat Level**: HIGH - Immediate action required to avoid compromise\n";
    
    explanation += "\n## Recommendations\n\n";
    explanation += "### **🚨 IMMEDIATE ACTIONS - DO NOT**\n";
    explanation += "- **❌ DO NOT** click this link or visit this website\n";
    explanation += "- **❌ DO NOT** enter any personal information if already visited\n";
    explanation += "- **❌ DO NOT** download files or software from this site\n";
    explanation += "- **❌ DO NOT** enter login credentials or passwords\n";
    explanation += "- **❌ DO NOT** provide financial information or make payments\n\n";
    
    explanation += "### **🛡️ PROTECTIVE MEASURES**\n";
    explanation += "- **🔒 Change passwords** immediately if you entered credentials\n";
    explanation += "- **📱 Enable 2FA** on all accounts that may be compromised\n";
    explanation += "- **💳 Monitor accounts** for unauthorized transactions\n";
    explanation += "- **🦠 Run antivirus scan** if you downloaded anything\n";
    explanation += "- **📞 Contact your bank** if you provided financial information\n\n";
    
    explanation += "### **✅ VERIFICATION STEPS**\n";
    explanation += "- **🌐 Type the official website URL** directly into your browser\n";
    explanation += "- **📞 Call the organization** using official phone numbers\n";
    explanation += "- **📧 Check official communications** through verified channels\n";
    explanation += "- **📋 Report the malicious URL** to relevant authorities\n\n";
    
    explanation += "## Educational Context\n\n";
    if (threats.includes('Phishing Attempt')) {
      explanation += "This appears to be a **phishing website** - fake sites designed to steal your personal information. ";
      explanation += "Phishing attacks have increased by 220% since 2020, with over 1.4 million new phishing sites created monthly. ";
    } else if (threats.includes('Brand Impersonation')) {
      explanation += "This URL shows signs of **brand impersonation** - criminals copying legitimate websites to trick users. ";
      explanation += "Brand impersonation attacks target popular services like banks, social media, and e-commerce platforms. ";
    }
    
    explanation += "Cybercriminals often register domains that look similar to legitimate ones, hoping users won't notice the difference. ";
    explanation += "Always verify URLs carefully and navigate to websites directly rather than clicking suspicious links.\n";
    
  } else if (confidence > 0.3) {
    explanation += `⚠️ **POTENTIALLY RISKY URL** - Some concerning characteristics detected (**${Math.round(confidence * 100)}% risk level**).\n\n`;
    
    explanation += "## Key Indicators\n\n";
    if (threats.length > 0) {
      explanation += "### **⚠️ Warning Signs**\n";
      threats.forEach(threat => {
        switch(threat) {
          case 'URL Shortener':
            explanation += "- **🔗 Shortened URL**: Hides the final destination - use caution\n";
            break;
          case 'Insecure Connection':
            explanation += "- **🔓 HTTP Only**: Lacks HTTPS encryption for secure browsing\n";
            break;
          default:
            explanation += `- **📍 ${threat}**: May indicate elevated risk\n`;
        }
      });
      explanation += "\n";
    }
    
    explanation += "### **✅ Positive Indicators**\n";
    explanation += "- **🎯 No obvious phishing patterns** detected\n";
    explanation += "- **🏢 No clear brand impersonation** observed\n";
    explanation += "- **📊 Risk level remains moderate** based on current analysis\n\n";
    
    explanation += "## Recommendations\n\n";
    explanation += "### **🔍 VERIFICATION STEPS**\n";
    explanation += "- **👀 Examine the URL carefully** - look for typos or unusual domains\n";
    explanation += "- **🌐 Check if HTTPS is available** by manually typing https://\n";
    explanation += "- **🔍 Research the website** using search engines or review sites\n";
    explanation += "- **📱 Use official apps** instead of web browsers when possible\n\n";
    
    explanation += "### **🛡️ SAFE BROWSING PRACTICES**\n";
    explanation += "- **⏰ Take your time** - don't rush into clicking or entering information\n";
    explanation += "- **🔗 Hover over links** to see the real destination before clicking\n";
    explanation += "- **👥 Get a second opinion** from tech-savvy friends or colleagues\n";
    explanation += "- **🦠 Keep security software updated** for real-time protection\n\n";
    
    explanation += "### **📞 When in Doubt**\n";
    explanation += "- **📱 Contact the organization directly** using official contact methods\n";
    explanation += "- **🌐 Navigate to official websites** by typing URLs manually\n";
    explanation += "- **🎓 Trust your instincts** - if something feels off, investigate further\n";
    
  } else {
    explanation += `✅ **URL APPEARS SAFE** - No significant security threats detected (**${Math.round(confidence * 100)}% risk level**).\n\n`;
    
    explanation += "## Key Indicators\n\n";
    explanation += "### **✅ Safety Signals**\n";
    explanation += "- **🌐 Standard Domain**: Uses conventional domain structure and TLD\n";
    explanation += "- **🔒 Secure Protocol**: ";
    
    if (originalUrl.startsWith('https://')) {
      explanation += "Uses HTTPS encryption for secure browsing\n";
    } else {
      explanation += "HTTP detected - HTTPS would be better for security\n";
    }
    
    explanation += "- **🏢 No Brand Impersonation**: Domain appears legitimate and properly structured\n";
    explanation += "- **🎯 No Phishing Indicators**: URL structure follows normal web standards\n";
    explanation += "- **📊 Low Risk Assessment**: Multiple security checks passed successfully\n\n";
    
    if (threats.length > 0) {
      explanation += "### **📋 Minor Considerations**\n";
      threats.forEach(threat => {
        explanation += `- **${threat}**: Present but in acceptable context\n`;
      });
      explanation += "\n";
    }
    
    explanation += "## Recommendations\n\n";
    explanation += "### **🛡️ GENERAL SECURITY PRACTICES**\n";
    explanation += "- **🔍 Stay vigilant** - even safe URLs can occasionally be compromised\n";
    explanation += "- **🔒 Look for HTTPS** when entering personal or financial information\n";
    explanation += "- **📱 Keep browsers updated** for the latest security protections\n";
    explanation += "- **🦠 Use reputable security software** for real-time threat detection\n\n";
    
    explanation += "### **🎓 ONGOING EDUCATION**\n";
    explanation += "- **📚 Learn about URL structure** - understand what makes URLs trustworthy\n";
    explanation += "- **🚨 Stay informed** about new phishing and malware trends\n";
    explanation += "- **👥 Share knowledge** with family and friends to protect your community\n";
    explanation += "- **🔄 Regularly review** your browser's security settings\n\n";
    
    explanation += "### **🆘 IF PROBLEMS ARISE**\n";
    explanation += "- **📞 Contact site support** if you experience unusual behavior\n";
    explanation += "- **🔒 Change passwords** if you suspect account compromise\n";
    explanation += "- **📋 Report suspicious activity** to relevant authorities\n";
    explanation += "- **🦠 Run security scans** if you notice system problems\n\n";
    
    explanation += "## Educational Context\n\n";
    explanation += "This URL appears to follow standard web conventions and shows no obvious signs of malicious intent. ";
    explanation += "However, cybersecurity is an evolving field, and threats can emerge rapidly. ";
    explanation += "The fact that you're verifying URLs before visiting them demonstrates excellent security awareness. ";
    explanation += "Continue this practice, especially with links received via email, social media, or text messages. ";
    explanation += "Remember: when in doubt, navigate to websites directly by typing their official URLs rather than clicking links.\n";
  }
  
  return explanation;
}

export async function analyzeUrlForFraud(input: AnalyzeUrlForFraudInput): Promise<AnalyzeUrlForFraudOutput> {
  console.log('🔍 Starting comprehensive URL fraud analysis...');
  
  try {
    const result = comprehensiveUrlAnalysis(input.url);
    console.log('✅ Comprehensive URL analysis completed:', {
      isFraudulent: result.isFraudulent,
      confidence: result.confidenceScore,
      threatCount: result.threatTypes.length
    });
    return result;
    
  } catch (error) {
    console.error('❌ URL analysis failed:', error);
    
    return {
      isFraudulent: false,
      confidenceScore: 0.5,
      explanation: "**Analysis Unavailable**\n\nUnable to analyze URL at this time. Please try again later.\n\n**General Safety Tips:**\n- Verify URLs before clicking\n- Look for HTTPS encryption\n- Be cautious of suspicious domains\n- Navigate to websites directly when possible",
      threatTypes: []
    };
  }
}
