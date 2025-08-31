import { NextRequest, NextResponse } from 'next/server';
import { analyzeUrlForFraud } from '@/ai/flows/analyze-url-fraud';
import { z } from 'zod';

const RequestSchema = z.object({
  url: z.string().url('Please provide a valid URL'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔗 URL analysis API called with:', { url: body.url });
    
    // Validate request
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      console.error('❌ URL analysis validation failed:', validation.error);
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    // Call the AI analysis flow
    console.log('🤖 Calling analyzeUrlForFraud...');
    const result = await analyzeUrlForFraud({ url });
    console.log('✅ URL analysis completed:', { 
      isSafe: result.isSafe, 
      threatTypes: result.threatTypes,
      explanationLength: result.explanation?.length 
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ URL analysis API error:', error);
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
