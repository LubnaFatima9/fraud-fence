
'use server';

/**
 * @fileOverview Flow for analyzing images for fraud using the Cogniflow AI model and providing a GenAI explanation.
 *
 * - analyzeImageForFraud - Analyzes an image for potential fraud.
 * - AnalyzeImageForFraudInput - The input type for the analyzeImageForFraud function.
 * - AnalyzeImageForFraudOutput - The return type for the analyzeImageForFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageForFraudInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to check for fraud, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type AnalyzeImageForFraudInput = z.infer<typeof AnalyzeImageForFraudInputSchema>;

const AnalyzeImageForFraudOutputSchema = z.object({
  isFraudulent: z
    .boolean()
    .describe('Whether the image is determined to be fraudulent or not.'),
  confidenceScore: z.number().describe('The confidence score of the fraud detection.'),
  explanation: z.string().describe('An explanation of why the image is considered fraudulent or safe, highlighting specific indicators.'),
});
export type AnalyzeImageForFraudOutput = z.infer<typeof AnalyzeImageForFraudOutputSchema>;

export async function analyzeImageForFraud(input: AnalyzeImageForFraudInput): Promise<AnalyzeImageForFraudOutput> {
  return analyzeImageForFraudFlow(input);
}

const fraudImageExplanationPrompt = ai.definePrompt({
  name: 'fraudImageExplanationPrompt',
  input: { schema: z.object({
      photoDataUri: AnalyzeImageForFraudInputSchema.shape.photoDataUri,
      isFraudulent: z.boolean(),
      confidenceScore: z.number(),
  }) },
  output: { schema: z.object({
    explanation: AnalyzeImageForFraudOutputSchema.shape.explanation,
  }) },
  prompt: `You are an expert digital forensics analyst specializing in identifying fraudulent and deceptive visual content. Your expertise includes recognizing manipulated images, fake advertisements, phishing graphics, and other visual scam tactics.

  Analysis from specialized fraud detection model:
  - Classification Result: {{{isFraudulent}}} (fraud detected: true/false)  
  - Model Confidence: {{{confidenceScore}}} (0-1 scale)
  
  Image to analyze:
  {{media url=photoDataUri}}
  
  Provide a comprehensive, educational explanation (minimum 200 words) that includes:

  **Visual Analysis:**
  - Examine image quality, consistency, and editing artifacts
  - Assess text elements (fonts, alignment, grammar, language)
  - Evaluate branding, logos, and design professionalism
  - Look for common visual scam indicators

  **If Fraudulent:**
  - Specific red flags identified (poor editing, fake logos, suspicious QR codes)
  - Analysis of urgency tactics or psychological manipulation in the image
  - Common characteristics of this type of visual scam
  - How scammers typically use such images
  - Protective measures and warning signs to watch for

  **If Safe:**
  - Professional elements that indicate legitimacy
  - Consistent branding and design quality
  - Absence of common scam indicators
  - General tips for identifying fraudulent images

  **Educational Context:**
  - Background on this type of image-based fraud (if applicable)
  - Technical details about image manipulation detection
  - Best practices for image verification
  - Resources for reporting suspicious content

  Use a professional yet accessible tone. Be specific about visual elements and provide actionable advice.
  Your response must be in JSON format containing only the 'explanation' field.
  Your response must be in JSON format and contain only the 'explanation' field.
  `,
});


const analyzeImageForFraudFlow = ai.defineFlow(
  {
    name: 'analyzeImageForFraudFlow',
    inputSchema: AnalyzeImageForFraudInputSchema,
    outputSchema: AnalyzeImageForFraudOutputSchema,
  },
  async input => {
    const cogniflowApiKey = '764ea05f-f623-4c7f-919b-dac6cf7223f3';
    const cogniflowModelId = 'ba056844-ddea-47fb-b6f5-9adcf567cbae';
    const url = `https://predict.cogniflow.ai/image/llm-classification/predict/${cogniflowModelId}`;

    const base64Image = input.photoDataUri.split(',')[1];
    const mimeType = input.photoDataUri.match(/data:(image\/(\w+));base64,/)?.[1] || 'image/jpeg';
    const imageFormat = mimeType.split('/')[1];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': cogniflowApiKey,
      },
      body: JSON.stringify({
        base64_image: base64Image,
        format: imageFormat,
      }),
    });

    if (!response.ok) {
        throw new Error(`Cogniflow API request failed with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('🖼️ Cogniflow Image API Response:', result);
    
    // More robust parsing of image analysis results
    let isFraudulent = false;
    let confidenceScore = 0;
    
    if (result.result && Array.isArray(result.result)) {
        const primaryPrediction = result.result.find((r: any) => r.match === true);
        
        if (primaryPrediction) {
            console.log('🎯 Primary Image Prediction:', primaryPrediction);
            
            // Check for various fraud/scam indicators
            const predictionName = (primaryPrediction.name || '').toLowerCase();
            isFraudulent = predictionName === 'scam' || 
                          predictionName === 'fraud' || 
                          predictionName === 'fraudulent' ||
                          predictionName.includes('scam') ||
                          predictionName.includes('fraud') ||
                          predictionName.includes('phishing');
                          
            confidenceScore = primaryPrediction.score || 0;
            
            console.log('🔍 Image Analysis Result:', { isFraudulent, confidenceScore, predictionName });
        } else {
            console.warn('⚠️ No matching prediction found in image results:', result.result);
        }
    } else {
        console.warn('⚠️ Unexpected image response format:', result);
    }
    
    let explanation = "An AI explanation could not be generated at this time.";

    try {
      // Now, use a generative model to explain *why*.
      const { output } = await fraudImageExplanationPrompt({
          ...input,
          isFraudulent,
          confidenceScore
      });
      if (output?.explanation) {
        explanation = output.explanation;
      }
    } catch (error) {
      console.error("GenAI explanation for image fraud failed:", error);
      // Fallback to the ault explanation already set
    }


    // Combine the results, using the specialized model's verdict and the generative model's explanation.
    return {
      isFraudulent,
      confidenceScore,
      explanation: explanation,
    };
  }
);
