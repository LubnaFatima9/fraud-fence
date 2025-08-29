
'use server';

/**
 * @fileOverview This file defines a Genkit flow for rewriting news headlines to be more casual and eye-catching.
 *
 * - rewriteHeadline - The function to call to rewrite a headline.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RewriteHeadlineInputSchema = z.object({
  headline: z.string().describe('The headline to rewrite.'),
});

const RewriteHeadlineOutputSchema = z.object({
    rewrittenHeadline: z.string().describe('The rewritten, catchy headline.'),
});


export async function rewriteHeadline(headline: string): Promise<string> {
    const { output } = await rewriteHeadlinePrompt({ headline });
    return output?.rewrittenHeadline ?? headline;
}

const rewriteHeadlinePrompt = ai.definePrompt({
    name: 'rewriteHeadlinePrompt',
    input: { schema: RewriteHeadlineInputSchema },
    output: { schema: RewriteHeadlineOutputSchema },
    prompt: `You are a social media expert who writes catchy headlines. Rewrite the following formal news headline into a short, eye-catching, and casual headline for a news ticker. Keep it under 10 words.

    Original Headline:
    """
    {{{headline}}}
    """

    Your response must be in JSON format and contain only the 'rewrittenHeadline' field.
    `,
});
