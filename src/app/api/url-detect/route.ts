import { NextRequest, NextResponse } from 'next/server';
import { analyzeUrlForFraud } from '@/ai/flows/analyze-url-fraud';

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

    // Analyze the URL using the AI flow
    const result = await analyzeUrlForFraud({ url });

    // Transform the result to match the expected Chrome extension format
    return NextResponse.json({
      isFraud: !result.isSafe,
      confidence: result.isSafe ? 5 : 95, // High confidence for threats, low for safe
      riskLevel: result.isSafe ? 'low' : 'high',
      details: result.explanation,
      analysis: result.explanation,
      threatTypes: result.threatTypes,
      source: 'Google Safe Browsing + AI Analysis'
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
