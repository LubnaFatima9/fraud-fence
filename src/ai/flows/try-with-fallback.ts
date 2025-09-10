
'use server';

/**
 * @fileOverview A helper flow to provide model fallback for Genkit prompts.
 *
 * - tryWithFallback - A function that attempts to call a prompt with a primary model and falls back to a secondary model on failure.
 */

import { PromptAction } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const primaryModel = googleAI.model('gemini-2.0-flash-exp');
const secondaryModel = googleAI.model('gemini-2.0-flash-thinking-exp');
const tertiaryModel = googleAI.model('gemini-1.5-flash-latest');
const quaternaryModel = googleAI.model('gemini-1.5-pro-latest');

/**
 * Executes a Genkit prompt with fallback chain: Gemini 2.0 models → Gemini 1.5 models
 * This is useful for handling rate limiting (429 errors) or other transient issues.
 *
 * @param prompt The Genkit prompt action to execute.
 * @param input The input data for the prompt.
 * @returns The output of the prompt execution.
 * @throws An error if all models in the fallback chain fail.
 */
export async function tryWithFallback<I, O>(
  prompt: PromptAction<any>, 
  input: I
): Promise<{ output: O } | undefined> {
  const models = [
    { name: 'gemini-2.0-flash-exp (primary)', model: primaryModel },
    { name: 'gemini-2.0-flash-thinking-exp (secondary)', model: secondaryModel },
    { name: 'gemini-1.5-flash-latest (tertiary)', model: tertiaryModel },
    { name: 'gemini-1.5-pro-latest (quaternary)', model: quaternaryModel }
  ];

  let lastError: any = null;

  for (let i = 0; i < models.length; i++) {
    const { name, model } = models[i];
    
    try {
      console.log(`🤖 Trying ${name}...`);
      const result = await prompt(input);
      console.log(`✅ Success with ${name}`);
      return result;
    } catch (err: any) {
      lastError = err;
      console.warn(`⚠️ ${name} failed:`, err.message);
      
      // Check if it's worth trying the next model
      const isRetryableError = err.cause?.status === 429 || // Rate limit
                              err.cause?.status === 503 || // Service unavailable  
                              err.cause?.status === 500 || // Internal server error
                              err.cause?.status === 502 || // Bad gateway
                              err.cause?.status === 504 || // Gateway timeout
                              err.message?.includes('overloaded') ||
                              err.message?.includes('unavailable');
      
      // If it's the last model or not a retryable error, don't continue
      if (i === models.length - 1 || !isRetryableError) {
        break;
      }
      
      console.log(`🔄 Falling back to next model...`);
    }
  }

  // All models failed
  console.error('🚨 All models in fallback chain failed. Last error:', lastError);
  throw lastError || new Error('All AI models failed');
}
