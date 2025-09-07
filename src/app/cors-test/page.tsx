'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Globe, TestTube } from 'lucide-react';

export default function CorsTestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customOrigin, setCustomOrigin] = useState('https://example.com');

  const testEndpoint = async (endpoint: string, data: any, origin?: string) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (origin) {
        headers['Origin'] = origin;
      }

      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      const endTime = Date.now();
      
      setResults(prev => [{
        id: Date.now(),
        endpoint,
        origin: origin || 'same-origin',
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        result,
        duration: endTime - startTime,
        timestamp: new Date().toISOString(),
        success: response.ok
      }, ...prev]);
    } catch (error) {
      setResults(prev => [{
        id: Date.now(),
        endpoint,
        origin: origin || 'same-origin',
        status: 'error',
        result: { error: error instanceof Error ? error.message : 'Unknown error' },
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        success: false
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const testTextAnalysis = () => {
    testEndpoint('text-detect', {
      text: 'URGENT! You have won $1,000,000! Click here to claim your prize now! Limited time offer!'
    });
  };

  const testUrlAnalysis = () => {
    testEndpoint('url-detect', {
      url: 'https://phishing-example.com'
    });
  };

  const testImageAnalysis = () => {
    // Create a simple test image data URL
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText('TEST', 30, 55);
    }
    
    testEndpoint('image-detect', {
      imageData: canvas.toDataURL('image/png')
    });
  };

  const testWithCustomOrigin = () => {
    testEndpoint('text-detect', {
      text: 'Test message for CORS validation'
    }, customOrigin);
  };

  const testCorsPreflightText = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/text-detect', {
        method: 'OPTIONS',
        headers: {
          'Origin': customOrigin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      const endTime = Date.now();
      
      setResults(prev => [{
        id: Date.now(),
        endpoint: 'text-detect (OPTIONS)',
        origin: customOrigin,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        result: { message: 'CORS preflight request' },
        duration: endTime - startTime,
        timestamp: new Date().toISOString(),
        success: response.ok
      }, ...prev]);
    } catch (error) {
      setResults(prev => [{
        id: Date.now(),
        endpoint: 'text-detect (OPTIONS)',
        origin: customOrigin,
        status: 'error',
        result: { error: error instanceof Error ? error.message : 'Unknown error' },
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        success: false
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">CORS Test Panel</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Text Analysis</CardTitle>
            <CardDescription>Test text fraud detection API</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testTextAnalysis} 
              disabled={loading}
              className="w-full"
            >
              Test Text API
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">URL Analysis</CardTitle>
            <CardDescription>Test URL fraud detection API</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testUrlAnalysis} 
              disabled={loading}
              className="w-full"
            >
              Test URL API
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Image Analysis</CardTitle>
            <CardDescription>Test image fraud detection API</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testImageAnalysis} 
              disabled={loading}
              className="w-full"
            >
              Test Image API
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Origin Tests</CardTitle>
          <CardDescription>Test CORS with different origins</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Custom Origin (e.g., https://example.com)"
            value={customOrigin}
            onChange={(e) => setCustomOrigin(e.target.value)}
          />
          <div className="flex gap-2">
            <Button 
              onClick={testWithCustomOrigin} 
              disabled={loading}
              variant="outline"
            >
              Test with Custom Origin
            </Button>
            <Button 
              onClick={testCorsPreflightText} 
              disabled={loading}
              variant="outline"
            >
              Test CORS Preflight
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Test Results</h2>
          {results.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setResults([])}
              size="sm"
            >
              Clear Results
            </Button>
          )}
        </div>

        {results.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
              No test results yet. Run some tests to see results here.
            </CardContent>
          </Card>
        ) : (
          results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <CardTitle className="text-lg">
                      {result.endpoint}
                    </CardTitle>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(result.timestamp).toLocaleTimeString()} 
                    <span className="ml-2">({result.duration}ms)</span>
                  </div>
                </div>
                <CardDescription>
                  Origin: {result.origin}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.headers && (
                  <div>
                    <h4 className="font-medium mb-2">Response Headers</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-xs">
                      {Object.entries(result.headers).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="font-mono text-blue-600 min-w-[200px]">{key}:</span>
                          <span className="font-mono break-all">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Response Body</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
