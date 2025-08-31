import { NextRequest, NextResponse } from 'next/server';
import { analyzeTextForFraud } from '@/ai/flows/analyze-text-fraud';

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

    // Analyze the text using the AI flow
    const result = await analyzeTextForFraud({ text });

    // Transform the result to match the expected Chrome extension format
    return NextResponse.json({
      isFraud: result.isFraudulent,
      confidence: Math.round(result.confidenceScore * 100), // Convert to percentage
      riskLevel: result.confidenceScore > 0.8 ? 'high' : result.confidenceScore > 0.5 ? 'medium' : 'low',
      details: result.explanation,
      analysis: result.explanation,
      source: 'AI Text Analysis'
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
