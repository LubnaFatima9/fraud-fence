
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
// import { tryWithFallback } from './try-with-fallback'; // Temporarily disabled due to model compatibility issues

const AnalyzeTextForFraudInputSchema = z.object({
  text: z.string().describe('The text to analyze for potential fraud.'),
});

export type AnalyzeTextForFraudInput = z.infer<typeof AnalyzeTextForFraudInputSchema>;

const AnalyzeTextForFraudOutputSchema = z.object({
  isFraudulent: z.boolean().describe('Whether the text is likely fraudulent.'),
  confidenceScore: z.number().describe('A score indicating the confidence level of the fraud detection.'),
  explanation: z.string().describe('An explanation of why the text is considered fraudulent or safe, highlighting specific indicators.'),
  threatTypes: z.array(z.string()).describe('Array of detected threat types (e.g., Phishing, Sextortion, Romance Scam).')
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
    const langResult = await detectLanguagePrompt({ text: input.text });
    const sourceLanguage = langResult.output?.language || 'en';

    let textToAnalyze = input.text;

    // 2. Translate to English if necessary
    if (sourceLanguage !== 'en') {
        const translationResult = await translateTextPrompt({
            text: input.text,
            targetLanguage: 'English',
            sourceLanguage,
        });
        if (translationResult.output?.translatedText) {
            textToAnalyze = translationResult.output.translatedText;
        }
    }
    
    // 3. Dual AI Analysis: Analyze using both Cogniflow and Gemini, then average the results
    const cogniflowApiKey = 'cdc872e5-00ae-4d32-936c-a80bf6a889ce';
    const cogniflowModelId = '69cd908d-f479-49f2-9984-eb6c5d462417';
    const url = `https://predict.cogniflow.ai/text/classification/predict/${cogniflowModelId}`;

    let cogniflowResult = { isFraudulent: false, confidenceScore: 0.5, available: false };
    let geminiResult = { isFraudulent: false, confidenceScore: 0.5, available: false };
    let explanation;

    // Parallel analysis - Cogniflow and Gemini
    const [cogniflowResponse, geminiResponse] = await Promise.allSettled([
        // Cogniflow analysis
        fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': cogniflowApiKey,
            },
            body: JSON.stringify({
                text: textToAnalyze,
            }),
        }),
        // Gemini analysis
        fraudAnalysisPrompt({ text: textToAnalyze })
    ]);

    // Process Cogniflow result
    if (cogniflowResponse.status === 'fulfilled' && cogniflowResponse.value.ok) {
        try {
            const result = await cogniflowResponse.value.json();
            console.log('🧠 Cogniflow Text API Response:', result);
            
            if (result.result) {
                const prediction = result.result.toLowerCase();
                console.log('📊 Cogniflow Text Prediction:', prediction);
                
                cogniflowResult.isFraudulent = prediction === 'fraud' || 
                              prediction === 'scam' || 
                              prediction === 'fraudulent' ||
                              prediction.includes('fraud') ||
                              prediction.includes('scam');
                              
                cogniflowResult.confidenceScore = result.confidence_score || result.confidence || 0.5;
                cogniflowResult.available = true;
                
                console.log('🔍 Cogniflow Text Analysis Result:', cogniflowResult);
            }
        } catch (error) {
            console.warn('⚠️ Error parsing Cogniflow response:', error);
        }
    } else {
        console.warn('⚠️ Cogniflow API request failed');
    }

    // Process Gemini result
    if (geminiResponse.status === 'fulfilled' && geminiResponse.value.output) {
        const geminiOutput = geminiResponse.value.output;
        geminiResult.isFraudulent = geminiOutput.isFraudulent || false;
        geminiResult.confidenceScore = geminiOutput.confidenceScore || 0.5;
        geminiResult.available = true;
        explanation = geminiOutput.explanation;
        
        console.log('🤖 Gemini Text Analysis Result:', geminiResult);
    } else {
        console.warn('⚠️ Gemini analysis failed');
    }

    // Combine results using weighted average (both AI systems contribute equally)
    let finalIsFraudulent, finalConfidenceScore;
    
    if (cogniflowResult.available && geminiResult.available) {
        // Both available - average the confidence scores
        const avgConfidence = (cogniflowResult.confidenceScore + geminiResult.confidenceScore) / 2;
        const fraudVotes = (cogniflowResult.isFraudulent ? 1 : 0) + (geminiResult.isFraudulent ? 1 : 0);
        
        finalIsFraudulent = fraudVotes >= 1; // If either detects fraud, mark as fraud
        finalConfidenceScore = fraudVotes === 2 ? Math.max(avgConfidence, 0.7) : // Both agree on fraud
                              fraudVotes === 1 ? avgConfidence : // Mixed results
                              Math.min(avgConfidence, 0.4); // Both agree it's safe
        
        console.log('🔄 Dual AI Analysis - Averaged Result:', { 
            finalIsFraudulent, 
            finalConfidenceScore, 
            cogniflow: cogniflowResult, 
            gemini: geminiResult 
        });
    } else if (cogniflowResult.available) {
        // Only Cogniflow available
        finalIsFraudulent = cogniflowResult.isFraudulent;
        finalConfidenceScore = cogniflowResult.confidenceScore;
        console.log('📱 Using Cogniflow only (Gemini unavailable)');
    } else if (geminiResult.available) {
        // Only Gemini available
        finalIsFraudulent = geminiResult.isFraudulent;
        finalConfidenceScore = geminiResult.confidenceScore;
        console.log('🤖 Using Gemini only (Cogniflow unavailable)');
    } else {
        // Both failed - fallback
        throw new Error("Both Cogniflow and Gemini analysis failed.");
    }

    // Ensure we have an explanation
    if (!explanation) {
        const explanationResult = await fraudAnalysisPrompt({ text: textToAnalyze });
        explanation = explanationResult.output?.explanation || "Could not generate a detailed explanation. Please try again or contact support.";
    }

    // Assign final results
    const isFraudulent = finalIsFraudulent;
    const confidenceScore = finalConfidenceScore;

    // Classify threat types based on content analysis
    const threatTypes: string[] = [];
    const textLower = textToAnalyze.toLowerCase();

    // Phishing detection
    if (textLower.includes('verify') && (textLower.includes('account') || textLower.includes('password')) ||
        textLower.includes('click here') || textLower.includes('suspended') ||
        textLower.includes('confirm your identity') || textLower.includes('login')) {
        threatTypes.push('Phishing');
    }

    // Sextortion detection
    if (textLower.includes('video') && (textLower.includes('embarrassing') || textLower.includes('intimate')) ||
        textLower.includes('webcam') || textLower.includes('bitcoin') && textLower.includes('expose') ||
        textLower.includes('private') && textLower.includes('footage')) {
        threatTypes.push('Sextortion');
    }

    // Romance scam detection
    if (textLower.includes('love') && textLower.includes('money') ||
        textLower.includes('military') && textLower.includes('overseas') ||
        textLower.includes('lonely') || textLower.includes('soulmate') ||
        textLower.includes('relationship') && textLower.includes('emergency')) {
        threatTypes.push('Romance Scam');
    }

    // Investment fraud detection
    if (textLower.includes('guaranteed') && (textLower.includes('profit') || textLower.includes('return')) ||
        textLower.includes('investment opportunity') || textLower.includes('cryptocurrency') ||
        textLower.includes('forex') || textLower.includes('trading') && textLower.includes('guaranteed')) {
        threatTypes.push('Investment Fraud');
    }

    // Prize/Lottery scam detection
    if (textLower.includes('congratulations') && (textLower.includes('won') || textLower.includes('winner')) ||
        textLower.includes('lottery') || textLower.includes('prize') ||
        textLower.includes('claim your') && textLower.includes('reward')) {
        threatTypes.push('Prize/Lottery Scam');
    }

    // Tech support scam detection
    if (textLower.includes('microsoft') && textLower.includes('virus') ||
        textLower.includes('computer infected') || textLower.includes('tech support') ||
        textLower.includes('windows') && textLower.includes('error') ||
        textLower.includes('call immediately') && textLower.includes('computer')) {
        threatTypes.push('Tech Support Scam');
    }

    // Job/Employment scam detection
    if (textLower.includes('work from home') && textLower.includes('easy money') ||
        textLower.includes('no experience') && textLower.includes('high pay') ||
        textLower.includes('data entry') && textLower.includes('$') ||
        textLower.includes('mystery shopper') || textLower.includes('envelope stuffing')) {
        threatTypes.push('Employment Scam');
    }

    // Generic fraud if high confidence but no specific type
    if (isFraudulent && threatTypes.length === 0) {
        threatTypes.push('Suspicious Content');
    }

    // 4. Translate the explanation back to the source language if necessary
    let finalExplanation = explanation;
    if (sourceLanguage !== 'en') {
        const finalTranslationResult = await translateTextPrompt({
            text: explanation,
            targetLanguage: sourceLanguage,
            sourceLanguage: 'en',
        });
        if (finalTranslationResult.output?.translatedText) {
            finalExplanation = finalTranslationResult.output.translatedText;
        }
    }

    // 5. Return the final result
    return {
      isFraudulent,
      confidenceScore,
      explanation: finalExplanation,
      threatTypes,
    };
  }
);
