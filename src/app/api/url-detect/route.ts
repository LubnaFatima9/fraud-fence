import { NextRequest, NextResponse } from 'next/server';
import { analyzeUrlForFraud } from '@/ai/flows/analyze-url-fraud-enhanced';
import { createCorsResponse, handleCorsPreflightRequest } from '@/lib/cors';
import { z } from 'zod';

const RequestSchema = z.object({
  url: z.string().url('Please provide a valid URL'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const origin = request.headers.get('origin') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    console.log('🔗 URL analysis API called with:', { 
      url: body.url,
      origin,
      userAgent: userAgent.includes('Mozilla') ? 'Browser' : userAgent.substring(0, 50)
    });
    
    // Validate request
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      console.error('❌ URL analysis validation failed:', validation.error);
      return createCorsResponse(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    // Call the AI analysis flow
    console.log('🤖 Calling analyzeUrlForFraud...');
    const result = await analyzeUrlForFraud({ url });
    console.log('✅ URL analysis completed:', { 
      isFraudulent: result.isFraudulent, 
      confidenceScore: result.confidenceScore,
      threatTypes: result.threatTypes,
      explanationLength: result.explanation?.length 
    });

    return createCorsResponse(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const stack = error instanceof Error ? error.stack : undefined;
    
    console.error('❌ URL analysis API error:', {
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
