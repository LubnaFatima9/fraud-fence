
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing text to detect potential fraud using the Cogniflow AI model.
 *
 * - analyzeTextForFraud - The function to call to analyze text for fraud.
 * - AnalyzeTextForFraudInput - The input type for the analyzeTextForFraud function.
 * - AnalyzeTextForFraudOutput - The output type for the analyzeTextForFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextForFraudInputSchema = z.object({
  text: z.string().describe('The text to analyze for potential fraud.'),
});

export type AnalyzeTextForFraudInput = z.infer<typeof AnalyzeTextForFraudInputSchema>;

const AnalyzeTextForFraudOutputSchema = z.object({
  isFraudulent: z.boolean().describe('Whether the text is likely fraudulent.'),
  confidenceScore: z.number().describe('A score indicating the confidence level of the fraud detection.'),
});

export type AnalyzeTextForFraudOutput = z.infer<typeof AnalyzeTextForFraudOutputSchema>;

export async function analyzeTextForFraud(input: AnalyzeTextForFraudInput): Promise<AnalyzeTextForFraudOutput> {
  return analyzeTextForFraudFlow(input);
}

const analyzeTextForFraudFlow = ai.defineFlow(
  {
    name: 'analyzeTextForFraudFlow',
    inputSchema: AnalyzeTextForFraudInputSchema,
    outputSchema: AnalyzeTextForFraudOutputSchema,
  },
  async input => {
    const cogniflowApiKey = 'cdc872e5-00ae-4d32-936c-a80bf6a889ce';
    const cogniflowModelId = '93310e76-d5c0-4856-89e1-af31d18d6a81';
    const url = `https://predict.cogniflow.ai/text/classification/predict/${cogniflowModelId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': cogniflowApiKey,
      },
      body: JSON.stringify({
        text: input.text,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Cogniflow API request failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();

    const primaryPrediction = result.result[0];
    const isFraudulent = primaryPrediction.label.toLowerCase() === 'fraud';
    const confidenceScore = primaryPrediction.score;

    return {
      isFraudulent,
      confidenceScore,
    };
  }
);
