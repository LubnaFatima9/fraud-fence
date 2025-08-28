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

const prompt = ai.definePrompt({
  name: 'analyzeImageForFraudPrompt',
  input: {schema: AnalyzeImageForFraudInputSchema},
  output: {schema: AnalyzeImageForFraudOutputSchema},
  prompt: `You are an AI fraud detection expert. Analyze the image provided to determine if it is fraudulent.

Image: {{media url=photoDataUri}}

Based on your analysis, determine if the image is fraudulent and provide a confidence score.
Set the isFraudulent output field to true if it is fraudulent, and false otherwise. Provide a confidence score between 0 and 1.

Ensure the output adheres strictly to the AnalyzeImageForFraudOutputSchema schema and provide it with a description.`, // prettier-ignore
  model: 'googleai/gemini-pro-vision',
  config: {
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

const analyzeImageForFraudFlow = ai.defineFlow(
  {
    name: 'analyzeImageForFraudFlow',
    inputSchema: AnalyzeImageForFraudInputSchema,
    outputSchema: AnalyzeImageForFraudOutputSchema,
  },
  async input => {
    // Call the Cogniflow API here using the provided API key and model number
    // Replace this with the actual API call
    // const cogniflowApiKey = '764ea05f-f623-4c7f-919b-dac6cf7223f3';
    // const cogniflowModelNumber = 'ba056844-ddea-47fb-b6f5-9adcf567cbae';
    // const cogniflowResponse = await cogniflowApiCall(input.photoDataUri, cogniflowApiKey, cogniflowModelNumber);

    // Simulate the Cogniflow API response for now
    const {output} = await prompt(input);
    return output!;
  }
);
