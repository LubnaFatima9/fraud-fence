// Simplified URL fraud analysis for debugging
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

// Simple URL analysis based on patterns and known indicators
function simpleUrlAnalysis(url: string): AnalyzeUrlForFraudOutput {
  console.log('🔗 Performing simple URL analysis for:', url);
  
  let suspiciousScore = 0;
  const detectedThreats: string[] = [];
  
  const urlLower = url.toLowerCase();
  
  // Check for suspicious domains and TLDs
  const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.bit', '.onion'];
  if (suspiciousTLDs.some(tld => urlLower.includes(tld))) {
    suspiciousScore += 0.4;
    detectedThreats.push('Suspicious Domain');
  }
  
  // Check for URL shorteners (can hide malicious destinations)
  const shorteners = ['bit.ly', 'tinyurl', 't.co', 'goo.gl', 'ow.ly', 'short.link', 'tiny.cc'];
  if (shorteners.some(shortener => urlLower.includes(shortener))) {
    suspiciousScore += 0.3;
    detectedThreats.push('URL Shortener');
  }
  
  // Check for suspicious keywords in URL
  const suspiciousKeywords = [
    'verify', 'login', 'secure', 'update', 'suspend', 'confirm', 'account',
    'paypal', 'amazon', 'apple', 'microsoft', 'google', 'facebook',
    'bank', 'credit', 'visa', 'mastercard'
  ];
  
  suspiciousKeywords.forEach(keyword => {
    if (urlLower.includes(keyword) && !urlLower.includes(`${keyword}.com`) && !urlLower.includes(`www.${keyword}.com`)) {
      suspiciousScore += 0.2;
      if (!detectedThreats.includes('Brand Impersonation')) {
        detectedThreats.push('Brand Impersonation');
      }
    }
  });
  
  // Check for suspicious patterns
  if (urlLower.includes('phishing') || urlLower.includes('scam')) {
    suspiciousScore += 0.6;
    detectedThreats.push('Obvious Scam Keywords');
  }
  
  // Check for IP addresses instead of domain names
  const ipPattern = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/;
  if (ipPattern.test(url)) {
    suspiciousScore += 0.4;
    detectedThreats.push('IP Address URL');
  }
  
  // Check for suspicious subdomains
  const suspiciousSubdomains = ['secure-', 'verify-', 'login-', 'account-', 'update-'];
  if (suspiciousSubdomains.some(sub => urlLower.includes(sub))) {
    suspiciousScore += 0.3;
    detectedThreats.push('Suspicious Subdomain');
  }
  
  // Check for excessive hyphens or numbers (often used in fake domains)
  const hyphenCount = (url.match(/-/g) || []).length;
  const numberCount = (url.match(/\d/g) || []).length;
  
  if (hyphenCount > 3 || numberCount > 5) {
    suspiciousScore += 0.2;
    detectedThreats.push('Suspicious Domain Pattern');
  }
  
  // Check if HTTPS is missing for login/financial sites
  if (!url.startsWith('https://') && (urlLower.includes('login') || urlLower.includes('bank') || urlLower.includes('pay'))) {
    suspiciousScore += 0.3;
    detectedThreats.push('Insecure Connection');
  }
  
  const isFraudulent = suspiciousScore >= 0.6;
  const confidenceScore = Math.min(suspiciousScore, 0.9);
  
  let explanation = "## URL Analysis Complete\n\n";
  
  if (isFraudulent) {
    explanation += "🚨 **HIGH RISK** - This URL shows multiple signs of being fraudulent or malicious.\n\n";
    explanation += "### Detected Issues:\n";
    detectedThreats.forEach(threat => {
      explanation += `- **${threat}**: Common in phishing and scam websites\n`;
    });
    explanation += "\n### Recommendations:\n";
    explanation += "- **Do not** click this link or visit this website\n";
    explanation += "- **Do not** enter personal information or login credentials\n";
    explanation += "- **Verify** the URL through official channels if it claims to be from a known company\n";
    explanation += "- **Report** this URL to relevant authorities if it's impersonating a legitimate service\n";
  } else if (suspiciousScore > 0.3) {
    explanation += "⚠️ **MEDIUM RISK** - Some suspicious characteristics detected in this URL.\n\n";
    explanation += "### Proceed with Caution:\n";
    explanation += "- Verify the website's legitimacy before entering personal information\n";
    explanation += "- Check for HTTPS encryption on sensitive pages\n";
    explanation += "- Look for official verification badges or certificates\n";
  } else {
    explanation += "✅ **LOW RISK** - URL appears to have normal characteristics.\n\n";
    explanation += "### General Safety Tips:\n";
    explanation += "- Always verify URLs before clicking, especially in emails\n";
    explanation += "- Look for HTTPS encryption on websites handling sensitive data\n";
    explanation += "- Be cautious of shortened URLs that hide the real destination\n";
    explanation += "- When in doubt, navigate to websites directly rather than clicking links\n";
  }
  
  return {
    isFraudulent,
    confidenceScore,
    explanation,
    threatTypes: detectedThreats
  };
}

export async function generateComprehensiveUrlExplanation(isFraudulent: boolean, confidence: number, threats: string[], originalUrl: string): string {
  console.log('🔍 Starting simplified URL analysis...');
  
  try {
    const result = simpleUrlAnalysis(input.url);
    console.log('✅ Simple URL analysis completed:', result);
    return result;
    
  } catch (error) {
    console.error('❌ URL analysis failed:', error);
    
    return {
      isFraudulent: false,
      confidenceScore: 0.5,
      explanation: "**Analysis Unavailable**\n\nUnable to analyze URL at this time. Please try again later.\n\n**General Safety Tips:**\n- Verify URLs before clicking\n- Look for HTTPS encryption\n- Be cautious of suspicious domains",
      threatTypes: []
    };
  }
}
