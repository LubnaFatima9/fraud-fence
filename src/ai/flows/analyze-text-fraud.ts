
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
    prompt: `You are an expert fraud detection specialist with years of experience in identifying scams, phishing attempts, and fraudulent communications. Your goal is to provide detailed, educational analysis that helps users understand potential threats.

    Analyze the following text for any signs of fraud, scams, or deception:
    """
    {{{text}}}
    """
    
    Provide a thorough analysis in JSON format with these fields:
    1. 'isFraudulent': Boolean indicating if this is likely a scam or fraud
    2. 'confidenceScore': Number 0-1 representing your confidence in the assessment
    3. 'explanation': A comprehensive, well-structured explanation (minimum 200 words) using markdown formatting:
    
    Format your explanation with clear headings and structure:
    ## Overall Assessment
    - Provide your main conclusion about whether this is fraudulent or safe
    
    ## Key Indicators
    - **Red Flags Detected**: List specific suspicious elements (use **bold** for emphasis)
    - **Safety Signals**: Note any legitimate aspects if present
    
    ## Analysis Details
    - **Language Patterns**: Urgency tactics, emotional manipulation, or professional language
    - **Technical Elements**: Links, contact methods, requests for information
    - **Psychological Tactics**: How scammers might be trying to influence the reader
    
    ## Recommendations
    - **Immediate Actions**: What the user should do right now
    - **General Advice**: How to avoid similar scams in the future
    
    ## Educational Context
    - Brief explanation of this scam type and why it's effective
    
    Guidelines for explanations:
    - Use **bold text** for important terms and key points
    - Use clear, conversational language
    - Be specific about what makes something suspicious or safe
    - Provide actionable advice for the user
    - Include context about common scam tactics when relevant
    - If safe, explain why and offer general safety tips
    - If fraudulent, detail specific red flags and protective measures
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
        console.log('🧠 Cogniflow Text API Response:', result);
        
        // More robust parsing of Cogniflow response
        // Handle different possible response formats
        if (result.result) {
            const prediction = result.result.toLowerCase();
            console.log('📊 Text Prediction:', prediction);
            
            // Check for fraud indicators in various forms
            isFraudulent = prediction === 'fraud' || 
                          prediction === 'scam' || 
                          prediction === 'fraudulent' ||
                          prediction.includes('fraud') ||
                          prediction.includes('scam');
                          
            confidenceScore = result.confidence_score || result.confidence || 0.5;
            
            console.log('🔍 Text Analysis Result:', { isFraudulent, confidenceScore, prediction });
        } else {
            console.warn('⚠️ Unexpected Cogniflow response format:', result);
            // Fallback to GenAI if response format is unexpected
            const output = await tryWithFallback(fraudAnalysisPrompt, { text: textToAnalyze });
            if (!output) {
                throw new Error("Both Cogniflow and GenAI analysis failed.");
            }
            ({ isFraudulent, confidenceScore, explanation } = output);
        }

        // Get the generative explanation based on the original text
        if (!explanation) {
            const explanationOutput = await tryWithFallback(fraudAnalysisPrompt, { text: textToAnalyze });
            explanation = explanationOutput?.explanation || "Could not generate a detailed explanation. Please try again or contact support.";
        }
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
