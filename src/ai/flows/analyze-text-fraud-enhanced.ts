// Enhanced fraud analysis - reliable rule-based with AI fallback
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

// Enhanced rule-based analysis with more sophisticated pattern detection
function enhancedRuleBasedAnalysis(text: string): AnalyzeTextForFraudOutput {
  const textLower = text.toLowerCase();
  const suspiciousKeywords = [
    'urgent', 'verify your account', 'click here', 'suspended', 'confirm your identity',
    'winner', 'congratulations', 'lottery', 'inheritance', 'prince', 'million dollars',
    'act now', 'limited time', 'expires today', 'verify now', 'update payment',
    'suspended account', 'security alert', 'verify identity', 'click link',
    'romantic', 'love you', 'send money', 'western union', 'gift cards',
    'immediate action', 'account locked', 'unusual activity', 'confirm details'
  ];

  // Enhanced threat detection with more categories
  const threatPatterns = {
    'Phishing': ['verify', 'login', 'password', 'account', 'suspended', 'click here', 'confirm your identity'],
    'Sextortion': ['intimate', 'video', 'embarrass', 'photos', 'expose', 'blackmail'],
    'Romance Scam': ['love you', 'soulmate', 'destiny', 'send money', 'need help', 'emergency funds'],
    'Tech Support Scam': ['computer infected', 'virus detected', 'microsoft', 'windows', 'call immediately'],
    'Investment Fraud': ['guaranteed return', 'risk-free', 'double your money', 'investment opportunity'],
    'Lottery Scam': ['winner', 'lottery', 'prize', 'claim your reward', 'congratulations'],
    'Business Email Compromise': ['wire transfer', 'urgent payment', 'change bank details', 'invoice attached'],
    'Impersonation': ['irs', 'government', 'police', 'fbi', 'social security'],
    'Advance Fee Fraud': ['inheritance', 'millions', 'processing fee', 'transfer funds', 'prince'],
    'Urgency Tactics': ['urgent', 'immediate', 'expires today', 'act now', 'limited time'],
    'Financial Request': ['money', 'payment', 'bank', 'credit card', 'bitcoin', 'gift card'],
    'Suspicious Links': ['http://', 'bit.ly', 'tinyurl', 'click here to', 'download now']
  };

  let suspiciousScore = 0;
  const detectedThreats: string[] = [];

  // Check for threat patterns
  Object.entries(threatPatterns).forEach(([threatType, patterns]) => {
    let threatFound = false;
    patterns.forEach(pattern => {
      if (textLower.includes(pattern)) {
        suspiciousScore += 0.15;
        threatFound = true;
      }
    });
    if (threatFound && !detectedThreats.includes(threatType)) {
      detectedThreats.push(threatType);
    }
  });

  // Additional sophisticated checks
  
  // Check for common scam phone number patterns
  if (text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/) || text.match(/\+\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/)) {
    suspiciousScore += 0.2;
    if (!detectedThreats.includes('Suspicious Contact Info')) {
      detectedThreats.push('Suspicious Contact Info');
    }
  }

  // Check for cryptocurrency mentions (often used in scams)
  const cryptoTerms = ['bitcoin', 'ethereum', 'cryptocurrency', 'crypto wallet', 'blockchain'];
  if (cryptoTerms.some(term => textLower.includes(term))) {
    suspiciousScore += 0.3;
    if (!detectedThreats.includes('Cryptocurrency Request')) {
      detectedThreats.push('Cryptocurrency Request');
    }
  }

  // Check for excessive capitalization (common in scams)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.3 && text.length > 20) {
    suspiciousScore += 0.2;
    if (!detectedThreats.includes('Excessive Capitalization')) {
      detectedThreats.push('Excessive Capitalization');
    }
  }

  // Check for grammar/spelling issues (basic check)
  const grammarIssues = ['recieve', 'loose', 'there account', 'you account', 'imediately', 'succesful'];
  if (grammarIssues.some(issue => textLower.includes(issue))) {
    suspiciousScore += 0.2;
    if (!detectedThreats.includes('Poor Grammar/Spelling')) {
      detectedThreats.push('Poor Grammar/Spelling');
    }
  }

  const isFraudulent = suspiciousScore >= 0.6;
  const confidenceScore = Math.min(suspiciousScore, 0.95);

  // Generate comprehensive explanation
  let explanation = generateDetailedExplanation(isFraudulent, confidenceScore, detectedThreats, text);

  return {
    isFraudulent,
    confidenceScore,
    explanation,
    threatTypes: detectedThreats
  };
}

function generateDetailedExplanation(isFraudulent: boolean, confidence: number, threats: string[], originalText: string): string {
  let explanation = "## Overall Assessment\n\n";
  
  if (isFraudulent) {
    explanation += `🚨 **FRAUD DETECTED** - This content shows strong indicators of fraudulent activity with **${Math.round(confidence * 100)}% confidence**.\n\n`;
    
    explanation += "## Key Indicators\n\n";
    explanation += "### **Red Flags Detected**\n";
    threats.forEach(threat => {
      switch(threat) {
        case 'Phishing':
          explanation += "- **Phishing Attempt**: Contains language designed to steal login credentials or personal information\n";
          break;
        case 'Urgency Tactics':
          explanation += "- **Urgency Manipulation**: Uses high-pressure language to force quick decisions without thinking\n";
          break;
        case 'Financial Request':
          explanation += "- **Financial Solicitation**: Directly or indirectly requests money, payments, or financial information\n";
          break;
        case 'Suspicious Links':
          explanation += "- **Malicious Links**: Contains potentially dangerous URLs that may lead to scam websites\n";
          break;
        case 'Romance Scam':
          explanation += "- **Romance Fraud**: Uses emotional manipulation and false romantic interest to extract money\n";
          break;
        case 'Tech Support Scam':
          explanation += "- **Fake Tech Support**: Impersonates legitimate technology companies to gain remote access\n";
          break;
        case 'Investment Fraud':
          explanation += "- **Investment Scam**: Promises unrealistic returns with minimal risk to steal your money\n";
          break;
        case 'Lottery Scam':
          explanation += "- **Fake Lottery**: Claims you've won a prize you never entered to collect personal information\n";
          break;
        case 'Impersonation':
          explanation += "- **Authority Impersonation**: Pretends to be government agencies or law enforcement\n";
          break;
        case 'Cryptocurrency Request':
          explanation += "- **Crypto Fraud**: Requests cryptocurrency payments (common in modern scams)\n";
          break;
        default:
          explanation += `- **${threat}**: Commonly used in fraudulent communications\n`;
      }
    });
    
    explanation += "\n### **Analysis Details**\n";
    explanation += "- **Language Patterns**: Contains manipulative language designed to bypass critical thinking\n";
    explanation += "- **Psychological Tactics**: Uses fear, urgency, greed, or false authority to manipulate victims\n";
    explanation += "- **Technical Elements**: May contain malicious links, suspicious contact methods, or tracking elements\n";
    
    explanation += "\n## Recommendations\n\n";
    explanation += "### **Immediate Actions**\n";
    explanation += "- **🚫 DO NOT** click any links or download attachments\n";
    explanation += "- **🚫 DO NOT** provide personal, financial, or login information\n";
    explanation += "- **🚫 DO NOT** send money, gift cards, or cryptocurrency\n";
    explanation += "- **🚫 DO NOT** call any phone numbers provided\n";
    explanation += "- **🗑️ DELETE** this message immediately\n\n";
    
    explanation += "### **If This Claims to Be From a Legitimate Organization**\n";
    explanation += "- **📞 Contact** the organization directly using official contact information\n";
    explanation += "- **🌐 Visit** their official website by typing the URL manually\n";
    explanation += "- **❓ Ask** them directly about any claimed issues with your account\n";
    explanation += "- **📋 Report** this scam attempt to the organization being impersonated\n\n";
    
    explanation += "### **General Protection**\n";
    explanation += "- **🛡️ Enable** two-factor authentication on all important accounts\n";
    explanation += "- **📧 Be skeptical** of unexpected emails, even if they look official\n";
    explanation += "- **🤔 Take time** to think before responding to urgent requests\n";
    explanation += "- **👥 Ask** friends, family, or IT professionals when unsure\n\n";
    
    explanation += "## Educational Context\n\n";
    if (threats.includes('Phishing')) {
      explanation += "This appears to be a **phishing attack** - one of the most common types of cybercrime. ";
      explanation += "Phishing attempts have increased by over 600% since 2016, and they're getting more sophisticated. ";
    } else if (threats.includes('Romance Scam')) {
      explanation += "This shows signs of a **romance scam** - a type of fraud that costs victims billions annually. ";
      explanation += "Romance scammers often build relationships over weeks or months before requesting money. ";
    } else if (threats.includes('Investment Fraud')) {
      explanation += "This appears to be an **investment scam** promising unrealistic returns. ";
      explanation += "Remember: if an investment opportunity seems too good to be true, it probably is. ";
    }
    
    explanation += "Scammers constantly evolve their tactics, but they rely on creating urgency and emotional responses to bypass your natural skepticism. ";
    explanation += "Taking time to verify suspicious messages through independent channels is your best defense.\n";
    
  } else if (confidence > 0.3) {
    explanation += `⚠️ **POTENTIALLY SUSPICIOUS** - Some concerning elements detected (**${Math.round(confidence * 100)}% risk level**).\n\n`;
    
    explanation += "## Key Indicators\n\n";
    if (threats.length > 0) {
      explanation += "### **Warning Signs Detected**\n";
      threats.forEach(threat => {
        explanation += `- **${threat}**: May indicate elevated risk - proceed with extra caution\n`;
      });
      explanation += "\n";
    }
    
    explanation += "### **Positive Indicators**\n";
    explanation += "- **No obvious scam language** patterns detected\n";
    explanation += "- **Limited high-pressure tactics** observed\n";
    explanation += "- **Risk level remains moderate** based on current analysis\n\n";
    
    explanation += "## Recommendations\n\n";
    explanation += "### **Verification Steps**\n";
    explanation += "- **🔍 Verify** the sender's identity through independent channels\n";
    explanation += "- **🤔 Think carefully** before providing any personal information\n";
    explanation += "- **🔗 Check URLs** by hovering over links before clicking\n";
    explanation += "- **📞 Call** the organization directly if they're requesting action\n\n";
    
    explanation += "### **Stay Protected**\n";
    explanation += "- **⏰ Take your time** - legitimate organizations won't pressure you\n";
    explanation += "- **🎯 Trust your instincts** - if something feels off, investigate further\n";
    explanation += "- **👥 Get a second opinion** from someone you trust\n";
    
  } else {
    explanation += `✅ **CONTENT APPEARS SAFE** - No significant fraud indicators detected (**${Math.round(confidence * 100)}% risk level**).\n\n`;
    
    explanation += "## Key Indicators\n\n";
    explanation += "### **Safety Signals**\n";
    explanation += "- **📝 Normal Language**: No suspicious urgency or manipulation tactics detected\n";
    explanation += "- **💰 No Financial Requests**: Does not ask for money, payments, or sensitive financial information\n";
    explanation += "- **🔒 Standard Communication**: Appears to be legitimate correspondence or content\n";
    explanation += "- **⚡ No Pressure Tactics**: Does not use high-pressure or fear-based language\n\n";
    
    if (threats.length > 0) {
      explanation += "### **Minor Considerations**\n";
      threats.forEach(threat => {
        explanation += `- **${threat}**: Present but in normal context\n`;
      });
      explanation += "\n";
    }
    
    explanation += "## Recommendations\n\n";
    explanation += "### **General Safety Practices**\n";
    explanation += "- **🔍 Stay vigilant** - even safe-looking messages can occasionally be deceptive\n";
    explanation += "- **📧 Verify unexpected messages** through official channels when in doubt\n";
    explanation += "- **🎓 Stay informed** about evolving scam tactics and fraud trends\n";
    explanation += "- **🤝 Share knowledge** with friends and family to protect your community\n\n";
    
    explanation += "### **If You're Still Concerned**\n";
    explanation += "- **💬 Ask questions** - legitimate senders will be happy to verify their identity\n";
    explanation += "- **🌐 Check official websites** for any security alerts or notices\n";
    explanation += "- **📞 Call directly** using phone numbers from official sources\n\n";
    
    explanation += "## Educational Context\n\n";
    explanation += "While this message appears legitimate, maintaining healthy skepticism is important in our digital age. ";
    explanation += "Cybercriminals are constantly developing new tactics, so staying informed about common fraud patterns helps protect you and your community. ";
    explanation += "The fact that you're checking suspicious messages shows excellent security awareness - keep it up!\n";
  }
  
  return explanation;
}

export async function analyzeTextForFraud(input: AnalyzeTextForFraudInput): Promise<AnalyzeTextForFraudOutput> {
  console.log('🔍 Starting AI-powered text fraud analysis...');
  
  try {
    // Try AI-powered analysis first
    const aiAnalysisFlow = ai.defineFlow(
      {
        name: 'analyzeTextForFraud',
        inputSchema: AnalyzeTextForFraudInputSchema,
        outputSchema: AnalyzeTextForFraudOutputSchema,
      },
      async (input) => {
        const prompt = `You are an expert cybersecurity fraud analyst with deep knowledge of scams, phishing, social engineering, and online fraud patterns.

Analyze the following text and determine if it contains fraudulent content, scam attempts, phishing, or social engineering tactics.

TEXT TO ANALYZE:
"""
${input.text}
"""

FRAUD DETECTION CRITERIA:
1. **Phishing Attempts**: Requests for credentials, password resets, account verification
2. **Financial Scams**: Unexpected money requests, investment schemes, lottery/prize scams
3. **Romance Scams**: Emotional manipulation, money requests in relationships
4. **Tech Support Scams**: Fake virus warnings, unsolicited tech support offers
5. **Impersonation**: Fake government agencies, authority figures, companies
6. **Urgency Tactics**: "Act now", "Limited time", "Account will be closed"
7. **Social Engineering**: Manipulative language, fear tactics, greed appeals
8. **Business Email Compromise**: Fake invoices, urgent wire transfers, CEO fraud

IMPORTANT ANALYSIS RULES:
- **Context Matters**: Words like "urgent", "verify", "payment" are NORMAL in legitimate business communications
- **Consider the full message**: Is this a genuine business email or a scam attempt?
- **Look for RED FLAGS**: Typosquatting domains, grammar errors, suspicious requests, emotional manipulation
- **Avoid False Positives**: Don't flag normal business correspondence just because it mentions payments or urgency
- **Confidence Scoring**: Be confident (>0.8) only when clear fraud indicators exist

LEGITIMATE EXAMPLES (should score LOW):
- "Your invoice for last month is attached. Please process payment by the 15th."
- "Urgent: Please review the quarterly report before tomorrow's meeting."
- "We need to verify your shipping address for the order you placed."

FRAUD EXAMPLES (should score HIGH):
- "URGENT! Your account has been suspended! Click here to verify immediately or lose access!"
- "Congratulations! You've won $1,000,000! Send $500 processing fee to claim your prize!"
- "I'm the CEO. Wire $50,000 to this account immediately. Don't tell anyone."

Provide your analysis in the following JSON format:
{
  "isFraudulent": boolean,
  "confidenceScore": number (0.0 to 1.0),
  "explanation": "Detailed markdown explanation with specific indicators",
  "threatTypes": ["Type1", "Type2", ...]
}

Be ACCURATE and AVOID FALSE POSITIVES. Consider business context carefully.`;

        const result = await ai.generate({
          model: 'googleai/gemini-2.0-flash-exp',
          prompt,
          output: {
            schema: AnalyzeTextForFraudOutputSchema,
          },
        });

        return result.output!;
      }
    );

    const result = await aiAnalysisFlow(input);
    
    console.log('✅ AI analysis completed:', {
      isFraudulent: result.isFraudulent,
      confidence: result.confidenceScore,
      threatCount: result.threatTypes.length
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ AI analysis failed, using fallback:', error);
    
    // Fallback to rule-based if AI fails
    const fallbackResult = enhancedRuleBasedAnalysis(input.text);
    return {
      ...fallbackResult,
      explanation: "⚠️ **AI Analysis Unavailable** - Using Fallback Detection\n\n" + fallbackResult.explanation
    };
  }
}
