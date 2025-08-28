
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FileImage,
  FileText,
  Link as LinkIcon,
  Loader2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { analyzeTextForFraud } from "@/ai/flows/analyze-text-fraud";
import { analyzeImageForFraud } from "@/ai/flows/analyze-image-fraud";
import { analyzeUrlForFraud } from "@/ai/flows/analyze-url-fraud";
import {
  AnalysisResult,
  type AnalysisResultData,
} from "@/components/analysis-result";
import { Label } from "./ui/label";

const textSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters long.").max(5000, "Text must be 5000 characters or less."),
});

const urlSchema = z.object({
  url: z.string().url("Please enter a valid URL."),
});

type TabValue = "text" | "image" | "url";

export function FraudAnalyzer() {
  const [activeTab, setActiveTab] = useState<TabValue>("text");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResultData | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { toast } = useToast();

  const textForm = useForm<z.infer<typeof textSchema>>({
    resolver: zodResolver(textSchema),
    defaultValues: { text: "" },
  });

  const urlForm = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: { url: "" },
  });
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
    setResult(null);
  }

  const handleAnalysis = async (
    analysisFn: (input: any) => Promise<any>,
    input: any,
    type: TabValue
  ) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await analysisFn(input);
      setResult({ ...response, type, inputValue: type === 'image' ? input.fileName : (input.text || input.url) });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onTextSubmit = (values: z.infer<typeof textSchema>) => {
    handleAnalysis(analyzeTextForFraud, { text: values.text }, "text");
  };

  const onUrlSubmit = (values: z.infer<typeof urlSchema>) => {
    handleAnalysis(analyzeUrlForFraud, { url: values.url }, "url");
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({ variant: "destructive", title: "Image too large", description: "Please upload an image smaller than 4MB." });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const onImageSubmit = () => {
    if (!imageFile || !imagePreview) {
      toast({ variant: "destructive", title: "No image selected", description: "Please select an image to analyze." });
      return;
    }
    handleAnalysis(analyzeImageForFraud, { photoDataUri: imagePreview, fileName: imageFile.name }, "image");
  };

  const renderSubmitButton = (tab: TabValue) => (
    <Button type="submit" className="w-full" disabled={loading}>
      {loading && activeTab === tab ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        "Analyze"
      )}
    </Button>
  );

  return (
    <Card className="w-full shadow-2xl shadow-primary/10">
      <CardHeader>
        <CardTitle className="font-headline text-center text-2xl">
          FraudFence Analyzer
        </CardTitle>
        <CardDescription className="text-center">
          Choose content type and let our AI do the work.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4"/>Text</TabsTrigger>
            <TabsTrigger value="image"><FileImage className="mr-2 h-4 w-4"/>Image</TabsTrigger>
            <TabsTrigger value="url"><LinkIcon className="mr-2 h-4 w-4"/>URL</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-4">
            <Form {...textForm}>
              <form onSubmit={textForm.handleSubmit(onTextSubmit)} className="space-y-6">
                <FormField
                  control={textForm.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Content</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Paste suspicious text here..." className="min-h-[150px]" {...field} />
                      </FormControl>
                      <FormDescription>
                        You can paste text in English, Hindi, or Spanish.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {renderSubmitButton("text")}
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="image" className="mt-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="image-upload">Image File</Label>
                <div className="relative">
                  <Input id="image-upload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                  <div className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border text-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Image preview" className="h-full w-full rounded-md object-contain" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload or drag & drop</span>
                        <span className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 4MB</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button onClick={onImageSubmit} className="w-full" disabled={loading || !imageFile}>
                {loading && activeTab === 'image' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Analyze"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-4">
            <Form {...urlForm}>
              <form onSubmit={urlForm.handleSubmit(onUrlSubmit)} className="space-y-6">
                <FormField
                  control={urlForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {renderSubmitButton("url")}
              </form>
            </Form>
          </TabsContent>
        </Tabs>
        
        {loading && <div className="mt-6 flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
        {result && <AnalysisResult result={result} />}
      </CardContent>
    </Card>
  );
}
