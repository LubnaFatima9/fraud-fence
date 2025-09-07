import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageForFraud } from '@/ai/flows/analyze-image-fraud';
import { createCorsResponse, handleCorsPreflightRequest } from '@/lib/cors';
import { z } from 'zod';

const RequestSchema = z.object({
  imageData: z.string().min(1, 'Image data is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const origin = request.headers.get('origin') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    console.log('🖼️ Image analysis API called', {
      origin,
      userAgent: userAgent.includes('Mozilla') ? 'Browser' : userAgent.substring(0, 50),
      hasImageData: !!body.imageData
    });
    
    // Validate request
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      console.error('❌ Image analysis validation failed:', validation.error);
      return createCorsResponse(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { imageData } = validation.data;

    // Validate data URI format
    if (!imageData.startsWith('data:image/')) {
      console.error('❌ Invalid image data URI format');
      return createCorsResponse(
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

    return createCorsResponse(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const stack = error instanceof Error ? error.stack : undefined;
    
    console.error('❌ Image analysis API error:', {
      message: errorMessage,
      stack: stack?.substring(0, 500),
      timestamp: new Date().toISOString()
    });
    
    return createCorsResponse(
      { 
        error: 'Analysis failed', 
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return handleCorsPreflightRequest();
}

export async function GET() {
  return createCorsResponse(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
