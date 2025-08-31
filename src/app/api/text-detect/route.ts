import { NextRequest, NextResponse } from 'next/server';

// Simple fraud detection patterns for immediate functionality
const FRAUD_PATTERNS = [
  /win\s*[\$€£¥]\s*[\d,]+/i,
  /congratulations.*you.*won/i,
  /claim.*prize/i,
  /urgent.*action.*required/i,
  /click.*here.*now/i,
  /limited.*time.*offer/i,
  /act.*now/i,
  /free.*money/i,
  /nigerian.*prince/i,
  /inheritance/i,
  /lottery.*winner/i,
  /tax.*refund/i,
  /suspend.*account/i,
  /verify.*account/i,
  /secure.*your.*account/i
];

function analyzeTextSimple(text: string) {
  const matches = FRAUD_PATTERNS.filter(pattern => pattern.test(text));
  const fraudScore = Math.min(95, matches.length * 15 + (text.includes('$') ? 10 : 0));
  
  return {
    isFraud: fraudScore > 30,
    confidence: fraudScore > 0 ? Math.max(fraudScore, 20) : 5,
    details: matches.length > 0 
      ? `Detected ${matches.length} suspicious pattern(s) commonly used in fraud/scam messages`
      : 'Text appears normal with no obvious fraud indicators'
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text cannot be empty' },
        { status: 400 }
      );
    }

    // Use simple pattern matching for now
    const result = analyzeTextSimple(text);

    // Return the format expected by Chrome extension
    return NextResponse.json({
      isFraud: result.isFraud,
      confidence: result.confidence,
      riskLevel: result.confidence > 80 ? 'high' : result.confidence > 50 ? 'medium' : 'low',
      details: result.details,
      analysis: result.details,
      source: 'Pattern Matching Analysis'
    });

  } catch (error) {
    console.error('Text analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze text', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Text detection API endpoint',
    method: 'POST',
    expectedBody: {
      text: 'Sample text to analyze for fraud'
    }
  });
}
