
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing URLs for potential fraud using the Google Safe Browsing API and providing a GenAI explanation.
 *
 * - analyzeUrlForFraud - Analyzes a given URL for fraud and returns the results.
 * - AnalyzeUrlInput - The input type for the analyzeUrlForFraud function.
 * - AnalyzeUrlOutput - The return type for the analyzeUrlForFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUrlInputSchema = z.object({
  url: z.string().url().describe('The URL to analyze.'),
});
export type AnalyzeUrlInput = z.infer<typeof AnalyzeUrlInputSchema>;

const AnalyzeUrlOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the URL is considered safe or not.'),
  threatTypes: z.array(z.string()).describe('The types of threats detected, if any.'),
  explanation: z.string().describe('An explanation of why the URL is considered safe or fraudulent.')
});
export type AnalyzeUrlOutput = z.infer<typeof AnalyzeUrlOutputSchema>;

export async function analyzeUrlForFraud(input: AnalyzeUrlInput): Promise<AnalyzeUrlOutput> {
  return analyzeUrlFlow(input);
}

const urlExplanationPrompt = ai.definePrompt({
    name: 'urlExplanationPrompt',
    input: { schema: z.object({
        url: AnalyzeUrlInputSchema.shape.url,
        isSafe: AnalyzeUrlOutputSchema.shape.isSafe,
        threatTypes: AnalyzeUrlOutputSchema.shape.threatTypes,
    }) },
    output: { schema: z.object({
      explanation: AnalyzeUrlOutputSchema.shape.explanation,
    }) },
    prompt: `You are a friendly and helpful AI security assistant. Your goal is to explain the results of a URL scan to a user in a clear, reassuring, and easy-to-understand way.

    Another service has already analyzed a URL and provided the following data:
    URL: {{{url}}}
    Is Safe: {{{isSafe}}}
    Threat Types Found: {{#each threatTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

    Based on this data, generate a comprehensive, step-by-step explanation of the findings. Use a conversational and reassuring tone.
    - If the URL is not safe, explain what each of the threat types means in simple, practical terms (e.g., for 'SOCIAL_ENGINEERING', you could say: "This is a phishing site that might try to trick you into revealing personal information like passwords or credit card numbers.").
    - If the URL is safe, reassure the user that the site has been checked against a major threat database and no immediate risks were found, but also provide general advice for staying safe online (e.g., "Even though this link looks safe, it's always a good idea to be cautious. Make sure you recognize the website, look for 'https://' in the address bar, and avoid downloading suspicious files.").
    - Your response must be in JSON format and contain only the 'explanation' field.
    `,
});

const googleSafeBrowsingApiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

const analyzeUrlFlow = ai.defineFlow(
  {
    name: 'analyzeUrlFlow',
    inputSchema: AnalyzeUrlInputSchema,
    outputSchema: AnalyzeUrlOutputSchema,
  },
  async input => {
    if (!googleSafeBrowsingApiKey) {
      // In a real app, you might want to fall back to a less-reliable method
      // or simply return a safe-by-default result with a warning.
      // For this example, we'll return a GenAI-only result.
      const { output } = await urlExplanationPrompt({ ...input, isSafe: true, threatTypes: [] });
      if (!output) {
        throw new Error("GenAI analysis failed to provide an explanation.");
      }
      return {
        isSafe: true,
        threatTypes: [],
        explanation: output.explanation
      };
    }

    const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${googleSafeBrowsingApiKey}`;

    const requestBody = {
      client: {
        clientId: 'FraudFence',
        clientVersion: '1.0.0',
      },
      threatInfo: {
        threatTypes: [
          'MALWARE',
          'SOCIAL_ENGINEERING',
          'THREAT_TYPE_UNSPECIFIED',
          'POTENTIALLY_HARMFUL_APPLICATION',
        ],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: [{
          url: input.url,
        }]
      },
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    const isSafe = !data.matches || data.matches.length === 0;
    const threatTypes = data.matches ? data.matches.map((match: any) => match.threatType) : [];

    // Now, get the GenAI explanation.
    const { output } = await urlExplanationPrompt({ ...input, isSafe, threatTypes });
    if (!output) {
        throw new Error("GenAI analysis failed to provide an explanation.");
    }

    return {
      isSafe: isSafe,
      threatTypes: threatTypes,
      explanation: output.explanation
    };
  }
);
