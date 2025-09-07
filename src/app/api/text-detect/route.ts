import { NextRequest, NextResponse } from 'next/server';
import { analyzeTextForFraud } from '@/ai/flows/analyze-text-fraud';
import { createCorsResponse, handleCorsPreflightRequest } from '@/lib/cors';
import { z } from 'zod';

const RequestSchema = z.object({
  text: z.string().min(1, 'Text is required').max(10000, 'Text too long'),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    const body = await request.json();
    const origin = request.headers.get('origin') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || 'unknown';
    const contentType = request.headers.get('content-type') || 'unknown';
    
    console.log(`[${requestId}] 📝 Text analysis API called:`, { 
      timestamp: new Date().toISOString(),
      textLength: body.text?.length,
      origin,
      referer,
      contentType,
      userAgent: userAgent.includes('Mozilla') ? 'Browser' : userAgent.substring(0, 50),
      bodyKeys: Object.keys(body),
      textPreview: body.text?.substring(0, 50) + '...'
    });
    
    // Validate request
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      console.error(`[${requestId}] ❌ Text analysis validation failed:`, validation.error);
      return createCorsResponse(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { text } = validation.data;

    // Call the AI analysis flow
    console.log(`[${requestId}] 🤖 Calling analyzeTextForFraud...`);
    const result = await analyzeTextForFraud({ text });
    const duration = Date.now() - startTime;
    
    console.log(`[${requestId}] ✅ Text analysis completed in ${duration}ms:`, { 
      isFraudulent: result.isFraudulent, 
      confidenceScore: result.confidenceScore,
      explanationLength: result.explanation?.length 
    });

    return createCorsResponse(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const stack = error instanceof Error ? error.stack : undefined;
    
    console.error(`[${requestId}] ❌ Text analysis API error after ${duration}ms:`, {
      message: errorMessage,
      stack: stack?.substring(0, 500),
      timestamp: new Date().toISOString(),
      error: error
    });
    
    return createCorsResponse(
      { 
        error: 'Analysis failed', 
        message: errorMessage,
        timestamp: new Date().toISOString(),
        requestId
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
