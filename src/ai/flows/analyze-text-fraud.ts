
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing text to detect potential fraud and provide an explanation.
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
  explanation: z.string().describe('An explanation of why the text is considered fraudulent or safe, highlighting specific indicators.')
});

export type AnalyzeTextForFraudOutput = z.infer<typeof AnalyzeTextForFraudOutputSchema>;

export async function analyzeTextForFraud(input: AnalyzeTextForFraudInput): Promise<AnalyzeTextForFraudOutput> {
  return analyzeTextForFraudFlow(input);
}

const fraudAnalysisPrompt = ai.definePrompt({
    name: 'fraudAnalysisPrompt',
    input: { schema: AnalyzeTextForFraudInputSchema },
    output: { schema: AnalyzeTextForFraudOutputSchema },
    prompt: `You are a fraud detection expert. Analyze the following text for scam indicators.

    Text to analyze:
    """
    {{{text}}}
    """

    Based on your analysis, determine if the text is fraudulent. Your response must be in JSON format and include:
    1.  'isFraudulent': A boolean (true/false).
    2.  'confidenceScore': A number between 0 and 1 representing your confidence in the fraud assessment.
    3.  'explanation': A concise, user-friendly explanation for your decision. If it is fraudulent, highlight indicators like forced urgency, suspicious links, requests for money, or poor grammar. If it is safe, briefly state why.
    `,
});


const analyzeTextForFraudFlow = ai.defineFlow(
  {
    name: 'analyzeTextForFraudFlow',
    inputSchema: AnalyzeTextForFraudInputSchema,
    outputSchema: AnalyzeTextForFraudOutputSchema,
  },
  async input => {
    // First, get the basic fraud detection from the specialized Cogniflow model.
    const cogniflowApiKey = 'cdc872e5-00ae-4d32-936c-a80bf6a889ce';
    const cogniflowModelId = '69cd908d-f479-49f2-9984-eb6c5d462417';
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
        const { output } = await fraudAnalysisPrompt(input);
        if (!output) {
            throw new Error("GenAI analysis failed to provide an explanation.");
        }
        return output;
    }

    const result = await response.json();

    const predictionLabel = result.result;
    const confidenceScore = result.confidence_score;
    const isFraudulent = predictionLabel.toLowerCase() === 'fraud';

    // Now, use a generative model to explain *why*.
    const { output } = await fraudAnalysisPrompt(input);
    if (!output) {
        throw new Error("GenAI analysis failed to provide an explanation.");
    }

    // Combine the results, using the specialized model's verdict but the generative model's explanation.
    return {
      isFraudulent,
      confidenceScore,
      explanation: output.explanation,
    };
  }
);
