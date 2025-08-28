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

const analyzeTextPrompt = ai.definePrompt({
  name: 'analyzeTextPrompt',
  input: {schema: AnalyzeTextForFraudInputSchema},
  output: {schema: AnalyzeTextForFraudOutputSchema},
  prompt: `You are an AI expert in detecting fraudulent text.
  Analyze the following text and determine if it is fraudulent.
  Return a confidence score between 0 and 1, where 1 is certainly fraud.

  Text: {{{text}}}
  `,
  config: {
    model: 'googleai/gemini-2.5-flash',
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const analyzeTextForFraudFlow = ai.defineFlow(
  {
    name: 'analyzeTextForFraudFlow',
    inputSchema: AnalyzeTextForFraudInputSchema,
    outputSchema: AnalyzeTextForFraudOutputSchema,
  },
  async input => {
    // Call the Cogniflow API here using the provided API key and model number.
    //  The API key is cdc872e5-00ae-4d32-936c-a80bf6a889ce
    //  The model number is 69cd908d-f479-49f2-9984-eb6c5d462417
    //  For now, return dummy data.
    const {output} = await analyzeTextPrompt(input);
    return output!;
  }
);
