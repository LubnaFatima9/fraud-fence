
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
    const cogniflowApiKey = 'cdc872e5-00ae-4d32-936c-a80bf6a889ce';
    const cogniflowModelId = '69cd908d-f479-49f2-9984-eb6c5d462417';
    const url = `https://api.cogniflow.ai/v1/models/${cogniflowModelId}/predict`;

    // The data URI needs to be stripped of its prefix `data:image/...;base64,`
    const base64Image = input.photoDataUri.split(',')[1];
    const mimeType = input.photoDataUri.match(/data:(image\/\w+);base64,/)?.[1];
    const imageFormat = mimeType?.split('/')[1] || 'jpeg';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cogniflowApiKey}`,
      },
      body: JSON.stringify({
        input_image: base64Image,
        format: imageFormat,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Cogniflow API request failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();

    const primaryPrediction = result.predictions[0];
    const isFraudulent = primaryPrediction.label.toLowerCase() === 'fraud';
    const confidenceScore = primaryPrediction.confidence;

    return {
      isFraudulent,
      confidenceScore,
    };
  }
);

