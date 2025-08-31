import { NextRequest, NextResponse } from 'next/server';
import { analyzeTextForFraud } from '@/ai/flows/analyze-text-fraud';
import { z } from 'zod';

const RequestSchema = z.object({
  text: z.string().min(1, 'Text is required').max(10000, 'Text too long'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Text analysis API called with:', { textLength: body.text?.length });
    
    // Validate request
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      console.error('❌ Text analysis validation failed:', validation.error);
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { text } = validation.data;

    // Call the AI analysis flow
    console.log('🤖 Calling analyzeTextForFraud...');
    const result = await analyzeTextForFraud({ text });
    console.log('✅ Text analysis completed:', { 
      isFraudulent: result.isFraudulent, 
      confidenceScore: result.confidenceScore,
      explanationLength: result.explanation?.length 
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Text analysis API error:', error);
    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
