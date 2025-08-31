
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
  
  // Fix: Calculate fraud confidence correctly based on the analysis result
  // If it's fraud, show the confidence as-is
  // If it's safe, show how confident we are it's safe (not fraudulent)
  let fraudConfidence: number;
  let fraudConfidencePercentage: number;
  
  if (result.type === "url") {
    // For URLs, safe results should show low fraud confidence
    fraudConfidence = isFraud ? confidence : 0.05; // 5% baseline for safe URLs
    fraudConfidencePercentage = Math.round(fraudConfidence * 100);
  } else {
    // For text and images, confidence represents certainty of the classification
    if (isFraud) {
      // If it's fraudulent, show the confidence as fraud percentage
      fraudConfidence = confidence;
    } else {
      // If it's safe, show low fraud confidence (high safety confidence = low fraud confidence)
      fraudConfidence = 1 - confidence;
    }
    fraudConfidencePercentage = Math.round(fraudConfidence * 100);
  }

  // Ensure percentage is within reasonable bounds
  fraudConfidencePercentage = Math.max(5, Math.min(95, fraudConfidencePercentage));


  const handleReport = async () => {
    try {
      await reportFraud({ type: result.type, content: result.inputValue });
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
        {(result.type === "text" || result.type === "image") && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Fraud Confidence</span>
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
      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
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
      </CardFooter>
    </Card>
  );
};
