"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getAllFeedback, getFeedbackStats, clearAllFeedback, exportFeedbackData, type UserFeedback } from '@/lib/feedback';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Download, Trash2, RefreshCw } from 'lucide-react';

export default function FeedbackDashboard() {
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadFeedback = () => {
    try {
      const allFeedback = getAllFeedback();
      const feedbackStats = getFeedbackStats();
      setFeedback(allFeedback);
      setStats(feedbackStats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load feedback:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleClearFeedback = () => {
    if (confirm('Are you sure you want to clear all feedback data? This cannot be undone.')) {
      clearAllFeedback();
      loadFeedback();
      toast({
        title: "Feedback Cleared",
        description: "All feedback data has been removed.",
      });
    }
  };

  const handleExportFeedback = () => {
    try {
      const data = exportFeedbackData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fraud-fence-feedback-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Feedback data has been downloaded.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not export feedback data.",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading feedback data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Feedback Dashboard</h1>
          <p className="text-muted-foreground">User feedback on fraud analysis results</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={loadFeedback} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportFeedback} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleClearFeedback} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">"Not Scam" Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.notScamReports || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.fraudReports || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24h</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Type Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Analysis Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Text: {stats.byType?.text || 0}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Image: {stats.byType?.image || 0}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">URL: {stats.byType?.url || 0}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Latest user feedback on analysis results</CardDescription>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No feedback data available. Users haven't provided feedback yet.
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.slice(-10).reverse().map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.type === 'not-scam' ? 'default' : 'destructive'}>
                        {item.type === 'not-scam' ? 'Not Scam' : 'Report Fraud'}
                      </Badge>
                      <Badge variant="outline">{item.analysisResult.type}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Content: </span>
                      <span className="text-sm text-muted-foreground truncate">
                        {item.analysisResult.inputValue.length > 100 
                          ? `${item.analysisResult.inputValue.substring(0, 100)}...`
                          : item.analysisResult.inputValue
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span>
                        <span className="font-medium">AI Result: </span>
                        <Badge variant={item.analysisResult.isFraudulent ? 'destructive' : 'default'}>
                          {item.analysisResult.isFraudulent ? 'Fraud' : 'Safe'}
                        </Badge>
                      </span>
                      
                      {item.analysisResult.confidenceScore && (
                        <span>
                          <span className="font-medium">Confidence: </span>
                          {Math.round((item.analysisResult.confidenceScore || 0) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
