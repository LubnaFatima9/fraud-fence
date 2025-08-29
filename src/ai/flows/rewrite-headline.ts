
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


export async function rewriteHeadlines(headlines: string[]): Promise<string[]> {
    const { output } = await rewriteHeadlinesPrompt({ headlines });
    return output?.rewrittenHeadlines ?? headlines;
}

const rewriteHeadlinesPrompt = ai.definePrompt({
    name: 'rewriteHeadlinesPrompt',
    input: { schema: RewriteHeadlinesInputSchema },
    output: { schema: RewriteHeadlinesOutputSchema },
    model: googleAI.model('gemini-1.0-pro'),
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
