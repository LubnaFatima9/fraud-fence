import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageForFraud } from '@/ai/flows/analyze-image-fraud';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let imageData: string;
    let format = 'base64';

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data (file upload)
      const formData = await request.formData();
      const file = formData.get('image') as File;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No image file provided' },
          { status: 400 }
        );
      }

      // Convert file to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageData = buffer.toString('base64');
      
    } else if (contentType.includes('application/json')) {
      // Handle JSON payload with base64 image
      const body = await request.json();
      
      if (body.image_base64) {
        imageData = body.image_base64;
      } else if (body.image) {
        imageData = body.image;
      } else {
        return NextResponse.json(
          { error: 'No image data provided. Use either image_base64 or image field' },
          { status: 400 }
        );
      }
      
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type. Use multipart/form-data or application/json' },
        { status: 400 }
      );
    }

    // Validate base64 format
    if (!imageData || imageData.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty image data' },
        { status: 400 }
      );
    }

    // Create data URI format expected by the AI flow
    // Assume JPEG if not specified - you might want to detect the actual MIME type
    const mimeType = 'image/jpeg'; // Default, could be enhanced to detect actual type
    const photoDataUri = `data:${mimeType};base64,${imageData}`;

    // Analyze the image using the AI flow
    const result = await analyzeImageForFraud({ 
      photoDataUri: photoDataUri
    });

    // Transform the result to match the expected Chrome extension format
    return NextResponse.json({
      isFraud: result.isFraudulent,
      confidence: Math.round(result.confidenceScore * 100), // Convert to percentage
      riskLevel: result.confidenceScore > 0.8 ? 'high' : result.confidenceScore > 0.5 ? 'medium' : 'low',
      details: result.explanation,
      analysis: result.explanation,
      source: 'AI Image Analysis'
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze image', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Image detection API endpoint',
    method: 'POST',
    supportedFormats: [
      'multipart/form-data with image field',
      'application/json with image_base64 or image field'
    ],
    exampleJson: {
      image_base64: 'base64-encoded-image-data',
      format: 'base64'
    }
  });
}
