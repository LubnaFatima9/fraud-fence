import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageForFraud } from '@/ai/flows/analyze-image-fraud';
import { z } from 'zod';

const RequestSchema = z.object({
  imageData: z.string().min(1, 'Image data is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🖼️ Image analysis API called');
    
    // Validate request
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      console.error('❌ Image analysis validation failed:', validation.error);
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { imageData } = validation.data;

    // Validate data URI format
    if (!imageData.startsWith('data:image/')) {
      console.error('❌ Invalid image data URI format');
      return NextResponse.json(
        { error: 'Invalid image format. Please provide a valid data URI.' },
        { status: 400 }
      );
    }

    // Call the AI analysis flow
    console.log('🤖 Calling analyzeImageForFraud...');
    const result = await analyzeImageForFraud({ photoDataUri: imageData });
    console.log('✅ Image analysis completed:', { 
      isFraudulent: result.isFraudulent, 
      confidenceScore: result.confidenceScore,
      explanationLength: result.explanation?.length 
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Image analysis API error:', error);
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
