
'use server';

/**
 * @fileOverview This file defines a Genkit flow for rewriting news headlines to be more casual and eye-catching.
 *
 * - rewriteHeadlines - The function to call to rewrite a list of headlines.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const RewriteHeadlinesInputSchema = z.object({
  headlines: z.array(z.string()).describe('The list of headlines to rewrite.'),
});

const RewriteHeadlinesOutputSchema = z.object({
    rewrittenHeadlines: z.array(z.string()).describe('The list of rewritten, catchy headlines, in the same order as the input.'),
});


/**
 * Simple fallback headline shortener when AI is unavailable
 */
function fallbackHeadlineTransform(headlines: string[]): string[] {
    return headlines.map(headline => {
        // Simple transformations to make headlines more ticker-friendly
        let transformed = headline
            .replace(/^.*?\s*:\s*/, '') // Remove source prefixes
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
        
        // If too long, truncate smartly
        if (transformed.length > 60) {
            const words = transformed.split(' ');
            let result = '';
            for (const word of words) {
                if ((result + word).length > 57) break;
                result += (result ? ' ' : '') + word;
            }
            transformed = result + '...';
        }
        
        return transformed;
    });
}

export async function rewriteHeadlines(headlines: string[]): Promise<string[]> {
    // Implement retry logic for overloaded API
    const maxRetries = 2;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const { output } = await rewriteHeadlinesPrompt({ headlines });
            return output?.rewrittenHeadlines ?? headlines;
        } catch (error) {
            lastError = error as Error;
            
            // If it's a 503 (overloaded) error and we have retries left, wait and try again
            if (error instanceof Error && 
                (error.message.includes("503") || error.message.includes("overloaded")) && 
                attempt < maxRetries) {
                console.warn(`Gemini API overloaded, attempt ${attempt}/${maxRetries}. Retrying in ${attempt * 2}s...`);
                await new Promise(resolve => setTimeout(resolve, attempt * 2000)); // Wait 2s, then 4s
                continue;
            }
            
            // If it's not a retryable error or we've exhausted retries, break
            break;
        }
    }
    
    // If we get here, all retries failed - use fallback transformation
    console.warn("AI headline rewriting failed after retries, using fallback transformation");
    return fallbackHeadlineTransform(headlines);
}

const rewriteHeadlinesPrompt = ai.definePrompt({
    name: 'rewriteHeadlinesPrompt',
    input: { schema: RewriteHeadlinesInputSchema },
    output: { schema: RewriteHeadlinesOutputSchema },
    model: googleAI.model('gemini-pro'),
    prompt: `You are a social media expert who writes catchy headlines. For each of the following formal news headlines, rewrite it into a short, eye-catching, and casual headline for a news ticker. Keep each one under 10 words.

    Return the rewritten headlines as a JSON array in the 'rewrittenHeadlines' field, maintaining the original order.

    Original Headlines:
    """
    {{#each headlines}}
    - {{{this}}}
    {{/each}}
    """

    Your response must be in JSON format.
    `,
});
