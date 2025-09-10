
'use server';

/**
 * @fileOverview A helper flow to provide model fallback for Genkit prompts.
 *
 * - tryWithFallback - A function that attempts to call a prompt with a primary model and falls back to a secondary model on failure.
 */

import { PromptAction } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const primaryModel = googleAI.model('gemini-pro');
const secondaryModel = googleAI.model('gemini-pro');

/**
 * Executes a Genkit prompt with a primary model, falling back to a secondary model if the primary fails.
 * This is useful for handling rate limiting (429 errors) or other transient issues.
 *
 * @param prompt The Genkit prompt action to execute.
 * @param input The input data for the prompt.
 * @returns The output of the prompt execution.
 * @throws An error if both the primary and secondary models fail.
 */
export async function tryWithFallback<I, O>(
  prompt: PromptAction<any>, 
  input: I
): Promise<O | undefined> {
  try {
    // Attempt with the primary (faster/cheaper) model first.
    const { output } = await prompt(input, { model: primaryModel });
    return output;
  } catch (err: any) {
    // Check if the error is a rate limit error (429) or a server error (5xx)
    if (
      err.cause?.status === 429 ||
      (err.cause?.status >= 500 && err.cause?.status < 600)
    ) {
      console.warn(
        `Primary model failed with status ${err.cause?.status}. Retrying with fallback model.`
      );
      try {
        // If it is, fall back to the secondary (more powerful/expensive) model.
        const { output } = await prompt(input, { model: secondaryModel });
        return output;
      } catch (fallbackErr) {
        console.error('Fallback model also failed:', fallbackErr);
        throw fallbackErr; // Re-throw the fallback error if it also fails
      }
    } else {
      // If it's a different kind of error, re-throw it immediately.
      console.error('An unexpected error occurred:', err);
      throw err;
    }
  }
}
