// Test the fraud detection logic from popup.js

function analyzeText(text) {
  const lowerText = text.toLowerCase();
  
  const scamKeywords = [
    'urgent', 'verify your account', 'suspended', 'click here immediately',
    'congratulations you won', 'claim your prize', 'limited time offer',
    'act now', 'wire transfer', 'western union', 'gift card',
    'social security number', 'ssn', 'credit card', 'bank account',
    'password', 'pin code', 'verify identity', 'confirm your information',
    'nigerian prince', 'inheritance', 'lottery', 'bitcoin wallet',
    'investment opportunity', 'guaranteed returns', 'risk-free'
  ];
  
  const suspiciousPatterns = [
    /bit\.ly/i,
    /tinyurl/i,
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
    /https?:\/\/[^\s]+\.(tk|ml|ga|cf|gq)/i
  ];
  
  let fraudScore = 0;
  let reasons = [];
  
  scamKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      fraudScore += 15;
      reasons.push(`Contains suspicious keyword: "${keyword}"`);
    }
  });
  
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      fraudScore += 20;
      reasons.push('Contains suspicious URL pattern');
    }
  });
  
  if (/within \d+ (hours?|minutes?|days?)/i.test(text)) {
    fraudScore += 10;
    reasons.push('Creates false urgency');
  }
  
  if (/[!?]{3,}/.test(text)) {
    fraudScore += 5;
    reasons.push('Excessive punctuation (pressure tactic)');
  }
  
  if (fraudScore >= 40) {
    return {
      type: 'danger',
      emoji: '🚨',
      title: 'High Risk - Likely Scam',
      message: 'This text contains multiple fraud indicators.',
      score: fraudScore,
      reasons: reasons.slice(0, 3)
    };
  } else if (fraudScore >= 20) {
    return {
      type: 'warning',
      emoji: '⚠️',
      title: 'Medium Risk - Be Cautious',
      message: 'This text has some suspicious elements.',
      score: fraudScore,
      reasons: reasons.slice(0, 2)
    };
  } else {
    return {
      type: 'safe',
      emoji: '✅',
      title: 'Low Risk',
      message: 'No major fraud indicators detected.',
      score: fraudScore,
      reasons: []
    };
  }
}

// Test cases
console.log('\n========================================');
console.log('🧪 Testing Fraud Detection Logic');
console.log('========================================\n');

const testCases = [
  {
    name: 'Obvious Scam',
    text: 'URGENT! Your account will be suspended within 24 hours! Click here immediately to verify your password and social security number!!!'
  },
  {
    name: 'Phishing Attempt',
    text: 'Congratulations! You won the lottery! Click this link bit.ly/prize123 to claim your prize within 2 hours!'
  },
  {
    name: 'Suspicious URL',
    text: 'Visit our website at http://192.168.1.1/login to update your bank account'
  },
  {
    name: 'Normal Text',
    text: 'Thank you for your order. Your package will arrive in 3-5 business days.'
  },
  {
    name: 'Mildly Suspicious',
    text: 'Limited time offer! Act now for special discount!'
  }
];

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: ${testCase.name}`);
  console.log('─'.repeat(50));
  console.log(`Input: "${testCase.text.substring(0, 60)}${testCase.text.length > 60 ? '...' : ''}"`);
  
  const result = analyzeText(testCase.text);
  
  console.log(`\n${result.emoji} ${result.title}`);
  console.log(`Risk Score: ${result.score}`);
  console.log(`Type: ${result.type.toUpperCase()}`);
  
  if (result.reasons.length > 0) {
    console.log('\nReasons:');
    result.reasons.forEach(reason => {
      console.log(`  • ${reason}`);
    });
  }
  
  console.log('\n');
});

console.log('========================================');
console.log('✅ All tests completed!');
console.log('========================================\n');
