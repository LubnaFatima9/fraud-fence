
'use server';

/**
 * @fileOverview Flow for analyzing images for fraud using the Cogniflow AI model.
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
});
export type AnalyzeImageForFraudOutput = z.infer<typeof AnalyzeImageForFraudOutputSchema>;

export async function analyzeImageForFraud(input: AnalyzeImageForFraudInput): Promise<AnalyzeImageForFraudOutput> {
  return analyzeImageForFraudFlow(input);
}

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
      const errorBody = await response.text();
      throw new Error(`Cogniflow API request failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    
    const isFraudulent = result.result?.toLowerCase() === 'fraud';
    const confidenceScore = result.confidence_score ?? 0; // fallback if missing

    return {
      isFraudulent,
      confidenceScore,
    };
  }
);
