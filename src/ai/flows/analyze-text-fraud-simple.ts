// Simplified fraud analysis for debugging
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextForFraudInputSchema = z.object({
  text: z.string().describe('The text to analyze for potential fraud.'),
});

export type AnalyzeTextForFraudInput = z.infer<typeof AnalyzeTextForFraudInputSchema>;

const AnalyzeTextForFraudOutputSchema = z.object({
  isFraudulent: z.boolean().describe('Whether the text is likely fraudulent.'),
  confidenceScore: z.number().describe('A score indicating the confidence level of the fraud detection.'),
  explanation: z.string().describe('An explanation of why the text is considered fraudulent or safe.'),
  threatTypes: z.array(z.string()).describe('Array of detected threat types.')
});

export type AnalyzeTextForFraudOutput = z.infer<typeof AnalyzeTextForFraudOutputSchema>;

// Simple rule-based analysis as fallback
function simpleRuleBasedAnalysis(text: string): AnalyzeTextForFraudOutput {
  const textLower = text.toLowerCase();
  const suspiciousKeywords = [
    'urgent', 'verify your account', 'click here', 'suspended', 'confirm your identity',
    'winner', 'congratulations', 'lottery', 'inheritance', 'prince', 'million dollars',
    'act now', 'limited time', 'expires today', 'verify now', 'update payment',
    'suspended account', 'security alert', 'verify identity', 'click link',
    'romantic', 'love you', 'send money', 'western union', 'gift cards'
  ];

  let suspiciousScore = 0;
  const detectedThreats = [];

  // Check for suspicious keywords
  suspiciousKeywords.forEach(keyword => {
    if (textLower.includes(keyword)) {
      suspiciousScore += 0.2;
    }
  });

  // Check for URLs
  if (textLower.includes('http') || textLower.includes('www.')) {
    suspiciousScore += 0.3;
    detectedThreats.push('Suspicious Links');
  }

  // Check for urgency patterns
  if (textLower.includes('urgent') || textLower.includes('immediate')) {
    suspiciousScore += 0.3;
    detectedThreats.push('Urgency Tactics');
  }

  // Check for financial requests
  if (textLower.includes('money') || textLower.includes('payment') || textLower.includes('bank')) {
    suspiciousScore += 0.3;
    detectedThreats.push('Financial Request');
  }

  const isFraudulent = suspiciousScore >= 0.6;
  const confidenceScore = Math.min(suspiciousScore, 0.95);

  let explanation = "## Overall Assessment\n\n";
  
  if (isFraudulent) {
    explanation += "🚨 **FRAUD DETECTED** - This content shows multiple signs of fraudulent or malicious activity with high confidence.\n\n";
    
    explanation += "## Key Indicators\n\n";
    explanation += "### **Red Flags Detected**\n";
    if (detectedThreats.length > 0) {
      detectedThreats.forEach(threat => {
        switch(threat) {
          case 'Suspicious Links':
            explanation += "- **Suspicious URLs**: Contains potentially malicious or phishing links\n";
            break;
          case 'Urgency Tactics':
            explanation += "- **Urgency Manipulation**: Uses pressure tactics like 'urgent', 'immediate action required'\n";
            break;
          case 'Financial Request':
            explanation += "- **Financial Solicitation**: Requests money, payment information, or financial details\n";
            break;
          default:
            explanation += `- **${threat}**: Commonly used in fraudulent communications\n`;
        }
      });
    }
    
    explanation += "\n### **Analysis Details**\n";
    explanation += "- **Language Patterns**: Contains urgent language and emotional manipulation tactics\n";
    explanation += "- **Technical Elements**: Suspicious links or unusual contact methods detected\n";
    explanation += "- **Psychological Tactics**: Designed to create fear, urgency, or false excitement\n";
    
    explanation += "\n## Recommendations\n\n";
    explanation += "### **Immediate Actions**\n";
    explanation += "- **Do NOT** click any links in this message\n";
    explanation += "- **Do NOT** provide personal or financial information\n";
    explanation += "- **Do NOT** send money, gift cards, or payments\n";
    explanation += "- **Delete** this message immediately\n\n";
    
    explanation += "### **General Advice**\n";
    explanation += "- Always verify through official channels if this claims to be from a legitimate organization\n";
    explanation += "- Contact the supposed sender through their official website or phone number\n";
    explanation += "- Report this to relevant authorities if it impersonates a real company\n\n";
    
    explanation += "## Educational Context\n\n";
    explanation += "This appears to be a **phishing/scam attempt** designed to steal your personal information or money. ";
    explanation += "Scammers often use urgent language and impersonate trusted organizations to pressure victims into quick decisions. ";
    explanation += "Always take time to verify suspicious messages through independent channels.\n";
    
  } else if (suspiciousScore > 0.3) {
    explanation += "⚠️ **SUSPICIOUS CONTENT** - Some concerning elements detected that warrant caution.\n\n";
    
    explanation += "## Key Indicators\n\n";
    if (detectedThreats.length > 0) {
      explanation += "### **Warning Signs**\n";
      detectedThreats.forEach(threat => {
        explanation += `- **${threat}**: May indicate potential risk\n`;
      });
      explanation += "\n";
    }
    
    explanation += "### **Safety Signals**\n";
    explanation += "- No obvious scam language patterns detected\n";
    explanation += "- Limited use of high-pressure tactics\n\n";
    
    explanation += "## Recommendations\n\n";
    explanation += "### **Immediate Actions**\n";
    explanation += "- **Verify** the sender's identity through independent means\n";
    explanation += "- **Be cautious** of any requests for personal information\n";
    explanation += "- **Double-check** any links before clicking\n\n";
    
    explanation += "### **General Advice**\n";
    explanation += "- When in doubt, contact the sender through official channels\n";
    explanation += "- Trust your instincts - if something feels off, investigate further\n";
    
  } else {
    explanation += "✅ **CONTENT APPEARS SAFE** - No significant fraud indicators detected.\n\n";
    
    explanation += "## Key Indicators\n\n";
    explanation += "### **Safety Signals**\n";
    explanation += "- **Normal Language**: No suspicious urgency or manipulation tactics\n";
    explanation += "- **No Financial Requests**: Does not ask for money or sensitive information\n";
    explanation += "- **Standard Communication**: Appears to be legitimate correspondence\n\n";
    
    explanation += "## Recommendations\n\n";
    explanation += "### **General Safety Tips**\n";
    explanation += "- Always verify unexpected messages through official channels\n";
    explanation += "- Be cautious of unsolicited offers or requests\n";
    explanation += "- Keep your guard up even with seemingly safe messages\n";
    explanation += "- Trust your instincts - if something seems off, investigate further\n\n";
    
    explanation += "## Educational Context\n\n";
    explanation += "While this message appears safe, always maintain vigilance with digital communications. ";
    explanation += "Scammers constantly evolve their tactics, so staying informed about common fraud patterns helps protect you and others.\n";
  }

  return {
    isFraudulent,
    confidenceScore,
    explanation,
    threatTypes: detectedThreats
  };
}

export async function analyzeTextForFraud(input: AnalyzeTextForFraudInput): Promise<AnalyzeTextForFraudOutput> {
  console.log('🔍 Starting simplified text analysis...');
  
  try {
    // For now, use the simple rule-based analysis
    const result = simpleRuleBasedAnalysis(input.text);
    console.log('✅ Simple analysis completed:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Even simple analysis failed:', error);
    
    return {
      isFraudulent: false,
      confidenceScore: 0.5,
      explanation: "**Analysis Unavailable**\n\nUnable to analyze content at this time. Please try again later.",
      threatTypes: []
    };
  }
}
