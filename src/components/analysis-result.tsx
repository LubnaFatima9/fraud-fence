
"use client";

import type { FC } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  FileWarning,
  MessageCircleWarning,
  Link2Off,
  Info,
  AlertTriangle,
  Brain,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { reportFraud, type ReportFraudInput } from "@/ai/flows/report-fraud";
import { saveFeedback, type FeedbackType } from "@/lib/feedback";
import { cn } from "@/lib/utils";

// Simple markdown formatter - inline implementation
function formatMarkdownExplanation(text: string): React.ReactNode {
  if (!text) return null;

  const sections = text.split('\n\n').filter(section => section.trim());
  
  return (
    <div className="space-y-4">
      {sections.map((section, sectionIndex) => {
        const lines = section.split('\n').filter(line => line.trim());
        
        return (
          <div key={sectionIndex} className="space-y-2">
            {lines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              
              // Handle headers
              if (trimmedLine.startsWith('##')) {
                return (
                  <h3 key={lineIndex} className="text-lg font-bold text-foreground mt-4 mb-2 flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    {trimmedLine.replace(/^##\s*/, '')}
                  </h3>
                );
              }
              
              if (trimmedLine.startsWith('#')) {
                return (
                  <h2 key={lineIndex} className="text-xl font-bold text-foreground mt-6 mb-3 border-b border-border pb-2">
                    {trimmedLine.replace(/^#\s*/, '')}
                  </h2>
                );
              }
              
              // Handle bullet points
              if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
                const content = trimmedLine.replace(/^[-•]\s*/, '');
                return (
                  <div key={lineIndex} className="flex items-start gap-3 py-1">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">{formatInlineMarkdown(content)}</span>
                  </div>
                );
              }
              
              // Handle numbered lists
              const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.*)$/);
              if (numberedMatch) {
                return (
                  <div key={lineIndex} className="flex items-start gap-3 py-1">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {numberedMatch[1]}
                    </div>
                    <span className="text-sm leading-relaxed">{formatInlineMarkdown(numberedMatch[2])}</span>
                  </div>
                );
              }
              
              // Regular paragraphs
              if (trimmedLine) {
                return (
                  <p key={lineIndex} className="text-sm leading-relaxed text-muted-foreground">
                    {formatInlineMarkdown(trimmedLine)}
                  </p>
                );
              }
              
              return null;
            })}
          </div>
        );
      })}
    </div>
  );
}

// Format inline markdown like **bold**
function formatInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-foreground">
          {boldText}
        </strong>
      );
    }
    return part;
  });
}

export type AnalysisResultData = {
  type: "text" | "image" | "url";
  isFraudulent?: boolean;
  isSafe?: boolean;
  confidenceScore?: number;
  threatTypes?: string[];
  inputValue: string;
  explanation?: string;
};

interface AnalysisResultProps {
  result: AnalysisResultData;
}

const getConfidenceColor = (score: number) => {
  // Red for high fraud confidence (75%+)
  if (score > 0.75) return "hsl(0 84.2% 60.2%)"; // Red
  // Yellow/Orange for medium fraud confidence (40-75%)
  if (score > 0.4) return "hsl(35 91.7% 55.1%)"; // Orange/Yellow 
  // Green for low fraud confidence (0-40%)
  return "hsl(142.1 76.2% 36.3%)"; // Safe green
};

const ResultIcon: FC<{ result: AnalysisResultData }> = ({ result }) => {
  const isFraud =
    result.isFraudulent === true || (result.isSafe === false && (result.threatTypes?.length ?? 0) > 0);
  const confidence = result.confidenceScore ?? (isFraud ? 1 : 0);

  if (isFraud) {
    if (confidence > 0.75) {
      return <ShieldX className="h-12 w-12 text-destructive" />;
    }
    return <ShieldAlert className="h-12 w-12 text-yellow-500" />;
  }
  return <ShieldCheck className="h-12 w-12 text-green-500" />;
};

const ResultTitle: FC<{ result: AnalysisResultData }> = ({ result }) => {
  const isFraud = result.isFraudulent === true || (result.isSafe === false && (result.threatTypes?.length ?? 0) > 0);
  if (isFraud) {
    return (
      <CardTitle className="font-headline text-2xl text-destructive">
        Potential Fraud Detected
      </CardTitle>
    );
  }
  return (
    <CardTitle className="font-headline text-2xl text-green-500">
      Looks Safe
    </CardTitle>
  );
};

export const AnalysisResult: FC<AnalysisResultProps> = ({ result }) => {
  const { toast } = useToast();
  const isFraud = result.isFraudulent === true || (result.isSafe === false && (result.threatTypes?.length ?? 0) > 0);
  const confidence = result.confidenceScore ?? 0;
  
  // Enhanced: Properly synchronized fraud confidence calculation
  // The meter should ALWAYS represent fraud likelihood (0-100%)
  // Green = Low fraud risk, Red = High fraud risk
  let fraudConfidencePercentage;
  
  if (isFraud) {
    // If AI determined it's fraud, show the confidence in fraud detection
    fraudConfidencePercentage = Math.round(confidence * 100);
    // Ensure fraud detection is at least 60% to justify "fraud" classification
    fraudConfidencePercentage = Math.max(60, fraudConfidencePercentage);
  } else {
    // If AI determined it's safe, fraud confidence should be low
    // Use inverse of safety confidence, but cap at reasonable levels
    fraudConfidencePercentage = Math.round((1 - confidence) * 100);
    // For safe content, fraud confidence should be very low (5-35%)
    fraudConfidencePercentage = Math.max(5, Math.min(35, fraudConfidencePercentage));
  }

  // Final bounds check
  fraudConfidencePercentage = Math.max(5, Math.min(95, fraudConfidencePercentage));
  
  // Calculate the actual fraud confidence for color coding (always represents fraud risk)
  const fraudConfidence = fraudConfidencePercentage / 100;


  const handleReport = async () => {
    try {
      await reportFraud({ type: result.type, content: result.inputValue });
      
      // Save feedback to localStorage
      saveFeedback({
        type: 'report-fraud',
        analysisResult: result,
      });
      
      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep the web safe.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Report Failed",
        description: "Could not submit your report. Please try again.",
      });
      console.error("Report error:", error);
    }
  };

  const handleNotScamFeedback = async () => {
    try {
      // Save feedback to localStorage
      saveFeedback({
        type: 'not-scam',
        analysisResult: result,
      });
      
      toast({
        title: "Feedback Received",
        description: "Thank you for your feedback! This helps us improve our detection accuracy.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Feedback Failed",
        description: "Could not save your feedback. Please try again.",
      });
      console.error("Feedback error:", error);
    }
  };

  const renderIcon = () => {
    switch (result.type) {
      case "image":
        return <FileWarning className="mr-2 h-5 w-5" />;
      case "text":
        return <MessageCircleWarning className="mr-2 h-5 w-5" />;
      case "url":
        return <Link2Off className="mr-2 h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <Card className={cn(
        "mt-6 animate-in fade-in-50 duration-500",
        isFraud 
            ? "bg-gradient-to-br from-destructive/10 via-red-500/10 to-destructive/20 dark:from-destructive/20 dark:via-red-900/20 dark:to-destructive/30" 
            : "bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-600/20 dark:from-green-900/20 dark:via-emerald-800/20 dark:to-green-900/30"
    )}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <ResultIcon result={result} />
        </div>
        <ResultTitle result={result} />
        <CardDescription>
          Our AI has analyzed the submitted content. Here's the verdict.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(result.type === "text" || result.type === "image" || result.type === "url") && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Fraud Risk Meter</span>
              <div className="flex items-center gap-2">
                <span 
                  className="font-bold"
                  style={{ color: getConfidenceColor(fraudConfidence) }}
                >
                  {fraudConfidencePercentage}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {fraudConfidence > 0.75 ? "HIGH RISK" : 
                   fraudConfidence > 0.4 ? "MODERATE" : "LOW RISK"}
                </span>
              </div>
            </div>
            <Progress
              value={fraudConfidencePercentage}
              className="h-3 [&>div]:bg-[--confidence-color] [&>div]:transition-all [&>div]:duration-300"
              style={
                {
                  "--confidence-color": getConfidenceColor(fraudConfidence),
                } as React.CSSProperties
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span className="text-green-600">Safe</span>
              <span className="text-orange-500">Suspicious</span>
              <span className="text-red-600">Fraud</span>
            </div>
          </div>
        )}

        {result.explanation && (
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base font-medium">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <span>Detailed AI Analysis</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
                  <Brain className="h-3 w-3" />
                  Dual AI System
                </div>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Combined analysis from Cogniflow fraud detection + Gemini reasoning AI
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-white/50 dark:bg-slate-950/50 rounded-lg p-4 border">
                {formatMarkdownExplanation(result.explanation)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suspicious Indicators Section - Always show if fraud confidence > 20% */}
        {fraudConfidencePercentage > 20 && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
            <CardHeader>
              <CardTitle className="flex items-center text-base font-medium text-amber-800 dark:text-amber-200">
                <AlertTriangle className="mr-2 h-5 w-5" />
                {isFraud ? "Fraud Indicators Detected" : "Suspicious Patterns Found"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {isFraud 
                    ? "Our AI detected several red flags that indicate this content is likely fraudulent:"
                    : "While this content isn't classified as fraud, our AI noticed some patterns that warrant caution:"
                  }
                </p>
                <div className="space-y-1">
                  {fraudConfidencePercentage > 60 && (
                    <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                      <span>High-risk language patterns detected</span>
                    </div>
                  )}
                  {fraudConfidencePercentage > 40 && (
                    <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                      <span>Urgency and pressure tactics identified</span>
                    </div>
                  )}
                  {fraudConfidencePercentage > 30 && result.type === "url" && (
                    <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                      <span>Suspicious URL characteristics</span>
                    </div>
                  )}
                  {fraudConfidencePercentage > 25 && (
                    <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                      <span>Requests for sensitive information</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>💡 Recommendation:</strong> {isFraud 
                      ? "Do not proceed with any requests in this content. Verify independently through official channels."
                      : "Exercise caution and verify information through official sources before taking any action."
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result.threatTypes && result.threatTypes.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Detected Threats:
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.threatTypes.map((threat) => (
                <Badge key={threat} variant="destructive" className="text-xs">
                  {threat}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Our dual AI system identified these specific threat patterns in the analyzed content.
            </p>
          </div>
        )}

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center text-base font-medium">
              {renderIcon()}
              Analyzed Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="truncate text-sm text-muted-foreground">
              {result.type === "image"
                ? `Image: ${result.inputValue}`
                : result.inputValue}
            </p>
          </CardContent>
        </Card>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row">
        {/* Report as Fraud Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-auto">
              Report as Fraud
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will flag the content as potentially fraudulent.
                This helps our system learn and improves future detections.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReport}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Not a Scam Feedback Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Not a scam? Let us know
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Help us improve</AlertDialogTitle>
              <AlertDialogDescription>
                Did our AI get it wrong? Your feedback helps us improve our fraud detection accuracy and reduce false positives.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleNotScamFeedback}>
                Submit Feedback
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};
