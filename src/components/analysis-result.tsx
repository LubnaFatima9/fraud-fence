
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
  return <ShieldCheck className="h-12 w-12 text-green-600" />;
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
    <CardTitle className="font-headline text-2xl text-green-600">
      Looks Safe
    </CardTitle>
  );
};

export const AnalysisResult: FC<AnalysisResultProps> = ({ result }) => {
  const { toast } = useToast();
  const isFraud = result.isFraudulent === true || (result.isSafe === false && (result.threatTypes?.length ?? 0) > 0);
  const confidence = result.confidenceScore ?? 0;
  
  const fraudConfidence = isFraud ? confidence : 1 - confidence;
  const fraudConfidencePercentage = Math.round(fraudConfidence * 100);

  const handleReport = () => {
    toast({
      title: "Report Submitted",
      description: "Thank you for helping keep the web safe.",
    });
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
    <Card className="mt-6 animate-in fade-in-50 duration-500">
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

        {result.type === "text" && result.explanation && (
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
