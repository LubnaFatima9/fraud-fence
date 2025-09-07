import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Shield, Image, Link, FileText } from 'lucide-react';

export default function DebugPage() {
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const analyzeText = async () => {
    if (!textInput.trim()) return;
    
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/text-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput })
      });
      
      const data = await response.json();
      const endTime = Date.now();
      
      setResults(prev => [{
        id: Date.now(),
        type: 'text',
        input: textInput.substring(0, 100) + '...',
        result: data,
        duration: endTime - startTime,
        timestamp: new Date().toISOString(),
        status: response.status
      }, ...prev]);
    } catch (error) {
      console.error('Text analysis error:', error);
      setResults(prev => [{
        id: Date.now(),
        type: 'text',
        input: textInput.substring(0, 100) + '...',
        result: { error: error instanceof Error ? error.message : 'Unknown error' },
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        status: 'error'
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const analyzeUrl = async () => {
    if (!urlInput.trim()) return;
    
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/url-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      });
      
      const data = await response.json();
      const endTime = Date.now();
      
      setResults(prev => [{
        id: Date.now(),
        type: 'url',
        input: urlInput,
        result: data,
        duration: endTime - startTime,
        timestamp: new Date().toISOString(),
        status: response.status
      }, ...prev]);
    } catch (error) {
      console.error('URL analysis error:', error);
      setResults(prev => [{
        id: Date.now(),
        type: 'url',
        input: urlInput,
        result: { error: error instanceof Error ? error.message : 'Unknown error' },
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        status: 'error'
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) return;
    
    setLoading(true);
    const startTime = Date.now();
    
    try {
      // Convert image to data URL
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        try {
          const response = await fetch('/api/image-detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageData })
          });
          
          const data = await response.json();
          const endTime = Date.now();
          
          setResults(prev => [{
            id: Date.now(),
            type: 'image',
            input: imageFile.name,
            result: data,
            duration: endTime - startTime,
            timestamp: new Date().toISOString(),
            status: response.status
          }, ...prev]);
        } catch (error) {
          console.error('Image analysis error:', error);
          setResults(prev => [{
            id: Date.now(),
            type: 'image',
            input: imageFile.name,
            result: { error: error instanceof Error ? error.message : 'Unknown error' },
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            status: 'error'
          }, ...prev]);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error('Image processing error:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (result: any) => {
    if (result.error) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (result.isFraudulent || !result.isSafe) return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'url': return <Link className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Fraud Analysis Debug Panel</h1>
      </div>

      <Tabs defaultValue="test" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="test">Run Tests</TabsTrigger>
          <TabsTrigger value="results">Results History</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-6">
          {/* Text Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Text Analysis
              </CardTitle>
              <CardDescription>
                Test fraud detection for text content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Enter text to analyze for fraud..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={analyzeText} 
                disabled={loading || !textInput.trim()}
                className="w-full"
              >
                {loading ? 'Analyzing...' : 'Analyze Text'}
              </Button>
            </CardContent>
          </Card>

          {/* URL Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                URL Analysis
              </CardTitle>
              <CardDescription>
                Test fraud detection for URLs and websites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Enter URL to analyze..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <Button 
                onClick={analyzeUrl} 
                disabled={loading || !urlInput.trim()}
                className="w-full"
              >
                {loading ? 'Analyzing...' : 'Analyze URL'}
              </Button>
            </CardContent>
          </Card>

          {/* Image Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Image Analysis
              </CardTitle>
              <CardDescription>
                Test fraud detection for images
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <Button 
                onClick={analyzeImage} 
                disabled={loading || !imageFile}
                className="w-full"
              >
                {loading ? 'Analyzing...' : 'Analyze Image'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {results.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No analysis results yet. Run some tests to see results here.
              </CardContent>
            </Card>
          ) : (
            results.map((result) => (
              <Card key={result.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(result.type)}
                      {getStatusIcon(result.result)}
                      <CardTitle className="text-lg capitalize">
                        {result.type} Analysis
                      </CardTitle>
                      <Badge variant={result.status === 200 ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(result.timestamp).toLocaleTimeString()} 
                      <span className="ml-2">({result.duration}ms)</span>
                    </div>
                  </div>
                  <CardDescription className="truncate">
                    {result.input}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          
          {results.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setResults([])}
              className="w-full"
            >
              Clear Results
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
