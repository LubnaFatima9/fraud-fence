
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
  prompt: `You are a fraud detection expert specializing in image analysis.
  Another AI model has already analyzed an image and made a determination. Your task is to provide a user-friendly explanation for this verdict.

  Image to analyze:
  {{media url=photoDataUri}}

  The verdict from the other model is:
  - Is Fraudulent: {{{isFraudulent}}}
  - Confidence Score: {{{confidenceScore}}}

  Based on the provided verdict and your own visual analysis, generate a concise explanation.
  - If it was deemed fraudulent, highlight potential indicators like poorly edited text, fake logos, suspicious QR codes, unbelievable offers, or pressure tactics.
  - If it was deemed safe, briefly state why it appears legitimate.
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
    
    const primaryPrediction = result.result?.find((r: any) => r.match === true);

    const isFraudulent = primaryPrediction
      ? primaryPrediction.name.toLowerCase() === 'scam'
      : false;

    const confidenceScore = primaryPrediction?.score ?? 0;
    
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
      // Fallback to the default explanation already set
    }


    // Combine the results, using the specialized model's verdict and the generative model's explanation.
    return {
      isFraudulent,
      confidenceScore,
      explanation: explanation,
    };
  }
);
