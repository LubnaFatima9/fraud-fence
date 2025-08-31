import { NextRequest, NextResponse } from 'next/server';

// Simple URL safety patterns for immediate functionality
const SUSPICIOUS_URL_PATTERNS = [
  /bit\.ly|tinyurl\.com|short\.link|t\.co|goo\.gl/i, // URL shorteners
  /\d+\.\d+\.\d+\.\d+/, // IP addresses instead of domains
  /[a-z0-9]{20,}\.com/i, // Very long random domain names
  /winner|prize|claim|reward/i, // Common scam words in URL
  /verify|secure|update.*account/i, // Phishing words
  /paypal|amazon|microsoft|google.*[a-z0-9]{10,}/i, // Spoofed domains
  /\.tk$|\.ml$|\.ga$|\.cf$/i, // Free suspicious TLDs
];

const SAFE_DOMAINS = [
  'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
  'linkedin.com', 'github.com', 'stackoverflow.com', 'wikipedia.org', 'microsoft.com',
  'apple.com', 'amazon.com', 'paypal.com', 'ebay.com', 'cnn.com', 'bbc.com'
];

function analyzeUrlSimple(url: string) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    
    // Check if it's a known safe domain
    if (SAFE_DOMAINS.some(safeDomain => domain === safeDomain || domain.endsWith('.' + safeDomain))) {
      return {
        isFraud: false,
        confidence: 5,
        details: 'URL appears to be from a trusted, well-known domain'
      };
    }
    
    // Check for suspicious patterns
    const matches = SUSPICIOUS_URL_PATTERNS.filter(pattern => pattern.test(url));
    const fraudScore = Math.min(95, matches.length * 25 + (urlObj.hostname.length > 30 ? 15 : 0));
    
    return {
      isFraud: fraudScore > 30,
      confidence: fraudScore > 0 ? Math.max(fraudScore, 25) : 5,
      details: matches.length > 0 
        ? `Detected ${matches.length} suspicious pattern(s) commonly associated with malicious URLs`
        : 'URL appears safe with no obvious suspicious indicators'
    };
  } catch (error) {
    return {
      isFraud: false,
      confidence: 5,
      details: 'Could not analyze URL format'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Analyze the URL using simple pattern matching
    const result = analyzeUrlSimple(url);

    // Return the format expected by Chrome extension and frontend
    return NextResponse.json({
      isFraud: result.isFraud,
      confidence: result.confidence,
      riskLevel: result.confidence > 80 ? 'high' : result.confidence > 50 ? 'medium' : 'low',
      details: result.details,
      analysis: result.details,
      source: 'Pattern Analysis'
    });

  } catch (error) {
    console.error('URL analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze URL', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'URL detection API endpoint',
    method: 'POST',
    expectedBody: {
      url: 'https://example.com'
    }
  });
}
