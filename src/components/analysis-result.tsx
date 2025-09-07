
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
  if (score > 0.75) return "hsl(var(--destructive))";
  if (score > 0.4) return "hsl(var(--primary))";
  return "hsl(142.1 76.2% 36.3%)"; // A safe green
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
  
  // Fixed: Fraud confidence calculation
  // For fraud cases: show the confidence as fraud likelihood (0-100%)
  // For safe cases: show how confident we are it's safe (inverse of fraud confidence)
  let fraudConfidencePercentage;
  
  if (isFraud) {
    // If it's fraud, show the confidence in the fraud detection
    fraudConfidencePercentage = Math.round(confidence * 100);
  } else {
    // If it's safe, show low fraud confidence (high safety confidence)
    // Convert safety confidence to fraud confidence (inverted)
    fraudConfidencePercentage = Math.round((1 - confidence) * 100);
    // For safe content, fraud confidence should be low (typically 5-30%)
    fraudConfidencePercentage = Math.min(fraudConfidencePercentage, 30);
  }

  // Ensure percentage is within reasonable bounds
  fraudConfidencePercentage = Math.max(5, Math.min(95, fraudConfidencePercentage));
  
  // Calculate the actual fraud confidence for color coding
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
              <span>Fraud Meter</span>
              <span style={{ color: getConfidenceColor(fraudConfidence) }}>
                {fraudConfidencePercentage}%
              </span>
            </div>
            <Progress
              value={fraudConfidencePercentage}
              className="h-2 [&>div]:bg-[--confidence-color]"
              style={
                {
                  "--confidence-color": getConfidenceColor(fraudConfidence),
                } as React.CSSProperties
              }
            />
          </div>
        )}

        {result.explanation && (
           <Card className="bg-muted/50">
           <CardHeader>
             <CardTitle className="flex items-center text-base font-medium">
                <Info className="mr-2 h-5 w-5 text-primary" />
                AI Explanation
             </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-sm text-muted-foreground">
                {result.explanation}
             </p>
           </CardContent>
         </Card>
        )}

        {result.type === "url" && result.threatTypes && result.threatTypes.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Detected Threats:</h4>
            <div className="flex flex-wrap gap-2">
              {result.threatTypes.map((threat) => (
                <Badge key={threat} variant="destructive">
                  {threat}
                </Badge>
              ))}
            </div>
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
