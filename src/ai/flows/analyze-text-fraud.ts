
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing text to detect potential fraud and provide an explanation in multiple languages.
 *
 * - analyzeTextForFraud - The function to call to analyze text for fraud.
 * - AnalyzeTextForFraudInput - The input type for the analyzeTextForFraud function.
 * - AnalyzeTextForFraudOutput - The output type for the analyzeTextForFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { tryWithFallback } from './try-with-fallback';

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
    input: { schema: z.object({ text: z.string() }) },
    output: { schema: AnalyzeTextForFraudOutputSchema },
    prompt: `You are a fraud detection expert. Analyze the following text for scam indicators.

    Text to analyze:
    """
    {{{text}}}
    """

    Based on your analysis, determine if the text is fraudulent. Your response must be in JSON format and include:
    1.  'isFraudulent': A boolean (true/false).
    2.  'confidenceScore': A number between 0 and 1 representing your confidence in the fraud assessment.
    3.  'explanation': A concise, user-friendly explanation in English for your decision. If it is fraudulent, highlight indicators like forced urgency, suspicious links, requests for money, or poor grammar. If it is safe, briefly state why.
    `,
});

const detectLanguagePrompt = ai.definePrompt({
    name: 'detectLanguagePrompt',
    input: { schema: z.object({ text: z.string() }) },
    output: { schema: z.object({ language: z.string().describe("The detected language code (e.g., 'en', 'es', 'hi').") }) },
    prompt: `Detect the language of the following text. Respond with only the two-letter ISO 639-1 language code (e.g., 'en' for English, 'es' for Spanish, 'hi' for Hindi).

    Text: """{{{text}}}"""
    `,
});

const translateTextPrompt = ai.definePrompt({
    name: 'translateTextPrompt',
    input: { schema: z.object({ text: z.string(), targetLanguage: z.string(), sourceLanguage: z.string().optional() }) },
    output: { schema: z.object({ translatedText: z.string() }) },
    prompt: `Translate the following text to {{{targetLanguage}}}.
    {{#if sourceLanguage}}The source language is {{{sourceLanguage}}}.{{/if}}

    Text: """{{{text}}}"""
    `,
});


const analyzeTextForFraudFlow = ai.defineFlow(
  {
    name: 'analyzeTextForFraudFlow',
    inputSchema: AnalyzeTextForFraudInputSchema,
    outputSchema: AnalyzeTextForFraudOutputSchema,
  },
  async input => {
    // 1. Detect the language
    const langOutput = await tryWithFallback(detectLanguagePrompt, { text: input.text });
    const sourceLanguage = langOutput?.language || 'en';

    let textToAnalyze = input.text;

    // 2. Translate to English if necessary
    if (sourceLanguage !== 'en') {
        const translationOutput = await tryWithFallback(translateTextPrompt, {
            text: input.text,
            targetLanguage: 'English',
            sourceLanguage,
        });
        if (translationOutput?.translatedText) {
            textToAnalyze = translationOutput.translatedText;
        }
    }
    
    // 3. Analyze the (now English) text for fraud using the specialized model
    const cogniflowApiKey = 'cdc872e5-00ae-4d32-936c-a80bf6a889ce';
    const cogniflowModelId = '69cd908d-f479-49f2-9984-eb6c5d462417';
    const url = `https://predict.cogniflow.ai/text/classification/predict/${cogniflowModelId}`;

    let isFraudulent, confidenceScore, explanation;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': cogniflowApiKey,
      },
      body: JSON.stringify({
        text: textToAnalyze,
      }),
    });

    if (!response.ok) {
        // Fallback to pure GenAI analysis if Cogniflow fails
        const output = await tryWithFallback(fraudAnalysisPrompt, { text: textToAnalyze });
        if (!output) {
            throw new Error("GenAI analysis failed to provide a response.");
        }
        ({ isFraudulent, confidenceScore, explanation } = output);
    } else {
        const result = await response.json();
        isFraudulent = result.result.toLowerCase() === 'fraud';
        confidenceScore = result.confidence_score;

        // Get the generative explanation based on the original text
        const explanationOutput = await tryWithFallback(fraudAnalysisPrompt, { text: textToAnalyze });
        explanation = explanationOutput?.explanation || "Could not generate an explanation.";
    }

    // 4. Translate the explanation back to the source language if necessary
    let finalExplanation = explanation;
    if (sourceLanguage !== 'en') {
        const finalTranslationOutput = await tryWithFallback(translateTextPrompt, {
            text: explanation,
            targetLanguage: sourceLanguage,
            sourceLanguage: 'en',
        });
        if (finalTranslationOutput?.translatedText) {
            finalExplanation = finalTranslationOutput.translatedText;
        }
    }

    // 5. Return the final result
    return {
      isFraudulent,
      confidenceScore,
      explanation: finalExplanation,
    };
  }
);
