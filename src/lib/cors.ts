import { NextResponse } from 'next/server';

/**
 * CORS headers for API routes to allow cross-origin requests
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours
};

/**
 * Create a NextResponse with CORS headers
 */
export function createCorsResponse(data: any, init?: ResponseInit) {
  const response = NextResponse.json(data, init);
  
  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Handle OPTIONS preflight request
 */
export function handleCorsPreflightRequest() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
