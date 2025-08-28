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
    const cogniflowApiKey = '764ea05f-f623-4c7f-919b-dac6cf7223f3';
    const cogniflowModelId = 'ba056844-ddea-47fb-b6f5-9adcf567cbae';
    const url = `https://api.cogniflow.ai/v1/models/${cogniflowModelId}/predict`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cogniflowApiKey}`,
      },
      body: JSON.stringify({
        input_text: input.text,
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
